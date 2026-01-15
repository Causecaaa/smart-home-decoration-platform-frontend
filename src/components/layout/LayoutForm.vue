<template>
  <div class="layout-card">
    <!-- STEP 1: 布局意图 -->
    <div v-show="step === 1">
      <div class="input-row">
        <span class="label">布局意图</span>
        <div class="input-col">
          <select v-model="form.layoutIntent" @blur="validateStep">
            <option value="KEEP_ORIGINAL">保留现有户型</option>
            <option value="REDESIGN">需要重新设计</option>
          </select>
          <div v-if="errors.layoutIntent" class="error-text">× {{ errors.layoutIntent }}</div>
        </div>
      </div>

      <div class="input-row" v-if="form.layoutIntent === 'REDESIGN'">
        <span class="label" style="padding-top: 20px">设计需求</span>
        <div class="input-col" style="padding-top: 20px">
          <textarea
              v-model="form.redesignNotes"
              placeholder="简单描述你的设计需求（可选）"
              rows="3"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- STEP 2: 上传图片 -->
    <div v-show="step === 2">
      <h3>上传图片</h3>
      <input type="file" multiple @change="handleFiles" />
      <div class="preview">
        <div
            v-for="(img, index) in form.images"
            :key="img.key"
            class="preview-item"
        >
          <img :src="img.url" />
          <button @click="removeImage(index)">删除</button>
        </div>
      </div>
    </div>

    <!-- STEP 3: 选择设计师 -->
    <div v-show="step === 3 && form.layoutIntent === 'REDESIGN'">
      <h3>选择设计师</h3>
      <DesignerSelector
          :designers="designers"
          v-model="form.designerId"
          @select="onDesignerSelected"
      />
      <div v-if="errors.designerId" class="error-text">× {{ errors.designerId }}</div>
    </div>

    <!-- 底部导航 -->
    <div class="form-footer">
      <StandardButton v-if="!isLastStep" @click="nextStep">下一步</StandardButton>
      <StandardButton v-else @click="submitForm">提交</StandardButton>
    </div>

    <!-- 小点指示 -->
    <div class="dots">
      <span v-for="n in totalSteps" :key="n" :class="{ active: step === n }"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StandardButton from '@/components/button/StandardButton.vue'
import DesignerSelector from '@/components/DesignerSelector.vue'
import { getDesignerList } from '@/api/designer'
import { useLayoutFormStore } from '@/stores/layoutFormStore'
import {createLayout, createLayoutDraft} from "@/api/layout";
import {uploadLayoutImage} from "@/api/layoutImage";
import {showToast} from "@nutui/nutui";

// ✅ 顶层解构 props
// eslint-disable-next-line vue/no-setup-props-destructure
const { houseId } = defineProps({ houseId: { type: Number, required: true } })
const emit = defineEmits(['success'])

// Pinia 管理 form 和 errors
const store = useLayoutFormStore()
const form = store.form
const errors = store.errors

// 直接初始化
form.houseId = houseId

const step = ref(1)
const designers = ref([])

// 总步骤
const totalSteps = computed(() => (form.layoutIntent === 'REDESIGN' ? 3 : 2))
const isLastStep = computed(() => step.value === totalSteps.value)

// 校验步骤
const validateStep = () => {
  if (step.value === 1 && !form.layoutIntent) {
    errors.layoutIntent = '请选择布局意图'
    return false
  }
  errors.layoutIntent = ''

  if (step.value === 3 && !form.designerId) {
    errors.designerId = '请选择设计师'
    return false
  }
  errors.designerId = ''
  return true
}

// 下一步
const nextStep = async () => {
  if (!validateStep()) return
  if (step.value === 2 && form.layoutIntent === 'REDESIGN' && designers.value.length === 0) {
    await loadDesigners()
  }
  step.value++
}

// 上传图片
const handleFiles = (e) => {
  const files = Array.from(e.target.files || [])
  files.forEach(file => {
    const url = URL.createObjectURL(file)
    const key = file.name + file.lastModified + '_' + Math.random().toString(36).slice(2, 8)
    form.images.push({ file, url, key })
  })
}

// 删除图片
const removeImage = (index) => form.images.splice(index, 1)

// 选择设计师回调
const onDesignerSelected = (designer) => {
  console.log('选择设计师:', designer)
}

// 提交
const submitForm = async () => {
  if (!validateStep()) return

  if (store.form.layoutIntent === 'KEEP_ORIGINAL') {
    try {
      // 1️⃣ 创建 layout
      const layoutData = {
        houseId: store.form.houseId,
        layoutIntent: store.form.layoutIntent,
        redesignNotes: store.form.redesignNotes || null
      }

      const res = await createLayout(layoutData)
      const layoutId = res.layoutId

      // 2️⃣ 循环上传图片
      for (const img of store.form.images) {
        await uploadLayoutImage(layoutId, {
          file: img.file,
          imageDesc: '', // 如果有描述可以用 img.desc
          imageType: 'STRUCTURE' // 后端需要的类型
        })
      }
      // emit 给父组件
      emit('success', { layoutId })
    } catch (err) {
      showToast.fail('提交 KEEP_ORIGINAL layout 出错', err)
    }
  }
  if(store.form.layoutIntent === 'REDESIGN'){
    try{
      const layoutData = {
        houseId: store.form.houseId,
        layoutIntent: store.form.layoutIntent,
        redesignNotes: store.form.redesignNotes || null,
        designerId : store.form.designerId,
      }

      const res = await createLayoutDraft(layoutData)
      const layoutId = res.layoutId

      for (const img of store.form.images) {
        await uploadLayoutImage(layoutId, {
          file: img.file,
          imageDesc: '', // 如果有描述可以用 img.desc
          imageType: 'STRUCTURE' // 后端需要的类型
        })
      }
      emit('success', { layoutId })
    }catch (err){
      showToast.fail('提交 REDESIGN layout 出错', err)
    }
  }
}


// 请求设计师列表
const loadDesigners = async () => {
  try {
    const data = await getDesignerList()
    designers.value = data.map(d => ({
      userId: d.userId,
      name: d.name,
      avatar: d.avatar,
      style: d.style,
      experienceYears: d.experienceYears,
      shortBio: d.shortBio,
      rating: d.rating,
      orderCount: d.orderCount
    }))
  } catch (err) {
    console.error(err)
  }
}

</script>


<style scoped>
.layout-card {
  width: 480px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: start;
}
.label { font-weight: bold; padding-top: 6px; }
.input-col { display: flex; flex-direction: column; gap: 6px; }

textarea, select, input { width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #ccc; }

.preview { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.preview-item { position: relative; width: 80px; height: 80px; }
.preview-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
.preview-item button { position: absolute; top: 2px; right: 2px; background: rgba(255,0,0,0.7); border: none; color: #fff; border-radius: 4px; padding: 2px 4px; cursor: pointer; }

.form-footer { display: flex; justify-content: space-between; margin-top: 16px; }

.dots { display: flex; justify-content: center; margin-top: 12px; gap: 6px; }
.dots span { width: 10px; height: 10px; border-radius: 50%; background: #ccc; display: inline-block; }
.dots span.active { background: #409eff; }

.error-text { color: #ff4d4f; font-size: 12px; margin-top: 4px; }
</style>

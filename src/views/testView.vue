<template>
  <div class="layout-card">
    <!-- 步骤1: 布局意图 -->
    <div v-show="step === 1">
      <div class="input-row">
        <span class="label">布局意图</span>
        <div class="input-col">
          <select v-model="form.layoutIntent">
            <option value="KEEP_ORIGINAL">保留现有户型</option>
            <option value="REDESIGN">需要重新设计</option>
          </select>
        </div>
      </div>
      <div class="input-row" v-if="form.layoutIntent === 'REDESIGN'">
        <span class="label" style="padding-top: 20px">设计需求</span>
        <div class="input-col" style="padding-top: 20px">
          <textarea v-model="form.redesignNotes" placeholder="简单描述你的设计需求（可选）" rows="3"></textarea>
        </div>
      </div>
    </div>

    <!-- 步骤2: 上传图片 -->
    <div v-show="step === 2">
      <h3>上传图片</h3>
      <input type="file" multiple @change="handleFiles" />
      <div class="preview">
        <div v-for="(img, index) in form.images" :key="img.key" class="preview-item">
          <img :src="img.url" />
          <button @click="removeImage(index)">删除</button>
        </div>
      </div>
    </div>

    <!-- 步骤3: 选择设计师 -->
    <div v-show="step === 3 && form.layoutIntent === 'REDESIGN'">
      <h3>选择设计师</h3>
      <DesignerSelector
          :designers="designers"
          v-model="form.designerId"
          @select="onDesignerSelected"
      />
    </div>

    <!-- 底部导航 -->
    <div class="form-footer">
      <button v-if="!isLastStep" @click="nextStep">下一步</button>
      <button v-else @click="submitForm">提交</button>
    </div>

    <!-- 小点指示 -->
    <div class="dots">
      <span v-for="n in totalSteps" :key="n" :class="{ active: step === n }"></span>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import DesignerSelector from '../components/DesignerSelector.vue'
import { getDesignerList } from '@/api/designer'

const step = ref(1)

const form = reactive({
  layoutIntent: 'KEEP_ORIGINAL',
  redesignNotes: '',
  images: [],
  designerId: ''
})

const designers = ref([])

const totalSteps = computed(() => (form.layoutIntent === 'REDESIGN' ? 3 : 2))
const isLastStep = computed(() => step.value === totalSteps.value)

const nextStep = () => {
  step.value++
  if (step.value === 3) loadDesigners()
}

const submitForm = () => {
  console.log('提交数据:', form)
  alert('表单已提交，查看控制台数据')
}

// 文件上传
const handleFiles = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    const url = URL.createObjectURL(file)
    const key = file.name + file.lastModified + '_' + Math.random().toString(36).slice(2, 8)
    form.images.push({ file, url, key })
  })
}

const removeImage = (index) => {
  form.images.splice(index, 1)
}

// 选择设计师回调
const onDesignerSelected = (designer) => {
  console.log('选中设计师:', designer)
}

// 请求后端设计师列表
const loadDesigners = async () => {
  try {
    const data = await getDesignerList()
    designers.value = data.map(d => ({
      id: d.userId,
      name: d.name,
      avatar: d.avatar,
      shortBio: d.shortBio,
      style: d.style,
      experienceYears: d.experienceYears,
      rating: d.rating,
      orderCount: d.orderCount
    }))
    console.log('设计师列表加载完毕:', designers.value)
  } catch (err) {
    console.error('加载设计师失败', err)
  }
}
</script>

<style scoped>
.layout-card { padding: 16px; background: #fff; border-radius: 12px; width: 500px; display: flex; flex-direction: column; gap: 12px; }
.input-row { display: grid; grid-template-columns: 120px 1fr; gap: 12px; }
.label { font-weight: bold; padding-top: 6px; }
.input-col { display: flex; flex-direction: column; gap: 6px; }
textarea, select, input { width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #ccc; }
.preview { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.preview-item { position: relative; width: 80px; height: 80px; }
.preview-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }
.preview-item button { position: absolute; top: 2px; right: 2px; background: rgba(255,0,0,0.7); border: none; color: #fff; border-radius: 4px; padding: 2px 4px; cursor: pointer; }
.form-footer { display: flex; justify-content: space-between; margin-top: 16px; }
.dots { display: flex; justify-content: center; gap: 6px; margin-top: 12px; }
.dots span { width: 10px; height: 10px; border-radius: 50%; background: #ccc; display: inline-block; }
.dots span.active { background: #409eff; }
</style>

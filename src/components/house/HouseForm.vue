<template>
  <div class="house-form">

    <!-- 城市 -->
    <div class="input-row">
      <span class="label">城市</span>
      <div class="input-col">
        <nut-input v-model="form.city" placeholder="请输入城市" @blur="validateCity" />
        <div v-if="errors.city" class="error-text">× {{ errors.city }}</div>
      </div>
    </div>

    <!-- 小区 -->
    <div class="input-row">
      <span class="label">小区</span>
      <div class="input-col">
        <nut-input v-model="form.communityName" placeholder="请输入小区名" @blur="validateCommunity" />
        <div v-if="errors.communityName" class="error-text">× {{ errors.communityName }}</div>
      </div>
    </div>

    <!-- 楼栋/单元/房号 -->
    <div class="input-row">
      <span class="label">楼栋</span>
      <div class="input-col">
        <nut-input v-model="form.buildingNo" placeholder="栋号" @blur="validateBuildingNo" />
        <div v-if="errors.buildingNo" class="error-text">× {{ errors.buildingNo }}</div>
      </div>
    </div>
    <div class="input-row">
      <span class="label">单元</span>
      <div class="input-col">
        <nut-input v-model="form.unitNo" placeholder="单元号" @blur="validateUnitNo" />
        <div v-if="errors.unitNo" class="error-text">× {{ errors.unitNo }}</div>
      </div>
    </div>
    <div class="input-row">
      <span class="label">房号</span>
      <div class="input-col">
        <nut-input v-model="form.roomNo" placeholder="房号" @blur="validateRoomNo" />
        <div v-if="errors.roomNo" class="error-text">× {{ errors.roomNo }}</div>
      </div>
    </div>

    <!-- 面积 -->
    <div class="input-row">
      <span class="label">面积</span>
      <div class="input-col">
        <nut-input v-model.number="form.area" type="number" placeholder="㎡" @blur="validateArea" />
        <div v-if="errors.area" class="error-text">× {{ errors.area }}</div>
      </div>
    </div>

    <!-- 户型 -->
    <div class="input-row">
      <span class="label">户型</span>
      <div class="input-col">
        <nut-input v-model="form.layoutType" placeholder="例如 2室1厅" @blur="validateLayoutType" />
        <div v-if="errors.layoutType" class="error-text">× {{ errors.layoutType }}</div>
      </div>
    </div>

    <!-- 楼层 -->
    <div class="input-row">
      <span class="label">楼层</span>
      <div class="input-col">
        <nut-input v-model.number="form.floorCount" type="number" @blur="validateFloorCount" />
        <div v-if="errors.floorCount" class="error-text">× {{ errors.floorCount }}</div>
      </div>
    </div>

    <!-- 装修类型下拉框 -->
    <div class="input-row">
      <span class="label">装修类型</span>
      <select v-model="form.decorationType" :disabled="isEditMode">
        <option v-for="(label, value) in DECORATION_MAP" :key="value" :value="value">
          {{ label }}
        </option>
      </select>
    </div>

    <div class="form-footer">
      <StandardButton @click="submit">{{ isEditMode ? '保存' : '新增' }}</StandardButton>
    </div>

  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import StandardButton from '@/components/button/StandardButton.vue'
import { createHouse, updateHouse } from '@/api/house'

const props = defineProps({ house: Object })
const emit = defineEmits(['success'])

// 后端枚举 -> 中文
const DECORATION_MAP = { FULL: '全包', HALF: '半包', LOOSE: '散装' }

// 是否编辑模式
const isEditMode = computed(() => !!props.house)

// 表单数据
const form = reactive({
  city: props.house?.city || '',
  communityName: props.house?.communityName || '',
  buildingNo: props.house?.buildingNo || '',
  unitNo: props.house?.unitNo || '',
  roomNo: props.house?.roomNo || '',
  area: props.house?.area || '',
  layoutType: props.house?.layoutType || '',
  floorCount: props.house?.floorCount || '',
  decorationType: props.house?.decorationType || 'FULL'
})

// 错误信息
const errors = reactive({
  city: '',
  communityName: '',
  buildingNo: '',
  unitNo: '',
  roomNo: '',
  area: '',
  layoutType: '',
  floorCount: ''
})

// 校验函数
const validateCity = () => { errors.city = form.city ? '' : '城市不能为空'; return !errors.city }
const validateCommunity = () => { errors.communityName = form.communityName ? '' : '小区不能为空'; return !errors.communityName }
const validateBuildingNo = () => { errors.buildingNo = form.buildingNo ? '' : '楼栋不能为空'; return !errors.buildingNo }
const validateUnitNo = () => { errors.unitNo = form.unitNo ? '' : '单元不能为空'; return !errors.unitNo }
const validateRoomNo = () => { errors.roomNo = form.roomNo ? '' : '房号不能为空'; return !errors.roomNo }
const validateArea = () => { errors.area = form.area > 0 ? '' : '面积必须大于0'; return !errors.area }
const validateLayoutType = () => { errors.layoutType = form.layoutType ? '' : '户型不能为空'; return !errors.layoutType }
const validateFloorCount = () => { errors.floorCount = form.floorCount > 0 ? '' : '楼层必须大于0'; return !errors.floorCount }

const validateAll = () => [
  validateCity(),
  validateCommunity(),
  validateBuildingNo(),
  validateUnitNo(),
  validateRoomNo(),
  validateArea(),
  validateLayoutType(),
  validateFloorCount()
].every(v => v)

let isSubmitting = false
const submit = async () => {
  if (isSubmitting) return
  if (!validateAll()) {
    alert('请检查表单信息')
    return
  }

  isSubmitting = true
  try {
    let res
    if (isEditMode.value) {
      res = await updateHouse(props.house.houseId, form)
    } else {
      res = await createHouse(form)
    }
    emit('success', res)
  } catch (err) {
    console.error('提交失败', err)
    alert('提交失败，请重试')
  } finally {
    isSubmitting = false
  }
}
</script>

<style scoped>
.house-form {
  width: 480px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  border-radius: 12px;
}
.input-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
}
.input-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.error-text {
  color: #f56c6c;
  font-size: 12px;
}
select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background: #fff;
  width: 100%;
}
select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}
.form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>

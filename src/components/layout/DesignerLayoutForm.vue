<template>
  <div class="layout-card">
    <div class="form-section">
      <h3>创建新方案</h3>

      <!-- 设计需求说明 -->
      <div class="input-row">
        <span class="label">设计需求</span>
        <div class="input-col">
          <textarea
            v-model="form.redesignNotes"
            placeholder="简单描述你的设计需求（可选）"
            class="notes-input"
            rows="3"
          ></textarea>
        </div>
      </div>

      <!-- 图片上传区域 -->
      <div class="input-row">
        <span class="label">上传设计图</span>
        <div class="input-col">
          <div class="upload-area" @dragover.prevent @drop="handleDrop" @click="triggerFileInput">
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
            />
            <div class="upload-content">
              <div class="upload-icon">📁</div>
              <p>拖拽图片到此处或点击上传</p>
              <p class="hint">支持多张图片上传</p>
            </div>
          </div>

          <!-- 图片预览 -->
          <div v-if="form.images.length > 0" class="preview-section">
            <h4>已选择的图片 ({{ form.images.length }})</h4>
            <div class="preview">
              <div
                v-for="(img, index) in form.images"
                :key="img.key"
                class="preview-item"
              >
                <img :src="img.url" alt="预览图" />
                <button
                  class="remove-btn"
                  @click="removeImage(index)"
                  type="button"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 表单底部按钮 -->
    <div class="form-footer">
      <StandardButton
        :disabled="isSubmitting"
        @click="submitForm"
      >
        <span v-if="isSubmitting">提交中...</span>
        <span v-else>创建方案</span>
      </StandardButton>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { showToast } from '@nutui/nutui'
import StandardButton from '@/components/button/StandardButton.vue'
import {createLayout} from "@/api/layout";
import {uploadLayoutImage} from "@/api/layoutImage";

// Props
const props = defineProps({
  houseId: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['success', 'cancel'])

// Refs
const fileInputRef = ref(null)

// State
const isSubmitting = ref(false)

// Form data
const form = reactive({
  redesignNotes: '',
  images: [] // { file, url, key }
})

// Methods
const triggerFileInput = () => {
  fileInputRef.value.click()
}

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files || [])
  addFiles(files)
}

const handleDrop = (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files || [])
  addFiles(files)
}

const addFiles = (files) => {
  const validFiles = files.filter(file => file.type.startsWith('image/'))

  if (validFiles.length === 0) {
    showToast.warn('请选择有效的图片文件')
    return
  }

  validFiles.forEach(file => {
    const url = URL.createObjectURL(file)
    const key = `${file.name}-${file.size}-${Date.now()}`

    // 检查是否已存在相同文件
    const exists = form.images.some(img => img.key === key)
    if (!exists) {
      form.images.push({ file, url, key })
    }
  })
}

const removeImage = (index) => {
  const img = form.images[index]
  URL.revokeObjectURL(img.url) // 释放内存
  form.images.splice(index, 1)
}

const submitForm = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  console.log("props.houseId: "+props.houseId)

  try {
    // 发送创建请求
    const payload = {
      houseId: props.houseId,
      layoutIntent: 'REDESIGN',
      redesignNotes: form.redesignNotes || null
    }

    const response = await createLayout(payload)
    const layoutId = response.layoutId

    // 上传图片
    for (const img of form.images) {
      await uploadLayoutImage(layoutId, {
        file: img.file,
        imageType: 'STRUCTURE',
        imageDesc: ''
      })
    }

    showToast.success('方案创建成功')
    emit('success')
  } catch (error) {
    console.error('创建方案失败:', error)
    showToast.fail('方案创建失败，请重试')
  } finally {
    isSubmitting.value = false
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

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-section h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.input-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: start;
}

.label {
  font-weight: bold;
  padding-top: 6px;
}

.input-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.notes-input {
  width: 100%;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  resize: vertical;
  min-height: 80px;
  font-size: 14px;
}

.notes-input:focus {
  outline: none;
  border-color: #409eff;
}

.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-content .upload-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.upload-content p {
  margin: 5px 0;
  color: #666;
}

.hint {
  font-size: 12px;
  color: #999;
}

.file-input {
  display: none;
}

.preview-section h4 {
  margin: 10px 0 8px 0;
  font-size: 14px;
  color: #666;
}

.preview {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.remove-btn {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(255,0,0,0.7);
  border: none;
  color: #fff;
  border-radius: 4px;
  padding: 2px 4px;
  cursor: pointer;
  font-size: 12px;
}

.remove-btn:hover {
  background: rgba(255,0,0,0.9);
}

.form-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
}

.form-footer .btn {
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.form-footer .btn-default {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #dcdfe6;
}

.form-footer .btn-default:hover {
  background: #e0e0e0;
}

.form-footer .btn-primary {
  background: #409eff;
  color: white;
  border: 1px solid #409eff;
}

.form-footer .btn-primary:hover:not(:disabled) {
  background: #66b1ff;
}

.form-footer .btn-primary:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}
</style>

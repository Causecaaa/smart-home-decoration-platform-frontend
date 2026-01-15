<template>
  <TopNav class="top-nav" />

  <div class="layouts-page">
    <div class="header">
      <h2>房屋布局</h2>
      <button class="add-btn" @click="openLayoutDialog">新增布局</button>
    </div>

    <div class="layout-list">
      <div
          class="layout-item"
          v-for="layout in layouts"
          :key="layout.layoutId"
      >
        <div class="layout-header">
          <h3>
            布局意图：{{ LAYOUT_INTENT_MAP[layout.layoutIntent] }}
            <span> - V{{ layout.layoutVersion }}</span>
          </h3>

          <!-- 三个点按钮 -->
          <div class="actions-wrapper" @click.stop="toggleDropdown(layout.layoutId)">
            <span class="dot-btn">⋮</span>
            <!-- 下拉选项 -->
            <div v-if="layout.showDropdown" class="dropdown">
              <button @click="confirmDelete(layout.layoutId)">删除布局</button>
            </div>
          </div>
        </div>

        <p v-if="!layout.layoutVersion && designer">
          设计师：{{ designer.name }}（{{ designer.email }}）
        </p>



        <p v-if="layout.redesignNotes">设计需求：{{ layout.redesignNotes }}</p>
        <p>状态：{{ LAYOUT_STATUS_MAP[layout.layoutStatus] }}</p>



        <div class="images">
          <div
              v-for="(img, index) in imageStore.images[layout.layoutId] || []"
              :key="img.id ?? img.key ?? index"
              class="image-wrapper"
          >
            <img
                :src="img.url"
                @click="previewImage(img.file)"
                class="image"
            />
            <button class="delete-btn" @click.stop="removeImage(layout.layoutId, img.id || img.key)">×</button>
          </div>
        </div>

        <!-- 上传图片按钮 -->
        <label class="file-btn">
          新增图片
          <input
              type="file"
              @change="uploadImage($event, layout.layoutId)"
              class="hidden-file-input"
          />
        </label>
        <button
            v-if="layout.layoutVersion !== 0"
            class="confirm-btn"
            @click="confirmLayout(layout.layoutId)"
        >
          确认布局
        </button>
      </div>

      <p v-if="layouts.length === 0" class="no-layout">
        还没有布局信息，快去新增吧～
      </p>
    </div>

    <div v-if="showLayoutDialog" class="overlay" @click.self="closeLayoutDialog">
      <div class="modal">
        <div class="modal-header">
          <span>布局设计</span>
          <span class="close" @click="closeLayoutDialog">×</span>
        </div>

        <div class="modal-body">
          <LayoutForm
              :houseId="currentHouseId"
              @success="onLayoutCreated"
              @cancel="closeLayoutDialog"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 图片预览 -->
  <div v-if="showPreview" class="overlay" @click.self="closePreview">
    <div class="modal">
      <img :src="previewUrl" style="max-width: 100%; max-height: 80vh;" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TopNav from '@/layouts/TopNav.vue'
import { showToast } from '@nutui/nutui'
import {getLayoutsByHouse, deleteLayout, confirmLayoutRequest} from '@/api/layout'
import LayoutForm from '@/components/layout/LayoutForm.vue'
import { deleteLayoutImage, uploadLayoutImage, getLayoutImages } from "@/api/layoutImage"
import { useLayoutImageStore } from "@/stores/layoutImageStore"
import {getDesignerForLayout} from "@/api/designer";

// 常量
const LAYOUT_INTENT_MAP = { KEEP_ORIGINAL: '保留现有户型', REDESIGN: '需要重新设计' }
const LAYOUT_STATUS_MAP = { DRAFT: '草稿', SUBMITTED: '已提交', CONFIRMED: '已确认', ARCHIVED: '已废弃' }

const route = useRoute()
const houseId = Number(route.params.houseId)

const imageStore = useLayoutImageStore()
const layouts = ref([])
const designer = ref(null)


const showLayoutDialog = ref(false)
const currentHouseId = ref(houseId)

const BASE_URL = 'http://localhost:8181'

// --- 统一方法，把 url 转成 File ---
const urlToFile = async (url, name) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type })
}

// --- 加载布局和图片 ---
const loadLayouts = async () => {
  try {
    const res = await getLayoutsByHouse(houseId)
    layouts.value = res.map(l => ({
      ...l,
      layoutVersion: l.layoutVersion ?? 0
    }))

    const firstLayout = layouts.value[0]
    if (firstLayout?.designerId) {
      try {
        designer.value = await getDesignerForLayout(firstLayout.designerId)
      } catch (e) {
        console.warn('加载设计师信息失败', e)
        designer.value = null
      }
    } else {
      designer.value = null
    }

    for (const layout of layouts.value) {
      const imgList = await getLayoutImages(layout.layoutId)
      const formatted = await Promise.all(
          imgList.map(async img => {
            const fullUrl = BASE_URL + img.imageUrl
            const file = await urlToFile(fullUrl, `image_${img.imageId}.jpg`)
            return { id: img.imageId, url: fullUrl, file }
          })
      )
      imageStore.setImages(layout.layoutId, formatted)
    }
  } catch (err) {
    console.error(err)
    layouts.value = []
    showToast.fail('加载布局失败，请重试')
  }
}

// --- 图片预览 ---
const previewUrl = ref(null)
const showPreview = ref(false)
const previewImage = (file) => {
  if (!file) return
  previewUrl.value = URL.createObjectURL(file)
  showPreview.value = true
}
const closePreview = () => { showPreview.value = false }

// --- 新增布局 ---
const openLayoutDialog = () => {
  if (layouts.value.length > 0) {
    showToast.fail('当前房屋已存在布局，不能重复创建')
    return
  }

  currentHouseId.value = houseId
  showLayoutDialog.value = true
}


const onLayoutCreated = () => {
  showLayoutDialog.value = false
  loadLayouts()
}
const closeLayoutDialog = () => { showLayoutDialog.value = false }

// --- 删除布局 ---
const confirmDelete = async (layoutId) => {
  if (!confirm('确定要删除该布局吗？')) return
  try {
    await deleteLayout(layoutId)
    layouts.value = layouts.value.filter(l => l.layoutId !== layoutId)
    imageStore.images[layoutId] = []
    showToast.success('删除成功')
  } catch (err) {
    const msg = err.response?.data?.message || '删除失败，请重试'
    showToast.fail(msg)
  }
}

// --- 上传图片 ---
const uploadImage = async (e, layoutId) => {
  const file = e.target.files[0]
  if (!file) return

  // 生成唯一 key，用于前端缓存
  const key = Date.now() + '_' + file.name

  // 先放入缓存显示预览
  const fileObj = {
    file,                      // 真正的 File 对象
    url: URL.createObjectURL(file), // 前端预览
    key
  }
  imageStore.addImage(layoutId, fileObj)

  try {
    // 上传到后端
    const res = await uploadLayoutImage(layoutId, {
      file: fileObj.file,      // 直接传 file 对象
      imageType: 'STRUCTURE',  // 必填，按你后端需求设置
      imageDesc: ''            // 可选描述
    })

    // 上传成功，更新缓存里的 id
    const imgIndex = imageStore.images[layoutId].findIndex(i => i.key === key)
    if (imgIndex !== -1) {
      imageStore.images[layoutId][imgIndex].id = res.imageId
    }

    showToast.success('上传成功')
  } catch (err) {
    // 上传失败，从缓存删除
    imageStore.removeImage(layoutId, key)
    const msg = err.response?.data?.message || '上传失败'
    showToast.fail(msg)
  }

  // 清空 input，防止同文件无法触发 change
  e.target.value = ''
}

const confirmLayout = async (layoutId) => {
  try {
    await confirmLayoutRequest(layoutId);  // 调用后端的确认布局接口
    showToast.success('布局已确认');
    loadLayouts();  // 重新加载布局列表以更新 UI
  } catch (err) {
    const msg = err.response?.data?.message || '确认布局失败';
    showToast.fail(msg);
  }
};

// --- 删除图片 ---
const removeImage = async (layoutId, keyOrId) => {
  const target = imageStore.images[layoutId]?.find(i => i.id === keyOrId || i.key === keyOrId)
  if (!target) return

  if (target.id) {
    try {
      await deleteLayoutImage(target.id)
      showToast.success('删除成功')
    } catch (err) {
      const msg = err.response?.data?.message || '删除失败'
      showToast.fail(msg)
      return
    }
  }

  imageStore.removeImage(layoutId, keyOrId)
}

// 控制每个 layout 的下拉显示
const toggleDropdown = (layoutId) => {
  layouts.value = layouts.value.map(l => ({
    ...l,
    showDropdown: l.layoutId === layoutId ? !l.showDropdown : false
  }))
}

// 点击其他地方收起下拉
document.addEventListener('click', () => {
  layouts.value = layouts.value.map(l => ({ ...l, showDropdown: false }))
})


// --- 页面初始化 ---
onMounted(() => {
  loadLayouts()
})
</script>



<style scoped>
.layouts-page { padding: 24px; }
.header { display: flex; align-items: center; margin-bottom: 24px; }
.add-btn { margin-left: auto; background: #409eff; color: #fff; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; }
.layout-list { display: flex; flex-wrap: wrap; gap: 16px; }
.layout-item { width: 280px; padding: 16px; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 8px; }
.layout-item h3 { font-weight: bold; }
.images { display: flex; gap: 8px; flex-wrap: wrap; }
.image-wrapper { position: relative; width: 80px; height: 80px; }
.image { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; cursor: pointer; }
.delete-btn { position: absolute; top: -6px; right: -6px; width: 18px; height: 18px; border-radius: 50%; border: none; background: rgba(0,0,0,0.6); color: #fff; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; line-height: 1; }
.delete-btn:hover { background: rgba(255,0,0,0.8); }
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; z-index: 999; }
.modal { background: #fff; border-radius: 12px; width: 500px; max-height: 90vh; overflow-y: auto; padding: 16px; }
.modal-header { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 12px; }
.modal-header .close { cursor: pointer; font-size: 20px; }
.actions { display: flex; gap: 8px; margin-top: 8px; }
.actions button { padding: 4px 10px; border-radius: 6px; border: none; cursor: pointer; background: #f0f0f0; }
.actions .danger { background: #ffeaea; color: #d93026; }
.actions button:hover { background: #e0e0e0; }
.no-layout { width: 100%; text-align: center; color: #888; margin-top: 40px; }

.hidden-file-input {
  display: none; /* 隐藏原始文件选择框 */
}

.file-btn {
  display: inline-block;
  padding: 6px 12px;
  background-color: #409eff;
  color: #fff;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
  transition: background 0.2s;
}

.file-btn:hover {
  background-color: #66b1ff;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.actions-wrapper {
  position: relative;
  cursor: pointer;
}

.dot-btn {
  font-size: 20px;
  padding: 4px;
  user-select: none;
}

.dropdown {
  position: absolute;
  top: 24px;      /* 三个点按钮下方 */
  right: 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.dropdown button {
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown button:hover {
  background: #f5f5f5;
}

</style>

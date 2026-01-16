<template>
  <TopNav class="top-nav" />

  <div class="layouts-page" @click="closeAllDropdowns">
    <div class="header">
      <h2>房屋布局</h2>
      <button class="add-btn" @click="openLayoutDialog">新增布局</button>
    </div>

    <div class="layout-list">
      <!-- 布局列表 -->
      <div
          class="layout-item"
          v-for="layout in layouts"
          :key="layout.layoutId"
      >
        <div class="layout-header">
          <h3>
            布局意图：{{ LAYOUT_INTENT_MAP[layout.layoutIntent] }}
            <span v-if="layout.version !== undefined">
              - V{{ layout.version }}
            </span>
          </h3>

          <!-- 三个点 -->
          <div
              class="actions-wrapper"
              @click.stop="toggleDropdown(layout.layoutId)"
          >
            <span class="dot-btn">⋮</span>
            <div v-if="activeDropdownId === layout.layoutId" class="dropdown">
              <button @click="confirmDelete(layout.layoutId)">
                删除布局
              </button>
            </div>

          </div>
        </div>

        <!-- ✅ 只有 draftLayout 显示设计师 -->
        <p v-if="layout.isCurrent && draftLayout">
          设计师：
          {{ draftLayout.designerUsername }}
          （{{ draftLayout.designerEmail }}）
        </p>

        <p v-if="layout.redesignNotes">
          设计需求：{{ layout.redesignNotes }}
        </p>

        <p>
          状态：{{ LAYOUT_STATUS_MAP[layout.layoutStatus] }}
        </p>

        <!-- 图片列表 -->
        <div class="images">
          <div
              v-for="(img, index) in imageStore.images[layout.layoutId] || []"
              :key="img.id ?? img.key ?? index"
              class="image-wrapper"
          >
            <img
                :src="img.url"
                class="image"
                @click="previewImage(img.file)"
            />
            <button
                class="delete-btn"
                @click.stop="removeImage(layout, img.id || img.key)"
            >
              ×
            </button>
          </div>
        </div>

        <!-- 上传 -->
        <label class="file-btn">
          新增图片
          <input
              type="file"
              class="hidden-file-input"
              @change="(e) => uploadImage(e, layout)"
          />
        </label>

          <button
              v-if="layout._meta.confirmable"
              @click="confirmLayout(layout.layoutId)"
              class="btn"
          >
            确认布局
          </button>

        <!-- 💰 订单状态区 -->
        <div
            v-if="layout._billMeta.visible"
            class="bill-box"
        >
          <div class="bill-title">💰 设计方案费用</div>

          <!-- ① 未付定金 -->
          <div v-if="layout._billMeta.payStatus === 'UNPAID'">
            <p>总价：¥{{ layout._billMeta.amount }}</p>
            <p>定金：¥{{ layout._billMeta.depositAmount }}</p>

            <p class="bill-hint">
              支付定金后，设计师将开始方案设计
            </p>

            <button
                class="btn"
                @click="payDeposit(layout._billMeta.billId)"
            >
              支付定金
            </button>
          </div>

          <!-- ② 已付定金，但还没确认方案 -->
          <div
              v-else-if="
        layout._billMeta.payStatus === 'DEPOSIT_PAID' &&
        layout.layoutStatus !== 'ARCHIVED'
      "
          >
            <p>已支付定金：¥{{ layout._billMeta.depositAmount }}</p>
            <p class="bill-hint">
              设计师正在出方案，确认方案后需支付尾款
            </p>
          </div>

          <!-- ③ 已确认方案，需要付尾款 -->
          <div
              v-else-if="
        layout._billMeta.payStatus === 'DEPOSIT_PAID' &&
        layout.layoutStatus === 'ARCHIVED'
      "
          >
            <p>总价：¥{{ layout._billMeta.amount }}</p>
            <p>已付定金：¥{{ layout._billMeta.depositAmount }}</p>
            <p>
              需支付尾款：¥{{
                layout._billMeta.amount - layout._billMeta.depositAmount
              }}
            </p>

            <p class="bill-hint">
              方案已确认，请支付尾款以完成设计流程
            </p>

            <button
                class="btn"
                @click="payFinal(layout._billMeta.billId)"
            >
              支付尾款
            </button>
          </div>

          <!-- ④ 已全部支付 -->
          <div v-else-if="layout._billMeta.payStatus === 'PAID'">
            <p>总价：¥{{ layout._billMeta.amount }}</p>
            <p class="bill-hint success">
              ✅ 费用已全部结清
            </p>
          </div>
        </div>


      </div>

      <!-- 空状态 -->
      <p
          v-if="!draftLayout && designerLayouts.length === 0"
          class="no-layout"
      >
        还没有布局信息，快去新增吧～
      </p>
    </div>

    <!-- 新增布局弹窗 -->
    <div
        v-if="showLayoutDialog"
        class="overlay"
        @click.self="closeLayoutDialog"
    >
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
  <div
      v-if="showPreview"
      class="overlay"
      @click.self="closePreview"
  >
    <div class="modal">
      <img
          :src="previewUrl"
          style="max-width: 100%; max-height: 80vh;"
      />
    </div>
  </div>
</template>


<script setup>
import {ref, onMounted, computed} from 'vue'
import { useRoute } from 'vue-router'
import TopNav from '@/layouts/TopNav.vue'
import LayoutForm from '@/components/layout/LayoutForm.vue'
import { showToast } from '@nutui/nutui'

import {
  getLayoutsByHouse,
  deleteLayout,
  confirmLayoutRequest
} from '@/api/layout'

import {
  getLayoutImages,
  uploadLayoutImage,
  deleteLayoutImage
} from '@/api/layoutImage'

import { useLayoutImageStore } from '@/stores/layoutImageStore'

/* -------------------- 常量 -------------------- */
const LAYOUT_INTENT_MAP = {
  KEEP_ORIGINAL: '保留现有户型',
  REDESIGN: '需要重新设计'
}
const LAYOUT_STATUS_MAP = {
  DRAFT: '草稿',
  SUBMITTED: '已提交',
  CONFIRMED: '已确认',
  ARCHIVED: '历史记录'
}
const BASE_URL = 'http://localhost:8181'

/* -------------------- 路由 & Store -------------------- */
const route = useRoute()
const houseId = Number(route.params.houseId)
const imageStore = useLayoutImageStore()

/* -------------------- 页面状态 -------------------- */
const draftLayout = ref(null)
const designerLayouts = ref([])

const showLayoutDialog = ref(false)
const currentHouseId = ref(houseId)
const activeDropdownId = ref(null)



import { nextTick } from 'vue'
import {payDepositRequest, payFinalRequest} from "@/api/bill";



/* -------------------- 工具函数 -------------------- */
const urlToFile = async (url, name) => {
  const res = await fetch(url)
  const blob = await res.blob()
  return new File([blob], name, { type: blob.type })
}

const toggleDropdown = (layoutId) => {
  activeDropdownId.value =
      activeDropdownId.value === layoutId ? null : layoutId
}



const closeAllDropdowns = () => {
  layouts.value.forEach(l => (l.showDropdown = false))
}

// eslint-disable-next-line vue/no-export-in-script-setup
function resolveLayoutType(layout) {
  if (layout.version === 0 && layout.layoutIntent === 'REDESIGN') {
    return 'USER_ORIGIN'
  }

  if (layout.version === 10 && layout.layoutIntent === 'KEEP_ORIGINAL') {
    return 'USER_FINAL'
  }

  if (layout.layoutIntent === 'REDESIGN' && layout.version >= 1 && layout.version <= 9) {
    return 'DESIGNER'
  }

  return 'UNKNOWN'
}

const Layout_LOCKED_STATUS = ['ARCHIVED', 'CONFIRMED']
const Bill_LOCKED_STATUS = ['DEPOSIT_PAID', 'PAID']

// eslint-disable-next-line vue/no-export-in-script-setup
function resolveLayoutMeta(layout) {
  const type = resolveLayoutType(layout) // USER_ORIGIN / USER_FINAL / DESIGNER
  const locked1 = Layout_LOCKED_STATUS.includes(layout.layoutStatus)
  const locked2 = Bill_LOCKED_STATUS.includes(layout.payStatus ?? '')

  const locked = locked1 || locked2

  const editable =
      (type === 'USER_ORIGIN' && !locked) || (type === 'USER_FINAL' && !locked1)

  const confirmable =
      !locked &&
      (type === 'USER_FINAL' || type === 'DESIGNER')

  const needPay = type === 'USER_ORIGIN'

  return {
    type,
    editable,
    confirmable,
    needPay
  }
}


function resolveBillMeta(layout) {
  // 没有 billId → 没有任何支付相关 UI
  if (!layout.billId) {
    return { visible: false }
  }

  const payStatus = layout.payStatus

  return {
    visible: true,
    billId: layout.billId,
    payStatus,
    amount: layout.billAmount,
    depositAmount: layout.depositAmount,

    canPayDeposit: payStatus === 'UNPAID',
    depositPaid: payStatus === 'DEPOSIT_PAID'
  }
}


const payDeposit = async (billId) => {
  const ok = confirm('确认支付定金吗？支付后将进入设计阶段')
  if (!ok) return

  try {
    await payDepositRequest(billId) // 你已有的接口
    showToast.success('定金支付成功')
    await loadLayouts()
  } catch (e) {
    showToast.fail('支付失败，请稍后重试')
  }
}

const payFinal = async (billId) => {
  const ok = confirm('确认支付定金吗？支付后将进入设计阶段')
  if (!ok) return

  try {
    await payFinalRequest(billId) // 你已有的接口
    showToast.success('定金支付成功')
    await loadLayouts()
  } catch (e) {
    showToast.fail('支付失败，请稍后重试')
  }
}
/* -------------------- 加载布局 -------------------- */
const loadLayouts = async () => {
  try {
    const res = await getLayoutsByHouse(houseId)

    draftLayout.value = res.draftLayout
        ? {
          ...res.draftLayout,
          layoutVersion: res.draftLayout.version ?? 0
        }
        : null

    designerLayouts.value = (res.designerLayouts || []).map(l => ({
      ...l,
      layoutVersion: l.version ?? 0
    }))

    await loadAllLayoutImages()
  } catch (err) {
    console.error(err)
    draftLayout.value = null
    designerLayouts.value = []
    showToast.fail('加载布局失败')
  }
}


const layouts = computed(() => {
  const list = []

  if (draftLayout.value) {
    list.push({
      ...draftLayout.value,
      isCurrent: true,
      _meta: resolveLayoutMeta(draftLayout.value),
      _billMeta: resolveBillMeta(draftLayout.value)
    })
  }

  designerLayouts.value.forEach(l => {
    list.push({
      ...l,
      isCurrent: false,
      _meta: resolveLayoutMeta(l),
      _billMeta: resolveBillMeta(l)
    })
  })

  return list
})



/* -------------------- 加载图片 -------------------- */
const loadAllLayoutImages = async () => {
  const ids = []

  if (draftLayout.value) {
    ids.push(draftLayout.value.layoutId)
  }
  designerLayouts.value.forEach(l => ids.push(l.layoutId))

  await Promise.all(ids.map(loadLayoutImages))
}

const loadLayoutImages = async (layoutId) => {
  const imgList = await getLayoutImages(layoutId)

  const formatted = await Promise.all(
      imgList.map(async img => {
        const fullUrl = BASE_URL + img.imageUrl
        const file = await urlToFile(fullUrl, `image_${img.imageId}.jpg`)
        return { id: img.imageId, url: fullUrl, file }
      })
  )

  imageStore.setImages(layoutId, formatted)
}

/* -------------------- 图片预览 -------------------- */
const previewUrl = ref(null)
const showPreview = ref(false)

const previewImage = (file) => {
  previewUrl.value = URL.createObjectURL(file)
  showPreview.value = true
}
const closePreview = () => {
  showPreview.value = false
}

/* -------------------- 新增布局 -------------------- */
const openLayoutDialog = () => {
  if (draftLayout.value) {
    showToast.fail('当前房屋已存在布局')
    return
  }
  showLayoutDialog.value = true
}

const onLayoutCreated = async () => {
  showLayoutDialog.value = false

  // 等弹窗组件彻底卸载后再改状态
  await nextTick()

  await loadLayouts()
}


/* -------------------- 删除布局 -------------------- */
const confirmDelete = async (layoutId) => {
  if (!confirm('确定删除该布局？')) return
  await deleteLayout(layoutId)
  await loadLayouts()
  showToast.success('删除成功')
}

/* -------------------- 上传图片 -------------------- */
const uploadImage = async (e, layout) => {
  if (!layout._meta?.editable) {
    showToast.fail('当前布局不可编辑')
    return
  }

  const layoutId = layout.layoutId
  const file = e.target.files[0]
  if (!file) return

  const key = Date.now() + '_' + file.name
  imageStore.addImage(layoutId, {
    key,
    file,
    url: URL.createObjectURL(file)
  })

  try {
    const res = await uploadLayoutImage(layoutId, {
      file,
      imageType: 'STRUCTURE',
      imageDesc: ''
    })

    const img = imageStore.images[layoutId].find(i => i.key === key)
    if (img) img.id = res.imageId

    showToast.success('上传成功')
  } catch {
    imageStore.removeImage(layoutId, key)
    showToast.fail('上传失败')
  }

  e.target.value = ''
}

/* -------------------- 删除图片 -------------------- */
const removeImage = async (layout, keyOrId) => {
  if (!layout._meta?.editable) {
    showToast.fail('当前布局不可编辑')
    return
  }

  const layoutId = layout.layoutId
  const target = imageStore.images[layoutId]?.find(
      i => i.id === keyOrId || i.key === keyOrId
  )
  if (!target) return

  if (target.id) {
    await deleteLayoutImage(target.id)
  }

  imageStore.removeImage(layoutId, keyOrId)
}


/* -------------------- 确认布局 -------------------- */
const confirmLayout = async (layoutId) => {
  await confirmLayoutRequest(layoutId)
  showToast.success('布局已确认')
  await loadLayouts()
}

/* -------------------- 生命周期 -------------------- */
onMounted(loadLayouts)
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
.btn {
  margin-top: 12px;
  padding: 8px 0;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.btn:hover {
  opacity: 0.9;
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

<template>
  <TopNav class="top-nav" />
  <div class="layouts-page" @click="closeAllDropdowns">
    <div class="header">
      <h2>房屋布局</h2>
      <button class="add-btn" @click="openLayoutDialog">新增布局</button>
    </div>

    <div class="layout-list">
      <!-- 用户布局 -->
      <div v-if="draftLayout" :class="['layout-item', { 'user-layout': true }]">
        <div class="layout-header">
          <h3>
            布局意图：{{ LAYOUT_INTENT_MAP[draftLayout.layoutIntent] }}
            <span v-if="draftLayout.version !== undefined">
              - V{{ draftLayout.version }}
            </span>
          </h3>

          <div class="actions-wrapper" @click.stop="toggleDropdown(draftLayout.layoutId)">
            <span class="dot-btn">⋮</span>
            <div v-if="activeDropdownId === draftLayout.layoutId" class="dropdown">
              <button @click="confirmDelete(draftLayout.layoutId)">删除布局</button>
            </div>
          </div>
        </div>

        <p v-if="draftLayout.designerUsername">
          设计师：{{ draftLayout.designerUsername }}（{{ draftLayout.designerEmail }}）
        </p>

        <p v-if="draftLayout.redesignNotes">
          设计需求：{{ draftLayout.redesignNotes }}
        </p>

<!--        <p>状态：{{ LAYOUT_STATUS_MAP[draftLayout.layoutStatus] }}</p>-->

        <div class="images">
          <div v-for="(img, index) in imageStore.images[draftLayout.layoutId] || []" :key="img.id ?? img.key ?? index" class="image-wrapper">
            <img :src="img.url" class="image" @click="previewImage(img.file)" />
            <button class="delete-btn" @click.stop="removeImage(draftLayout, img.id || img.key)">×</button>
          </div>
        </div>

        <!-- 上传图片 -->
        <label class="file-btn">
          新增图片
          <input type="file" class="hidden-file-input" @change="(e) => uploadImage(e, draftLayout)" />
        </label>

        <!-- 💰 订单状态区 -->
        <div class="bill-box">
          <div class="bill-title">💰 设计方案费用</div>
          <!-- 防止 _billMeta 为空 -->
          <div v-if="draftLayout._billMeta?.payStatus === 'UNPAID'">
            <p>总价：¥{{ draftLayout._billMeta?.amount }}</p>
            <p>定金：¥{{ draftLayout._billMeta?.depositAmount }}</p>
            <p class="bill-hint">支付定金后，设计师将开始方案设计</p>
            <button class="btn" @click="payDeposit(draftLayout._billMeta?.billId)">支付定金</button>
          </div>
          <div v-else-if="draftLayout._billMeta?.payStatus === 'DEPOSIT_PAID' && draftLayout.layoutStatus !== 'ARCHIVED'">
            <p>已支付定金：¥{{ draftLayout._billMeta?.depositAmount }}</p>
            <p class="bill-hint">设计师正在出方案，确认方案后需支付尾款</p>
          </div>
          <div v-else-if="draftLayout._billMeta?.payStatus === 'DEPOSIT_PAID' && draftLayout.layoutStatus === 'ARCHIVED'">
            <p>总价：¥{{ draftLayout._billMeta?.amount }}</p>
            <p>已付定金：¥{{ draftLayout._billMeta?.depositAmount }}</p>
            <p>需支付尾款：¥{{ draftLayout._billMeta?.amount - draftLayout._billMeta?.depositAmount }}</p>
            <p class="bill-hint">方案已确认，请支付尾款</p>
            <button class="btn" @click="payFinal(draftLayout._billMeta?.billId)">支付尾款</button>
          </div>
          <div v-else-if="draftLayout._billMeta.payStatus === 'PAID'">
            <p>总价：¥{{ draftLayout._billMeta.amount }}</p>
            <p class="bill-hint success">
              ✅ 费用已全部结清<br>
              已完成房屋结构设计
            </p>
            <StandardButton @click="goToFurnitureDesign(draftLayout)">前往家具设计</StandardButton>
          </div>
        </div>
      </div>

      <!-- 设计师方案布局 -->
      <div class="designer-layouts-wrapper">
        <div v-for="layout in designerLayouts" :key="layout.layoutId" :class="['layout-item', { 'designer-layout': true }]">
          <div class="layout-header">
            <h3>
              布局意图：{{ LAYOUT_INTENT_MAP[layout.layoutIntent] }}
              <span v-if="layout.version !== undefined">
                - V{{ layout.version }}
              </span>
            </h3>
          </div>

          <p v-if="layout.redesignNotes">设计需求：{{ layout.redesignNotes }}</p>
          <p>状态：{{ LAYOUT_STATUS_MAP[layout.layoutStatus] }}</p>

          <div class="images">
            <div v-for="(img, index) in imageStore.images[layout.layoutId] || []" :key="img.id ?? img.key ?? index" class="image-wrapper">
              <img :src="img.url" class="image" @click="previewImage(img.file)" />
            </div>
          </div>

          <button @click="confirmLayout(layout)" class="btn">
            确认布局
          </button>
        </div>
      </div>

      <!-- 保留原布局 -->
      <div v-if="keepOriginalLayout" :class="['layout-item', { 'designer-layout': true }]">
        <div class="layout-header">
          <h3>
            布局意图：{{ LAYOUT_INTENT_MAP[keepOriginalLayout.layoutIntent] }}
            <span v-if="keepOriginalLayout.version !== undefined">
              - V{{ keepOriginalLayout.version }}
            </span>
          </h3>

          <div class="actions-wrapper" @click.stop="toggleDropdown(keepOriginalLayout.layoutId)">
            <span class="dot-btn">⋮</span>
            <div v-if="activeDropdownId === keepOriginalLayout.layoutId" class="dropdown">
              <button @click="confirmDelete(keepOriginalLayout.layoutId)">删除布局</button>
            </div>
          </div>
        </div>

        <p>状态：{{ LAYOUT_STATUS_MAP[keepOriginalLayout.layoutStatus] }}</p>

        <div class="images">
          <div v-for="(img, index) in imageStore.images[keepOriginalLayout.layoutId] || []" :key="img.id ?? img.key ?? index" class="image-wrapper">
            <img :src="img.url" class="image" @click="previewImage(img.file)" />
            <button class="delete-btn" @click.stop="removeImage(keepOriginalLayout, img.id || img.key)">×</button>
          </div>
        </div>

        <!-- 上传图片 -->
        <label class="file-btn">
          新增图片
          <input type="file" class="hidden-file-input" @change="(e) => uploadImage(e, keepOriginalLayout)" />
        </label>

        <button @click="confirmLayout(keepOriginalLayout)" class="btn">确认布局</button>
      </div>

      <!-- 空状态 -->
      <p v-if="!draftLayout && designerLayouts.length === 0 && !keepOriginalLayout" class="no-layout">
        还没有布局信息，快去新增吧～
      </p>
    </div>

    <!-- 新增布局弹窗 -->
    <div v-if="showLayoutDialog" class="overlay" @click.self="closeLayoutDialog">
      <div class="modal">
        <div class="modal-header">
          <span>布局设计</span>
          <span class="close" @click="closeLayoutDialog">×</span>
        </div>
        <div class="modal-body">
          <LayoutForm :houseId="currentHouseId" @success="onLayoutCreated" @cancel="closeLayoutDialog" />
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="showPreview" class="overlay" @click.self="closePreview">
      <div class="modal">
        <img :src="previewUrl" style="max-width: 100%; max-height: 80vh;" />
      </div>
    </div>
  </div>
</template>





<script setup>
import {ref, onMounted} from 'vue'
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
  ARCHIVED: '已封存'
}
const BASE_URL = 'http://localhost:8181'

/* -------------------- 路由 & Store -------------------- */
const route = useRoute()
const houseId = Number(route.params.houseId)
const imageStore = useLayoutImageStore()

/* -------------------- 页面状态 -------------------- */
const draftLayout = ref(null)
const designerLayouts = ref([])
const keepOriginalLayout = ref(null)

const showLayoutDialog = ref(false)
const currentHouseId = ref(houseId)
const activeDropdownId = ref(null)



import { nextTick } from 'vue'
import {payDepositRequest, payFinalRequest} from "@/api/bill";
import StandardButton from "@/components/button/StandardButton.vue";
import router from "@/router";


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

}


function resolveBillMeta(layout) {
  // 没有 billId → 没有任何支付相关 UI
  if (!layout.billId) {
    console.error('No bill meta data available');
    layout._billMeta = { visible: false };  // 直接给 draftLayout 添加 _billMeta
    return;
  }

  const payStatus = layout.payStatus;
  console.log(payStatus);

  // 直接将计算的 _billMeta 添加到 layout (draftLayout) 中
  layout._billMeta = {
    billId: layout.billId,
    payStatus,
    amount: layout.billAmount,
    depositAmount: layout.depositAmount,
    canPayDeposit: payStatus === 'UNPAID',
    depositPaid: payStatus === 'DEPOSIT_PAID'
  };
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

    if (draftLayout.value) {
      resolveBillMeta(draftLayout.value);  // 这里将 _billMeta 添加到 draftLayout 中
    }

    designerLayouts.value = (res.designerLayouts || []).map(l => ({
      ...l,
      layoutVersion: l.version ?? 0
    }))

    keepOriginalLayout.value = res.keepOriginalLayout
        ? {
          ...res.keepOriginalLayout,
          layoutVersion: res.keepOriginalLayout.version ?? 0
        }
        : null

    await loadAllLayoutImages()
  } catch (err) {
    draftLayout.value = null
    designerLayouts.value = []
    showToast.fail('加载布局失败')
  }
}

const goToFurnitureDesign = (layout) =>{
  router.push({ path: `/furniture/${layout.confirmedLayoutId}` })
}


/* -------------------- 加载图片 -------------------- */
const loadAllLayoutImages = async () => {
  const ids = []

  if (draftLayout.value) {
    ids.push(draftLayout.value.layoutId)
  }
  designerLayouts.value.forEach(l => ids.push(l.layoutId))

  if (keepOriginalLayout.value) {
    ids.push(keepOriginalLayout.value.layoutId)
  }

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

const closeLayoutDialog = () =>{
  showLayoutDialog.value = false
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
  if (layout.layoutStatus === 'CONFIRMED' || layout.layoutStatus === 'ARCHIVED') {
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
  if (layout.layoutStatus === 'CONFIRMED' || layout.layoutStatus === 'ARCHIVED') {
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
const confirmLayout = async (layout) => {
  if(layout.layoutStatus === 'CONFIRMED' || layout.layoutStatus === 'ARCHIVED'){
    showToast.fail('不可再次确认')
    return
  }
  await confirmLayoutRequest(layout.layoutId)
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

.layout-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;  /* 允许元素根据内容高度对齐 */
}

.layout-item {
  width: 280px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
  /* 不强制设置高度 */
  height: auto;  /* 允许高度根据内容扩展 */
}

.layout-item h3 { font-weight: bold; }

.user-layout { border: 2px solid #409eff; background-color: #f0f9ff; }

.designer-layout { border: 2px solid #66b1ff; background-color: #e6f7ff; }

.designer-layouts-wrapper {
  display: flex;
  gap: 16px; /* 给每个设计师方案项间隔 */
  flex-wrap: wrap;
  padding-left: 50px;
  padding-top: 100px;
  justify-content: flex-start; /* 保证设计师方案的容器可以适应布局 */
}

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

.hidden-file-input { display: none; }

.btn { margin-top: 12px; padding: 8px 0; border-radius: 8px; border: none; background: linear-gradient(135deg, #409eff, #66b1ff); color: #fff; font-weight: 600; cursor: pointer; }

.btn:hover { opacity: 0.9; }

.file-btn { display: inline-block; padding: 6px 12px; background-color: #409eff; color: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 8px; transition: background 0.2s; }

.file-btn:hover { background-color: #66b1ff; }

.layout-header { display: flex; justify-content: space-between; align-items: center; position: relative; }

.actions-wrapper { position: relative; cursor: pointer; }

.dot-btn { font-size: 20px; padding: 4px; user-select: none; }

.dropdown { position: absolute; top: 24px; right: 0; background: #fff; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: flex; flex-direction: column; z-index: 10; }

.dropdown button { background: none; border: none; padding: 8px 12px; text-align: left; cursor: pointer; transition: background 0.2s; }

.dropdown button:hover { background: #f5f5f5; }

</style>

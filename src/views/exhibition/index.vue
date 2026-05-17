<template>
  <div ref="screenRef" :class="['digital-expo-page', { 'judge-mode': judgeMode, 'is-touring': isTouring }]">
    <header class="expo-header">
      <div class="brand-area" @click="goPage('/home')">
        <div class="brand-mark">AI</div>
        <div>
          <h1>AI创业就业助手数字展馆</h1>
          <p>Digital Technology Exhibition Hall</p>
        </div>
      </div>

      <nav class="top-nav">
        <button v-for="item in halls" :key="item.key" type="button" :class="{ active: activeKey === item.key }" @click="focusHall(item.key)">
          <span>{{ item.short }}</span>
          <em>{{ item.title }}</em>
        </button>
      </nav>

      <div class="header-actions">
        <button type="button" @click="toggleTour">{{ isTouring ? '停止导览' : '360°导览' }}</button>
        <button type="button" @click="captureScene">截图</button>
        <button type="button" @click="toggleFullscreen">{{ isFullscreen ? '退出全屏' : '全屏' }}</button>
        <button type="button" class="primary" @click="goPage(activeHall.path)">进入当前馆</button>
      </div>
    </header>

    <main class="expo-main">
      <section class="scene-layer">
        <ThreeExhibitionScene ref="sceneRef" :halls="halls" :active-key="activeKey" :is-touring="isTouring" :quality-mode="qualityMode" :judge-mode="judgeMode" @update:active-key="focusHall" @enter-hall="goPage" @model-state="modelState = $event" />
      </section>

      <ExhibitionNavPanel class="expo-aside nav-panel" :halls="halls" :active-key="activeKey" :model-state="modelState" :runtime-status="runtimeStatus" :is-touring="isTouring" :quality-mode="qualityMode" :quality-label="qualityLabel" :judge-mode="judgeMode" @focus-hall="focusHall" @enter-hall="goPage" @toggle-tour="toggleTour" @reset-camera="resetCamera" @toggle-quality="toggleQualityMode" @toggle-judge="toggleJudgeMode" />

      <ExhibitionInfoPanel class="expo-aside info-panel" :active-hall="activeHall" :active-color="activeColor" :favorite="isFavorite(activeHall.key)" @toggle-favorite="toggleFavorite" @enter-hall="goPage" />

      <section class="overview-strip">
        <div v-for="item in overviewStats" :key="item.label" class="overview-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <em>{{ item.trend }}</em>
        </div>
      </section>

      <div class="bottom-dock">
        <button type="button" class="active" @click="resetCamera">
          <i>⌂</i>
          <span>展馆总览</span>
        </button>
        <button type="button" @click="showFootprint">
          <i>◎</i>
          <span>我的足迹</span>
          <em>{{ footprintCount }}</em>
        </button>
        <button type="button" @click="showFavorite">
          <i>☆</i>
          <span>我的收藏</span>
          <em>{{ favoriteCount }}</em>
        </button>
        <button type="button" @click="showHelp">
          <i>?</i>
          <span>帮助中心</span>
        </button>
      </div>

      <div class="control-pad">
        <button type="button" @click="prevHall">‹</button>
        <button type="button" class="center" @click="focusHall(activeHall.key)">{{ activeHall.short }}</button>
        <button type="button" @click="nextHall">›</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ThreeExhibitionScene from './components/ThreeExhibitionScene.vue'
import ExhibitionNavPanel from './components/ExhibitionNavPanel.vue'
import ExhibitionInfoPanel from './components/ExhibitionInfoPanel.vue'
import { LOCAL_HALLS, LOCAL_OVERVIEW_STATS, LOCAL_RUNTIME_STATUS } from './data'
import type {
  HallItem,
  HallKey,
  OverviewStat,
  QualityMode,
  RuntimeStatus,
  VisitRecord
} from './types'

interface ThreeSceneExpose {
  focusHall: (key: HallKey, silent?: boolean) => void
  resetCamera: () => void
  captureScene: () => void
}

const router = useRouter()
const screenRef = ref<HTMLElement | null>(null)
const sceneRef = ref<ThreeSceneExpose | null>(null)
const halls = ref<HallItem[]>([...LOCAL_HALLS])
const overviewStats = ref<OverviewStat[]>([...LOCAL_OVERVIEW_STATS])
const runtimeStatus = ref<RuntimeStatus[]>([...LOCAL_RUNTIME_STATUS])
const activeKey = ref<HallKey>('job')
const modelState = ref('本地展馆数据')
const isTouring = ref(false)
const isFullscreen = ref(false)
const judgeMode = ref(true)
const qualityMode = ref<QualityMode>('high')
const favoriteKeys = ref<HallKey[]>(readStorage<HallKey[]>('exhibition:favorites', []))
const footprintList = ref<VisitRecord[]>(readStorage<VisitRecord[]>('exhibition:footprint', []))
let tourTimer: number | null = null

const activeHall = computed(
  () => halls.value.find((item) => item.key === activeKey.value) ?? halls.value[0] ?? LOCAL_HALLS[0]
)
const qualityLabel = computed(() => (qualityMode.value === 'high' ? '高画质' : '流畅模式'))
const favoriteCount = computed(() => favoriteKeys.value.length)
const footprintCount = computed(() => footprintList.value.length)
const activeColor = computed(
  () => `#${Number(activeHall.value.color).toString(16).padStart(6, '0')}`
)

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('keydown', handleShortcutKeys)
  addFootprint(activeKey.value)
})

onBeforeUnmount(() => {
  stopTour(false)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('keydown', handleShortcutKeys)
})

function focusHall(key: HallKey) {
  if (!halls.value.some((item) => item.key === key)) return
  activeKey.value = key
  sceneRef.value?.focusHall(key)
  addFootprint(key)
}

function prevHall() {
  const index = halls.value.findIndex((item) => item.key === activeKey.value)
  const nextIndex = (index - 1 + halls.value.length) % halls.value.length
  focusHall(halls.value[nextIndex].key)
}

function nextHall() {
  const index = halls.value.findIndex((item) => item.key === activeKey.value)
  const nextIndex = (index + 1) % halls.value.length
  focusHall(halls.value[nextIndex].key)
}

function toggleTour() {
  if (isTouring.value) stopTour()
  else startTour()
}

function startTour() {
  stopTour(false)
  isTouring.value = true
  let index = Math.max(
    0,
    halls.value.findIndex((item) => item.key === activeKey.value)
  )
  focusHall(halls.value[index].key)
  tourTimer = window.setInterval(() => {
    index = (index + 1) % halls.value.length
    focusHall(halls.value[index].key)
  }, 5200)
}

function stopTour(resetState = true) {
  if (tourTimer) {
    window.clearInterval(tourTimer)
    tourTimer = null
  }
  if (resetState) isTouring.value = false
}

function resetCamera() {
  stopTour()
  sceneRef.value?.resetCamera()
}

async function toggleFullscreen() {
  const target = screenRef.value
  if (!target) return
  if (!document.fullscreenElement) await target.requestFullscreen?.()
  else await document.exitFullscreen?.()
}

function handleFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

function captureScene() {
  sceneRef.value?.captureScene()
  ElMessage.success('已导出当前数字展馆截图')
}

function toggleQualityMode() {
  qualityMode.value = qualityMode.value === 'high' ? 'balanced' : 'high'
}

function toggleJudgeMode() {
  judgeMode.value = !judgeMode.value
}

function toggleFavorite(key: HallKey) {
  const exists = favoriteKeys.value.includes(key)
  favoriteKeys.value = exists
    ? favoriteKeys.value.filter((item) => item !== key)
    : [...favoriteKeys.value, key]
  writeStorage('exhibition:favorites', favoriteKeys.value)
  ElMessage.success(exists ? '已取消收藏' : '已加入收藏')
}

function isFavorite(key: HallKey) {
  return favoriteKeys.value.includes(key)
}

function addFootprint(key: HallKey) {
  const hall = halls.value.find((item) => item.key === key)
  if (!hall) return
  const record: VisitRecord = { key, title: hall.title, time: new Date().toLocaleString() }
  const next = [record, ...footprintList.value.filter((item) => item.key !== key)].slice(0, 20)
  footprintList.value = next
  writeStorage('exhibition:footprint', next)
}

function showFootprint() {
  if (!footprintList.value.length) {
    ElMessage.info('暂无浏览足迹')
    return
  }
  ElMessage.info(
    `最近访问：${footprintList.value
      .slice(0, 3)
      .map((item) => item.title)
      .join('、')}`
  )
}

function showFavorite() {
  if (!favoriteKeys.value.length) {
    ElMessage.info('暂无收藏展馆')
    return
  }
  const names = favoriteKeys.value
    .map((key) => halls.value.find((item) => item.key === key)?.title)
    .filter(Boolean)
    .slice(0, 3)
    .join('、')
  ElMessage.info(`我的收藏：${names}`)
}

function showHelp() {
  ElMessage.info('操作方式：拖拽旋转展馆，滚轮缩放，点击聚焦，双击进入模块，数字键 1-6 快速切换。')
}

function handleShortcutKeys(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
  const index = Number(event.key)
  if (index >= 1 && index <= halls.value.length) focusHall(halls.value[index - 1].key)
  if (event.key.toLowerCase() === 'r') resetCamera()
  if (event.key.toLowerCase() === 'p') toggleTour()
  if (event.key.toLowerCase() === 'f') toggleFullscreen()
  if (event.key.toLowerCase() === 'j') toggleJudgeMode()
}

function goPage(path: string) {
  if (!path) return
  router.push(path)
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const text = localStorage.getItem(key)
    return text ? (JSON.parse(text) as T) : fallback
  } catch (error) {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}
</script>

<style scoped lang="scss">
.digital-expo-page {
  position: relative;
  width: 100%;
  height: calc(100dvh);
  min-height: 680px;
  overflow: hidden;
  color: #e8f4ff;
  background: radial-gradient(circle at 50% 32%, rgba(23, 132, 216, 0.24), transparent 38%),
    radial-gradient(circle at 80% 72%, rgba(44, 120, 220, 0.12), transparent 34%),
    linear-gradient(180deg, #061426 0%, #050b15 100%);
  box-sizing: border-box;
}

.digital-expo-page:fullscreen {
  height: 100dvh;
  min-height: 100dvh;
}

.digital-expo-page::before {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  content: '';
  background-image: linear-gradient(rgba(95, 195, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(95, 195, 255, 0.04) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at 50% 45%, #000 0%, transparent 75%);
}

.expo-header {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: 340px minmax(360px, 1fr) auto;
  gap: 18px;
  align-items: center;
  height: 76px;
  padding: 0 26px;
  background: linear-gradient(180deg, rgba(5, 16, 30, 0.92), rgba(5, 16, 30, 0.64));
  border-bottom: 1px solid rgba(105, 201, 255, 0.18);
  backdrop-filter: blur(18px);
}

.brand-area {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
  cursor: pointer;
}

.brand-mark {
  display: grid;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  font-weight: 800;
  color: #edfbff;
  place-items: center;
  background: linear-gradient(145deg, #0e6fb0, #132a56);
  border: 1px solid rgba(122, 226, 255, 0.44);
  border-radius: 12px;
  box-shadow: 0 0 24px rgba(54, 186, 255, 0.28);
}

.brand-area h1 {
  margin: 0;
  overflow: hidden;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.brand-area p {
  margin: 4px 0 0;
  overflow: hidden;
  font-size: 11px;
  color: rgba(225, 242, 255, 0.54);
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  letter-spacing: 0.14em;
}

.top-nav {
  display: flex;
  gap: 8px;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}

.top-nav button,
.header-actions button,
.bottom-dock button,
.control-pad button {
  box-sizing: border-box;
  font-family: inherit;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.top-nav button {
  min-width: 76px;
  padding: 8px 9px;
  color: rgba(228, 243, 255, 0.7);
  border-bottom: 2px solid transparent;
  transition: all 0.22s ease;
}

.top-nav button span {
  display: block;
  font-size: 13px;
  font-weight: 700;
}

.top-nav button em {
  display: block;
  max-width: 88px;
  margin-top: 3px;
  overflow: hidden;
  font-size: 11px;
  font-style: normal;
  color: rgba(228, 243, 255, 0.42);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-nav button.active,
.top-nav button:hover {
  color: #ffffff;
  border-color: #58d6ff;
  background: linear-gradient(180deg, rgba(69, 183, 255, 0.1), rgba(69, 183, 255, 0.02));
}

.header-actions {
  display: flex;
  gap: 9px;
  align-items: center;
  min-width: 0;
}

.header-actions button {
  flex: 0 0 auto;
  height: 34px;
  padding: 0 13px;
  font-size: 12px;
  color: rgba(230, 244, 255, 0.74);
  background: rgba(13, 32, 56, 0.72);
  border: 1px solid rgba(116, 203, 255, 0.16);
  border-radius: 999px;
}

.header-actions button.primary {
  color: #051322;
  font-weight: 700;
  background: linear-gradient(135deg, #77e5ff, #4c9bff);
  border: 0;
  box-shadow: 0 12px 28px rgba(57, 169, 255, 0.28);
}

.expo-main,
.scene-layer {
  position: absolute;
  inset: 76px 0 0;
  z-index: 1;
}

.scene-layer {
  inset: 0;
}

.expo-aside {
  position: absolute;
  top: 4px;
  bottom: 122px;
  z-index: 7;
  width: clamp(268px, 18vw, 314px);
  min-height: 0;
}

.nav-panel {
  left: 24px;
}

.info-panel {
  right: 24px;
  width: clamp(306px, 21vw, 350px);
}

.overview-strip {
  position: absolute;
  right: clamp(350px, 23vw, 392px);
  bottom: 112px;
  left: clamp(300px, 21vw, 354px);
  z-index: 5;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  pointer-events: none;
}

.overview-card {
  min-width: 0;
  padding: 12px 14px;
  background: rgba(6, 20, 38, 0.56);
  border: 1px solid rgba(110, 205, 255, 0.14);
  border-radius: 14px;
  backdrop-filter: blur(12px);
}

.overview-card span,
.overview-card em {
  display: block;
  overflow: hidden;
  font-size: 11px;
  font-style: normal;
  color: rgba(230, 244, 255, 0.5);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.overview-card strong {
  display: block;
  margin: 3px 0;
  overflow: hidden;
  font-size: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bottom-dock {
  position: absolute;
  bottom: max(18px, env(safe-area-inset-bottom));
  left: 50%;
  z-index: 8;
  display: flex;
  min-width: min(560px, calc(100vw - 48px));
  overflow: hidden;
  background: rgba(6, 18, 34, 0.74);
  border: 1px solid rgba(106, 199, 255, 0.16);
  border-radius: 22px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
  transform: translateX(-50%);
  backdrop-filter: blur(16px);
}

.bottom-dock button {
  position: relative;
  display: grid;
  grid-template-columns: 24px auto;
  gap: 8px;
  align-items: center;
  min-width: 136px;
  height: 58px;
  padding: 0 20px;
  font-size: 14px;
  color: rgba(229, 244, 255, 0.6);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.bottom-dock button.active,
.bottom-dock button:hover {
  color: #6fe2ff;
  background: rgba(63, 174, 255, 0.08);
}

.bottom-dock button em {
  position: absolute;
  top: 9px;
  right: 16px;
  font-size: 11px;
  font-style: normal;
  color: #ffffff;
}

.control-pad {
  position: absolute;
  right: 48px;
  bottom: calc(92px + env(safe-area-inset-bottom));
  z-index: 9;
  display: grid;
  grid-template-columns: 38px 58px 38px;
  gap: 8px;
  align-items: center;
}

.control-pad button {
  height: 38px;
  color: #7ce9ff;
  background: rgba(4, 18, 34, 0.72);
  border: 1px solid rgba(118, 223, 255, 0.22);
  border-radius: 50%;
  backdrop-filter: blur(10px);
}

.control-pad .center {
  height: 58px;
  color: #051322;
  font-weight: 800;
  background: radial-gradient(circle, #8ff0ff, #2f8cff);
  box-shadow: 0 0 24px rgba(94, 211, 255, 0.38);
}

@media (max-height: 780px) and (min-width: 921px) {
  .digital-expo-page {
    min-height: 620px;
  }

  .expo-header {
    height: 68px;
  }

  .expo-main,
  .scene-layer {
    inset: 68px 0 0;
  }

  .expo-aside {
    top: 16px;
    bottom: 108px;
  }

  .overview-strip {
    display: none;
  }

  .bottom-dock button {
    min-width: 122px;
    height: 52px;
    padding: 0 16px;
    font-size: 13px;
  }

  .control-pad {
    right: 32px;
    bottom: calc(84px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 1440px) {
  .expo-header {
    grid-template-columns: 300px minmax(320px, 1fr) auto;
    gap: 12px;
  }

  .top-nav button {
    min-width: 68px;
  }

  .header-actions button:not(.primary) {
    padding: 0 10px;
  }

  .overview-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: 420px;
    margin: 0 auto;
  }
}

@media (max-width: 1180px) {
  .expo-header {
    grid-template-columns: 1fr auto;
    height: 72px;
  }

  .top-nav {
    display: none;
  }

  .expo-main,
  .scene-layer {
    inset: 72px 0 0;
  }

  .expo-aside {
    top: 18px;
    bottom: 120px;
    width: 278px;
  }

  .info-panel {
    width: 300px;
  }

  .overview-strip {
    display: none;
  }
}

@media (max-width: 920px) {
  .digital-expo-page {
    height: auto;
    min-height: 1180px;
    overflow: auto;
  }

  .expo-header {
    grid-template-columns: 1fr;
    height: auto;
    padding: 14px 18px;
  }

  .header-actions {
    overflow-x: auto;
  }

  .expo-main {
    position: relative;
    inset: auto;
    display: grid;
    gap: 14px;
    padding: 14px;
  }

  .scene-layer {
    position: relative;
    inset: auto;
    height: 520px;
    overflow: hidden;
    border: 1px solid rgba(110, 205, 255, 0.12);
    border-radius: 18px;
  }

  .expo-aside {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
    width: 100%;
    height: 420px;
  }

  .bottom-dock,
  .control-pad {
    display: none;
  }
}
</style>

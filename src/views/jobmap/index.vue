<template>
  <div class="job-map-page" :class="{ 'is-enter-ready': enterReady, 'is-clean-mode': cleanMode }">
    <div class="map-bg map-bg--left"></div>
    <div class="map-bg map-bg--right"></div>
    <div class="map-grid-bg"></div>

    <header class="map-header">
      <div class="header-left">
        <div class="header-title">AI创业就业助手 · 3D技能图谱</div>
        <div class="header-subtitle">Three.js Skill Galaxy & Employment Knowledge Map</div>
      </div>

      <div class="header-center">
        <div class="system-title">岗位能力关系星图</div>
        <div class="system-line"></div>
      </div>

      <div class="header-right">
        <div class="time-box">
          <span>{{ currentDate }}</span>
          <strong>{{ currentTime }}</strong>
        </div>
        <el-button class="screen-btn" size="small" :loading="loading" @click="loadGraphData">刷新</el-button>
        <el-button class="screen-btn" size="small" @click="toggleFullScreen">全屏</el-button>
        <el-button class="screen-btn" size="small" @click="toggleCleanMode">{{ cleanMode ? '恢复面板' : '清屏展示' }}</el-button>
        <el-button class="screen-btn screen-btn--primary" size="small" @click="toggleDemoMode">
          {{ demoMode ? '停止演示' : '自动演示' }}
        </el-button>
        <el-button class="screen-btn" size="small" @click="goHome">返回首页</el-button>
      </div>
    </header>

    <section class="filter-bar">
      <div class="filter-title">
        <strong>图谱筛选</strong>
        <span>支持自动演示、清屏展示和节点聚焦，适合项目答辩与功能录屏</span>
      </div>

      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input v-model="queryForm.keyword" clearable placeholder="岗位 / 技能 / 公司" @keyup.enter="handleSearch" />
        </el-form-item>

        <el-form-item label="城市">
          <el-select v-model="queryForm.city" clearable filterable placeholder="全部城市">
            <el-option v-for="item in options.cities" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="queryForm.categoryMain" clearable filterable placeholder="全部分类">
            <el-option v-for="item in options.categoryMains" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="节点规模">
          <el-select v-model="queryForm.limit">
            <el-option :value="150" label="轻量 150" />
            <el-option :value="300" label="标准 300" />
            <el-option :value="500" label="增强 500" />
            <el-option :value="800" label="演示 800" />
          </el-select>
        </el-form-item>

        <el-form-item class="filter-action-item">
          <el-button class="screen-btn" @click="handleReset">重置</el-button>
          <el-button class="screen-btn" @click="toggleCleanMode">{{ cleanMode ? '恢复面板' : '清屏' }}</el-button>
          <el-button class="screen-btn" @click="toggleDemoMode">{{ demoMode ? '停止演示' : '自动演示' }}</el-button>
          <el-button class="screen-btn screen-btn--primary" :loading="loading" @click="handleSearch">
            生成图谱
          </el-button>
        </el-form-item>
      </el-form>
    </section>

    <main v-loading="loading" class="map-body" element-loading-text="3D技能图谱构建中..." element-loading-background="rgba(3, 12, 30, 0.72)">
      <aside class="side-panel side-panel--left panel-enter panel-enter--left">
        <section class="panel-card kpi-card">
          <div class="panel-title">
            <span>数据概览</span>
            <em>OVERVIEW</em>
          </div>
          <div class="kpi-grid">
            <div v-for="item in kpiCards" :key="item.label" class="kpi-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
              <em>{{ item.unit }}</em>
            </div>
          </div>
        </section>

        <section class="panel-card">
          <div class="panel-title">
            <span>热门技能</span>
            <em>TOP SKILLS</em>
          </div>
          <div class="rank-list">
            <div v-for="(item, index) in graphData.topSkills" :key="item.name" class="rank-item">
              <i>{{ String(index + 1).padStart(2, '0') }}</i>
              <div class="rank-main">
                <div class="rank-label">
                  <span>{{ item.name }}</span>
                  <em>{{ item.value }}</em>
                </div>
                <div class="rank-track">
                  <div class="rank-bar" :style="{ width: getPercent(item.value, maxSkillValue) + '%' }"></div>
                </div>
              </div>
            </div>
            <el-empty v-if="!graphData.topSkills.length" description="暂无技能数据" :image-size="80" />
          </div>
        </section>

        <section class="panel-card panel-card--compact">
          <div class="panel-title">
            <span>岗位分类</span>
            <em>CATEGORY</em>
          </div>
          <div class="category-list">
            <div v-for="item in graphData.categoryDistribution" :key="item.name" class="category-item">
              <span>{{ item.name }}</span>
              <div class="category-progress">
                <i :style="{ width: getPercent(item.value, maxCategoryValue) + '%' }"></i>
              </div>
              <em>{{ item.value }}</em>
            </div>
            <el-empty v-if="!graphData.categoryDistribution.length" description="暂无分类数据" :image-size="70" />
          </div>
        </section>
      </aside>

      <section class="galaxy-panel panel-enter panel-enter--center">
        <div class="galaxy-toolbar">
          <div class="legend-list">
            <span v-for="item in legendItems" :key="item.label">
              <i :style="{ background: item.color }"></i>{{ item.label }}
            </span>
          </div>
          <div class="galaxy-tip">拖拽旋转 · 滚轮缩放 · 双击复位 · 点击节点自动聚焦 · 自动演示可串联讲解</div>
        </div>

        <!-- <DemoGuideCard
          :demo-mode="demoMode"
          :title="demoMode ? '正在演示：' + currentDemoStep.title : '演示说明'"
          :description="
            demoMode
              ? currentDemoStep.desc
              : '建议按“数据来源 → 五类节点 → 关系路径 → 能力补齐”的顺序讲解。点击自动演示后，系统会自动聚焦关键节点并高亮关联路径。'
          "
          :step-text="demoMode ? String(demoStepIndex + 1).padStart(2, '0') + ' / ' + demoSteps.length : 'GUIDE'"
        /> -->

        <div ref="sceneRef" class="three-scene" @dblclick="resetCamera"></div>

        <div class="floating-label-layer">
          <div v-for="item in floatingLabels" :key="item.id" class="floating-label" :class="{ 'is-active': item.active }" :style="{ left: item.x + 'px', top: item.y + 'px', borderColor: item.color }">
            <i :style="{ background: item.color }"></i>
            <span>{{ item.name }}</span>
          </div>
        </div>

        <div v-if="tooltip.visible" class="graph-tooltip" :style="tooltipStyle">
          <strong>{{ tooltip.title }}</strong>
          <span>{{ tooltip.desc }}</span>
        </div>

        <CleanNodeAnalysisCard v-if="cleanMode && showCleanAnalysisCard" :node="selectedNode" :node-color="selectedNodeColor" :relations="selectedRelations" :enhanced-relations="enhancedRelations" :loading="cleanAiLoading" :summary="cleanAiSummary" :bullets="cleanAiBullets" @close="showCleanAnalysisCard = false" @analyze="handleCleanAiAnalyze" @recommend="handleRecommendFromCleanCard" />

        <div v-if="!loading && !graphData.nodes.length" class="empty-graph">
          <strong>暂无可视化数据</strong>
          <span>请调整关键词、城市或分类后重新生成图谱</span>
        </div>

        <div class="galaxy-status">
          <div>
            <span>当前节点</span>
            <strong>{{ selectedNode?.name || '未选择' }}</strong>
          </div>
          <div>
            <span>关系数量</span>
            <strong>{{ selectedRelations.length || graphData.links.length }}</strong>
          </div>
          <div>
            <span>视图模式</span>
            <strong>{{ demoMode ? '自动演示' : 'Three.js' }}</strong>
          </div>
        </div>
      </section>

      <aside class="side-panel side-panel--right panel-enter panel-enter--right">
        <section class="panel-card detail-card">
          <div class="panel-title">
            <span>节点详情</span>
            <em>DETAIL</em>
          </div>

          <template v-if="selectedNode">
            <div class="node-profile">
              <div class="node-icon" :style="{ background: selectedNodeColor }">
                {{ selectedNode.category.slice(0, 1) }}
              </div>
              <div>
                <strong>{{ selectedNode.name }}</strong>
                <span>{{ selectedNode.category }} · 关联 {{ selectedDegree }} 条关系</span>
              </div>
            </div>

            <div class="relation-list">
              <div v-for="item in selectedRelations" :key="getRelationKey(item)" class="relation-item">
                <div class="relation-top">
                  <span>{{ cleanNodeName(item.source) }}</span>
                  <em>{{ item.relationType }}</em>
                  <span>{{ cleanNodeName(item.target) }}</span>
                </div>
                <p>{{ item.relationDesc || '基于岗位样本共现关系生成' }}</p>
              </div>
              <el-empty v-if="!selectedRelations.length" description="暂无节点关系" :image-size="70" />
            </div>
          </template>

          <template v-else>
            <div class="node-empty">
              <strong>点击星图中的节点</strong>
              <span>可查看技能、岗位、企业、城市和分类之间的直接关系。</span>
            </div>
          </template>
        </section>

        <section class="panel-card ai-card">
          <div class="panel-title">
            <span>AI关系说明</span>
            <em>ENHANCE</em>
          </div>
          <p class="ai-desc">默认展示本地规则说明，点击后仅增强当前节点的少量关系，避免拖慢页面加载。</p>
          <el-button class="screen-btn screen-btn--primary ai-btn" :disabled="!selectedNode || !selectedRelations.length" :loading="enhanceLoading" @click="handleEnhanceRelations">
            增强当前关系说明
          </el-button>
          <div class="enhance-list">
            <div v-for="item in enhancedRelations" :key="getRelationKey(item)" class="enhance-item">
              <strong>{{ cleanNodeName(item.source) }} → {{ cleanNodeName(item.target) }}</strong>
              <span>{{ item.aiRelationDesc || item.relationDesc }}</span>
            </div>
          </div>
        </section>

        <section class="panel-card recommend-card">
          <div class="panel-title">
            <span>能力补齐建议</span>
            <em>RECOMMEND</em>
          </div>
          <el-form label-position="top" :model="recommendForm" class="recommend-form">
            <el-form-item label="目标岗位">
              <el-input v-model="recommendForm.targetJob" clearable placeholder="如：前端工程师" />
            </el-form-item>
            <el-form-item label="已有技能">
              <el-input v-model="recommendForm.skills" clearable placeholder="Vue, TypeScript, ECharts" />
            </el-form-item>
            <div class="recommend-actions">
              <el-button class="screen-btn" @click="fillRecommendFromNode">带入当前节点</el-button>
              <el-button class="screen-btn screen-btn--primary" :loading="recommendLoading" @click="handleRecommend">
                生成建议
              </el-button>
            </div>
          </el-form>

          <div v-if="recommendResult.summary" class="recommend-result">
            <p>{{ recommendResult.summary }}</p>
            <div class="tag-group">
              <span v-for="item in recommendResult.coreSkills" :key="'core-' + item">{{ item }}</span>
            </div>
            <div class="missing-title">建议补齐</div>
            <div class="tag-group tag-group--warning">
              <span v-for="item in recommendResult.missingSkills" :key="'missing-' + item">{{ item }}</span>
            </div>
          </div>
        </section>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import CleanNodeAnalysisCard from './components/CleanNodeAnalysisCard.vue'
import DemoGuideCard from './components/DemoGuideCard.vue'
import {
  enhanceJobSkillRelations,
  getJobSkillGraphData,
  getJobSkillGraphOptions,
  getJobSkillNodeRelations,
  getJobSkillRecommend,
  type GraphData,
  type GraphLinkItem,
  type GraphNodeItem,
  type NameValueItem,
  type NodeRelationItem,
  type RecommendData
} from '@/api/job-skill-graph'

interface SceneNode extends GraphNodeItem {
  degree: number
  position: THREE.Vector3
  color: number
  orbitPhase: number
  pulseSpeed: number
  mesh?: THREE.Mesh
}

interface FloatingLabel {
  id: string
  name: string
  category: string
  x: number
  y: number
  color: string
  active: boolean
  score: number
}

interface DemoStep {
  title: string
  desc: string
  category: string
}

type SceneLink = GraphLinkItem & {
  sourceNode?: SceneNode
  targetNode?: SceneNode
  object?: THREE.Line
}

const router = useRouter()

const loading = ref(false)
const enhanceLoading = ref(false)
const recommendLoading = ref(false)
const enterReady = ref(false)
const cleanMode = ref(false)
const demoMode = ref(false)
const showCleanAnalysisCard = ref(false)
const cleanAiLoading = ref(false)
const cleanAiSummary = ref('')
const cleanAiBullets = ref<string[]>([])
const demoStepIndex = ref(0)
const sceneRef = ref<HTMLDivElement | null>(null)
const selectedNode = ref<SceneNode | null>(null)
const selectedRelations = ref<NodeRelationItem[]>([])
const enhancedRelations = ref<GraphLinkItem[]>([])
const floatingLabels = ref<FloatingLabel[]>([])
const currentDate = ref('')
const currentTime = ref('')

const queryForm = reactive({
  keyword: '',
  city: '',
  categoryMain: '',
  limit: 500
})

const options = reactive({
  cities: [] as string[],
  categoryMains: [] as string[]
})

const graphData = reactive<GraphData>({
  nodes: [],
  links: [],
  topSkills: [],
  topJobs: [],
  topCompanies: [],
  topCities: [],
  categoryDistribution: [],
  jobCount: 0,
  skillCount: 0,
  companyCount: 0,
  cityCount: 0,
  relationCount: 0
})

const recommendForm = reactive({
  targetJob: '',
  skills: '',
  city: '',
  categoryMain: ''
})

const recommendResult = reactive<RecommendData>({
  coreSkills: [],
  missingSkills: [],
  relatedJobs: [],
  relatedCompanies: [],
  suggestions: [],
  summary: ''
})

const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  desc: ''
})

const categoryConfig: Record<string, { color: number; css: string; radius: number }> = {
  技能: { color: 0x5fe7ff, css: '#5fe7ff', radius: 350 },
  岗位: { color: 0x9ba8ff, css: '#9ba8ff', radius: 235 },
  公司: { color: 0xffc678, css: '#ffc678', radius: 455 },
  城市: { color: 0x82f2ba, css: '#82f2ba', radius: 525 },
  分类: { color: 0xd7a8ff, css: '#d7a8ff', radius: 160 }
}

const legendItems = [
  { label: '技能', color: categoryConfig.技能.css },
  { label: '岗位', color: categoryConfig.岗位.css },
  { label: '公司', color: categoryConfig.公司.css },
  { label: '城市', color: categoryConfig.城市.css },
  { label: '分类', color: categoryConfig.分类.css }
]

const demoSteps: DemoStep[] = [
  {
    title: '数据来源',
    category: '分类',
    desc: '图谱从岗位样本中抽取岗位类别、技能要求、企业和城市，形成就业能力关系网络。'
  },
  {
    title: '岗位中心',
    category: '岗位',
    desc: '岗位节点连接技能、公司、城市和分类，是理解就业需求的核心入口。'
  },
  {
    title: '技能热度',
    category: '技能',
    desc: '技能节点越大、关系越密集，说明在招聘样本中出现频次越高、适配岗位越多。'
  },
  {
    title: '企业需求',
    category: '公司',
    desc: '企业节点展示不同公司发布岗位与技能要求之间的联系，适合分析招聘侧需求。'
  },
  {
    title: '城市分布',
    category: '城市',
    desc: '城市节点反映岗位在地域上的分布，可辅助判断目标城市的就业机会。'
  }
]

const currentDemoStep = computed(() => demoSteps[demoStepIndex.value] || demoSteps[0])

const maxSkillValue = computed(() => Math.max(...graphData.topSkills.map((item) => item.value), 1))
const maxCategoryValue = computed(() =>
  Math.max(...graphData.categoryDistribution.map((item) => item.value), 1)
)
const selectedDegree = computed(() => selectedNode.value?.degree || 0)
const selectedNodeColor = computed(() => {
  if (!selectedNode.value) return 'rgba(56, 214, 255, 0.85)'
  return categoryConfig[selectedNode.value.category]?.css || '#38d6ff'
})

const kpiCards = computed(() => [
  { label: '岗位样本', value: graphData.jobCount || 0, unit: '条' },
  { label: '技能实体', value: graphData.skillCount || 0, unit: '个' },
  { label: '企业实体', value: graphData.companyCount || 0, unit: '家' },
  { label: '关系边', value: graphData.relationCount || graphData.links.length, unit: '条' }
])

const tooltipStyle = computed(() => ({
  left: `${tooltip.x + 16}px`,
  top: `${tooltip.y + 16}px`
}))

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let galaxyGroup: THREE.Group | null = null
let raycaster: THREE.Raycaster | null = null
let pointer: THREE.Vector2 | null = null
let resizeObserver: ResizeObserver | null = null
let animationId = 0
let timer: number | null = null
let sceneNodes: SceneNode[] = []
let sceneLinks: SceneLink[] = []
let relationParticles: THREE.Mesh[] = []
let labelNodeIds = new Set<string>()
let lastLabelUpdate = 0
let hoveredNode: SceneNode | null = null
let demoTimer: number | null = null
let glowTexture: THREE.CanvasTexture | null = null
const clock = new THREE.Clock()
let focusTween: {
  fromPosition: THREE.Vector3
  toPosition: THREE.Vector3
  fromTarget: THREE.Vector3
  toTarget: THREE.Vector3
  start: number
  duration: number
} | null = null

let rotationPaused = false
let interactionLockUntil = 0
const dragState = {
  pointerId: -1,
  isDown: false,
  isDragging: false,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  velocityX: 0,
  velocityY: 0,
  candidateNode: null as SceneNode | null
}

const updateClock = () => {
  const now = new Date()
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short'
  })
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getPercent = (value: number, max: number) =>
  Math.min(100, Math.round((value / Math.max(max, 1)) * 100))

const cleanNodeName = (id: string) => {
  if (!id) return '-'
  const index = id.indexOf(':')
  return index > -1 ? id.slice(index + 1) : id
}

const getRelationKey = (item: { source: string; target: string; relationType?: string }) => {
  return `${item.source}-${item.target}-${item.relationType || 'relation'}`
}

const initOptions = async () => {
  try {
    const res = await getJobSkillGraphOptions()
    options.cities = res.cities || []
    options.categoryMains = res.categoryMains || []
  } catch (error) {
    console.warn(error)
  }
}

const loadGraphData = async () => {
  loading.value = true
  tooltip.visible = false
  selectedNode.value = null
  selectedRelations.value = []
  enhancedRelations.value = []
  showCleanAnalysisCard.value = false
  cleanAiSummary.value = ''
  cleanAiBullets.value = []
  rotationPaused = false

  try {
    const res = await getJobSkillGraphData({ ...queryForm })
    setGraphData(res)
    await nextTick()
    renderGalaxy()
  } catch (error) {
    console.error(error)
    ElMessage.error('3D技能图谱加载失败，请检查后端接口或筛选条件')
    clearGalaxy()
  } finally {
    loading.value = false
  }
}

const setGraphData = (data: GraphData) => {
  graphData.nodes = data.nodes || []
  graphData.links = data.links || []
  graphData.topSkills = data.topSkills || []
  graphData.topJobs = data.topJobs || []
  graphData.topCompanies = data.topCompanies || []
  graphData.topCities = data.topCities || []
  graphData.categoryDistribution = data.categoryDistribution || []
  graphData.jobCount = data.jobCount || 0
  graphData.skillCount = data.skillCount || 0
  graphData.companyCount = data.companyCount || 0
  graphData.cityCount = data.cityCount || 0
  graphData.relationCount = data.relationCount || graphData.links.length
}

const handleSearch = () => {
  loadGraphData()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.city = ''
  queryForm.categoryMain = ''
  queryForm.limit = 500
  recommendForm.city = ''
  recommendForm.categoryMain = ''
  loadGraphData()
}

const goHome = () => {
  router.push('/home')
}

const toggleFullScreen = () => {
  const doc = document as Document & {
    webkitFullscreenElement?: Element
    webkitExitFullscreen?: () => Promise<void>
  }
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>
  }

  if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
    const request = el.requestFullscreen || el.webkitRequestFullscreen
    request?.call(el)
    return
  }

  const exit = document.exitFullscreen || doc.webkitExitFullscreen
  exit?.call(document)
}

const toggleCleanMode = async () => {
  cleanMode.value = !cleanMode.value
  tooltip.visible = false
  if (!cleanMode.value && demoMode.value) stopDemoMode()
  if (!cleanMode.value) showCleanAnalysisCard.value = false
  await nextTick()
  resizeThree()
  resetCamera()
  updateFloatingLabels(true)
}

const initThree = () => {
  const container = sceneRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x061936, 0.00115)

  camera = new THREE.PerspectiveCamera(48, container.clientWidth / container.clientHeight, 1, 4000)
  camera.position.set(0, 0, 1040)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.28
  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.enableRotate = false
  controls.enablePan = false
  controls.zoomSpeed = 0.82
  controls.minDistance = 260
  controls.maxDistance = 1680

  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()
  galaxyGroup = new THREE.Group()
  scene.add(galaxyGroup)

  addLights()
  addBackgroundStars()
  addCoreSphere()

  renderer.domElement.addEventListener('pointerdown', handlePointerDown)
  renderer.domElement.addEventListener('pointermove', handlePointerMove)
  renderer.domElement.addEventListener('pointerup', handlePointerUp)
  renderer.domElement.addEventListener('pointercancel', handlePointerCancel)
  renderer.domElement.addEventListener('pointerleave', handlePointerLeave)

  resizeObserver = new ResizeObserver(resizeThree)
  resizeObserver.observe(container)
  animate()
}

const addLights = () => {
  if (!scene) return
  scene.add(new THREE.AmbientLight(0xd8f2ff, 1.05))

  const lightA = new THREE.PointLight(0x5fe7ff, 2.4, 2100)
  lightA.position.set(420, 360, 620)
  scene.add(lightA)

  const lightB = new THREE.PointLight(0x9ba8ff, 1.75, 1800)
  lightB.position.set(-560, -260, -420)
  scene.add(lightB)

  const lightC = new THREE.DirectionalLight(0xffffff, 0.9)
  lightC.position.set(0, 520, 760)
  scene.add(lightC)
}

const addBackgroundStars = () => {
  if (!scene) return
  const geometry = new THREE.BufferGeometry()
  const positions: number[] = []

  for (let i = 0; i < 950; i++) {
    positions.push((Math.random() - 0.5) * 2200)
    positions.push((Math.random() - 0.5) * 1400)
    positions.push((Math.random() - 0.5) * 1800)
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  const material = new THREE.PointsMaterial({
    color: 0xc5e8ff,
    size: 1.7,
    transparent: true,
    opacity: 0.72,
    depthWrite: false
  })
  scene.add(new THREE.Points(geometry, material))
}

const addCoreSphere = () => {
  if (!galaxyGroup) return

  const coreGeometry = new THREE.SphereGeometry(92, 42, 42)
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0x2564a8,
    transparent: true,
    opacity: 0.22,
    wireframe: true
  })
  const core = new THREE.Mesh(coreGeometry, coreMaterial)
  galaxyGroup.add(core)

  const ringMaterial = new THREE.LineBasicMaterial({
    color: 0x5fe7ff,
    transparent: true,
    opacity: 0.34
  })
  ;[128, 220, 330, 430, 520].forEach((radius, index) => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2)
    const points = curve.getPoints(160)
    const geometry = new THREE.BufferGeometry().setFromPoints(
      points.map((point) => new THREE.Vector3(point.x, point.y, 0))
    )
    const ring = new THREE.LineLoop(geometry, ringMaterial.clone())
    ring.rotation.x = index % 2 === 0 ? Math.PI / 2.6 : Math.PI / 2
    ring.rotation.y = index % 2 === 0 ? Math.PI / 7 : Math.PI / 3.2
    galaxyGroup?.add(ring)
  })
}

const renderGalaxy = () => {
  if (!sceneRef.value) return
  if (!scene || !renderer) initThree()
  clearGalaxy(true)

  if (!galaxyGroup || !graphData.nodes.length) return

  const degreeMap = buildDegreeMap(graphData.links)
  const nodesByCategory = groupNodesByCategory(graphData.nodes)
  const nodeMap = new Map<string, SceneNode>()

  Object.entries(nodesByCategory).forEach(([category, nodes]) => {
    const config = categoryConfig[category] || categoryConfig.技能
    nodes.forEach((node, index) => {
      const degree = degreeMap.get(node.id) || 0
      const position = getShellPosition(index, nodes.length, config.radius, hashCode(node.id))
      const sceneNode: SceneNode = {
        ...node,
        category,
        degree,
        position,
        color: config.color,
        orbitPhase: (Math.abs(hashCode(node.id)) % 628) / 100,
        pulseSpeed: 0.72 + (Math.abs(hashCode(node.name || node.id)) % 80) / 100
      }
      const mesh = createNodeMesh(sceneNode)
      sceneNode.mesh = mesh
      nodeMap.set(sceneNode.id, sceneNode)
      sceneNodes.push(sceneNode)
      galaxyGroup?.add(mesh)

      if (shouldShowLabel(sceneNode, index)) {
        labelNodeIds.add(sceneNode.id)
      }
    })
  })

  graphData.links.forEach((link) => {
    const sourceNode = nodeMap.get(link.source)
    const targetNode = nodeMap.get(link.target)
    if (!sourceNode || !targetNode) return

    const sceneLink: SceneLink = { ...link, sourceNode, targetNode }
    const line = createLinkLine(sceneLink)
    sceneLink.object = line
    sceneLinks.push(sceneLink)
    galaxyGroup?.add(line)

    const particle = createRelationParticle(sceneLink)
    if (particle) {
      relationParticles.push(particle)
      galaxyGroup?.add(particle)
    }
  })
}

const groupNodesByCategory = (nodes: GraphNodeItem[]) => {
  const map: Record<string, GraphNodeItem[]> = {
    分类: [],
    岗位: [],
    技能: [],
    公司: [],
    城市: []
  }

  nodes.forEach((node) => {
    const category = node.category || '技能'
    if (!map[category]) map[category] = []
    map[category].push(node)
  })

  return map
}

const buildDegreeMap = (links: GraphLinkItem[]) => {
  const map = new Map<string, number>()
  links.forEach((link) => {
    map.set(link.source, (map.get(link.source) || 0) + 1)
    map.set(link.target, (map.get(link.target) || 0) + 1)
  })
  return map
}

const getShellPosition = (index: number, total: number, radius: number, seed: number) => {
  const safeTotal = Math.max(total, 1)
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const y = 1 - (index / Math.max(safeTotal - 1, 1)) * 2
  const shell = Math.sqrt(1 - y * y)
  const theta = goldenAngle * index + seed * 0.0009
  const jitter = 0.88 + (Math.abs(Math.sin(seed)) % 0.22)

  return new THREE.Vector3(
    Math.cos(theta) * shell * radius * jitter,
    y * radius * 0.72,
    Math.sin(theta) * shell * radius * jitter
  )
}

const getGlowTexture = () => {
  if (glowTexture) return glowTexture

  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, 'rgba(255,255,255,0.95)')
    gradient.addColorStop(0.24, 'rgba(130,220,255,0.55)')
    gradient.addColorStop(0.62, 'rgba(90,170,255,0.20)')
    gradient.addColorStop(1, 'rgba(20,80,160,0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 128, 128)
  }
  glowTexture = new THREE.CanvasTexture(canvas)
  return glowTexture
}

const createNodeMesh = (node: SceneNode) => {
  const size = Math.min(26, Math.max(7.5, node.symbolSize / 5 + node.degree * 0.58))
  const geometry = new THREE.SphereGeometry(size, 30, 30)
  const material = new THREE.MeshStandardMaterial({
    color: node.color,
    emissive: node.color,
    emissiveIntensity: 0.68,
    roughness: 0.22,
    metalness: 0.22,
    transparent: true,
    opacity: 1
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.copy(node.position)
  mesh.userData = {
    type: 'node',
    node,
    baseSize: size,
    targetScale: 1,
    currentScale: 1,
    pulsePhase: node.orbitPhase
  }

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: getGlowTexture(),
      color: node.color,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  )
  halo.scale.set(size * 6.8, size * 6.8, 1)
  halo.userData = { type: 'halo' }
  mesh.add(halo)

  return mesh
}

const createLinkLine = (link: SceneLink) => {
  const source = link.sourceNode?.position || new THREE.Vector3()
  const target = link.targetNode?.position || new THREE.Vector3()
  const middle = source.clone().add(target).multiplyScalar(0.5)
  const distance = source.distanceTo(target)
  middle.normalize().multiplyScalar(distance * 0.18 + 40)

  const curve = new THREE.CatmullRomCurve3([source, middle, target])
  const points = curve.getPoints(24)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const color = link.sourceNode?.color || 0x38d6ff
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: getLinkOpacity(link.value),
    depthWrite: false
  })
  const line = new THREE.Line(geometry, material)
  line.userData = { type: 'link', link, curve, baseOpacity: material.opacity }
  return line
}

const createRelationParticle = (link: SceneLink) => {
  if (!link.object || relationParticles.length > 120) return null
  const curve = link.object.userData.curve as THREE.CatmullRomCurve3 | undefined
  if (!curve) return null

  const value = Number(link.value || 1)
  const shouldCreate = value >= 5 || relationParticles.length < 50
  if (!shouldCreate) return null

  const color = link.sourceNode?.color || 0x5fe7ff
  const geometry = new THREE.SphereGeometry(2.4 + Math.min(value, 12) * 0.08, 10, 10)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.74,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const particle = new THREE.Mesh(geometry, material)
  particle.userData = {
    type: 'flow-particle',
    curve,
    progress: Math.random(),
    speed: 0.045 + Math.random() * 0.045,
    baseOpacity: material.opacity
  }
  particle.position.copy(curve.getPointAt(particle.userData.progress))
  return particle
}

const shouldShowLabel = (node: SceneNode, index: number) => {
  if (node.category === '分类' || node.category === '岗位') return index < 10
  if (node.category === '技能') return node.degree >= 3 || index < 10
  return index < 5
}

const getLinkOpacity = (value: number) => {
  if (value >= 10) return 0.76
  if (value >= 5) return 0.56
  return 0.36
}

const clearGalaxy = (keepShell = false) => {
  if (!galaxyGroup) return

  const reserved = keepShell ? galaxyGroup.children.slice(0, 6) : []
  galaxyGroup.children
    .filter((child) => !reserved.includes(child))
    .forEach((child) => {
      disposeObject(child)
      galaxyGroup?.remove(child)
    })

  sceneNodes = []
  sceneLinks = []
  relationParticles = []
  labelNodeIds.clear()
  floatingLabels.value = []
  hoveredNode = null
}

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const material = mesh.material as THREE.Material | THREE.Material[] | undefined
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose())
    } else if (material) {
      material.dispose()
    }
  })
}

const handlePointerDown = (event: PointerEvent) => {
  if (!renderer?.domElement) return
  dragState.pointerId = event.pointerId
  dragState.isDown = true
  dragState.isDragging = false
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.lastX = event.clientX
  dragState.lastY = event.clientY
  dragState.velocityX = 0
  dragState.velocityY = 0
  dragState.candidateNode = pickNode(event)
  interactionLockUntil = performance.now() + 500
  renderer.domElement.setPointerCapture?.(event.pointerId)
}

const handlePointerMove = (event: PointerEvent) => {
  if (dragState.isDown && dragState.pointerId === event.pointerId) {
    const totalDx = event.clientX - dragState.startX
    const totalDy = event.clientY - dragState.startY
    const dx = event.clientX - dragState.lastX
    const dy = event.clientY - dragState.lastY

    if (!dragState.isDragging && Math.hypot(totalDx, totalDy) > 4) {
      dragState.isDragging = true
      tooltip.visible = false
      document.body.style.cursor = 'grabbing'
    }

    if (dragState.isDragging) {
      rotateGalaxyByPointer(dx, dy)
      dragState.velocityX = THREE.MathUtils.lerp(dragState.velocityX, dy * 0.0028, 0.42)
      dragState.velocityY = THREE.MathUtils.lerp(dragState.velocityY, dx * 0.0032, 0.42)
      dragState.lastX = event.clientX
      dragState.lastY = event.clientY
      updateFloatingLabels(true)
      event.preventDefault()
      return
    }
  }

  const node = pickNode(event)
  if (node) {
    setHoveredNode(node)
    updateFloatingLabels(true)
    tooltip.visible = true
    tooltip.x = event.offsetX
    tooltip.y = event.offsetY
    tooltip.title = `${node.category} · ${node.name}`
    tooltip.desc = `直接关系 ${node.degree} 条，权重 ${
      node.count || node.weight || node.symbolSize || '-'
    }`
  } else {
    setHoveredNode(null)
    updateFloatingLabels(true)
    tooltip.visible = false
  }
}

const handlePointerUp = async (event: PointerEvent) => {
  if (!dragState.isDown || dragState.pointerId !== event.pointerId) return
  renderer?.domElement.releasePointerCapture?.(event.pointerId)
  document.body.style.cursor = ''

  const wasDragging = dragState.isDragging
  const node = wasDragging ? null : pickNode(event) || dragState.candidateNode
  resetDragState()

  if (wasDragging) {
    interactionLockUntil = performance.now() + 1600
    return
  }

  if (node) {
    await selectSceneNode(node)
  }
}

const handlePointerCancel = (event: PointerEvent) => {
  renderer?.domElement.releasePointerCapture?.(event.pointerId)
  document.body.style.cursor = ''
  resetDragState()
}

const handlePointerLeave = () => {
  if (!dragState.isDragging) {
    setHoveredNode(null)
    updateFloatingLabels(true)
    tooltip.visible = false
  }
}

const resetDragState = () => {
  dragState.pointerId = -1
  dragState.isDown = false
  dragState.isDragging = false
  dragState.candidateNode = null
}

const rotateGalaxyByPointer = (dx: number, dy: number) => {
  if (!galaxyGroup) return
  const sensitivity = cleanMode.value ? 0.0048 : 0.0042
  galaxyGroup.rotation.y += dx * sensitivity
  galaxyGroup.rotation.x += dy * sensitivity * 0.72
  galaxyGroup.rotation.x = THREE.MathUtils.clamp(galaxyGroup.rotation.x, -0.82, 0.82)
}

const selectSceneNode = async (node: SceneNode) => {
  stopDemoMode()
  rotationPaused = true
  selectedNode.value = node
  enhancedRelations.value = []
  cleanAiSummary.value = ''
  cleanAiBullets.value = []
  fillRecommendByNode(node)
  highlightNode(node)
  focusCameraToNode(node)
  updateFloatingLabels(true)
  await loadNodeRelations(node)

  if (cleanMode.value) {
    showCleanAnalysisCard.value = true
    await handleCleanAiAnalyze()
  }
}

const pickNode = (event: PointerEvent) => {
  if (!raycaster || !pointer || !camera || !renderer) return null
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const objects = sceneNodes.map((item) => item.mesh).filter(Boolean) as THREE.Mesh[]
  const intersects = raycaster.intersectObjects(objects, false)
  return (intersects[0]?.object.userData.node || null) as SceneNode | null
}

const setHoveredNode = (node: SceneNode | null) => {
  if (selectedNode.value) {
    hoveredNode = node
    return
  }

  if (hoveredNode && hoveredNode !== selectedNode.value) {
    setNodeVisual(hoveredNode, false, false, false)
  }
  hoveredNode = node
  if (node && node !== selectedNode.value) {
    setNodeVisual(node, true, false, false)
  }
}

const highlightNode = (node: SceneNode) => {
  const neighborIds = new Set<string>([node.id])

  sceneLinks.forEach((link) => {
    if (link.source === node.id || link.target === node.id) {
      neighborIds.add(link.source)
      neighborIds.add(link.target)
    }
  })

  sceneNodes.forEach((item) => {
    if (item === node) {
      setNodeVisual(item, true, true, false)
      return
    }
    setNodeVisual(item, neighborIds.has(item.id), false, !neighborIds.has(item.id))
  })

  sceneLinks.forEach((link) => {
    const isRelated = link.source === node.id || link.target === node.id
    const material = link.object?.material as THREE.LineBasicMaterial | undefined
    if (material) {
      material.opacity = isRelated ? 0.92 : 0.035
      material.color.setHex(isRelated ? node.color : 0x284a68)
    }
  })

  relationParticles.forEach((particle) => {
    const curveLink = sceneLinks.find(
      (link) => link.object?.userData.curve === particle.userData.curve
    )
    const isRelated = curveLink && (curveLink.source === node.id || curveLink.target === node.id)
    particle.visible = Boolean(isRelated)
  })
}

const setNodeVisual = (node: SceneNode, active: boolean, selected = false, muted = false) => {
  if (!node.mesh) return
  const material = node.mesh.material as THREE.MeshStandardMaterial
  material.emissiveIntensity = selected ? 1.22 : active ? 0.9 : muted ? 0.16 : 0.48
  material.opacity = selected ? 1 : active ? 0.98 : muted ? 0.22 : 0.84
  const scale = selected ? 1.55 : active ? 1.24 : muted ? 0.74 : 1
  node.mesh.userData.targetScale = scale

  const halo = node.mesh.children.find((child) => child.userData.type === 'halo') as
    | THREE.Sprite
    | undefined
  if (halo) {
    const haloMaterial = halo.material as THREE.SpriteMaterial
    haloMaterial.opacity = selected ? 0.54 : active ? 0.36 : muted ? 0.05 : 0.2
  }
}

const getLocalNodeRelations = (node: SceneNode): NodeRelationItem[] => {
  return sceneLinks
    .filter((link) => link.source === node.id || link.target === node.id)
    .slice(0, 18)
    .map((link) => ({
      source: link.source,
      target: link.target,
      relationType: link.relationType || '关联',
      relationDesc:
        link.relationDesc ||
        '基于岗位样本中的共现关系生成，用于辅助理解岗位、技能、企业与城市之间的联系。'
    }))
}

const loadNodeRelations = async (node: SceneNode) => {
  try {
    const res = await getJobSkillNodeRelations({
      nodeId: node.id,
      keyword: queryForm.keyword
    })
    const relations = (res.relations || []).slice(0, 18)
    selectedRelations.value = relations.length ? relations : getLocalNodeRelations(node)
  } catch (error) {
    console.error(error)
    selectedRelations.value = getLocalNodeRelations(node)
  }
}

const requestEnhancedRelations = async (showMessage = true) => {
  if (!selectedNode.value || !selectedRelations.value.length) return []
  const links = selectedRelations.value.slice(0, 6).map((item) => ({
    source: item.source,
    target: item.target,
    value: 1,
    relationType: item.relationType,
    relationDesc: item.relationDesc
  }))

  try {
    const result = await enhanceJobSkillRelations({ links, enableAi: true })
    enhancedRelations.value = result || []
    if (showMessage) ElMessage.success('当前节点关系说明已增强')
    return enhancedRelations.value
  } catch (error) {
    console.error(error)
    if (showMessage) ElMessage.warning('AI增强失败，已保留本地关系说明')
    enhancedRelations.value = []
    return []
  }
}

const handleEnhanceRelations = async () => {
  if (!selectedNode.value || !selectedRelations.value.length) return
  enhanceLoading.value = true
  try {
    await requestEnhancedRelations(true)
  } finally {
    enhanceLoading.value = false
  }
}

const getNodePracticalRole = (node: SceneNode) => {
  const map: Record<string, string> = {
    技能: '技能节点可用于从能力反推岗位方向，判断该技能最常出现在哪些岗位中，并辅助制定学习优先级。',
    岗位: '岗位节点可用于拆解目标岗位所需技能、企业需求和城市分布，适合作为求职规划的中心入口。',
    公司: '企业节点可用于观察不同企业的岗位发布方向和技能偏好，辅助筛选目标公司。',
    城市: '城市节点可用于判断岗位机会在地域上的聚集情况，辅助选择就业城市。',
    分类: '分类节点可用于理解岗位所属赛道，帮助用户在大方向上定位职业路径。'
  }
  return (
    map[node.category] || '当前节点可用于理解岗位数据中的实体关系，辅助完成就业分析和能力规划。'
  )
}

const buildCleanAiSummary = (node: SceneNode, enhanced: GraphLinkItem[]) => {
  const relationCount = selectedRelations.value.length
  const relatedNames = selectedRelations.value
    .slice(0, 5)
    .map((item) => cleanNodeName(item.source === node.id ? item.target : item.source))
    .filter(Boolean)

  const aiText = enhanced
    .map((item) => item.aiRelationDesc || item.relationDesc)
    .filter(Boolean)
    .slice(0, 2)
    .join('；')

  const base = `当前选择的是「${node.name}」${
    node.category
  }节点，已识别 ${relationCount} 条直接关系。${getNodePracticalRole(node)}`
  const relationText = relatedNames.length ? ` 重点关联对象包括：${relatedNames.join('、')}。` : ''
  const aiPart = aiText ? ` 大模型关系说明：${aiText}` : ''
  return `${base}${relationText}${aiPart}`
}

const buildCleanAiBullets = (node: SceneNode) => {
  const type = node.category
  if (type === '技能') {
    return [
      '可查看该技能对应的岗位方向，判断它是通用能力还是垂直岗位能力。',
      '可结合右侧关系边，筛选学习优先级较高的岗位技能组合。',
      '适合在求职规划中作为“已有能力 → 可投岗位”的分析入口。'
    ]
  }
  if (type === '岗位') {
    return [
      '可快速拆解目标岗位需要补齐的核心技能。',
      '可观察岗位与企业、城市之间的关系，辅助选择投递区域。',
      '适合在项目演示中说明系统如何从岗位数据生成能力画像。'
    ]
  }
  if (type === '城市') {
    return [
      '可判断该城市岗位机会与技能需求的集中方向。',
      '可辅助学生选择实习、就业和创业落地城市。',
      '适合结合热门岗位和企业节点进行区域就业分析。'
    ]
  }
  if (type === '公司') {
    return [
      '可观察企业发布岗位与技能要求之间的对应关系。',
      '可辅助用户判断目标企业的招聘方向与能力偏好。',
      '适合用于企业画像和岗位匹配说明。'
    ]
  }
  return [
    '可从分类维度理解岗位所属方向和能力结构。',
    '可辅助用户先选赛道，再进入具体岗位和技能分析。',
    '适合在答辩中说明图谱不是装饰，而是就业分析入口。'
  ]
}

const handleCleanAiAnalyze = async () => {
  if (!selectedNode.value || !selectedRelations.value.length) return
  cleanAiLoading.value = true
  cleanAiSummary.value = buildCleanAiSummary(selectedNode.value, [])
  cleanAiBullets.value = buildCleanAiBullets(selectedNode.value)

  try {
    const enhanced = await requestEnhancedRelations(false)
    cleanAiSummary.value = buildCleanAiSummary(selectedNode.value, enhanced)
    cleanAiBullets.value = buildCleanAiBullets(selectedNode.value)
  } finally {
    cleanAiLoading.value = false
  }
}

const handleRecommendFromCleanCard = () => {
  if (!selectedNode.value) return
  fillRecommendByNode(selectedNode.value)
  if (!recommendForm.targetJob && selectedNode.value.category !== '技能') {
    recommendForm.targetJob = selectedNode.value.name
  }
  if (!cleanMode.value) return
  ElMessage.success('已将当前节点带入能力补齐建议')
}

const fillRecommendByNode = (node: SceneNode) => {
  if (node.category === '岗位') recommendForm.targetJob = node.name
  if (node.category === '技能') {
    const skills = recommendForm.skills
      .split(/[、,，;；\s]+/)
      .map((item) => item.trim())
      .filter(Boolean)
    if (!skills.includes(node.name)) skills.push(node.name)
    recommendForm.skills = skills.join('，')
  }
  if (node.category === '城市') recommendForm.city = node.name
  if (node.category === '分类') recommendForm.categoryMain = node.name
}

const fillRecommendFromNode = () => {
  if (!selectedNode.value) {
    ElMessage.info('请先在星图中选择一个节点')
    return
  }
  fillRecommendByNode(selectedNode.value)
}

const handleRecommend = async () => {
  recommendLoading.value = true
  try {
    const res = await getJobSkillRecommend({
      targetJob: recommendForm.targetJob,
      skills: recommendForm.skills,
      city: recommendForm.city || queryForm.city,
      categoryMain: recommendForm.categoryMain || queryForm.categoryMain
    })
    recommendResult.coreSkills = res.coreSkills || []
    recommendResult.missingSkills = res.missingSkills || []
    recommendResult.relatedJobs = res.relatedJobs || []
    recommendResult.relatedCompanies = res.relatedCompanies || []
    recommendResult.suggestions = res.suggestions || []
    recommendResult.summary = res.summary || ''
  } catch (error) {
    console.error(error)
    ElMessage.error('能力补齐建议生成失败')
  } finally {
    recommendLoading.value = false
  }
}

const updateFloatingLabels = (force = false) => {
  if (!camera || !renderer || !sceneRef.value || !sceneNodes.length) return

  const now = performance.now()
  if (!force && now - lastLabelUpdate < 90) return
  lastLabelUpdate = now

  const container = sceneRef.value
  const width = container.clientWidth
  const height = container.clientHeight
  const centerX = width / 2
  const centerY = height / 2
  const projected: FloatingLabel[] = []

  const candidateNodes = sceneNodes
    .filter(
      (node) => labelNodeIds.has(node.id) || node === selectedNode.value || node === hoveredNode
    )
    .sort((a, b) => {
      const activeA = a === selectedNode.value || a === hoveredNode ? 10000 : 0
      const activeB = b === selectedNode.value || b === hoveredNode ? 10000 : 0
      return activeB + b.degree - (activeA + a.degree)
    })
    .slice(0, cleanMode.value ? 24 : 18)

  candidateNodes.forEach((node) => {
    if (!node.mesh) return
    const worldPosition = new THREE.Vector3()
    node.mesh.getWorldPosition(worldPosition)
    const vector = worldPosition.clone().project(camera as THREE.Camera)
    if (vector.z < -1 || vector.z > 1) return

    let x = (vector.x * 0.5 + 0.5) * width
    let y = (-vector.y * 0.5 + 0.5) * height
    if (x < -40 || x > width + 40 || y < -30 || y > height + 30) return

    const dx = x - centerX
    const dy = y - centerY
    const screenDistance = Math.sqrt(dx * dx + dy * dy)
    const isActive = node === selectedNode.value || node === hoveredNode
    if (!isActive && screenDistance < 92) return

    const offset = isActive ? 22 : 36
    const length = Math.max(screenDistance, 1)
    x += (dx / length) * offset
    y += (dy / length) * offset

    projected.push({
      id: node.id,
      name: node.name.length > 12 ? `${node.name.slice(0, 12)}…` : node.name,
      category: node.category,
      x,
      y,
      color: categoryConfig[node.category]?.css || '#5fe7ff',
      active: isActive,
      score: (isActive ? 10000 : 0) + node.degree * 12 + screenDistance
    })
  })

  floatingLabels.value = projected
    .sort((a, b) => b.score - a.score)
    .slice(0, cleanMode.value ? 22 : 14)
}

const resetCamera = () => {
  if (!camera || !controls) return
  focusTween = null
  rotationPaused = false
  selectedNode.value = null
  selectedRelations.value = []
  enhancedRelations.value = []
  showCleanAnalysisCard.value = false
  cleanAiSummary.value = ''
  cleanAiBullets.value = []
  sceneNodes.forEach((item) => setNodeVisual(item, false, false, false))
  sceneLinks.forEach((link) => {
    const material = link.object?.material as THREE.LineBasicMaterial | undefined
    if (material) {
      material.opacity = Number(link.object?.userData.baseOpacity || getLinkOpacity(link.value))
      material.color.setHex(link.sourceNode?.color || 0x38d6ff)
    }
  })
  relationParticles.forEach((particle) => {
    particle.visible = true
  })
  camera.position.set(0, 0, 1040)
  controls.target.set(0, 0, 0)
  controls.update()
  updateFloatingLabels(true)
}

const updateSceneMotion = (elapsed: number, delta: number) => {
  sceneNodes.forEach((node) => {
    if (!node.mesh) return
    const targetScale = Number(node.mesh.userData.targetScale || 1)
    const breath = 1 + Math.sin(elapsed * node.pulseSpeed + node.orbitPhase) * 0.045
    const nextScale = THREE.MathUtils.lerp(node.mesh.scale.x, targetScale * breath, 0.075)
    node.mesh.scale.setScalar(nextScale)

    const halo = node.mesh.children.find((child) => child.userData.type === 'halo') as
      | THREE.Sprite
      | undefined
    if (halo) {
      const baseSize = Number(node.mesh.userData.baseSize || 10)
      const haloPulse = 1 + Math.sin(elapsed * node.pulseSpeed + node.orbitPhase) * 0.12
      halo.scale.set(baseSize * 6.8 * haloPulse, baseSize * 6.8 * haloPulse, 1)
      const haloMaterial = halo.material as THREE.SpriteMaterial
      haloMaterial.opacity =
        targetScale > 1 ? 0.42 : 0.22 + Math.sin(elapsed * 1.2 + node.orbitPhase) * 0.05
    }
  })

  relationParticles.forEach((particle) => {
    const curve = particle.userData.curve as THREE.CatmullRomCurve3 | undefined
    if (!curve) return
    particle.userData.progress = (particle.userData.progress + particle.userData.speed * delta) % 1
    particle.position.copy(curve.getPointAt(particle.userData.progress))
    const material = particle.material as THREE.MeshBasicMaterial
    material.opacity =
      Number(particle.userData.baseOpacity || 0.7) *
      (0.72 + Math.sin(elapsed * 5 + particle.userData.progress * 9) * 0.22)
  })

  sceneLinks.forEach((link, index) => {
    const material = link.object?.material as THREE.LineBasicMaterial | undefined
    if (!material || !link.object) return

    const isRelated =
      selectedNode.value &&
      (link.source === selectedNode.value.id || link.target === selectedNode.value.id)
    const base = selectedNode.value
      ? isRelated
        ? 0.82
        : 0.08
      : Number(link.object.userData.baseOpacity || getLinkOpacity(link.value))
    material.opacity = Math.max(0.04, base * (0.86 + Math.sin(elapsed * 1.6 + index * 0.21) * 0.14))
  })
}

const focusCameraToNode = (node: SceneNode) => {
  if (!camera || !controls || !node.mesh) return
  const worldPosition = new THREE.Vector3()
  node.mesh.getWorldPosition(worldPosition)
  const direction = worldPosition.clone().normalize()
  if (direction.lengthSq() < 0.01) direction.set(0, 0, 1)

  const distance = cleanMode.value || demoMode.value ? 520 : 620
  focusTween = {
    fromPosition: camera.position.clone(),
    toPosition: worldPosition.clone().add(direction.multiplyScalar(distance)),
    fromTarget: controls.target.clone(),
    toTarget: worldPosition,
    start: performance.now(),
    duration: 980
  }
}

const updateCameraTween = () => {
  if (!focusTween || !camera || !controls) return

  const progress = Math.min(1, (performance.now() - focusTween.start) / focusTween.duration)
  const eased = 1 - Math.pow(1 - progress, 3)
  camera.position.lerpVectors(focusTween.fromPosition, focusTween.toPosition, eased)
  controls.target.lerpVectors(focusTween.fromTarget, focusTween.toTarget, eased)
  if (progress >= 1) focusTween = null
}

const pickDemoNode = (category: string) => {
  const list = sceneNodes
    .filter((node) => node.category === category)
    .sort((a, b) => b.degree - a.degree || Number(b.count || 0) - Number(a.count || 0))
  return list[0] || sceneNodes.sort((a, b) => b.degree - a.degree)[0]
}

const runDemoStep = () => {
  if (!sceneNodes.length) return
  const step = currentDemoStep.value
  const node = pickDemoNode(step.category)
  if (!node) return

  selectedNode.value = node
  enhancedRelations.value = []
  fillRecommendByNode(node)
  highlightNode(node)
  focusCameraToNode(node)
  updateFloatingLabels(true)
  loadNodeRelations(node)

  demoStepIndex.value = (demoStepIndex.value + 1) % demoSteps.length
}

const startDemoMode = () => {
  if (!sceneNodes.length) {
    ElMessage.info('请先生成图谱后再启动自动演示')
    return
  }
  if (!cleanMode.value) cleanMode.value = true
  demoMode.value = true
  demoStepIndex.value = 0
  runDemoStep()
  if (demoTimer) window.clearInterval(demoTimer)
  demoTimer = window.setInterval(runDemoStep, 4200)
}

const stopDemoMode = () => {
  demoMode.value = false
  if (demoTimer) {
    window.clearInterval(demoTimer)
    demoTimer = null
  }
}

const toggleDemoMode = async () => {
  if (demoMode.value) {
    stopDemoMode()
    return
  }
  await nextTick()
  startDemoMode()
}

const resizeThree = () => {
  const container = sceneRef.value
  if (!container || !camera || !renderer) return
  const width = container.clientWidth
  const height = container.clientHeight
  camera.aspect = width / Math.max(height, 1)
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  const delta = Math.min(clock.getDelta(), 0.04)
  const elapsed = clock.elapsedTime

  if (galaxyGroup) {
    const lockedByInteraction = performance.now() < interactionLockUntil
    const allowAutoRotate =
      demoMode.value || (!rotationPaused && !dragState.isDragging && !lockedByInteraction)

    if (dragState.isDragging) {
      // 拖拽时由 pointer 事件直接驱动，动画帧只负责渲染，避免方向漂移。
    } else if (
      !rotationPaused &&
      !demoMode.value &&
      (Math.abs(dragState.velocityX) > 0.00008 || Math.abs(dragState.velocityY) > 0.00008)
    ) {
      galaxyGroup.rotation.x += dragState.velocityX
      galaxyGroup.rotation.y += dragState.velocityY
      galaxyGroup.rotation.x = THREE.MathUtils.clamp(galaxyGroup.rotation.x, -0.82, 0.82)
      dragState.velocityX *= 0.91
      dragState.velocityY *= 0.91
    } else if (allowAutoRotate) {
      const speed = demoMode.value ? 0.0028 : 0.00155
      galaxyGroup.rotation.y += speed * (1 + Math.sin(elapsed * 0.36) * 0.18)
      galaxyGroup.rotation.x += (Math.sin(elapsed * 0.28) * 0.065 - galaxyGroup.rotation.x) * 0.018
      galaxyGroup.rotation.z += (Math.sin(elapsed * 0.18) * 0.025 - galaxyGroup.rotation.z) * 0.014
    }
  }

  updateSceneMotion(elapsed, delta)
  updateCameraTween()
  controls?.update()
  updateFloatingLabels()
  if (scene && camera && renderer) renderer.render(scene, camera)
}

const hashCode = (text: string) => {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }
  return hash
}

const destroyThree = () => {
  stopDemoMode()
  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
    renderer.domElement.removeEventListener('pointermove', handlePointerMove)
    renderer.domElement.removeEventListener('pointerup', handlePointerUp)
    renderer.domElement.removeEventListener('pointercancel', handlePointerCancel)
    renderer.domElement.removeEventListener('pointerleave', handlePointerLeave)
  }

  if (animationId) cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  controls?.dispose()
  if (scene) {
    scene.traverse((object) => disposeObject(object))
  }
  renderer?.dispose()
  glowTexture?.dispose()
  glowTexture = null

  scene = null
  camera = null
  renderer = null
  controls = null
  galaxyGroup = null
  raycaster = null
  pointer = null
  floatingLabels.value = []
}

onMounted(async () => {
  enterReady.value = true
  updateClock()
  timer = window.setInterval(updateClock, 1000)
  await nextTick()
  initThree()
  await initOptions()
  await loadGraphData()
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
  destroyThree()
})
</script>

<style scoped lang="scss">
.job-map-page {
  position: relative;
  min-height: 100vh;
  padding: 0;
  overflow: hidden;
  color: #dff4ff;
  background: radial-gradient(circle at 12% 10%, rgba(31, 109, 180, 0.22), transparent 34%),
    radial-gradient(circle at 86% 20%, rgba(91, 65, 170, 0.18), transparent 32%), #061936;
}

.map-bg {
  position: absolute;
  width: 360px;
  height: 360px;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.35;
}

.map-bg--left {
  bottom: 6%;
  left: -120px;
  background: rgba(56, 214, 255, 0.32);
}

.map-bg--right {
  top: 12%;
  right: -130px;
  background: rgba(124, 140, 255, 0.28);
}

.map-grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: linear-gradient(rgba(125, 190, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(125, 190, 255, 0.055) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at center, #000 28%, transparent 76%);
}

.map-header,
.filter-bar,
.map-body {
  position: relative;
  z-index: 1;
}

.map-header {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr;
  gap: 16px;
  align-items: center;
  min-height: 72px;
  margin: 16px 16px 0;
  padding: 14px 18px;
  border: 1px solid rgba(104, 189, 255, 0.18);
  border-radius: 18px;
  background: rgba(8, 31, 58, 0.78);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(14px);
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.62);
}

.header-center {
  text-align: center;
}

.system-title {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: 4px;
  text-shadow: 0 0 16px rgba(56, 214, 255, 0.45);
}

.system-line {
  width: 72%;
  height: 2px;
  margin: 10px auto 0;
  background: linear-gradient(90deg, transparent, rgba(56, 214, 255, 0.9), transparent);
}

.header-right {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.time-box {
  min-width: 150px;
  padding-right: 8px;
  text-align: right;
}

.time-box span {
  display: block;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.62);
}

.time-box strong {
  font-family: DIN Alternate, Arial, sans-serif;
  font-size: 20px;
  color: #ffffff;
}

.screen-btn {
  color: #dff4ff;
  border-color: rgba(104, 189, 255, 0.32);
  background: rgba(13, 42, 75, 0.58);
}

.screen-btn:hover {
  color: #ffffff;
  border-color: rgba(56, 214, 255, 0.78);
  background: rgba(24, 81, 128, 0.72);
}

.screen-btn--primary {
  border-color: rgba(56, 214, 255, 0.82);
  background: rgba(21, 102, 157, 0.86);
}

.filter-bar {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
  margin: 12px 16px 0;
  padding: 12px 16px;
  border: 1px solid rgba(104, 189, 255, 0.16);
  border-radius: 16px;
  background: rgba(8, 31, 58, 0.76);
}

.filter-title strong {
  display: block;
  font-size: 16px;
}

.filter-title span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.58);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
  justify-content: flex-end;
}

.filter-form :deep(.el-form-item) {
  margin-right: 12px;
  margin-bottom: 0;
}

.filter-form :deep(.el-form-item__label) {
  color: rgba(223, 244, 255, 0.78);
}

.filter-form :deep(.el-input__wrapper),
.filter-form :deep(.el-select__wrapper) {
  width: 170px;
  border: 1px solid rgba(104, 189, 255, 0.2);
  background: rgba(8, 27, 51, 0.8);
  box-shadow: none;
}

.filter-form :deep(.el-input__inner),
.filter-form :deep(.el-select__placeholder),
.filter-form :deep(.el-select__selected-item) {
  color: #dff4ff;
}

.filter-action-item :deep(.el-form-item__content) {
  gap: 8px;
}

.map-body {
  display: grid;
  grid-template-columns: minmax(260px, 320px) minmax(420px, 1fr) minmax(300px, 360px);
  gap: 14px;
  height: calc(100vh - 188px);
  min-height: 640px;
  margin: 12px 16px 16px;
}

.side-panel,
.galaxy-panel {
  min-height: 0;
}

.side-panel {
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.side-panel--right {
  padding-right: 6px;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.side-panel--right::-webkit-scrollbar,
.relation-list::-webkit-scrollbar,
.enhance-list::-webkit-scrollbar {
  width: 6px;
}

.side-panel--right::-webkit-scrollbar-thumb,
.relation-list::-webkit-scrollbar-thumb,
.enhance-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(95, 231, 255, 0.28);
}

.side-panel--right::-webkit-scrollbar-track,
.relation-list::-webkit-scrollbar-track,
.enhance-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.035);
}

.side-panel--right .panel-card {
  flex: 0 0 auto;
}

.panel-card,
.galaxy-panel {
  border: 1px solid rgba(104, 189, 255, 0.18);
  border-radius: 18px;
  background: rgba(8, 31, 58, 0.78);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(14px);
}

.panel-card {
  padding: 14px;
  overflow: hidden;
}

.side-panel--right .panel-card {
  overflow: visible;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel-title span {
  font-size: 15px;
  font-weight: 700;
}

.panel-title em {
  font-size: 11px;
  font-style: normal;
  color: rgba(56, 214, 255, 0.72);
  letter-spacing: 1px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.kpi-item {
  padding: 12px;
  border: 1px solid rgba(104, 189, 255, 0.14);
  border-radius: 14px;
  background: rgba(14, 48, 86, 0.68);
}

.kpi-item span {
  display: block;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.62);
}

.kpi-item strong {
  margin-top: 6px;
  font-family: DIN Alternate, Arial, sans-serif;
  font-size: 26px;
  color: #ffffff;
}

.kpi-item em {
  margin-left: 5px;
  font-size: 12px;
  font-style: normal;
  color: rgba(223, 244, 255, 0.55);
}

.rank-list {
  max-height: 260px;
  padding-right: 2px;
  overflow-y: auto;
}

.rank-list::-webkit-scrollbar {
  width: 0;
}

.rank-item {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 11px;
}

.rank-item i {
  width: 28px;
  height: 28px;
  font-family: DIN Alternate, Arial, sans-serif;
  font-style: normal;
  line-height: 28px;
  color: #38d6ff;
  text-align: center;
  border: 1px solid rgba(56, 214, 255, 0.22);
  border-radius: 9px;
  background: rgba(56, 214, 255, 0.08);
}

.rank-main {
  flex: 1;
  min-width: 0;
}

.rank-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 12px;
}

.rank-label span {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-label em {
  font-style: normal;
  color: rgba(223, 244, 255, 0.65);
}

.rank-track,
.category-progress {
  height: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.rank-bar,
.category-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(56, 214, 255, 0.45), rgba(56, 214, 255, 0.95));
}

.panel-card--compact {
  flex: 1;
  min-height: 0;
}

.category-list {
  max-height: 210px;
  overflow-y: auto;
}

.category-item {
  display: grid;
  grid-template-columns: 80px 1fr 42px;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.78);
}

.category-item span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-item em {
  font-style: normal;
  color: rgba(223, 244, 255, 0.62);
  text-align: right;
}

.galaxy-panel {
  position: relative;
  overflow: hidden;
}

.galaxy-toolbar {
  position: absolute;
  top: 14px;
  right: 14px;
  left: 14px;
  z-index: 2;
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.legend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-list span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 9px;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.78);
  border: 1px solid rgba(104, 189, 255, 0.16);
  border-radius: 999px;
  background: rgba(7, 28, 54, 0.72);
}

.legend-list i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.galaxy-tip {
  max-width: 330px;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.5);
  text-align: right;
}

.three-scene {
  position: absolute;
  inset: 0;
  cursor: grab;
}

.three-scene:active {
  cursor: grabbing;
}

.graph-tooltip {
  position: absolute;
  z-index: 4;
  max-width: 240px;
  padding: 10px 12px;
  pointer-events: none;
  border: 1px solid rgba(56, 214, 255, 0.35);
  border-radius: 12px;
  background: rgba(3, 12, 30, 0.86);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.32);
}

.graph-tooltip strong,
.graph-tooltip span {
  display: block;
}

.graph-tooltip strong {
  margin-bottom: 5px;
  color: #ffffff;
}

.graph-tooltip span {
  font-size: 12px;
  color: rgba(223, 244, 255, 0.68);
}

.empty-graph {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  transform: translate(-50%, -50%);
}

.empty-graph strong {
  font-size: 20px;
}

.empty-graph span {
  font-size: 13px;
  color: rgba(223, 244, 255, 0.58);
}

.galaxy-status {
  position: absolute;
  right: 18px;
  bottom: 18px;
  left: 18px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  pointer-events: none;
}

.galaxy-status div {
  padding: 10px 12px;
  border: 1px solid rgba(104, 189, 255, 0.16);
  border-radius: 14px;
  background: rgba(7, 28, 54, 0.72);
}

.galaxy-status span,
.galaxy-status strong {
  display: block;
}

.galaxy-status span {
  font-size: 12px;
  color: rgba(223, 244, 255, 0.52);
}

.galaxy-status strong {
  max-width: 100%;
  margin-top: 4px;
  overflow: hidden;
  font-size: 14px;
  color: #ffffff;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-label-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
}

.floating-label {
  position: absolute;
  display: inline-flex;
  gap: 6px;
  align-items: center;
  max-width: 180px;
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 600;
  color: #f4fbff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(95, 231, 255, 0.45);
  border-radius: 999px;
  background: rgba(4, 18, 36, 0.78);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.26);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(8px);
}

.floating-label i {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  box-shadow: 0 0 10px currentColor;
}

.floating-label span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.floating-label.is-active {
  z-index: 5;
  padding: 7px 11px;
  font-size: 13px;
  background: rgba(8, 32, 62, 0.92);
  box-shadow: 0 10px 30px rgba(95, 231, 255, 0.2);
}

.detail-card,
.ai-card,
.recommend-card {
  min-height: 0;
}

.side-panel--right .detail-card,
.side-panel--right .ai-card,
.side-panel--right .recommend-card {
  flex: 0 0 auto;
}

.node-profile {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(104, 189, 255, 0.15);
  border-radius: 14px;
  background: rgba(9, 34, 64, 0.58);
}

.node-profile > div:last-child {
  min-width: 0;
}

.node-icon {
  width: 42px;
  height: 42px;
  font-weight: 800;
  line-height: 42px;
  color: #041222;
  text-align: center;
  border-radius: 14px;
}

.node-profile strong,
.node-profile span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-profile span {
  margin-top: 5px;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.58);
}

.relation-list {
  max-height: clamp(220px, 34vh, 360px);
  padding-right: 4px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.relation-item,
.enhance-item {
  padding: 10px;
  margin-bottom: 9px;
  border: 1px solid rgba(104, 189, 255, 0.12);
  border-radius: 12px;
  background: rgba(9, 34, 64, 0.44);
}

.relation-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 7px;
  align-items: center;
  font-size: 12px;
}

.relation-top span {
  overflow: hidden;
  color: rgba(223, 244, 255, 0.88);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relation-top em {
  padding: 3px 7px;
  font-size: 11px;
  font-style: normal;
  color: #38d6ff;
  border-radius: 999px;
  background: rgba(56, 214, 255, 0.1);
}

.relation-item p {
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(223, 244, 255, 0.58);
}

.node-empty {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  color: rgba(223, 244, 255, 0.62);
  text-align: center;
}

.node-empty strong {
  color: #ffffff;
}

.ai-desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(223, 244, 255, 0.58);
}

.ai-btn {
  width: 100%;
}

.enhance-list {
  max-height: clamp(120px, 22vh, 240px);
  padding-right: 4px;
  margin-top: 10px;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.enhance-item strong,
.enhance-item span {
  display: block;
}

.enhance-item strong {
  margin-bottom: 5px;
  font-size: 12px;
  color: #ffffff;
}

.enhance-item span {
  font-size: 12px;
  line-height: 1.6;
  color: rgba(223, 244, 255, 0.64);
}

.recommend-form :deep(.el-form-item) {
  margin-bottom: 10px;
}

.recommend-form :deep(.el-form-item__label) {
  color: rgba(223, 244, 255, 0.72);
}

.recommend-form :deep(.el-input__wrapper) {
  border: 1px solid rgba(104, 189, 255, 0.18);
  background: rgba(8, 27, 51, 0.72);
  box-shadow: none;
}

.recommend-form :deep(.el-input__inner) {
  color: #dff4ff;
}

.recommend-actions {
  display: flex;
  gap: 8px;
}

.recommend-actions .screen-btn {
  flex: 1;
}

.recommend-result {
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px solid rgba(104, 189, 255, 0.12);
}

.recommend-result p {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.7;
  color: rgba(223, 244, 255, 0.68);
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-group span {
  padding: 4px 8px;
  font-size: 12px;
  color: #dff4ff;
  border: 1px solid rgba(56, 214, 255, 0.2);
  border-radius: 999px;
  background: rgba(56, 214, 255, 0.08);
}

.missing-title {
  margin: 10px 0 7px;
  font-size: 12px;
  color: rgba(223, 244, 255, 0.56);
}

.tag-group--warning span {
  border-color: rgba(255, 183, 94, 0.26);
  background: rgba(255, 183, 94, 0.08);
}

.panel-enter {
  opacity: 0;
  transition: all 0.72s ease;
}

.panel-enter--left {
  transform: translateX(-24px);
}

.panel-enter--right {
  transform: translateX(24px);
}

.panel-enter--center {
  transform: translateY(18px) scale(0.985);
}

.is-enter-ready .panel-enter {
  opacity: 1;
  transform: none;
}

.is-clean-mode {
  padding: 0;
}

.is-clean-mode .map-header,
.is-clean-mode .side-panel,
.is-clean-mode .galaxy-status {
  display: none;
}

.is-clean-mode .filter-bar {
  min-height: auto;
  margin: 12px 12px 0;
  padding: 10px 12px;
}

.is-clean-mode .filter-title span {
  display: none;
}

.is-clean-mode .map-body {
  height: calc(100vh - 92px);
  margin: 12px;
  min-height: 560px;
  grid-template-columns: minmax(0, 1fr);
}

.is-clean-mode .galaxy-panel {
  min-height: 0;
}

.is-clean-mode .galaxy-toolbar {
  top: 12px;
  right: 12px;
  left: 12px;
}

.is-clean-mode .galaxy-tip {
  display: none;
}

.is-clean-mode .clean-analysis-card {
  top: 78px;
  right: 16px;
  max-height: calc(100% - 96px);
}

@media (max-width: 1400px) {
  .map-body {
    grid-template-columns: 290px minmax(360px, 1fr) 320px;
  }

  .system-title {
    font-size: 22px;
    letter-spacing: 3px;
  }
}

@media (max-width: 1180px) {
  .map-header,
  .filter-bar {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }

  .map-body {
    height: auto;
    grid-template-columns: 1fr;
  }

  .galaxy-panel {
    height: 680px;
  }
}

.demo-guide {
  position: absolute;
  top: 58px;
  left: 24px;
  right: 24px;
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 12px 16px;
  border: 1px solid rgba(95, 231, 255, 0.22);
  border-radius: 14px;
  background: rgba(5, 19, 43, 0.62);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
  pointer-events: none;
  transform: translateY(0);
  transition: opacity 0.24s ease, transform 0.24s ease, border-color 0.24s ease;
}

.demo-guide strong {
  display: block;
  color: #edf9ff;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.demo-guide span {
  display: block;
  max-width: 780px;
  margin-top: 4px;
  color: rgba(220, 241, 255, 0.74);
  font-size: 12px;
  line-height: 1.6;
}

.demo-guide em {
  flex: 0 0 auto;
  min-width: 64px;
  padding: 5px 8px;
  border-radius: 999px;
  color: #7ee8ff;
  font-size: 12px;
  font-style: normal;
  text-align: center;
  background: rgba(95, 231, 255, 0.1);
  border: 1px solid rgba(95, 231, 255, 0.2);
}

.demo-guide.is-playing {
  border-color: rgba(130, 242, 186, 0.42);
  background: rgba(6, 28, 50, 0.76);
}

.demo-guide.is-playing em {
  color: #82f2ba;
  background: rgba(130, 242, 186, 0.1);
  border-color: rgba(130, 242, 186, 0.3);
}

.is-clean-mode .demo-guide {
  top: 70px;
  left: 34px;
  right: 34px;
}

@media (max-width: 1280px) {
  .demo-guide {
    left: 16px;
    right: 16px;
  }

  .demo-guide span {
    max-width: 560px;
  }
}
</style>

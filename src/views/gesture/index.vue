<template>
  <div
    class="gesture-star-page"
    :class="{
      'clean-mode': isCleanMode,
      'is-fullscreen': isFullscreen,
      'rotation-paused': rotationPaused,
      'mouse-dragging': mouseDragging,
      'page-entering': pageEntering,
      'post-load-spinning': postLoadSpinActive,
      'mobile-panel-open': mobilePanelOpen,
      'is-mobile-view': isMobileView
    }"
  >
    <div ref="threeContainerRef" class="three-container"></div>

    <div class="page-mask"></div>

    <div v-if="entryOverlayVisible" class="entry-stage" :class="{ leaving: !pageEntering }">
      <div class="entry-nebula"></div>
      <div class="entry-grid"></div>
      <div class="entry-ring entry-ring-outer"></div>
      <div class="entry-ring entry-ring-middle"></div>
      <div class="entry-ring entry-ring-inner"></div>
      <div class="entry-spark" v-for="item in 24" :key="item" :style="entrySparkStyle(item)"></div>
      <div class="entry-core">
        <div class="entry-logo">✦</div>
        <div class="entry-title">手势星空 · 岗位星球</div>
        <div class="entry-subtitle">正在唤醒岗位星云与交互引擎</div>
        <div class="entry-progress">
          <span :style="{ width: `${entryProgressPercent}%` }"></span>
        </div>
        <div class="entry-percent">{{ entryProgressPercent }}%</div>
      </div>
      <div class="entry-scan-line"></div>
    </div>

    <div class="label-layer">
      <div
        v-for="label in visibleLabels"
        :key="label.id"
        class="job-label"
        :class="{ selected: label.selected, hover: label.hover }"
        :style="label.style"
      >
        {{ label.text }}
      </div>
    </div>

    <div
      v-show="virtualCursor.visible"
      class="gesture-cursor"
      :class="{ active: hoveredJobId !== null, pinch: handState.pinchStrength > 0.68 }"
      :style="{ left: `${virtualCursor.x}px`, top: `${virtualCursor.y}px` }"
    >
      <span></span>
    </div>

    <div v-show="selectedScreen.visible" class="selection-line" :style="selectedLineStyle"></div>

    <div class="top-panel">
      <div class="title-area">
        <div class="title-icon">✦</div>
        <div>
          <div class="page-title">手势星空 · 岗位星球</div>
          <div class="page-subtitle"
            >每一颗星代表一个岗位，放大后查看岗位名称，捏合手势选中岗位</div
          >
        </div>
      </div>

      <div class="top-actions">
        <span v-if="rotationPaused" class="pause-badge">已暂停旋转</span>
        <el-button class="plain-btn" @click.stop="toggleCleanMode">
          {{ isCleanMode ? '退出清屏' : '清屏' }}
        </el-button>
        <el-button class="plain-btn" @click.stop="toggleFullscreen">
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </el-button>
        <el-button v-if="rotationPaused" class="plain-btn" @click.stop="resumeRotation"
          >继续旋转</el-button
        >
        <el-button class="plain-btn" @click.stop="goBack">返回首页</el-button>
        <el-button type="primary" class="start-btn" @click.stop="toggleCamera">
          {{ cameraStarted ? '关闭手势识别' : '开启手势识别' }}
        </el-button>
      </div>
    </div>

    <div v-show="isCleanMode" class="clean-mode-toolbar">
      <span class="toolbar-title">沉浸清屏</span>
      <el-button size="small" class="toolbar-btn" @click.stop="toggleCleanMode">退出清屏</el-button>
      <el-button size="small" class="toolbar-btn" @click.stop="toggleFullscreen">
        {{ isFullscreen ? '退出全屏' : '全屏' }}
      </el-button>
      <el-button v-if="rotationPaused" size="small" class="toolbar-btn" @click.stop="resumeRotation"
        >继续旋转</el-button
      >
    </div>

    <div class="control-panel" :class="{ open: mobilePanelOpen }">
      <div class="panel-header">
        <span class="status-dot" :class="{ active: cameraStarted }"></span>
        <span>{{ statusText }}</span>
      </div>
      <button class="mobile-panel-close" @click.stop="mobilePanelOpen = false">×</button>

      <div class="gesture-card">
        <div class="gesture-label">当前手势</div>
        <div class="gesture-name">{{ gestureName }}</div>
        <div class="gesture-desc">{{ gestureDesc }}</div>
      </div>

      <div class="data-grid">
        <div class="data-item">
          <span>岗位星点</span>
          <strong>{{ JOB_STAR_COUNT }}</strong>
        </div>
        <div class="data-item">
          <span>镜头距离</span>
          <strong>{{ Math.round(handState.currentDistance) }}</strong>
        </div>
        <div class="data-item">
          <span>数据来源</span>
          <strong>{{ jobSourceText }}</strong>
        </div>
        <div class="data-item">
          <span>旋转状态</span>
          <strong>{{ rotationPaused ? '已暂停' : '缓慢浏览' }}</strong>
        </div>
      </div>

      <div class="current-target">
        <div class="target-label">当前指向</div>
        <div class="target-name">{{ currentTargetName }}</div>
      </div>

      <div class="tips">
        <div>手掌左右移动：平滑旋转岗位星球</div>
        <div>五指张开靠近：放大星空并显示岗位名称</div>
        <div>握拳后远离：缩小星空并隐藏密集文字</div>
        <div>食指指向星点：显示悬浮高亮</div>
        <div>拇指与食指捏合：选中岗位并打开详情</div>
        <div>快速左右挥手：切换岗位区域</div>
        <div>按住鼠标左键左右拖动：自由旋转岗位星球</div>
        <div>鼠标滚轮：放大或缩小岗位星球</div>
        <div>双击星空空白区域：恢复缓慢旋转</div>
        <div>移动端：单指拖动旋转，点击星点打开岗位卡片，双指捏合缩放</div>
      </div>
    </div>

    <transition name="job-panel">
      <div
        v-if="selectedJob"
        :key="`${selectedJob.id}-${selectedJobVersion}`"
        class="job-detail-panel"
      >
        <div class="detail-sheet-handle"></div>
        <button class="panel-close" @click.stop="clearSelection">×</button>
        <div class="detail-kicker">已选中岗位星点</div>
        <div class="detail-title">{{ selectedJob.job.jobName }}</div>
        <div class="detail-company">{{ selectedJob.job.companyName || '未知公司' }}</div>
        <div class="detail-status">已为你暂停星空旋转，方便查看当前岗位信息</div>

        <div class="detail-actions">
          <el-button size="small" class="plain-btn" @click.stop="resumeRotation"
            >继续旋转</el-button
          >
          <el-button size="small" type="primary" class="start-btn" @click.stop="toggleCleanMode">
            {{ isCleanMode ? '退出清屏' : '清屏查看' }}
          </el-button>
        </div>

        <div class="detail-meta-grid">
          <div>
            <span>薪资</span>
            <strong>{{ selectedJob.job.salary || '面议' }}</strong>
          </div>
          <div>
            <span>城市</span>
            <strong>{{ formatLocation(selectedJob.job) }}</strong>
          </div>
          <div>
            <span>学历</span>
            <strong>{{ selectedJob.job.degree || '不限' }}</strong>
          </div>
          <div>
            <span>经验</span>
            <strong>{{ selectedJob.job.experience || '不限' }}</strong>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">技能标签</div>
          <div class="skill-tags">
            <span v-for="skill in skillList(selectedJob.job.skills)" :key="skill">{{ skill }}</span>
            <span v-if="skillList(selectedJob.job.skills).length === 0">暂无技能要求</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">岗位描述</div>
          <div class="detail-desc">
            {{ buildJobDescription(selectedJob.job) }}
          </div>
        </div>
      </div>
    </transition>

    <div class="camera-card" :class="{ 'camera-active': cameraStarted }">
      <video ref="videoRef" class="camera-video" autoplay muted playsinline></video>
      <canvas ref="handCanvasRef" class="hand-canvas"></canvas>

      <div v-if="!cameraStarted" class="camera-placeholder">
        <div class="camera-icon">📷</div>
        <div>摄像头未开启</div>
      </div>
    </div>

    <div class="bottom-hint">
      localhost 或 HTTPS 环境下开启摄像头；未开启时可用鼠标点击星点、滚轮缩放、拖拽旋转
    </div>

    <div v-show="!isCleanMode" class="mobile-quick-bar">
      <button class="mobile-chip" @click.stop="mobilePanelOpen = !mobilePanelOpen">
        <span class="chip-dot" :class="{ active: cameraStarted }"></span>
        {{ mobilePanelOpen ? '收起状态' : '状态' }}
      </button>
      <button class="mobile-chip" @click.stop="goBack">返回</button>
      <button class="mobile-chip" @click.stop="toggleCleanMode">清屏</button>
      <button v-if="rotationPaused" class="mobile-chip" @click.stop="resumeRotation">继续</button>
      <button class="mobile-chip primary" @click.stop="toggleCamera">
        {{ cameraStarted ? '关闭手势' : '开启手势' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import * as THREE from 'three'
  import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision'
  import { getJobPage, type JobItem } from '@/api/job-list'

  type HandPoint = {
    x: number
    y: number
    z?: number
  }

  type JobStar = {
    id: number
    index: number
    job: JobItem
    position: THREE.Vector3
    seed: number
  }

  type VisibleLabel = {
    id: string
    text: string
    selected: boolean
    hover: boolean
    style: Record<string, string>
  }

  const router = useRouter()

  const threeContainerRef = ref<HTMLDivElement | null>(null)
  const videoRef = ref<HTMLVideoElement | null>(null)
  const handCanvasRef = ref<HTMLCanvasElement | null>(null)

  const JOB_STAR_COUNT = 1600
  const RING_PARTICLE_COUNT = 900
  const BACKGROUND_PARTICLE_COUNT = 1100
  const PLANET_RADIUS = 168
  const MIN_CAMERA_DISTANCE = 118
  const MAX_CAMERA_DISTANCE = 520
  const DEFAULT_CAMERA_DISTANCE = 338
  const LABEL_NEAR_DISTANCE = 260
  const LABEL_CLOSE_DISTANCE = 190
  const HOVER_PIXEL_RADIUS = 32
  const WHEEL_ZOOM_BASE_STEP = 34
  const WHEEL_ZOOM_MAX_STEP = 82
  const MOUSE_ROTATE_SPEED_X = 0.0062
  const MOUSE_ROTATE_SPEED_Y = 0.0048
  const MOUSE_DRAG_THRESHOLD = 4
  const ENTRY_ANIMATION_DURATION = 3000
  const ENTRY_OVERLAY_HIDE_DELAY = 720
  const POST_LOAD_SPIN_DURATION = 4000
  const POST_LOAD_SPIN_START_SPEED = 0.03
  const POST_LOAD_SPIN_END_SPEED = 0.00035
  const POST_LOAD_SPIN_DISTANCE_PULL = 28

  const statusText = ref('未开启摄像头')
  const gestureName = ref('等待手势')
  const gestureDesc = ref('点击右上角按钮后，将手放到摄像头前')
  const jobSourceText = ref('模拟岗位')

  const cameraStarted = ref(false)
  const isCleanMode = ref(false)
  const isFullscreen = ref(false)
  const rotationPaused = ref(false)
  const mouseDragging = ref(false)
  const pageEntering = ref(true)
  const postLoadSpinActive = ref(false)
  const mobilePanelOpen = ref(false)
  const isMobileView = ref(window.innerWidth <= 640)
  const entryOverlayVisible = ref(true)
  const entryProgressPercent = ref(0)
  const visibleLabels = ref<VisibleLabel[]>([])
  const hoveredJobId = ref<number | null>(null)
  const selectedJobId = ref<number | null>(null)
  const selectedJobSnapshot = ref<JobStar | null>(null)
  const hoveredJobSnapshot = ref<JobStar | null>(null)
  const selectedJobVersion = ref(0)

  const virtualCursor = reactive({
    visible: false,
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  })

  const selectedScreen = reactive({
    visible: false,
    x: 0,
    y: 0
  })

  const handState = reactive({
    visible: false,
    x: 0.5,
    y: 0.5,
    indexX: 0.5,
    indexY: 0.5,
    pinchStrength: 0,
    openStrength: 0,
    fistStrength: 0,
    targetRotX: 0,
    targetRotY: 0,
    targetRotZ: 0,
    currentRotX: 0,
    currentRotY: 0,
    currentRotZ: 0,
    swipeOffset: 0,
    targetDistance: DEFAULT_CAMERA_DISTANCE,
    currentDistance: DEFAULT_CAMERA_DISTANCE
  })

  const selectedLineStyle = computed(() => {
    if (!selectedScreen.visible) return { opacity: '0' }

    const panelX = Math.max(window.innerWidth - 430, window.innerWidth * 0.68)
    const panelY = window.innerHeight * 0.48
    const dx = panelX - selectedScreen.x
    const dy = panelY - selectedScreen.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)

    return {
      left: `${selectedScreen.x}px`,
      top: `${selectedScreen.y}px`,
      width: `${length}px`,
      transform: `rotate(${angle}rad)`,
      opacity: selectedJobId.value !== null ? '1' : '0'
    }
  })

  // hover 与 selected 都使用快照，避免动画帧中反复按 id 查找，造成控制台刷屏与无意义计算
  const hoveredJob = computed(() => hoveredJobSnapshot.value)
  const selectedJob = computed(() => selectedJobSnapshot.value)
  const currentTargetName = computed(
    () => hoveredJob.value?.job.jobName || selectedJob.value?.job.jobName || '移动食指指向岗位星点'
  )

  let scene: THREE.Scene | null = null
  let camera: THREE.PerspectiveCamera | null = null
  let renderer: THREE.WebGLRenderer | null = null
  let galaxyGroup: THREE.Group | null = null
  let jobStars: THREE.Points | null = null
  let jobGeometry: THREE.BufferGeometry | null = null
  let jobMaterial: THREE.PointsMaterial | null = null
  let ringGroup: THREE.Group | null = null
  let backgroundStars: THREE.Points | null = null
  let planetGlow: THREE.Mesh | null = null
  let hoverMarker: THREE.Sprite | null = null
  let selectedMarker: THREE.Sprite | null = null
  let animationId = 0
  let detectId = 0
  let stream: MediaStream | null = null
  let handLandmarker: HandLandmarker | null = null
  let jobStarsData: JobStar[] = []
  let jobStarsMap = new Map<number, JobStar>()
  let activeJobs: JobItem[] = []
  let starColors: Float32Array | null = null
  let baseColor = new THREE.Color(0x7dd3fc)
  let hoverColor = new THREE.Color(0x22d3ee)
  let selectedColor = new THREE.Color(0xe0f2fe)
  let autoRotate = 0
  let renderFrame = 0
  let lastHoverId: number | null = null
  let lastSelectedId: number | null = null
  let pendingPinchSelect = false
  let lastPinchAt = 0
  let lastSwipeAt = 0
  let lastPalmX = 0.5
  let lastPalmAt = 0
  let wheelZoomActive = false
  let manualRotationActive = false
  let isMouseDragging = false
  let mouseDragStarted = false
  let mouseDragStartX = 0
  let mouseDragStartY = 0
  let mouseDragStartRotX = 0
  let mouseDragStartRotY = 0
  let suppressNextClick = false
  let touchDragging = false
  let touchDragStarted = false
  let touchZooming = false
  let touchStartX = 0
  let touchStartY = 0
  let touchLastX = 0
  let touchLastY = 0
  let touchStartRotX = 0
  let touchStartRotY = 0
  let touchStartDistance = 0
  let touchStartCameraDistance = DEFAULT_CAMERA_DISTANCE
  let entryStartAt = 0
  let entryProgress = 0
  let entryHideTimer = 0
  let postLoadSpinStartAt = 0

  const projectionVector = new THREE.Vector3()
  const worldVector = new THREE.Vector3()

  onMounted(async () => {
    await nextTick()
    activeJobs = createFallbackJobs(JOB_STAR_COUNT)
    preparePageEntrance()
    initThree()
    animate()
    loadJobData()

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('blur', cancelMouseDrag)
    window.addEventListener('wheel', handleMouseWheel, { passive: false })
    window.addEventListener('click', handleMouseClick)
    window.addEventListener('dblclick', handleMouseDoubleClick)
    window.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: false })
    window.addEventListener('touchcancel', handleTouchEnd, { passive: false })
    document.addEventListener('fullscreenchange', handleFullscreenChange)
  })

  onBeforeUnmount(() => {
    stopCamera()

    if (animationId) cancelAnimationFrame(animationId)
    if (entryHideTimer) window.clearTimeout(entryHideTimer)

    window.removeEventListener('resize', handleResize)
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mousedown', handleMouseDown)
    window.removeEventListener('mouseup', handleMouseUp)
    window.removeEventListener('blur', cancelMouseDrag)
    window.removeEventListener('wheel', handleMouseWheel)
    window.removeEventListener('click', handleMouseClick)
    window.removeEventListener('dblclick', handleMouseDoubleClick)
    window.removeEventListener('touchstart', handleTouchStart)
    window.removeEventListener('touchmove', handleTouchMove)
    window.removeEventListener('touchend', handleTouchEnd)
    window.removeEventListener('touchcancel', handleTouchEnd)
    document.removeEventListener('fullscreenchange', handleFullscreenChange)

    disposeThree()
  })

  const preparePageEntrance = () => {
    pageEntering.value = true
    entryOverlayVisible.value = true
    entryProgressPercent.value = 0
    entryStartAt = performance.now()
    entryProgress = 0
    postLoadSpinActive.value = false
    postLoadSpinStartAt = 0
    autoRotate = -0.42

    handState.currentDistance = MAX_CAMERA_DISTANCE
    handState.targetDistance = DEFAULT_CAMERA_DISTANCE
    handState.currentRotX = -0.18
    handState.targetRotX = 0
    handState.currentRotY = -0.72
    handState.targetRotY = 0
    handState.currentRotZ = 0.18
    handState.targetRotZ = 0
  }

  const updatePageEntrance = () => {
    if (!entryOverlayVisible.value || !entryStartAt) return

    const elapsed = performance.now() - entryStartAt
    const rawProgress = clamp(elapsed / ENTRY_ANIMATION_DURATION, 0, 1)
    const easedProgress = easeOutCubic(rawProgress)
    entryProgress = easedProgress
    entryProgressPercent.value = Math.min(100, Math.round(rawProgress * 100))

    if (galaxyGroup) {
      const scale = 0.5 + easedProgress * 0.5
      galaxyGroup.scale.setScalar(scale)
    }

    if (ringGroup) {
      const ringScale = 0.64 + easedProgress * 0.36
      ringGroup.scale.setScalar(ringScale)
    }

    if (jobMaterial) {
      jobMaterial.opacity = 0.52 + easedProgress * 0.42
    }

    if (planetGlow) {
      const pulse =
        0.82 + easedProgress * 0.18 + Math.sin(performance.now() * 0.006) * (1 - rawProgress) * 0.06
      planetGlow.scale.setScalar(pulse)
    }

    if (rawProgress >= 1 && pageEntering.value) {
      pageEntering.value = false
      entryProgressPercent.value = 100

      if (entryHideTimer) window.clearTimeout(entryHideTimer)
      entryHideTimer = window.setTimeout(() => {
        entryOverlayVisible.value = false
        if (galaxyGroup) galaxyGroup.scale.setScalar(1)
        if (ringGroup) ringGroup.scale.setScalar(1)
        if (jobMaterial) jobMaterial.opacity = 0.94
        if (planetGlow) planetGlow.scale.setScalar(1)
        startPostLoadSpin()
      }, ENTRY_OVERLAY_HIDE_DELAY)
    }
  }

  const startPostLoadSpin = () => {
    if (postLoadSpinActive.value) return
    if (rotationPaused.value || isMouseDragging || handState.visible) return

    postLoadSpinActive.value = true
    postLoadSpinStartAt = performance.now()
    manualRotationActive = false
    handState.targetRotZ = 0
    gestureName.value = '星球启动旋转'
    gestureDesc.value = '岗位星球正在进行 4 秒快速旋转展示，结束后自动恢复缓慢浏览'
  }

  const stopPostLoadSpin = (showText = false) => {
    if (!postLoadSpinActive.value) return

    postLoadSpinActive.value = false
    postLoadSpinStartAt = 0
    handState.targetRotZ = 0

    if (showText && !rotationPaused.value) {
      gestureName.value = '自动旋转'
      gestureDesc.value = '星球启动动画已结束，已恢复原来的自动缓慢旋转'
    }
  }

  const entrySparkStyle = (index: number): Record<string, string> => {
    const angle = seededRandom(index * 17 + 5) * Math.PI * 2
    const radius = 18 + seededRandom(index * 23 + 11) * 46
    const x = 50 + Math.cos(angle) * radius
    const y = 50 + Math.sin(angle) * radius
    const size = 2 + seededRandom(index * 29 + 3) * 5
    const delay = seededRandom(index * 31 + 9) * 1.8
    const duration = 1.9 + seededRandom(index * 37 + 13) * 1.8

    return {
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    }
  }

  const easeOutCubic = (value: number) => {
    return 1 - Math.pow(1 - value, 3)
  }

  const initThree = () => {
    const container = threeContainerRef.value
    if (!container) return

    const width = container.clientWidth
    const height = container.clientHeight

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x020617, 0.0016)

    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2200)
    camera.position.set(0, 0, handState.currentDistance)
    camera.lookAt(0, 0, 0)

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x020617, 0)
    container.appendChild(renderer.domElement)

    galaxyGroup = new THREE.Group()
    scene.add(galaxyGroup)

    createBackgroundStars()
    createJobStarField(activeJobs)
    createParticleRings()
    createGlowCore()
    createSelectionMarkers()
  }

  const disposeThree = () => {
    disposeObject(jobStars)
    disposeObject(backgroundStars)
    disposeObject(planetGlow)
    disposeObject(hoverMarker)
    disposeObject(selectedMarker)

    if (ringGroup) {
      ringGroup.children.forEach((child: THREE.Object3D) => disposeObject(child))
      ringGroup.clear()
    }

    if (renderer) {
      renderer.dispose()
      renderer.domElement.remove()
    }

    scene = null
    camera = null
    renderer = null
    galaxyGroup = null
  }

  const disposeObject = (object: THREE.Object3D | null) => {
    if (!object) return

    if (object.parent) object.parent.remove(object)

    const mesh = object as THREE.Mesh | THREE.Points | THREE.Sprite
    const geometry = 'geometry' in mesh ? mesh.geometry : null
    const material = 'material' in mesh ? mesh.material : null

    if (geometry) geometry.dispose()

    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose())
    } else if (material) {
      material.dispose()
    }
  }

  const loadJobData = async () => {
    try {
      const result = await getJobPage({
        pageNum: 1,
        pageSize: JOB_STAR_COUNT
      })

      const list = Array.isArray(result?.list) ? result.list : []
      if (!list.length) return

      activeJobs = normalizeJobList(list, JOB_STAR_COUNT)
      jobSourceText.value = '岗位接口'
      rebuildJobGalaxy(activeJobs)
    } catch (error) {
      console.warn('岗位接口加载失败，继续使用模拟岗位数据', error)
      jobSourceText.value = '模拟岗位'
    }
  }

  const rebuildJobGalaxy = (jobs: JobItem[]) => {
    createJobStarField(jobs)
    selectedJobId.value = null
    selectedJobSnapshot.value = null
    hoveredJobSnapshot.value = null
    selectedJobVersion.value += 1
    hoveredJobId.value = null
    visibleLabels.value = []
  }

  const createJobStarField = (jobs: JobItem[]) => {
    if (!galaxyGroup) return

    disposeObject(jobStars)
    jobStars = null
    jobGeometry = null
    jobMaterial = null
    starColors = null

    jobStarsData = buildJobStars(jobs)
    jobStarsMap = new Map(jobStarsData.map((item) => [item.id, item]))

    const positions = new Float32Array(JOB_STAR_COUNT * 3)
    starColors = new Float32Array(JOB_STAR_COUNT * 3)

    for (let i = 0; i < JOB_STAR_COUNT; i++) {
      const index = i * 3
      const star = jobStarsData[i]

      positions[index] = star.position.x
      positions[index + 1] = star.position.y
      positions[index + 2] = star.position.z

      const warmth = 0.86 + seededRandom(i + 77) * 0.24
      const color = new THREE.Color().setHSL(0.56 + seededRandom(i + 3) * 0.18, 0.9, 0.46 * warmth)
      starColors[index] = color.r
      starColors[index + 1] = color.g
      starColors[index + 2] = color.b
    }

    jobGeometry = new THREE.BufferGeometry()
    jobGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    jobGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    jobMaterial = new THREE.PointsMaterial({
      size: 5.4,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.94,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    })

    jobStars = new THREE.Points(jobGeometry, jobMaterial)
    galaxyGroup.add(jobStars)
  }

  const buildJobStars = (jobs: JobItem[]) => {
    const result: JobStar[] = []
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))

    for (let i = 0; i < JOB_STAR_COUNT; i++) {
      const y = 1 - (i / (JOB_STAR_COUNT - 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = i * goldenAngle
      const shellJitter = (seededRandom(i * 17) - 0.5) * 18
      const radius = PLANET_RADIUS + shellJitter

      const x = Math.cos(theta) * radiusAtY * radius
      const z = Math.sin(theta) * radiusAtY * radius
      const position = new THREE.Vector3(x, y * radius, z)

      result.push({
        id: i,
        index: i,
        job: jobs[i % jobs.length],
        position,
        seed: seededRandom(i * 31 + 11)
      })
    }

    return result
  }

  const createParticleRings = () => {
    if (!galaxyGroup) return

    ringGroup = new THREE.Group()
    galaxyGroup.add(ringGroup)

    const ringOne = createRingParticles(RING_PARTICLE_COUNT, 238, 278, 0.2, 0xe0f2fe, 3.6)
    const ringTwo = createRingParticles(RING_PARTICLE_COUNT, 295, 346, -0.32, 0xa5b4fc, 3)

    ringGroup.add(ringOne)
    ringGroup.add(ringTwo)
  }

  const createRingParticles = (
    count: number,
    radiusX: number,
    radiusZ: number,
    tilt: number,
    color: number,
    size: number
  ) => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const particleColor = new THREE.Color(color)

    for (let i = 0; i < count; i++) {
      const index = i * 3
      const angle = (i / count) * Math.PI * 2
      const noise = (seededRandom(i * 19 + radiusX) - 0.5) * 20
      const band = (seededRandom(i * 13 + radiusZ) - 0.5) * 22

      positions[index] = Math.cos(angle) * (radiusX + noise)
      positions[index + 1] = band
      positions[index + 2] = Math.sin(angle) * (radiusZ + noise)

      colors[index] = particleColor.r
      colors[index + 1] = particleColor.g
      colors[index + 2] = particleColor.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    })

    const ring = new THREE.Points(geometry, material)
    ring.rotation.x = tilt
    ring.rotation.z = 0.18
    return ring
  }

  const createBackgroundStars = () => {
    if (!scene) return

    const positions = new Float32Array(BACKGROUND_PARTICLE_COUNT * 3)

    for (let i = 0; i < BACKGROUND_PARTICLE_COUNT; i++) {
      const index = i * 3
      const radius = 620 + seededRandom(i + 200) * 820
      const theta = seededRandom(i * 7 + 9) * Math.PI * 2
      const phi = Math.acos(seededRandom(i * 5 + 3) * 2 - 1)

      positions[index] = radius * Math.sin(phi) * Math.cos(theta)
      positions[index + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[index + 2] = radius * Math.cos(phi)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    const material = new THREE.PointsMaterial({
      color: 0xdbeafe,
      size: 1.9,
      transparent: true,
      opacity: 0.62,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    backgroundStars = new THREE.Points(geometry, material)
    scene.add(backgroundStars)
  }

  const createGlowCore = () => {
    if (!galaxyGroup) return

    const geometry = new THREE.SphereGeometry(116, 48, 48)
    const material = new THREE.MeshBasicMaterial({
      color: 0x312e81,
      transparent: true,
      opacity: 0.13,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })

    planetGlow = new THREE.Mesh(geometry, material)
    galaxyGroup.add(planetGlow)
  }

  const createSelectionMarkers = () => {
    if (!galaxyGroup) return

    const hoverTexture = createCircleTexture(
      'rgba(103, 232, 249, 0.96)',
      'rgba(103, 232, 249, 0.08)'
    )
    const selectedTexture = createCircleTexture(
      'rgba(224, 242, 254, 1)',
      'rgba(99, 102, 241, 0.08)'
    )

    hoverMarker = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: hoverTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    )
    hoverMarker.scale.set(24, 24, 1)
    hoverMarker.visible = false
    galaxyGroup.add(hoverMarker)

    selectedMarker = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: selectedTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    )
    selectedMarker.scale.set(28, 28, 1)
    selectedMarker.visible = false
    galaxyGroup.add(selectedMarker)
  }

  const createCircleTexture = (stroke: string, fill: string) => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, 128, 128)
    const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 58)
    gradient.addColorStop(0, fill)
    gradient.addColorStop(0.55, fill)
    gradient.addColorStop(1, 'rgba(255,255,255,0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(64, 64, 58, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = stroke
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.arc(64, 64, 42, 0, Math.PI * 2)
    ctx.stroke()

    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(64, 64, 55, 0, Math.PI * 2)
    ctx.stroke()

    return new THREE.CanvasTexture(canvas)
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    renderFrame += 1

    updateGestureMotion()
    updatePageEntrance()
    updateMarkers()
    updateHoverAndLabels()

    if (renderer && scene && camera) {
      renderer.render(scene, camera)
    }
  }

  const updateGestureMotion = () => {
    if (!galaxyGroup || !camera) return

    const now = performance.now()
    const locked = rotationPaused.value
    const mouseRotating = isMouseDragging || manualRotationActive

    if (handState.visible) {
      if (!locked && !mouseRotating) {
        handState.targetRotY = (handState.x - 0.5) * 0.48 + handState.swipeOffset
        handState.targetRotX = (handState.y - 0.5) * 0.3
      }

      if (handState.openStrength > 0.56) {
        wheelZoomActive = false
        handState.targetDistance = MIN_CAMERA_DISTANCE + (1 - handState.openStrength) * 82
      } else if (handState.fistStrength > 0.58) {
        wheelZoomActive = false
        handState.targetDistance = MAX_CAMERA_DISTANCE - (1 - handState.fistStrength) * 95
      } else if (!wheelZoomActive) {
        const relaxedTarget = selectedJobId.value !== null ? 228 : DEFAULT_CAMERA_DISTANCE
        handState.targetDistance += (relaxedTarget - handState.targetDistance) * 0.014
      }
    } else {
      if (postLoadSpinActive.value && (locked || mouseRotating)) {
        stopPostLoadSpin(false)
      }

      if (!locked && !mouseRotating) {
        if (postLoadSpinActive.value) {
          const spinElapsed = now - postLoadSpinStartAt
          const spinProgress = clamp(spinElapsed / POST_LOAD_SPIN_DURATION, 0, 1)
          const spinEase = easeOutCubic(spinProgress)
          const spinSpeed =
            POST_LOAD_SPIN_START_SPEED +
            (POST_LOAD_SPIN_END_SPEED - POST_LOAD_SPIN_START_SPEED) * spinEase

          autoRotate += spinSpeed
          handState.targetRotX = Math.sin(now * 0.0028) * (1 - spinEase) * 0.18
          handState.targetRotZ = Math.sin(now * 0.0022) * (1 - spinEase) * 0.12

          if (!wheelZoomActive) {
            const distancePull = Math.sin(spinProgress * Math.PI) * POST_LOAD_SPIN_DISTANCE_PULL
            handState.targetDistance +=
              (DEFAULT_CAMERA_DISTANCE - distancePull - handState.targetDistance) * 0.055
          }

          if (spinProgress >= 1) {
            stopPostLoadSpin(true)
          }
        } else {
          autoRotate += POST_LOAD_SPIN_END_SPEED
          handState.targetRotX = Math.sin(now * 0.00032) * 0.07
          handState.targetRotZ += (0 - handState.targetRotZ) * 0.035
        }
      } else if (locked && !mouseRotating) {
        handState.targetRotX = handState.currentRotX
        handState.targetRotY = handState.currentRotY
        handState.targetRotZ = handState.currentRotZ
      }

      if (!wheelZoomActive) {
        const idleTargetDistance =
          locked && selectedJobId.value !== null ? 228 : DEFAULT_CAMERA_DISTANCE
        handState.targetDistance += (idleTargetDistance - handState.targetDistance) * 0.016
      }
      handState.pinchStrength *= 0.94
      handState.openStrength *= 0.94
      handState.fistStrength *= 0.94
    }

    handState.swipeOffset *= locked ? 0.92 : 0.982

    handState.currentRotX += (handState.targetRotX - handState.currentRotX) * 0.034
    handState.currentRotY += (handState.targetRotY - handState.currentRotY) * 0.032
    handState.currentRotZ += (handState.targetRotZ - handState.currentRotZ) * 0.036

    const isZoomingIn = handState.targetDistance < handState.currentDistance
    const zoomEase = isZoomingIn ? 0.11 : 0.036 + handState.fistStrength * 0.06
    handState.currentDistance += (handState.targetDistance - handState.currentDistance) * zoomEase
    handState.currentDistance = clamp(
      handState.currentDistance,
      MIN_CAMERA_DISTANCE,
      MAX_CAMERA_DISTANCE
    )

    const entrySpinBoost = pageEntering.value ? (1 - entryProgress) * 0.72 : 0
    galaxyGroup.rotation.x = handState.currentRotX
    galaxyGroup.rotation.y = autoRotate + handState.currentRotY + entrySpinBoost
    galaxyGroup.rotation.z = handState.currentRotZ

    if (ringGroup && !locked) {
      const ringSpinBoost = postLoadSpinActive.value ? 0.0065 : 0
      ringGroup.rotation.y += 0.0008 + ringSpinBoost
      ringGroup.rotation.z = Math.sin(now * (postLoadSpinActive.value ? 0.0014 : 0.00036)) * 0.045
    }

    if (backgroundStars && !locked) {
      backgroundStars.rotation.y += postLoadSpinActive.value ? 0.00032 : 0.00008
    }

    if (jobMaterial) {
      const zoomBoost = clamp((DEFAULT_CAMERA_DISTANCE - handState.currentDistance) / 170, 0, 1)
      jobMaterial.size = 5.4 + zoomBoost * 2.4 + handState.openStrength * 0.9
      jobMaterial.opacity = 0.82 + zoomBoost * 0.12
    }

    if (planetGlow) {
      const glowScale =
        1 + clamp((DEFAULT_CAMERA_DISTANCE - handState.currentDistance) / 240, 0, 1) * 0.18
      planetGlow.scale.setScalar(glowScale)
    }

    camera.position.set(0, 0, handState.currentDistance)
    camera.lookAt(0, 0, 0)
  }

  const updateHoverAndLabels = () => {
    if (!camera || !galaxyGroup || !renderer) return

    galaxyGroup.updateMatrixWorld(true)

    const nearest = virtualCursor.visible
      ? findNearestJobByScreen(virtualCursor.x, virtualCursor.y, HOVER_PIXEL_RADIUS)
      : null
    const nextHoverId = nearest?.id ?? null

    if (nextHoverId !== hoveredJobId.value) {
      hoveredJobId.value = nextHoverId
      hoveredJobSnapshot.value =
        nextHoverId === null ? null : nearest || findJobStarById(nextHoverId)
    }

    if (hoveredJobId.value !== lastHoverId || selectedJobId.value !== lastSelectedId) {
      updateStarColors()
      lastHoverId = hoveredJobId.value
      lastSelectedId = selectedJobId.value
    }

    if (pendingPinchSelect) {
      pendingPinchSelect = false
      const candidate = findSelectableJobByScreen(virtualCursor.x, virtualCursor.y, 76) || nearest
      if (candidate) selectJob(candidate.id)
    }

    if (renderFrame % 4 !== 0) return

    const labels: VisibleLabel[] = []
    const selected = selectedJobSnapshot.value
    const hovered = hoveredJobSnapshot.value
    selectedScreen.visible = false
    const centerCandidates: Array<{
      star: JobStar
      x: number
      y: number
      score: number
      depth: number
    }> = []
    const rect = renderer.domElement.getBoundingClientRect()
    const isMobile = isMobileView.value
    const maxCenterLabels = isMobile
      ? handState.currentDistance < LABEL_CLOSE_DISTANCE
        ? 5
        : 0
      : handState.currentDistance < LABEL_CLOSE_DISTANCE
        ? 14
        : 7
    const centerLabelRadius = isMobile ? 150 : 280
    const canShowNearbyLabels = isMobile
      ? handState.currentDistance < LABEL_CLOSE_DISTANCE && selectedJobId.value === null
      : handState.currentDistance < LABEL_NEAR_DISTANCE

    jobStarsData.forEach((star) => {
      const screen = projectJobStar(star, rect)
      if (!screen.visible) return

      if (selected?.id === star.id) {
        selectedScreen.visible = true
        selectedScreen.x = screen.x
        selectedScreen.y = screen.y
        labels.push(createLabel(star, screen.x, screen.y, true, false, 1))
        return
      }

      if (hovered?.id === star.id) {
        labels.push(createLabel(star, screen.x, screen.y, false, true, 0.96))
        return
      }

      if (!canShowNearbyLabels) return

      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      const centerDistance = Math.hypot(screen.x - cx, screen.y - cy)
      const depthScore = 1 - Math.abs(screen.depth)

      if (centerDistance < centerLabelRadius && depthScore > 0.18) {
        centerCandidates.push({
          star,
          x: screen.x,
          y: screen.y,
          score: centerDistance - depthScore * 90,
          depth: depthScore
        })
      }
    })

    centerCandidates
      .sort((a, b) => a.score - b.score)
      .slice(0, maxCenterLabels)
      .forEach((item, index) => {
        labels.push(createLabel(item.star, item.x, item.y, false, false, 0.46 + index * 0.025))
      })

    visibleLabels.value = labels
  }

  const createLabel = (
    star: JobStar,
    x: number,
    y: number,
    selected: boolean,
    hover: boolean,
    opacity: number
  ): VisibleLabel => {
    return {
      id: `${star.id}-${selected ? 'selected' : hover ? 'hover' : 'normal'}`,
      text: star.job.jobName || '未知岗位',
      selected,
      hover,
      style: {
        left: `${x}px`,
        top: `${y - (isMobileView.value ? (selected ? 42 : 28) : selected ? 30 : 22)}px`,
        maxWidth: isMobileView.value
          ? selected
            ? '220px'
            : '132px'
          : selected
            ? '260px'
            : '168px',
        opacity: `${clamp(opacity, 0, 1)}`
      }
    }
  }

  const updateMarkers = () => {
    const time = performance.now() * 0.001

    if (hoverMarker) {
      const hovered = hoveredJobSnapshot.value
      if (hovered) {
        hoverMarker.visible = true
        hoverMarker.position.copy(hovered.position)
        const material = hoverMarker.material as THREE.SpriteMaterial
        material.opacity += (0.82 - material.opacity) * 0.18
        const scale = 24 + Math.sin(time * 7) * 1.6
        hoverMarker.scale.set(scale, scale, 1)
      } else {
        const material = hoverMarker.material as THREE.SpriteMaterial
        material.opacity *= 0.78
        hoverMarker.visible = material.opacity > 0.03
      }
    }

    if (selectedMarker) {
      const selected = selectedJobSnapshot.value
      if (selected) {
        selectedMarker.visible = true
        selectedMarker.position.copy(selected.position)
        const material = selectedMarker.material as THREE.SpriteMaterial
        material.opacity += (1 - material.opacity) * 0.14
        const pulse = 28 + Math.sin(time * 5.2) * 3
        selectedMarker.scale.set(pulse, pulse, 1)
      } else {
        const material = selectedMarker.material as THREE.SpriteMaterial
        material.opacity *= 0.78
        selectedMarker.visible = material.opacity > 0.03
      }
    }
  }

  const updateStarColors = () => {
    if (!jobGeometry || !starColors) return

    const colorAttr = jobGeometry.attributes.color as THREE.BufferAttribute
    const colors = colorAttr.array as Float32Array

    for (let i = 0; i < JOB_STAR_COUNT; i++) {
      const index = i * 3
      let color = baseColor

      if (i === selectedJobId.value) {
        color = selectedColor
      } else if (i === hoveredJobId.value) {
        color = hoverColor
      } else {
        const hue = 0.56 + seededRandom(i + 3) * 0.18
        color = new THREE.Color().setHSL(hue, 0.9, 0.48 + seededRandom(i + 15) * 0.08)
      }

      colors[index] = color.r
      colors[index + 1] = color.g
      colors[index + 2] = color.b
    }

    colorAttr.needsUpdate = true
  }

  const projectJobStar = (star: JobStar, rect: DOMRect) => {
    if (!camera || !galaxyGroup) {
      return { visible: false, x: 0, y: 0, depth: 0 }
    }

    worldVector.copy(star.position).applyMatrix4(galaxyGroup.matrixWorld)
    projectionVector.copy(worldVector).project(camera)

    const visible = projectionVector.z > -1 && projectionVector.z < 1
    const x = (projectionVector.x * 0.5 + 0.5) * rect.width + rect.left
    const y = (-projectionVector.y * 0.5 + 0.5) * rect.height + rect.top

    return {
      visible,
      x,
      y,
      depth: projectionVector.z
    }
  }

  const getScreenHitCandidates = (screenX: number, screenY: number, maxDistance: number) => {
    if (!camera || !galaxyGroup || !renderer)
      return [] as Array<{ star: JobStar; distance: number; depth: number }>

    const rect = renderer.domElement.getBoundingClientRect()
    const candidates: Array<{ star: JobStar; distance: number; depth: number }> = []

    for (const star of jobStarsData) {
      const screen = projectJobStar(star, rect)
      if (!screen.visible) continue

      const distance = Math.hypot(screen.x - screenX, screen.y - screenY)
      if (distance > maxDistance) continue

      candidates.push({
        star,
        distance,
        // projection depth 越小通常越靠近镜头，这里用于避免前后重叠星点时一直命中旧点
        depth: screen.depth
      })
    }

    return candidates.sort((a, b) => {
      const aIsCurrent = a.star.id === selectedJobId.value
      const bIsCurrent = b.star.id === selectedJobId.value

      // 点击新星点时，优先切换到非当前已选中的星点，解决详情不切换的问题
      if (aIsCurrent !== bIsCurrent) return aIsCurrent ? 1 : -1

      // 近距离优先；距离非常接近时，选择更靠前的星点
      const distanceDiff = a.distance - b.distance
      if (Math.abs(distanceDiff) > 4) return distanceDiff

      return a.depth - b.depth
    })
  }

  const findNearestJobByScreen = (screenX: number, screenY: number, maxDistance: number) => {
    return getScreenHitCandidates(screenX, screenY, maxDistance)[0]?.star || null
  }

  const findSelectableJobByScreen = (screenX: number, screenY: number, maxDistance: number) => {
    const candidates = getScreenHitCandidates(screenX, screenY, maxDistance)
    return (
      candidates.find((item) => item.star.id !== selectedJobId.value)?.star ||
      candidates[0]?.star ||
      null
    )
  }

  const selectJob = (id: number) => {
    wheelZoomActive = false
    const star = findJobStarById(id)
    if (!star) return

    // 每次点击都重新生成选中快照，确保右侧详情、已选中岗位星点、标签内容同步切换
    selectedJobId.value = id
    selectedJobSnapshot.value = {
      ...star,
      position: star.position.clone(),
      job: { ...star.job }
    }

    selectedJobVersion.value += 1
    hoveredJobId.value = id
    hoveredJobSnapshot.value = star
    rotationPaused.value = true
    handState.swipeOffset = 0
    handState.targetRotX = handState.currentRotX
    handState.targetRotY = handState.currentRotY
    handState.targetRotZ = handState.currentRotZ

    updateStarColors()
    updateMarkers()
    visibleLabels.value = visibleLabels.value.filter((label) => !label.selected)

    gestureName.value = '已选中岗位'
    gestureDesc.value = `当前查看：${
      star.job.jobName || '未知岗位'
    }，星空旋转已暂停，双击星空空白处可恢复旋转`
    if (isMobileView.value) mobilePanelOpen.value = false
    handState.targetDistance = Math.min(handState.currentDistance, isMobileView.value ? 252 : 228)
  }

  const clearSelection = () => {
    stopPostLoadSpin(false)
    wheelZoomActive = false
    manualRotationActive = false
    selectedJobId.value = null
    selectedJobSnapshot.value = null
    selectedJobVersion.value += 1
    selectedScreen.visible = false
    mobilePanelOpen.value = false
    rotationPaused.value = false
    handState.targetDistance = DEFAULT_CAMERA_DISTANCE
  }

  const resumeRotation = () => {
    stopPostLoadSpin(false)
    manualRotationActive = false
    rotationPaused.value = false
    gestureName.value = selectedJob.value ? '继续浏览' : '手掌浏览'
    gestureDesc.value = selectedJob.value
      ? '已恢复星空缓慢旋转，仍保留当前岗位详情'
      : '移动手掌旋转星球，食指靠近星点可高亮岗位'
  }

  const toggleCleanMode = () => {
    isCleanMode.value = !isCleanMode.value
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const target = threeContainerRef.value?.closest('.gesture-star-page') as HTMLElement | null
        await target?.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (error) {
      console.warn('全屏切换失败', error)
      ElMessage.warning('当前浏览器不支持或禁止全屏切换')
    }
  }

  const handleFullscreenChange = () => {
    isFullscreen.value = Boolean(document.fullscreenElement)
    nextTick(() => handleResize())
  }

  const findJobStarById = (id: number | null) => {
    if (id === null || id === undefined) return null
    return jobStarsMap.get(id) || null
  }

  const toggleCamera = async () => {
    stopPostLoadSpin(false)
    if (cameraStarted.value) {
      stopCamera()
      return
    }

    await startCamera()
  }

  const startCamera = async () => {
    try {
      statusText.value = '正在初始化手势模型...'
      gestureName.value = '模型加载中'
      gestureDesc.value = '首次加载可能需要一点时间'

      await initHandLandmarker()

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        },
        audio: false
      })

      if (!videoRef.value) return

      videoRef.value.srcObject = stream

      videoRef.value.onloadedmetadata = () => {
        videoRef.value?.play()
        resizeHandCanvas()

        cameraStarted.value = true
        statusText.value = '手势识别已开启'
        gestureName.value = '请伸出手掌'
        gestureDesc.value = '食指指向岗位星点，捏合即可查看岗位详情'
        virtualCursor.visible = true

        detectHands()
      }
    } catch (error) {
      console.error(error)

      cameraStarted.value = false
      statusText.value = '手势识别启动失败'
      gestureName.value = '启动失败'
      gestureDesc.value = '请检查摄像头权限，建议使用 localhost 或 HTTPS 环境访问'

      ElMessage.error('摄像头或手势模型启动失败，请检查浏览器权限')
    }
  }

  const initHandLandmarker = async () => {
    if (handLandmarker) return

    // 注意：不要固定使用 @0.10.22/wasm。该版本在 jsDelivr 上可能缺少 vision_wasm_internal.js，
    // 会导致 404 和 MIME type 报错。优先使用本地 public 目录下的 wasm 文件，失败后再使用 CDN 兜底。
    const wasmPaths = [
      '/mediapipe/tasks-vision/wasm',
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm',
      'https://unpkg.com/@mediapipe/tasks-vision/wasm'
    ]
    const modelPath =
      'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

    let vision = null
    let lastWasmError: unknown = null

    for (const wasmPath of wasmPaths) {
      try {
        vision = await FilesetResolver.forVisionTasks(wasmPath)
        console.info('MediaPipe WASM 加载成功:', wasmPath)
        break
      } catch (error) {
        lastWasmError = error
        console.warn('MediaPipe WASM 加载失败，尝试下一个地址:', wasmPath, error)
      }
    }

    if (!vision) {
      throw lastWasmError || new Error('MediaPipe WASM 加载失败')
    }

    try {
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelPath,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55
      })
    } catch (error) {
      console.warn('GPU 模式初始化失败，切换到 CPU 模式', error)

      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: modelPath,
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        numHands: 1,
        minHandDetectionConfidence: 0.55,
        minHandPresenceConfidence: 0.55,
        minTrackingConfidence: 0.55
      })
    }
  }

  const detectHands = () => {
    if (!videoRef.value || !handLandmarker || !cameraStarted.value) return

    const video = videoRef.value

    if (video.readyState >= 2) {
      const result = handLandmarker.detectForVideo(video, performance.now())

      if (result.landmarks && result.landmarks.length > 0) {
        const landmarks = result.landmarks[0] as HandPoint[]
        handleGesture(landmarks)
        drawHandLandmarks(landmarks)
      } else {
        handState.visible = false
        virtualCursor.visible = false
        gestureName.value = '未检测到手势'
        gestureDesc.value = '请将手掌移动到摄像头画面中；星球会自动缓慢旋转'
        clearHandCanvas()
      }
    }

    detectId = requestAnimationFrame(detectHands)
  }

  const handleGesture = (landmarks: HandPoint[]) => {
    stopPostLoadSpin(false)
    if (!isMouseDragging) manualRotationActive = false
    handState.visible = true
    virtualCursor.visible = true

    const wrist = landmarks[0]
    const thumbTip = landmarks[4]
    const indexMcp = landmarks[5]
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const pinkyMcp = landmarks[17]
    const pinkyTip = landmarks[20]

    const palm = getPalmCenter(landmarks)

    handState.x = 1 - palm.x
    handState.y = palm.y
    handState.indexX = 1 - indexTip.x
    handState.indexY = indexTip.y

    virtualCursor.x += (handState.indexX * window.innerWidth - virtualCursor.x) * 0.32
    virtualCursor.y += (handState.indexY * window.innerHeight - virtualCursor.y) * 0.32

    const pinchDistance = getDistance(thumbTip, indexTip)
    const pinchStrength = clamp(1 - pinchDistance / 0.095, 0, 1)

    const openDistance =
      (getDistance(wrist, indexTip) +
        getDistance(wrist, middleTip) +
        getDistance(wrist, ringTip) +
        getDistance(wrist, pinkyTip)) /
      4

    const openStrength = clamp((openDistance - 0.22) / 0.18, 0, 1)
    const fistStrength = clamp((0.235 - openDistance) / 0.075, 0, 1)

    handState.pinchStrength += (pinchStrength - handState.pinchStrength) * 0.28
    handState.openStrength += (openStrength - handState.openStrength) * 0.22
    handState.fistStrength += (fistStrength - handState.fistStrength) * 0.22

    const palmAngle = Math.atan2(pinkyMcp.y - indexMcp.y, pinkyMcp.x - indexMcp.x)
    handState.targetRotZ = clamp(palmAngle * 0.32, -0.7, 0.7)

    detectSwipe(handState.x)
    detectPinchSelect()
    updateGestureText()
  }

  const detectPinchSelect = () => {
    const now = performance.now()
    if (handState.pinchStrength > 0.72 && now - lastPinchAt > 850) {
      pendingPinchSelect = true
      lastPinchAt = now
    }
  }

  const detectSwipe = (palmX: number) => {
    if (rotationPaused.value) return

    const now = performance.now()

    if (!lastPalmAt) {
      lastPalmAt = now
      lastPalmX = palmX
      return
    }

    const deltaTime = Math.max(16, now - lastPalmAt)
    const velocity = ((palmX - lastPalmX) / deltaTime) * 1000

    if (Math.abs(velocity) > 1.65 && now - lastSwipeAt > 900) {
      handState.swipeOffset += velocity > 0 ? 0.34 : -0.34
      lastSwipeAt = now
      gestureName.value = velocity > 0 ? '右滑切换' : '左滑切换'
      gestureDesc.value = '正在平滑切换岗位星区'
    }

    lastPalmAt = now
    lastPalmX = palmX
  }

  const updateGestureText = () => {
    if (performance.now() - lastSwipeAt < 420) return

    if (handState.pinchStrength > 0.68) {
      gestureName.value = '捏合选择'
      gestureDesc.value = '松开后可继续移动食指，当前捏合会选中指向的岗位星点'
    } else if (handState.openStrength > 0.56) {
      gestureName.value = '五指张开放大'
      gestureDesc.value = '镜头正在靠近岗位星球，附近岗位名称会逐渐显示'
    } else if (handState.fistStrength > 0.58) {
      gestureName.value = '握拳缩小'
      gestureDesc.value = '镜头正在远离岗位星球，文字标签会逐渐收起'
    } else if (hoveredJob.value) {
      gestureName.value = '指向岗位'
      gestureDesc.value = `当前指向：${hoveredJob.value.job.jobName || '未知岗位'}，捏合可查看详情`
    } else {
      gestureName.value = '手掌浏览'
      gestureDesc.value = '移动手掌旋转星球，食指靠近星点可高亮岗位'
    }
  }

  const getPalmCenter = (landmarks: HandPoint[]) => {
    const ids = [0, 5, 9, 13, 17]
    const center = { x: 0, y: 0, z: 0 }

    ids.forEach((id) => {
      center.x += landmarks[id].x
      center.y += landmarks[id].y
      center.z += landmarks[id].z || 0
    })

    center.x /= ids.length
    center.y /= ids.length
    center.z /= ids.length

    return center
  }

  const getDistance = (a: HandPoint, b: HandPoint) => {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const dz = (a.z || 0) - (b.z || 0)

    return Math.sqrt(dx * dx + dy * dy + dz * dz)
  }

  const drawHandLandmarks = (landmarks: HandPoint[]) => {
    const canvas = handCanvasRef.value
    const video = videoRef.value
    if (!canvas || !video) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [0, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [0, 13],
      [13, 14],
      [14, 15],
      [15, 16],
      [0, 17],
      [17, 18],
      [18, 19],
      [19, 20],
      [5, 9],
      [9, 13],
      [13, 17]
    ]

    ctx.save()
    ctx.lineWidth = 4
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.9)'
    ctx.fillStyle = 'rgba(226, 232, 240, 0.96)'

    connections.forEach(([start, end]) => {
      const a = landmarks[start]
      const b = landmarks[end]

      ctx.beginPath()
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height)
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height)
      ctx.stroke()
    })

    landmarks.forEach((point, index) => {
      ctx.beginPath()
      ctx.arc(point.x * canvas.width, point.y * canvas.height, index === 8 ? 8 : 5, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.restore()
  }

  const clearHandCanvas = () => {
    const canvas = handCanvasRef.value
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const resizeHandCanvas = () => {
    const canvas = handCanvasRef.value
    const video = videoRef.value

    if (!canvas || !video) return

    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
  }

  const stopCamera = () => {
    cameraStarted.value = false
    statusText.value = '摄像头已关闭'
    gestureName.value = '等待手势'
    gestureDesc.value = '点击右上角按钮后，将手放到摄像头前'

    cancelMouseDrag()

    handState.visible = false
    handState.pinchStrength = 0
    handState.openStrength = 0
    handState.fistStrength = 0
    virtualCursor.visible = false

    clearHandCanvas()

    if (detectId) {
      cancelAnimationFrame(detectId)
      detectId = 0
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }

    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
  }

  const handleResize = () => {
    isMobileView.value = window.innerWidth <= 640
    if (!isMobileView.value) mobilePanelOpen.value = false

    const container = threeContainerRef.value

    if (!container || !renderer || !camera) return

    const width = container.clientWidth
    const height = container.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)

    resizeHandCanvas()
  }

  const handleMouseDown = (event: MouseEvent) => {
    stopPostLoadSpin(false)
    if (event.button !== 0 || event.defaultPrevented || isInteractiveTarget(event.target)) return
    if (cameraStarted.value && handState.visible) return

    isMouseDragging = true
    mouseDragStarted = false
    mouseDragging.value = true
    mouseDragStartX = event.clientX
    mouseDragStartY = event.clientY
    mouseDragStartRotX = handState.currentRotX
    mouseDragStartRotY = handState.currentRotY

    virtualCursor.visible = true
    virtualCursor.x = event.clientX
    virtualCursor.y = event.clientY
  }

  const handleMouseMove = (event: MouseEvent) => {
    if (isMouseDragging) {
      event.preventDefault()

      handState.visible = false
      virtualCursor.visible = true
      virtualCursor.x = event.clientX
      virtualCursor.y = event.clientY

      const dx = event.clientX - mouseDragStartX
      const dy = event.clientY - mouseDragStartY
      const distance = Math.hypot(dx, dy)

      if (!mouseDragStarted && distance > MOUSE_DRAG_THRESHOLD) {
        mouseDragStarted = true
        suppressNextClick = true
        manualRotationActive = true
      }

      if (mouseDragStarted) {
        handState.targetRotY = mouseDragStartRotY + dx * MOUSE_ROTATE_SPEED_X
        handState.targetRotX = clamp(mouseDragStartRotX + dy * MOUSE_ROTATE_SPEED_Y, -1.25, 1.25)
        handState.targetRotZ += (0 - handState.targetRotZ) * 0.12

        gestureName.value = '鼠标拖拽旋转'
        gestureDesc.value = '按住鼠标左键左右拖动可自由旋转岗位星球，松开后保留当前视角'
      }

      return
    }

    if (cameraStarted.value && handState.visible) return

    handState.visible = false
    virtualCursor.visible = true
    virtualCursor.x = event.clientX
    virtualCursor.y = event.clientY

    handState.x = event.clientX / window.innerWidth
    handState.y = event.clientY / window.innerHeight

    // 未进入拖拽旋转前，保留原来的“鼠标移动模拟轻微浏览”效果；
    // 一旦用户拖拽旋转，则固定手动视角，避免松手后被普通 mousemove 拉回。
    if (!rotationPaused.value && !manualRotationActive) {
      handState.targetRotY = (handState.x - 0.5) * 0.45
      handState.targetRotX = (handState.y - 0.5) * 0.28
    }
  }

  const handleMouseUp = () => {
    if (!isMouseDragging) return

    const hadDrag = mouseDragStarted
    isMouseDragging = false
    mouseDragging.value = false
    mouseDragStarted = false

    if (hadDrag) {
      suppressNextClick = true
      gestureName.value = '视角已固定'
      gestureDesc.value = '已保留当前星球视角；双击星空空白区域或点击继续旋转可恢复缓慢旋转'
    }
  }

  const cancelMouseDrag = () => {
    isMouseDragging = false
    mouseDragging.value = false
    mouseDragStarted = false
    touchDragging = false
    touchDragStarted = false
    touchZooming = false
  }

  const isInteractiveTarget = (target: EventTarget | null) => {
    const element = target as HTMLElement | null
    return Boolean(
      element?.closest(
        '.top-panel, .clean-mode-toolbar, .control-panel, .job-detail-panel, .camera-card, .bottom-hint, .mobile-quick-bar, .mobile-panel-close, .el-popper, .el-overlay, button, a, input, textarea, select, .el-button'
      )
    )
  }

  const handleMouseWheel = (event: WheelEvent) => {
    stopPostLoadSpin(false)
    if (event.defaultPrevented || isInteractiveTarget(event.target)) return

    event.preventDefault()

    virtualCursor.visible = true
    virtualCursor.x = event.clientX
    virtualCursor.y = event.clientY

    // deltaY < 0 表示向上滚动，镜头靠近；deltaY > 0 表示向下滚动，镜头远离
    const direction = event.deltaY > 0 ? 1 : -1
    const wheelStrength = clamp(Math.abs(event.deltaY) / 120, 0.35, 1.8)
    const zoomStep = Math.min(WHEEL_ZOOM_MAX_STEP, WHEEL_ZOOM_BASE_STEP * wheelStrength)
    const nextDistance = clamp(
      handState.targetDistance + direction * zoomStep,
      MIN_CAMERA_DISTANCE,
      MAX_CAMERA_DISTANCE
    )

    handState.targetDistance = nextDistance
    wheelZoomActive = true

    gestureName.value = direction > 0 ? '滚轮缩小' : '滚轮放大'
    gestureDesc.value = `当前镜头距离：${Math.round(nextDistance)}，向上滚动放大，向下滚动缩小`
  }

  const handleMouseClick = (event: MouseEvent) => {
    stopPostLoadSpin(false)
    if (suppressNextClick) {
      suppressNextClick = false
      return
    }

    if (event.defaultPrevented || isInteractiveTarget(event.target)) return
    if (cameraStarted.value && handState.visible) return

    virtualCursor.visible = true
    virtualCursor.x = event.clientX
    virtualCursor.y = event.clientY

    const candidate = findSelectableJobByScreen(event.clientX, event.clientY, 78)
    if (candidate) selectJob(candidate.id)
  }

  const handleMouseDoubleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || isInteractiveTarget(event.target)) return

    manualRotationActive = false
    if (!rotationPaused.value) {
      gestureName.value = '恢复自动旋转'
      gestureDesc.value = '已恢复星空缓慢旋转，仍可按住鼠标左键自由旋转视角'
      return
    }

    resumeRotation()
  }

  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0
    const a = touches[0]
    const b = touches[1]
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  const handleTouchStart = (event: TouchEvent) => {
    stopPostLoadSpin(false)
    if (event.defaultPrevented || isInteractiveTarget(event.target)) return
    if (cameraStarted.value && handState.visible) return

    if (event.touches.length === 2) {
      event.preventDefault()
      touchZooming = true
      touchDragging = false
      touchDragStarted = false
      touchStartDistance = getTouchDistance(event.touches)
      touchStartCameraDistance = handState.targetDistance
      wheelZoomActive = true
      return
    }

    if (event.touches.length !== 1) return

    const touch = event.touches[0]
    touchDragging = true
    touchDragStarted = false
    touchZooming = false
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    touchLastX = touch.clientX
    touchLastY = touch.clientY
    touchStartRotX = handState.currentRotX
    touchStartRotY = handState.currentRotY

    virtualCursor.visible = true
    virtualCursor.x = touch.clientX
    virtualCursor.y = touch.clientY
  }

  const handleTouchMove = (event: TouchEvent) => {
    if (event.defaultPrevented || isInteractiveTarget(event.target)) return
    if (cameraStarted.value && handState.visible) return

    if (event.touches.length === 2) {
      event.preventDefault()
      if (!touchZooming) {
        touchZooming = true
        touchStartDistance = getTouchDistance(event.touches)
        touchStartCameraDistance = handState.targetDistance
      }

      const currentDistance = getTouchDistance(event.touches)
      const distanceDelta = currentDistance - touchStartDistance
      const nextDistance = clamp(
        touchStartCameraDistance - distanceDelta * 0.72,
        MIN_CAMERA_DISTANCE,
        MAX_CAMERA_DISTANCE
      )
      handState.targetDistance = nextDistance
      wheelZoomActive = true
      gestureName.value = distanceDelta > 0 ? '双指放大' : '双指缩小'
      gestureDesc.value = `当前镜头距离：${Math.round(nextDistance)}，双指张开放大，双指收拢缩小`
      return
    }

    if (!touchDragging || event.touches.length !== 1) return

    event.preventDefault()

    const touch = event.touches[0]
    touchLastX = touch.clientX
    touchLastY = touch.clientY

    handState.visible = false
    virtualCursor.visible = true
    virtualCursor.x = touch.clientX
    virtualCursor.y = touch.clientY

    const dx = touch.clientX - touchStartX
    const dy = touch.clientY - touchStartY
    const distance = Math.hypot(dx, dy)

    if (!touchDragStarted && distance > MOUSE_DRAG_THRESHOLD) {
      touchDragStarted = true
      suppressNextClick = true
      manualRotationActive = true
    }

    if (touchDragStarted) {
      handState.targetRotY = touchStartRotY + dx * MOUSE_ROTATE_SPEED_X
      handState.targetRotX = clamp(touchStartRotX + dy * MOUSE_ROTATE_SPEED_Y, -1.25, 1.25)
      handState.targetRotZ += (0 - handState.targetRotZ) * 0.12
      gestureName.value = '触屏拖动旋转'
      gestureDesc.value = '单指拖动可自由旋转岗位星球，点击星点可打开岗位详情'
    }
  }

  const handleTouchEnd = (event: TouchEvent) => {
    if (touchZooming && event.touches.length < 2) {
      touchZooming = false
      suppressNextClick = true
      return
    }

    if (!touchDragging) return

    const hadDrag = touchDragStarted
    touchDragging = false
    touchDragStarted = false

    if (hadDrag) {
      suppressNextClick = true
      gestureName.value = '视角已固定'
      gestureDesc.value = '已保留当前星球视角；双击空白区域或点击继续旋转可恢复缓慢旋转'
      return
    }

    if (event.defaultPrevented || isInteractiveTarget(event.target)) return

    suppressNextClick = true
    virtualCursor.visible = true
    virtualCursor.x = touchLastX
    virtualCursor.y = touchLastY

    const candidate = findSelectableJobByScreen(touchLastX, touchLastY, 92)
    if (candidate) selectJob(candidate.id)
  }

  const normalizeJobList = (list: JobItem[], targetCount: number) => {
    const fallback = createFallbackJobs(targetCount)
    const normalized = list
      .filter((item) => item && (item.jobName || item.companyName))
      .map((item, index) => ({
        id: item.id || index + 1,
        jobName: item.jobName || fallback[index % fallback.length].jobName,
        salary: item.salary || '薪资面议',
        degree: item.degree || '学历不限',
        experience: item.experience || '经验不限',
        companyName: item.companyName || '优质企业',
        industry: item.industry || item.categoryMain || '数字经济',
        companySize: item.companySize || '规模未知',
        financingStage: item.financingStage || '',
        city: item.city || '全国',
        district: item.district || '',
        businessArea: item.businessArea || '',
        latitude: item.latitude,
        longitude: item.longitude,
        skills: item.skills || fallback[index % fallback.length].skills,
        welfare: item.welfare || item.categorySub || '',
        categoryMain: item.categoryMain || '就业岗位',
        categorySub: item.categorySub || '',
        sourceFile: item.sourceFile
      }))

    if (!normalized.length) return fallback

    const sourceLength = normalized.length
    while (normalized.length < targetCount) {
      // 原写法 normalized.length % normalized.length 永远等于 0，导致补齐星点一直复制第 1 条岗位，
      // 点击不同星星时详情看起来没有变化。这里按原始接口数据循环补齐。
      const source = normalized[normalized.length % sourceLength]
      normalized.push({
        ...source,
        id: normalized.length + 1
      })
    }

    return normalized.slice(0, targetCount)
  }

  const createFallbackJobs = (count: number): JobItem[] => {
    const titles = [
      'AI产品经理',
      '前端开发工程师',
      'Java后端工程师',
      '数据分析师',
      '算法工程师',
      '大模型应用工程师',
      '测试开发工程师',
      'UI设计师',
      '运维工程师',
      '数据标注质检',
      '数字化项目助理',
      '就业服务顾问'
    ]
    const companies = ['星图科技', '智联云创', '数航未来', '云启科技', '北辰数据', '灵犀智能']
    const cities = ['北京', '上海', '深圳', '杭州', '广州', '成都', '武汉', '西安', '兰州', '宁波']
    const skills = [
      'Vue,TypeScript,Three.js',
      'Java,Spring Boot,MySQL',
      'Python,数据分析,可视化',
      '大模型,RAG,Prompt',
      'ECharts,SQL,数据治理',
      '产品设计,需求分析,原型设计'
    ]

    return Array.from({ length: count }).map((_, index) => ({
      id: index + 1,
      jobName: `${titles[index % titles.length]} · 星位${index + 1}`,
      companyName: companies[index % companies.length],
      city: cities[index % cities.length],
      district: index % 3 === 0 ? '高新区' : index % 3 === 1 ? '软件园' : '核心城区',
      salary: `${8 + (index % 9)}K-${14 + (index % 12)}K`,
      degree: index % 4 === 0 ? '本科' : index % 4 === 1 ? '硕士' : '大专',
      experience: index % 5 === 0 ? '应届' : `${1 + (index % 5)}年经验`,
      industry: index % 2 === 0 ? '人工智能' : '互联网/软件',
      companySize: index % 2 === 0 ? '100-499人' : '500-999人',
      financingStage: index % 3 === 0 ? '成长型企业' : '稳定发展',
      skills: skills[index % skills.length],
      welfare: '五险一金,弹性工作,项目奖金',
      categoryMain: '数字经济岗位',
      categorySub: 'AI就业服务'
    }))
  }

  const skillList = (skills?: string) => {
    if (!skills) return []
    return skills
      .split(/[，,、/|]/)
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8)
  }

  const formatLocation = (job: JobItem) => {
    return [job.city, job.district || job.businessArea].filter(Boolean).join(' · ') || '全国'
  }

  const buildJobDescription = (job: JobItem) => {
    const skillText = skillList(job.skills).slice(0, 4).join('、') || '岗位相关技能'
    const welfare = job.welfare ? `，福利包括${job.welfare}` : ''
    return `该岗位属于${
      job.industry || job.categoryMain || '就业服务'
    }方向，主要面向${skillText}等能力要求，适合${job.degree || '相关学历'}、${
      job.experience || '相关经验'
    }求职者投递${welfare}。`
  }

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 12.9898) * 43758.5453
    return x - Math.floor(x)
  }

  const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value))
  }

  const goBack = () => {
    router.push('/home')
  }
</script>

<style scoped lang="scss" src="./styles/index.scss"></style>

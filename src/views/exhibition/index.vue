<template>
  <div class="exhibition-screen">
    <header class="screen-header">
      <div class="brand-zone" @click="goPage('/home')">
        <div class="brand-mark">AI</div>
        <div>
          <h1>AI创业就业助手数字展厅</h1>
          <p>Three.js Digital Exhibition</p>
        </div>
      </div>

      <div class="tech-status">
        <span>THREE.JS</span>
        <span>ORBIT CONTROLS</span>
        <span>GLTF LOADER</span>
        <span>{{ modelState }}</span>
      </div>

      <div class="header-actions">
        <el-button text class="ghost-btn" @click="goPage('/home')">返回首页</el-button>
        <el-button type="primary" class="solid-btn" @click="goPage(activeHall.path)">进入模块</el-button>
      </div>
    </header>

    <main class="screen-main">
      <aside class="screen-panel left-panel">
        <div class="panel-title">
          <span>数据总览</span>
          <em>OVERVIEW</em>
        </div>

        <div class="stat-list">
          <div v-for="item in overviewStats" :key="item.label" class="stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <em>{{ item.trend }}</em>
          </div>
        </div>

        <div class="mini-section">
          <div class="mini-title">运行状态</div>
          <div class="status-list">
            <div v-for="item in runtimeStatus" :key="item.name" class="status-row">
              <span>{{ item.name }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>
      </aside>

      <section class="scene-board">
        <div ref="sceneHost" class="three-host"></div>

        <div class="scene-topbar">
          <div>
            <span class="scene-label">当前展馆</span>
            <strong>{{ activeHall.title }}</strong>
          </div>
          <div class="scene-tip">拖拽旋转 · 滚轮缩放 · 点击展馆</div>
        </div>

        <div class="module-dock">
          <button v-for="item in halls" :key="item.key" type="button" :class="['dock-item', { active: activeKey === item.key }]" @click="focusHall(item.key)">
            <span>{{ item.short }}</span>
            <strong>{{ item.title }}</strong>
          </button>
        </div>
      </section>

      <aside class="screen-panel right-panel">
        <div class="panel-title">
          <span>展馆详情</span>
          <em>MODULE</em>
        </div>

        <div class="active-card">
          <div class="active-code">{{ activeHall.code }}</div>
          <h2>{{ activeHall.title }}</h2>
          <p>{{ activeHall.slogan }}</p>
          <div class="tag-row">
            <span v-for="tag in activeHall.tags" :key="tag">{{ tag }}</span>
          </div>
          <el-button type="primary" class="enter-btn" @click="goPage(activeHall.path)">
            进入{{ activeHall.title }}
          </el-button>
        </div>

        <div class="mini-section">
          <div class="mini-title">参观路线</div>
          <div class="route-flow">
            <button v-for="(item, index) in halls" :key="item.key" type="button" :class="['route-node', { active: activeKey === item.key }]" @click="focusHall(item.key)">
              <em>{{ formatNo(index + 1) }}</em>
              <span>{{ item.short }}</span>
            </button>
          </div>
        </div>

        <div class="mini-section">
          <div class="mini-title">快捷入口</div>
          <div class="quick-grid">
            <button type="button" @click="goPage('/jobscreen')">岗位大屏</button>
            <button type="button" @click="goPage('/aichat')">AI问答</button>
            <button type="button" @click="goPage('/toolbox/job-skill-graph/view')">技能图谱</button>
            <button type="button" @click="goPage('/study/pitchppt')">路演PPT</button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

type HallKey = 'job' | 'chat' | 'skill' | 'startup' | 'brand' | 'office'

interface HallItem {
  key: HallKey
  code: string
  short: string
  title: string
  slogan: string
  path: string
  tags: string[]
  position: [number, number, number]
  height: number
  color: number
}

const router = useRouter()
const sceneHost = ref<HTMLDivElement | null>(null)
const activeKey = ref<HallKey>('job')
const modelState = ref('模型初始化')

const halls: HallItem[] = [
  {
    key: 'job',
    code: 'HALL 01',
    short: '岗位',
    title: '就业分析馆',
    slogan: '岗位分布、薪资区间、城市热度集中展示。',
    path: '/toolbox/jobanalysis',
    tags: ['岗位画像', '薪资分析', '区域对比'],
    position: [-15, 0, -9],
    height: 9,
    color: 0x4f8cff
  },
  {
    key: 'chat',
    code: 'HALL 02',
    short: '问答',
    title: 'AI问答馆',
    slogan: '围绕求职、简历、面试与规划进行智能问答。',
    path: '/aichat',
    tags: ['职业问答', '简历建议', '面试准备'],
    position: [0, 0, -13],
    height: 11,
    color: 0x57d6a3
  },
  {
    key: 'skill',
    code: 'HALL 03',
    short: '图谱',
    title: '技能图谱馆',
    slogan: '把岗位能力要求转化为可视化技能关系。',
    path: '/toolbox/job-skill-graph/view',
    tags: ['技能节点', '关系网络', '能力路径'],
    position: [15, 0, -9],
    height: 8,
    color: 0xffc857
  },
  {
    key: 'startup',
    code: 'HALL 04',
    short: '创业',
    title: '创业孵化馆',
    slogan: '支持商业计划、产品定位与创业方案生成。',
    path: '/study/business',
    tags: ['商业计划', '市场定位', '落地方案'],
    position: [-15, 0, 10],
    height: 8.5,
    color: 0xff7a59
  },
  {
    key: 'brand',
    code: 'HALL 05',
    short: '品牌',
    title: '品牌表达馆',
    slogan: '沉淀品牌文案、项目介绍与传播材料。',
    path: '/study/copywriting',
    tags: ['品牌文案', '作品介绍', '传播表达'],
    position: [0, 0, 14],
    height: 10,
    color: 0xb88cff
  },
  {
    key: 'office',
    code: 'HALL 06',
    short: '办公',
    title: '智能办公馆',
    slogan: '面向汇报、会议、路演等场景进行内容生成。',
    path: '/study/pitchppt',
    tags: ['路演PPT', '会议纪要', '材料生成'],
    position: [15, 0, 10],
    height: 7.8,
    color: 0x46c2ff
  }
]

const overviewStats = [
  { label: '核心展馆', value: '6', trend: '功能矩阵' },
  { label: '数据大屏', value: '3', trend: '岗位 / 图谱 / 总览' },
  { label: 'AI入口', value: '4', trend: '问答 / 计划 / 文案 / PPT' },
  { label: '展示模式', value: '3D', trend: 'WebGL 渲染' }
]

const runtimeStatus = [
  { name: '渲染引擎', value: 'Three.js' },
  { name: '镜头控制', value: 'OrbitControls' },
  { name: '模型加载', value: 'GLTFLoader' },
  { name: '页面形态', value: '数字大屏' }
]

const activeHall = computed(() => halls.find((item) => item.key === activeKey.value) ?? halls[0])

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let controls: OrbitControls | null = null
let animationId = 0
let resizeObserver: ResizeObserver | null = null
let cityGroup: THREE.Group | null = null
let externalModel: THREE.Group | null = null

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const pickMeshes: THREE.Object3D[] = []
const hallGroups = new Map<HallKey, THREE.Group>()
const hallMaterials = new Map<HallKey, THREE.MeshStandardMaterial>()
const hallRings = new Map<HallKey, THREE.Mesh>()
const cameraTarget = new THREE.Vector3(30, 25, 34)
const controlsTarget = new THREE.Vector3(0, 4, 0)
const clock = new THREE.Clock()
let isCameraTransitioning = false

onMounted(async () => {
  await nextTick()
  initThreeScene()
})

onBeforeUnmount(() => {
  destroyThreeScene()
})

function initThreeScene() {
  const container = sceneHost.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x07111f)
  scene.fog = new THREE.Fog(0x07111f, 48, 130)

  const width = container.clientWidth || 960
  const height = container.clientHeight || 640

  camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 300)
  camera.position.set(30, 25, 34)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance'
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.enableZoom = true
  controls.zoomSpeed = 1.18
  controls.enablePan = true
  controls.panSpeed = 0.55
  controls.screenSpacePanning = false
  controls.minDistance = 8
  controls.maxDistance = 120
  controls.maxPolarAngle = Math.PI * 0.48
  controls.target.set(0, 4, 0)

  controls.addEventListener('start', stopCameraTransition)
  controls.addEventListener('change', syncCameraTargetFromControls)

  createLights()
  createDigitalCity()
  loadGltfExhibitionModel()
  bindRendererEvents()

  resizeObserver = new ResizeObserver(resizeRenderer)
  resizeObserver.observe(container)
  window.addEventListener('resize', resizeRenderer)

  focusHall('job')
  animateScene()
}

function createLights() {
  if (!scene) return

  const ambient = new THREE.AmbientLight(0xffffff, 0.52)
  scene.add(ambient)

  const hemi = new THREE.HemisphereLight(0xbfd7ff, 0x102033, 0.8)
  scene.add(hemi)

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.7)
  keyLight.position.set(26, 38, 22)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near = 1
  keyLight.shadow.camera.far = 120
  keyLight.shadow.camera.left = -45
  keyLight.shadow.camera.right = 45
  keyLight.shadow.camera.top = 45
  keyLight.shadow.camera.bottom = -45
  scene.add(keyLight)

  const rimLight = new THREE.PointLight(0x57d6ff, 1.2, 90)
  rimLight.position.set(-26, 16, -24)
  scene.add(rimLight)
}

function createDigitalCity() {
  if (!scene) return

  cityGroup = new THREE.Group()
  cityGroup.name = 'ai-career-digital-exhibition'
  scene.add(cityGroup)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(72, 54, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x0c1728, roughness: 0.86, metalness: 0.18 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  cityGroup.add(floor)

  const grid = new THREE.GridHelper(72, 24, 0x2f8cff, 0x19324e)
  grid.position.y = 0.035
  cityGroup.add(grid)

  createCoreHub()
  createHallBuildings()
  createRouteLines()
  createDecorativeBlocks()
}

function createCoreHub() {
  if (!cityGroup) return

  const coreGroup = new THREE.Group()
  coreGroup.name = 'central-ai-hub'

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 6.2, 1.2, 6),
    new THREE.MeshStandardMaterial({ color: 0x12243a, roughness: 0.48, metalness: 0.42 })
  )
  base.position.y = 0.6
  base.castShadow = true
  base.receiveShadow = true
  coreGroup.add(base)

  const core = new THREE.Mesh(
    new THREE.OctahedronGeometry(3.1, 0),
    new THREE.MeshStandardMaterial({
      color: 0x6be3ff,
      emissive: 0x2d8cff,
      emissiveIntensity: 0.7,
      roughness: 0.22,
      metalness: 0.38
    })
  )
  core.position.y = 5.1
  core.castShadow = true
  coreGroup.add(core)

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x57d6ff,
    transparent: true,
    opacity: 0.44
  })
  const ringOne = new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.045, 8, 96), ringMaterial)
  ringOne.position.y = 4.9
  ringOne.rotation.x = Math.PI / 2
  coreGroup.add(ringOne)

  const ringTwo = ringOne.clone()
  ringTwo.rotation.y = Math.PI / 2
  coreGroup.add(ringTwo)

  const sprite = createTextSprite('AI HUB', '#d7f3ff', 'rgba(8, 17, 31, 0.1)', 132)
  sprite.position.set(0, 9.2, 0)
  sprite.scale.set(7, 1.8, 1)
  coreGroup.add(sprite)

  cityGroup.add(coreGroup)
}

function createHallBuildings() {
  if (!cityGroup) return

  halls.forEach((hall) => {
    const group = new THREE.Group()
    group.name = `hall-${hall.key}`
    group.position.set(...hall.position)

    const material = new THREE.MeshStandardMaterial({
      color: hall.color,
      emissive: hall.color,
      emissiveIntensity: 0.08,
      roughness: 0.42,
      metalness: 0.22
    })
    hallMaterials.set(hall.key, material)

    const podium = new THREE.Mesh(
      new THREE.CylinderGeometry(4.6, 5.3, 0.8, 6),
      new THREE.MeshStandardMaterial({ color: 0x142238, roughness: 0.62, metalness: 0.32 })
    )
    podium.position.y = 0.4
    podium.castShadow = true
    podium.receiveShadow = true
    podium.userData.hallKey = hall.key
    group.add(podium)
    pickMeshes.push(podium)

    const tower = new THREE.Mesh(new THREE.BoxGeometry(5.2, hall.height, 5.2), material)
    tower.position.y = 0.8 + hall.height / 2
    tower.castShadow = true
    tower.receiveShadow = true
    tower.userData.hallKey = hall.key
    group.add(tower)
    pickMeshes.push(tower)

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(4.15, 1.8, 4),
      new THREE.MeshStandardMaterial({
        color: hall.color,
        emissive: hall.color,
        emissiveIntensity: 0.16,
        roughness: 0.36
      })
    )
    roof.position.y = hall.height + 1.8
    roof.rotation.y = Math.PI / 4
    roof.castShadow = true
    roof.userData.hallKey = hall.key
    group.add(roof)
    pickMeshes.push(roof)

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(5.6, 0.06, 8, 80),
      new THREE.MeshBasicMaterial({ color: hall.color, transparent: true, opacity: 0.42 })
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 1.03
    group.add(ring)
    hallRings.set(hall.key, ring)

    for (let index = 0; index < 4; index += 1) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, hall.height * 0.72, 0.04),
        new THREE.MeshBasicMaterial({ color: hall.color, transparent: true, opacity: 0.58 })
      )
      const sideOffset = 2.63
      strip.position.y = 1.3 + hall.height * 0.36
      if (index === 0) {
        strip.position.set(-1.5, strip.position.y, sideOffset)
      }
      if (index === 1) {
        strip.position.set(1.5, strip.position.y, sideOffset)
      }
      if (index === 2) {
        strip.position.set(sideOffset, strip.position.y, -1.5)
        strip.rotation.y = Math.PI / 2
      }
      if (index === 3) {
        strip.position.set(sideOffset, strip.position.y, 1.5)
        strip.rotation.y = Math.PI / 2
      }
      group.add(strip)
    }

    const label = createTextSprite(hall.short, '#ffffff', 'rgba(5, 13, 25, 0.72)', 122)
    label.position.set(0, hall.height + 4.3, 0)
    label.scale.set(4.8, 1.4, 1)
    group.add(label)

    hallGroups.set(hall.key, group)
    cityGroup.add(group)
  })
}

function createRouteLines() {
  if (!cityGroup) return

  const routeMaterial = new THREE.LineBasicMaterial({
    color: 0x4fb8ff,
    transparent: true,
    opacity: 0.42
  })
  const orderedPoints = halls.map(
    (item) => new THREE.Vector3(item.position[0], 0.16, item.position[2])
  )
  orderedPoints.unshift(new THREE.Vector3(0, 0.16, 0))
  orderedPoints.push(new THREE.Vector3(0, 0.16, 0))

  for (let index = 0; index < orderedPoints.length - 1; index += 1) {
    const curve = new THREE.CatmullRomCurve3([
      orderedPoints[index],
      new THREE.Vector3(
        (orderedPoints[index].x + orderedPoints[index + 1].x) / 2,
        0.16,
        (orderedPoints[index].z + orderedPoints[index + 1].z) / 2
      ),
      orderedPoints[index + 1]
    ])
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(24))
    const line = new THREE.Line(geometry, routeMaterial)
    cityGroup.add(line)
  }
}

function createDecorativeBlocks() {
  if (!cityGroup) return

  const material = new THREE.MeshStandardMaterial({
    color: 0x102033,
    roughness: 0.72,
    metalness: 0.2
  })
  const positions = [
    [-27, 0, -18],
    [-22, 0, 18],
    [25, 0, -18],
    [27, 0, 16],
    [-5, 0, -24],
    [7, 0, 24]
  ]

  positions.forEach((position, index) => {
    const height = 1.8 + (index % 3) * 0.8
    const block = new THREE.Mesh(new THREE.BoxGeometry(3.8, height, 3.8), material.clone())
    block.position.set(position[0], height / 2, position[2])
    block.castShadow = true
    block.receiveShadow = true
    cityGroup.add(block)
  })
}

function loadGltfExhibitionModel() {
  if (!scene) return

  const loader = new GLTFLoader()
  const modelUrl = '/models/ai-exhibition-hall.glb'
  modelState.value = 'GLB加载中'

  loader.load(
    modelUrl,
    (gltf) => {
      if (!scene) return
      externalModel = gltf.scene
      externalModel.name = 'gltf-exhibition-model'
      externalModel.position.set(0, 0.08, 0)
      externalModel.scale.set(1, 1, 1)
      externalModel.traverse((object) => {
        const mesh = object as THREE.Mesh
        if (mesh.isMesh) {
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      scene.add(externalModel)
      modelState.value = 'GLB已加载'
    },
    (event) => {
      if (!event.total) return
      const progress = Math.round((event.loaded / event.total) * 100)
      modelState.value = `GLB ${progress}%`
    },
    () => {
      modelState.value = '内置模型'
    }
  )
}

function bindRendererEvents() {
  const canvas = renderer?.domElement
  if (!canvas) return
  canvas.style.touchAction = 'none'
  canvas.addEventListener('click', handleCanvasClick)
  canvas.addEventListener('pointermove', handlePointerMove)
}

function handleCanvasClick(event: MouseEvent) {
  const key = pickHallFromPointer(event)
  if (key) focusHall(key)
}

function handlePointerMove(event: PointerEvent) {
  const key = pickHallFromPointer(event)
  const canvas = renderer?.domElement
  if (canvas) canvas.style.cursor = key ? 'pointer' : 'grab'
}

function pickHallFromPointer(event: MouseEvent | PointerEvent) {
  if (!camera || !renderer) return null

  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(pickMeshes, true)
  const target = intersects.find((item) => item.object.userData.hallKey)
  return (target?.object.userData.hallKey as HallKey | undefined) ?? null
}

function focusHall(key: HallKey) {
  activeKey.value = key
  const hall = halls.find((item) => item.key === key)
  const group = hallGroups.get(key)
  if (!hall || !group) return

  const [x, , z] = hall.position
  controlsTarget.set(x, 4.2, z)
  cameraTarget.set(x + 17, 17, z + 20)
  isCameraTransitioning = true
  updateHallMaterials()
}

function stopCameraTransition() {
  isCameraTransitioning = false
  if (!camera || !controls) return
  cameraTarget.copy(camera.position)
  controlsTarget.copy(controls.target)
}

function syncCameraTargetFromControls() {
  if (isCameraTransitioning || !camera || !controls) return
  cameraTarget.copy(camera.position)
  controlsTarget.copy(controls.target)
}

function updateHallMaterials() {
  halls.forEach((hall) => {
    const material = hallMaterials.get(hall.key)
    const ring = hallRings.get(hall.key)
    const isActive = hall.key === activeKey.value
    if (material) material.emissiveIntensity = isActive ? 0.46 : 0.08
    if (ring && ring.material instanceof THREE.MeshBasicMaterial) {
      ring.material.opacity = isActive ? 0.9 : 0.34
    }
  })
}

function animateScene() {
  animationId = window.requestAnimationFrame(animateScene)
  if (!renderer || !scene || !camera || !controls) return

  const elapsed = clock.getElapsedTime()

  if (isCameraTransitioning) {
    camera.position.lerp(cameraTarget, 0.04)
    controls.target.lerp(controlsTarget, 0.06)

    const cameraDone = camera.position.distanceToSquared(cameraTarget) < 0.04
    const targetDone = controls.target.distanceToSquared(controlsTarget) < 0.01
    if (cameraDone && targetDone) {
      camera.position.copy(cameraTarget)
      controls.target.copy(controlsTarget)
      isCameraTransitioning = false
    }
  }

  controls.update()

  hallRings.forEach((ring, key) => {
    ring.rotation.z += key === activeKey.value ? 0.015 : 0.005
    const pulse = key === activeKey.value ? 1 + Math.sin(elapsed * 3.2) * 0.045 : 1
    ring.scale.setScalar(pulse)
  })

  if (cityGroup) cityGroup.rotation.y = Math.sin(elapsed * 0.18) * 0.012
  if (externalModel) externalModel.rotation.y += 0.0015

  renderer.render(scene, camera)
}

function resizeRenderer() {
  const container = sceneHost.value
  if (!container || !renderer || !camera) return

  const width = container.clientWidth || 960
  const height = container.clientHeight || 640
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

function destroyThreeScene() {
  window.cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resizeRenderer)
  resizeObserver?.disconnect()

  const canvas = renderer?.domElement
  canvas?.removeEventListener('click', handleCanvasClick)
  canvas?.removeEventListener('pointermove', handlePointerMove)
  controls?.removeEventListener('start', stopCameraTransition)
  controls?.removeEventListener('change', syncCameraTargetFromControls)

  scene?.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.geometry?.dispose()
    const material = mesh.material
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose())
    } else {
      material?.dispose()
    }
  })

  controls?.dispose()
  renderer?.dispose()
  if (canvas?.parentNode) canvas.parentNode.removeChild(canvas)

  scene = null
  camera = null
  renderer = null
  controls = null
  cityGroup = null
  externalModel = null
  pickMeshes.length = 0
  isCameraTransitioning = false
  hallGroups.clear()
  hallMaterials.clear()
  hallRings.clear()
}

function createTextSprite(text: string, color: string, background: string, fontSize = 96) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 192
  const context = canvas.getContext('2d')
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = background
    roundRect(context, 48, 46, 416, 100, 24)
    context.fill()
    context.font = `700 ${fontSize}px Microsoft YaHei, PingFang SC, Arial`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillStyle = color
    context.fillText(text, 256, 98)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true })
  return new THREE.Sprite(material)
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath()
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
  context.closePath()
}

function goPage(path: string) {
  router.push(path)
}

function formatNo(no: number) {
  return no < 10 ? `0${no}` : `${no}`
}
</script>

<style scoped lang="scss">
.exhibition-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  color: #e6f1ff;
  background: #07111f;
}

.exhibition-screen::before,
.exhibition-screen::after {
  position: absolute;
  inset: auto;
  z-index: 0;
  width: 360px;
  height: 360px;
  pointer-events: none;
  content: '';
  border: 1px solid rgba(79, 140, 255, 0.18);
  border-radius: 50%;
}

.exhibition-screen::before {
  top: -180px;
  left: -120px;
}

.exhibition-screen::after {
  right: -160px;
  bottom: -210px;
}

.screen-header {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: minmax(260px, 360px) 1fr auto;
  gap: 18px;
  align-items: center;
  height: 76px;
  padding: 0 24px;
  background: rgba(7, 17, 31, 0.92);
  border-bottom: 1px solid rgba(125, 166, 255, 0.18);
}

.brand-zone {
  display: flex;
  gap: 14px;
  align-items: center;
  cursor: pointer;
}

.brand-mark {
  display: grid;
  width: 44px;
  height: 44px;
  font-size: 17px;
  font-weight: 800;
  color: #dff6ff;
  place-items: center;
  background: #14365f;
  border: 1px solid rgba(111, 201, 255, 0.42);
  border-radius: 14px;
  box-shadow: 0 0 24px rgba(79, 184, 255, 0.22);
}

.brand-zone h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.brand-zone p {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.55);
  text-transform: uppercase;
}

.tech-status {
  display: flex;
  gap: 10px;
  justify-content: center;
  min-width: 0;
}

.tech-status span {
  padding: 7px 12px;
  overflow: hidden;
  font-size: 12px;
  color: rgba(215, 235, 255, 0.78);
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(18, 36, 58, 0.86);
  border: 1px solid rgba(122, 169, 255, 0.16);
  border-radius: 999px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ghost-btn {
  color: rgba(230, 241, 255, 0.78) !important;
}

.solid-btn,
.enter-btn {
  border: 0;
  box-shadow: 0 10px 28px rgba(47, 140, 255, 0.28);
}

.screen-main {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 286px minmax(0, 1fr) 312px;
  gap: 16px;
  height: calc(100vh - 76px);
  min-height: 680px;
  padding: 16px;
}

.screen-panel,
.scene-board {
  background: rgba(8, 20, 37, 0.88);
  border: 1px solid rgba(125, 166, 255, 0.18);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.26);
}

.screen-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow: hidden;
  border-radius: 18px;
}

.panel-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(125, 166, 255, 0.15);
}

.panel-title span {
  font-size: 16px;
  font-weight: 700;
}

.panel-title em {
  font-size: 11px;
  font-style: normal;
  color: rgba(230, 241, 255, 0.42);
  letter-spacing: 0.12em;
}

.stat-list {
  display: grid;
  gap: 10px;
}

.stat-card {
  padding: 14px;
  margin-bottom: 0;
  background: #0e2036;
  border: 1px solid rgba(122, 169, 255, 0.14);
  border-radius: 16px;
}

.stat-card span,
.status-row span {
  display: block;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.58);
}

.stat-card strong {
  display: block;
  margin-top: 4px;
  font-size: 30px;
  line-height: 1;
  color: #ffffff;
}

.stat-card em {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  font-style: normal;
  color: #73d3ff;
}

.mini-section {
  padding: 14px;
  background: rgba(14, 32, 54, 0.72);
  border: 1px solid rgba(122, 169, 255, 0.12);
  border-radius: 16px;
}

.mini-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.status-list {
  display: grid;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-row strong {
  font-size: 12px;
  color: #dff6ff;
}

.scene-board {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border-radius: 22px;
}

.three-host {
  position: absolute;
  inset: 0;
  touch-action: none;
}

.three-host :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
  cursor: grab;
  outline: none;
  touch-action: none;
}

.scene-topbar {
  position: absolute;
  top: 18px;
  right: 18px;
  left: 18px;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  pointer-events: none;
}

.scene-topbar > div:first-child {
  padding: 12px 16px;
  background: rgba(7, 17, 31, 0.62);
  border: 1px solid rgba(125, 166, 255, 0.16);
  border-radius: 16px;
  backdrop-filter: blur(12px);
}

.scene-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.52);
}

.scene-topbar strong {
  font-size: 26px;
  letter-spacing: 0.04em;
}

.scene-tip {
  padding: 9px 13px;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.65);
  background: rgba(7, 17, 31, 0.52);
  border: 1px solid rgba(125, 166, 255, 0.12);
  border-radius: 999px;
  backdrop-filter: blur(12px);
}

.module-dock {
  position: absolute;
  right: 18px;
  bottom: 18px;
  left: 18px;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.dock-item,
.route-node,
.quick-grid button {
  font-family: inherit;
  color: inherit;
  cursor: pointer;
  background: rgba(12, 28, 48, 0.78);
  border: 1px solid rgba(125, 166, 255, 0.15);
}

.dock-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  min-width: 0;
  padding: 12px;
  text-align: left;
  border-radius: 16px;
  backdrop-filter: blur(14px);
  transition: all 0.2s ease;
}

.dock-item span {
  font-size: 12px;
  color: #73d3ff;
}

.dock-item strong {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dock-item.active,
.dock-item:hover,
.route-node.active,
.quick-grid button:hover {
  background: rgba(34, 84, 142, 0.86);
  border-color: rgba(115, 211, 255, 0.55);
  transform: translateY(-2px);
}

.active-card {
  padding: 18px;
  background: #0e2036;
  border: 1px solid rgba(122, 169, 255, 0.16);
  border-radius: 18px;
}

.active-code {
  width: fit-content;
  padding: 6px 9px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #89dcff;
  background: rgba(79, 140, 255, 0.14);
  border-radius: 999px;
}

.active-card h2 {
  margin: 0;
  font-size: 28px;
}

.active-card p {
  margin: 10px 0 14px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(230, 241, 255, 0.64);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag-row span {
  padding: 5px 8px;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.enter-btn {
  width: 100%;
}

.route-flow {
  display: grid;
  gap: 8px;
}

.route-node {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 8px;
  align-items: center;
  padding: 10px;
  text-align: left;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.route-node em {
  font-size: 11px;
  font-style: normal;
  color: #73d3ff;
}

.route-node span {
  font-size: 13px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.quick-grid button {
  min-height: 40px;
  font-size: 13px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

@media (max-width: 1280px) {
  .screen-main {
    grid-template-columns: 238px minmax(0, 1fr) 272px;
  }

  .module-dock {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .screen-header {
    grid-template-columns: 1fr;
    height: auto;
    padding: 14px;
  }

  .tech-status {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .screen-main {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
  }

  .scene-board {
    height: 680px;
  }
}
</style>

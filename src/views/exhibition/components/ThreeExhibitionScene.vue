<template>
  <div class="scene-shell">
    <div ref="sceneHost" class="three-host"></div>

    <div class="scene-topbar">
      <div class="current-hall-card">
        <span class="scene-label">当前展馆</span>
        <strong>{{ activeHall.title }}</strong>
        <em>{{ activeHall.sceneRole }}</em>
      </div>
      <div class="scene-tip">
        拖拽旋转 · 滚轮缩放 · 点击聚焦 · 双击进入 · 鼠标悬浮查看功能说明
      </div>
    </div>

    <!-- <div v-if="judgeMode" class="judge-ribbon">
      <span>评委视角</span>
      <strong>{{ activeHall.userValue }}</strong>
    </div> -->

    <div class="scene-value-bar">
      <div v-for="item in activeHall.kpis" :key="item.label" class="value-chip">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
        <em>{{ item.trend }}</em>
      </div>
    </div>

    <div v-if="hoverTooltip.visible && hoverTooltip.hall" class="hall-tooltip rich-tooltip" :style="tooltipStyle">
      <div class="tooltip-head">
        <span>{{ hoverTooltip.hall.code }}</span>
        <strong>{{ hoverTooltip.hall.hoverTitle }}</strong>
      </div>
      <p>{{ hoverTooltip.hall.hoverDesc }}</p>
      <div class="tooltip-grid">
        <div>
          <em>适用场景</em>
          <span>{{ hoverTooltip.hall.scenario }}</span>
        </div>
        <div>
          <em>数据资产</em>
          <span>{{ hoverTooltip.hall.dataAssets }}</span>
        </div>
      </div>
      <div class="tooltip-features">
        <span v-for="feature in hoverTooltip.hall.features.slice(0, 3)" :key="feature.name">
          {{ feature.name }}：{{ feature.desc }}
        </span>
      </div>
      <button type="button">双击进入{{ hoverTooltip.hall.short }}模块</button>
    </div>

    <div class="module-dock">
      <button v-for="item in halls" :key="item.key" type="button" :class="['dock-item', { active: activeKey === item.key }]" @click="focusHall(item.key)" @dblclick="emit('enter-hall', item.path)">
        <i>{{ item.icon }}</i>
        <span>{{ item.short }}</span>
        <strong>{{ item.title }}</strong>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import type { HallItem, HallKey, QualityMode } from '../types'

interface FlowMarker {
  mesh: THREE.Mesh
  curve: THREE.CatmullRomCurve3
  offset: number
  speed: number
}

interface HoverTooltipState {
  visible: boolean
  x: number
  y: number
  hall: HallItem | null
}

interface HallDecor {
  nameBoard: THREE.Sprite
  facadeBoard: THREE.Sprite
  ctaBoard: THREE.Sprite
  halo: THREE.Mesh
  entranceGlow: THREE.Mesh
}

const props = withDefaults(
  defineProps<{
    halls: HallItem[]
    activeKey: HallKey
    isTouring?: boolean
    qualityMode?: QualityMode
    judgeMode?: boolean
  }>(),
  {
    isTouring: false,
    qualityMode: 'high',
    judgeMode: false
  }
)

const emit = defineEmits<{
  (event: 'update:activeKey', value: HallKey): void
  (event: 'enter-hall', path: string): void
  (event: 'model-state', value: string): void
}>()

const sceneHost = ref<HTMLDivElement | null>(null)
const hoverTooltip = ref<HoverTooltipState>({
  visible: false,
  x: 0,
  y: 0,
  hall: null
})

const activeHall = computed(
  () => props.halls.find((item) => item.key === props.activeKey) ?? props.halls[0]
)
const tooltipStyle = computed(() => ({
  left: `${hoverTooltip.value.x}px`,
  top: `${hoverTooltip.value.y}px`
}))

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let composer: EffectComposer | null = null
let bloomPass: UnrealBloomPass | null = null
let controls: OrbitControls | null = null
let resizeObserver: ResizeObserver | null = null
let animationId = 0
let cityGroup: THREE.Group | null = null
let externalModel: THREE.Group | null = null
let hoveredKey: HallKey | null = null

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const pickMeshes: THREE.Object3D[] = []
const hallGroups = new Map<HallKey, THREE.Group>()
const hallMaterials = new Map<HallKey, THREE.MeshStandardMaterial[]>()
const hallGlowMaterials = new Map<HallKey, THREE.MeshBasicMaterial[]>()
const hallGlassMaterials = new Map<HallKey, THREE.MeshBasicMaterial[]>()
const hallRings = new Map<HallKey, THREE.Object3D[]>()
const hallDecor = new Map<HallKey, HallDecor>()
const animatedObjects: THREE.Object3D[] = []
const flowMarkers: FlowMarker[] = []
const cameraTarget = new THREE.Vector3(30, 23, 35)
const controlsTarget = new THREE.Vector3(0, 3.6, 0)
const clock = new THREE.Clock()
const scenePointer = new THREE.Vector2(0, 0)
const introScaleVector = new THREE.Vector3(1, 1, 1)
const INTRO_DURATION = 1650
let introStart = 0
let pointerInsideScene = false
let isCameraTransitioning = false

onMounted(async () => {
  await nextTick()
  initThreeScene()
})

onBeforeUnmount(() => {
  destroyThreeScene()
})

watch(
  () => props.activeKey,
  (key) => {
    focusHall(key, true)
  }
)

watch(
  () => props.qualityMode,
  () => {
    applyQualitySettings()
  }
)

watch(
  () => props.isTouring,
  () => {
    applyTourSettings()
  }
)

function initThreeScene() {
  const container = sceneHost.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = createSkyTexture()
  scene.fog = new THREE.FogExp2(0x0d1f34, 0.0125)

  const width = container.clientWidth || 960
  const height = container.clientHeight || 640

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 360)
  camera.position.copy(cameraTarget)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(getPixelRatio())
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.96
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.innerHTML = ''
  container.appendChild(renderer.domElement)

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), getBloomStrength(), 0.34, 0.24)
  composer.addPass(bloomPass)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.078
  controls.enableZoom = true
  controls.zoomSpeed = 0.82
  controls.rotateSpeed = 0.48
  controls.minDistance = 10
  controls.maxDistance = 118
  controls.maxPolarAngle = Math.PI * 0.49
  controls.target.copy(controlsTarget)
  controls.autoRotateSpeed = 0.36
  controls.addEventListener('start', stopCameraTransition)
  applyTourSettings()

  introStart = performance.now()
  createLights()
  createDigitalExhibition()
  loadGltfExhibitionModel()
  bindRendererEvents()

  resizeObserver = new ResizeObserver(resizeRenderer)
  resizeObserver.observe(container)
  emit('model-state', '立体展馆增强模型')
  focusHall(props.activeKey, true)
  animateScene()
}

function createSkyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, '#0a1a2d')
  gradient.addColorStop(0.46, '#102943')
  gradient.addColorStop(1, '#081624')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const glow = ctx.createRadialGradient(
    canvas.width * 0.5,
    canvas.height * 0.18,
    10,
    canvas.width * 0.5,
    canvas.height * 0.18,
    canvas.width * 0.62
  )
  glow.addColorStop(0, 'rgba(104, 204, 255, 0.26)')
  glow.addColorStop(0.42, 'rgba(62, 137, 204, 0.12)')
  glow.addColorStop(1, 'rgba(4, 12, 24, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

function createLights() {
  if (!scene) return

  scene.add(new THREE.AmbientLight(0xb7dcff, 0.58))

  const hemi = new THREE.HemisphereLight(0xd7f5ff, 0x0b1d33, 1.04)
  scene.add(hemi)

  const keyLight = new THREE.DirectionalLight(0xf7fcff, 1.92)
  keyLight.position.set(-22, 34, 25)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near = 1
  keyLight.shadow.camera.far = 95
  keyLight.shadow.camera.left = -42
  keyLight.shadow.camera.right = 42
  keyLight.shadow.camera.top = 42
  keyLight.shadow.camera.bottom = -42
  scene.add(keyLight)

  const frontSoft = new THREE.PointLight(0x7bd7ff, 1.02, 76, 2.1)
  frontSoft.position.set(0, 12, 16)
  scene.add(frontSoft)

  const warmInterior = new THREE.PointLight(0xffd8ad, 0.82, 64, 2.4)
  warmInterior.position.set(14, 7, -14)
  scene.add(warmInterior)
}

function createDigitalExhibition() {
  if (!scene) return

  cityGroup = new THREE.Group()
  cityGroup.name = 'ComfortDigitalExhibition'
  cityGroup.scale.setScalar(0.78)
  cityGroup.position.y = -1.35
  cityGroup.rotation.set(-0.08, -0.72, 0)
  scene.add(cityGroup)

  createAtriumFloor()
  createSoftDome()
  createCoreHub()
  createHallPavilions()
  createRouteLines()
  createLandscapeAndWater()
  createSoftHudRings()
}

function createAtriumFloor() {
  if (!cityGroup) return

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x0d2137,
    roughness: 0.44,
    metalness: 0.55,
    emissive: 0x061a2e,
    emissiveIntensity: 0.2
  })
  const base = new THREE.Mesh(new THREE.CylinderGeometry(39.5, 39.5, 0.28, 160), baseMaterial)
  base.position.y = -0.16
  base.receiveShadow = true
  cityGroup.add(base)

  const plazaMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b3a5b,
    roughness: 0.34,
    metalness: 0.64,
    emissive: 0x082541,
    emissiveIntensity: 0.26
  })
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(16.4, 17.6, 0.18, 128), plazaMaterial)
  plaza.position.y = 0.04
  plaza.receiveShadow = true
  cityGroup.add(plaza)

  const softRingMaterial = new THREE.MeshBasicMaterial({
    color: 0x8de9ff,
    transparent: true,
    opacity: 0.28,
    depthWrite: false
  })
  ;[8.2, 13.6, 21.5, 30.8, 38.5].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, index < 2 ? 0.035 : 0.024, 10, 192),
      softRingMaterial.clone()
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 0.12 + index * 0.012
    cityGroup?.add(ring)
    if (index < 3) animatedObjects.push(ring)
  })

  const guideMaterial = new THREE.MeshBasicMaterial({
    color: 0x72d7ff,
    transparent: true,
    opacity: 0.16,
    depthWrite: false
  })
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2
    const guide = new THREE.Mesh(new THREE.BoxGeometry(16, 0.018, 0.028), guideMaterial.clone())
    guide.position.set(Math.cos(angle) * 8, 0.14, Math.sin(angle) * 8)
    guide.rotation.y = -angle
    cityGroup.add(guide)
  }
}

function createSoftDome() {
  if (!cityGroup) return

  const domeMaterial = new THREE.MeshBasicMaterial({
    color: 0xa9e8ff,
    transparent: true,
    opacity: 0.045,
    side: THREE.BackSide,
    depthWrite: false
  })
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(40, 64, 20, 0, Math.PI * 2, 0, Math.PI * 0.52),
    domeMaterial
  )
  dome.position.y = -1.2
  cityGroup.add(dome)

  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x9feeff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  })
  ;[18, 27, 36].forEach((radius, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.028, 8, 220),
      ringMaterial.clone()
    )
    ring.rotation.x = Math.PI / 2
    ring.position.y = 9 + index * 2.8
    cityGroup?.add(ring)
    animatedObjects.push(ring)
  })
}

function createCoreHub() {
  if (!cityGroup) return

  const coreGroup = new THREE.Group()
  coreGroup.name = 'CoreHub'
  cityGroup.add(coreGroup)

  const baseMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b4268,
    roughness: 0.3,
    metalness: 0.72,
    emissive: 0x0d3153,
    emissiveIntensity: 0.28
  })
  const glassMaterial = new THREE.MeshBasicMaterial({
    color: 0x7fe6ff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false
  })
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x61d9ff,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  })

  const outer = new THREE.Mesh(new THREE.CylinderGeometry(7.4, 8.4, 0.6, 128), baseMaterial)
  outer.position.y = 0.34
  outer.castShadow = true
  outer.receiveShadow = true
  coreGroup.add(outer)

  const inner = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 5.4, 0.36, 128),
    baseMaterial.clone()
  )
  inner.position.y = 0.86
  inner.castShadow = true
  inner.receiveShadow = true
  coreGroup.add(inner)

  const sphere = new THREE.Mesh(new THREE.SphereGeometry(2.25, 64, 32), glassMaterial.clone())
  sphere.position.y = 4.15
  coreGroup.add(sphere)
  animatedObjects.push(sphere)

  const aiCore = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.25, 2),
    new THREE.MeshStandardMaterial({
      color: 0x4fcfff,
      roughness: 0.18,
      metalness: 0.42,
      emissive: 0x1a8fd8,
      emissiveIntensity: 0.95
    })
  )
  aiCore.position.y = 4.15
  aiCore.castShadow = true
  coreGroup.add(aiCore)
  animatedObjects.push(aiCore)
  ;[2.65, 3.85, 5.35].forEach((y, index) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.55 + index * 0.72, 0.045, 12, 160),
      glowMaterial.clone()
    )
    ring.position.y = y
    ring.rotation.x = Math.PI / 2
    coreGroup.add(ring)
    animatedObjects.push(ring)
  })

  const screen = createTextSprite('AI创业就业助手', '#f4fbff', 'rgba(9, 30, 52, 0.52)', 76)
  screen.position.set(0, 7.15, 0)
  screen.scale.set(6.2, 1.16, 1)
  coreGroup.add(screen)

  const sub = createTextSprite('数字展厅', '#94e8ff', 'rgba(9, 30, 52, 0.32)', 58)
  sub.position.set(0, 6.12, 0)
  sub.scale.set(3.3, 0.72, 1)
  coreGroup.add(sub)

  const light = new THREE.PointLight(0x71dcff, 2.1, 34, 2)
  light.position.set(0, 5.5, 0)
  coreGroup.add(light)
}

function createHallPavilions() {
  if (!cityGroup) return

  props.halls.forEach((hall, index) => {
    const group = new THREE.Group()
    group.name = hall.key
    group.position.set(...hall.position)
    group.userData.hallKey = hall.key
    group.userData.baseY = hall.position[1] ?? 0
    group.lookAt(0, group.position.y, 0)
    hallGroups.set(hall.key, group)
    cityGroup?.add(group)

    const color = new THREE.Color(hall.color)
    const shellMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2edf3,
      roughness: 0.36,
      metalness: 0.5,
      emissive: color.clone().multiplyScalar(0.025),
      emissiveIntensity: 0.28
    })
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: color.clone().multiplyScalar(0.4),
      roughness: 0.3,
      metalness: 0.68,
      emissive: color.clone().multiplyScalar(0.17),
      emissiveIntensity: 0.42
    })
    const glassMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    })
    const glowMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.46,
      depthWrite: false
    })
    hallMaterials.set(hall.key, [shellMaterial, bodyMaterial])
    hallGlassMaterials.set(hall.key, [glassMaterial])
    hallGlowMaterials.set(hall.key, [glowMaterial])

    createRoundedPavilion(
      group,
      hall,
      shellMaterial,
      bodyMaterial,
      glassMaterial,
      glowMaterial,
      index
    )

    const warm = new THREE.PointLight(0xffd5a0, 0.78, 15, 2.2)
    warm.position.set(0, 2.0, -0.4)
    group.add(warm)

    const accent = new THREE.PointLight(hall.color, 1.05, 20, 2.1)
    accent.position.set(0, 3.2, 0)
    group.add(accent)
  })

  updateHallMaterials()
}

function createRoundedPavilion(
  group: THREE.Group,
  hall: HallItem,
  shellMaterial: THREE.MeshStandardMaterial,
  bodyMaterial: THREE.MeshStandardMaterial,
  glassMaterial: THREE.MeshBasicMaterial,
  glowMaterial: THREE.MeshBasicMaterial,
  index: number
) {
  const color = new THREE.Color(hall.color)
  const widthScale = 1.12 + (index % 2) * 0.08
  const depthScale = 1.02 + (index % 3) * 0.04
  const unit = 1.55
  const decor: Partial<HallDecor> = {}
  const trackedShellMaterials: THREE.MeshStandardMaterial[] = []
  const trackedBodyMaterials: THREE.MeshStandardMaterial[] = []
  const trackedGlassMaterials: THREE.MeshBasicMaterial[] = []
  const trackedGlowMaterials: THREE.MeshBasicMaterial[] = []

  const pickable = (mesh: THREE.Mesh) => {
    mesh.userData.hallKey = hall.key
    pickMeshes.push(mesh)
    return mesh
  }

  const createShellMaterial = (tone = 0xe8f0f4) => {
    const material = shellMaterial.clone()
    material.color.set(tone)
    material.emissive.copy(color).multiplyScalar(0.035)
    material.emissiveIntensity = 0.34
    material.roughness = 0.4
    material.metalness = 0.42
    material.userData.role = 'shell'
    material.userData.baseTone = tone
    trackedShellMaterials.push(material)
    return material
  }

  const createBodyMaterial = (factor = 0.42, emissiveFactor = 0.14) => {
    const material = bodyMaterial.clone()
    material.color.copy(color).multiplyScalar(factor)
    material.emissive.copy(color).multiplyScalar(emissiveFactor)
    material.emissiveIntensity = 0.42
    material.roughness = 0.34
    material.metalness = 0.58
    material.userData.role = 'body'
    material.userData.factor = factor
    material.userData.emissiveFactor = emissiveFactor
    trackedBodyMaterials.push(material)
    return material
  }

  const createGlassMaterial = (opacity = 0.2) => {
    const material = glassMaterial.clone()
    material.color.copy(color).lerp(new THREE.Color(0xdff8ff), 0.34)
    material.opacity = opacity
    material.depthWrite = false
    trackedGlassMaterials.push(material)
    return material
  }

  const createGlowMaterial = (opacity = 0.32) => {
    const material = glowMaterial.clone()
    material.color.copy(color).lerp(new THREE.Color(0x88efff), 0.24)
    material.opacity = opacity
    material.depthWrite = false
    trackedGlowMaterials.push(material)
    return material
  }

  const createBox = (
    name: string,
    width: number,
    height: number,
    depth: number,
    radius: number,
    material: THREE.Material,
    position: [number, number, number],
    selectable = true
  ) => {
    const mesh = new THREE.Mesh(
      roundedBoxGeometry(
        width * unit * widthScale,
        height * unit,
        depth * unit * depthScale,
        radius * unit
      ),
      material
    )
    mesh.name = `${hall.short}-${name}`
    mesh.position.set(
      position[0] * unit * widthScale,
      position[1] * unit,
      position[2] * unit * depthScale
    )
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(selectable ? pickable(mesh) : mesh)
    return mesh
  }

  const baseMaterial = createShellMaterial(0xd7e2e8)
  const platformMaterial = createBodyMaterial(0.31, 0.1)
  const mainMaterial = createBodyMaterial(0.46, 0.17)
  const sideMaterial = createBodyMaterial(0.38, 0.14)
  const roofMaterial = createShellMaterial(0xeaf2f5)
  const stepMaterial = createShellMaterial(0xdde8ee)
  const glass = createGlassMaterial(0.22)
  const glow = createGlowMaterial(0.34)

  const foundation = createBox('展馆基座', 5.15, 0.34, 3.62, 0.22, baseMaterial, [0, 0.17, 0])
  foundation.name = `${hall.short}-盒体式展馆基座`

  const platform = createBox('下沉平台', 4.62, 0.28, 3.18, 0.2, platformMaterial, [0, 0.48, 0])
  platform.name = `${hall.short}-功能展示平台`

  const mainBody = createBox('主体展厅', 3.18, 1.72, 2.18, 0.24, mainMaterial, [0, 1.28, 0])
  mainBody.name = `${hall.short}-主体展馆空间`
  ;[-1, 1].forEach((side) => {
    const wing = createBox(
      side > 0 ? '右侧展陈厅' : '左侧展陈厅',
      0.92,
      1.26,
      1.72,
      0.18,
      sideMaterial.clone(),
      [side * 1.88, 1.05, 0.08]
    )
    wing.rotation.y = side * 0.045

    const sideWindow = createBox(
      side > 0 ? '右侧展示窗' : '左侧展示窗',
      0.58,
      0.48,
      0.05,
      0.07,
      createGlassMaterial(0.24),
      [side * 1.88, 1.14, -0.86],
      false
    )
    sideWindow.rotation.y = side * 0.045
  })

  const roof = createBox('屋顶压檐', 3.68, 0.38, 2.58, 0.2, roofMaterial, [0, 2.42, 0])
  roof.name = `${hall.short}-现代展馆屋顶`

  const skylight = createBox(
    '屋顶采光舱',
    2.25,
    0.14,
    0.92,
    0.12,
    createGlassMaterial(0.2),
    [0, 2.76, -0.02],
    false
  )
  skylight.castShadow = false

  const facadeGlass = createBox(
    '正面玻璃幕墙',
    1.42,
    1.06,
    0.055,
    0.1,
    createGlassMaterial(0.25),
    [0, 1.32, -1.13]
  )
  facadeGlass.name = `${hall.short}-入口玻璃幕墙`
  decor.entranceGlow = facadeGlass

  const doorMaterial = createBodyMaterial(0.58, 0.19)
  const door = createBox('入口门厅', 0.7, 0.78, 0.08, 0.07, doorMaterial, [0, 0.78, -1.22])
  door.name = `${hall.short}-入口门厅`

  const canopy = createBox(
    '入口悬挑雨棚',
    2.35,
    0.16,
    0.48,
    0.1,
    createShellMaterial(0xf0f6f8),
    [0, 2.02, -1.43]
  )
  canopy.name = `${hall.short}-入口悬挑雨棚`
  ;[0, 1, 2].forEach((stepIndex) => {
    createBox(
      `入口台阶-${stepIndex + 1}`,
      2.22 + stepIndex * 0.42,
      0.08,
      0.32,
      0.05,
      stepMaterial.clone(),
      [0, 0.14 + stepIndex * 0.055, -1.55 - stepIndex * 0.19]
    )
  })

  const displayMaterial = createGlassMaterial(0.23)
  ;[-0.86, 0.86].forEach((x, displayIndex) => {
    const display = createBox(
      `室内数字屏-${displayIndex + 1}`,
      0.58,
      0.44,
      0.045,
      0.06,
      displayMaterial.clone(),
      [x, 1.46, -1.2],
      false
    )
    display.castShadow = false
  })

  const badge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.04, 36),
    createGlowMaterial(0.48)
  )
  badge.name = `${hall.short}-屋顶识别徽章`
  badge.rotation.x = Math.PI / 2
  badge.position.set(0, 2.61 * unit, -1.28 * unit * depthScale)
  group.add(badge)
  animatedObjects.push(badge)

  const baseRing = new THREE.Mesh(
    new THREE.TorusGeometry(3.08 * unit, 0.032 * unit, 12, 180),
    createGlowMaterial(0.24)
  )
  baseRing.name = `${hall.short}-底部光环`
  baseRing.scale.set(widthScale * 0.86, depthScale * 0.74, 1)
  baseRing.rotation.x = Math.PI / 2
  baseRing.position.y = 0.62 * unit
  group.add(baseRing)

  const roofRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.14 * unit, 0.024 * unit, 12, 160),
    createGlowMaterial(0.2)
  )
  roofRing.name = `${hall.short}-屋顶光环`
  roofRing.scale.set(widthScale * 0.86, depthScale * 0.72, 1)
  roofRing.rotation.x = Math.PI / 2
  roofRing.position.y = 2.88 * unit
  group.add(roofRing)

  const entranceFrame = new THREE.Mesh(
    new THREE.TorusGeometry(0.82 * unit, 0.024 * unit, 10, 96),
    createGlowMaterial(0.34)
  )
  entranceFrame.name = `${hall.short}-入口导光框`
  entranceFrame.scale.set(1.42 * widthScale, 0.42, 1)
  entranceFrame.position.set(0, 1.32 * unit, -1.28 * unit * depthScale)
  group.add(entranceFrame)
  animatedObjects.push(entranceFrame)

  const hoverHaloMaterial = createGlowMaterial(0.08)
  hoverHaloMaterial.side = THREE.DoubleSide
  const hoverHalo = new THREE.Mesh(
    new THREE.RingGeometry(3.0 * unit, 3.78 * unit, 128),
    hoverHaloMaterial
  )
  hoverHalo.name = `${hall.short}-选中投影光环`
  hoverHalo.rotation.x = -Math.PI / 2
  hoverHalo.position.y = 0.12 * unit
  group.add(hoverHalo)
  decor.halo = hoverHalo

  const nameBoard = createTextSprite(hall.title, '#f7fcff', 'rgba(12, 31, 50, 0.62)', 58, 640, 176)
  nameBoard.name = `${hall.short}-顶部展馆名`
  nameBoard.position.set(0, 3.3 * unit, -0.04)
  nameBoard.scale.set(3.9, 1.06, 1)
  group.add(nameBoard)
  decor.nameBoard = nameBoard

  const facadeBoard = createTextSprite(hall.short, '#ffffff', 'rgba(8, 24, 42, 0.52)', 66, 512, 170)
  facadeBoard.name = `${hall.short}-正面馆名`
  facadeBoard.position.set(0, 2.08 * unit, -1.42 * unit * depthScale)
  facadeBoard.scale.set(2.4, 0.62, 1)
  group.add(facadeBoard)
  decor.facadeBoard = facadeBoard

  const icon = createTextSprite(hall.icon, '#ffffff', 'rgba(20, 58, 92, 0.36)', 88, 360, 160)
  icon.name = `${hall.short}-展馆图标`
  icon.position.set(-1.68 * unit * widthScale, 2.16 * unit, -1.32 * unit * depthScale)
  icon.scale.set(0.82, 0.52, 1)
  group.add(icon)

  const code = createTextSprite(
    `${index + 1}`.padStart(2, '0'),
    '#8beaff',
    'rgba(15, 48, 78, 0.34)',
    62,
    320,
    150
  )
  code.name = `${hall.short}-编号`
  code.position.set(1.72 * unit * widthScale, 0.9 * unit, -1.24 * unit * depthScale)
  code.scale.set(0.7, 0.36, 1)
  group.add(code)

  const ctaBoard = createTextSprite('双击进入', '#effcff', 'rgba(22, 74, 112, 0.55)', 50, 400, 142)
  ctaBoard.name = `${hall.short}-进入提示`
  ctaBoard.position.set(0, 0.54 * unit, -1.92 * unit * depthScale)
  ctaBoard.scale.set(1.68, 0.44, 1)
  ctaBoard.visible = false
  group.add(ctaBoard)
  decor.ctaBoard = ctaBoard

  hallMaterials.set(hall.key, [
    trackedShellMaterials[0],
    ...trackedBodyMaterials,
    ...trackedShellMaterials.slice(1)
  ])
  hallGlassMaterials.set(hall.key, trackedGlassMaterials)
  hallGlowMaterials.set(hall.key, trackedGlowMaterials)
  hallRings.set(hall.key, [baseRing, roofRing, entranceFrame, hoverHalo])
  animatedObjects.push(baseRing, roofRing)
  hallDecor.set(hall.key, decor as HallDecor)
}

function createRouteLines() {
  if (!cityGroup) return
  const center = new THREE.Vector3(0, 0.26, 0)
  props.halls.forEach((hall) => {
    const end = new THREE.Vector3(hall.position[0], 0.26, hall.position[2])
    const mid = center.clone().lerp(end, 0.55)
    mid.y = 0.36
    const curve = new THREE.CatmullRomCurve3([center, mid, end])
    const color = new THREE.Color(hall.color)
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    })
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.035, 10, false), material)
    cityGroup?.add(tube)

    const soft = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 64, 0.12, 10, false),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.055,
        depthWrite: false
      })
    )
    cityGroup?.add(soft)

    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 18, 18),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.86, depthWrite: false })
    )
    cityGroup?.add(marker)
    flowMarkers.push({
      mesh: marker,
      curve,
      offset: Math.random(),
      speed: 0.06 + Math.random() * 0.025
    })
  })
}

function createLandscapeAndWater() {
  if (!cityGroup) return

  const waterMaterial = new THREE.MeshBasicMaterial({
    color: 0x68d8ff,
    transparent: true,
    opacity: 0.055,
    depthWrite: false
  })
  ;[
    [-17, -14, 4.5, 2.2],
    [18, 13, 4.8, 2.4],
    [25, -9, 3.8, 1.8],
    [-26, 10, 3.6, 1.8]
  ].forEach(([x, z, sx, sz]) => {
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 64), waterMaterial.clone())
    pool.scale.set(sx, sz, 1)
    pool.rotation.x = -Math.PI / 2
    pool.position.set(x, 0.16, z)
    cityGroup?.add(pool)
  })

  const treeTopMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d7d64,
    roughness: 0.72,
    metalness: 0.08
  })
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x725238,
    roughness: 0.78,
    metalness: 0.05
  })
  for (let i = 0; i < 42; i += 1) {
    const angle = Math.random() * Math.PI * 2
    const radius = 20 + Math.random() * 17
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const tree = new THREE.Group()
    tree.position.set(x, 0.08, z)
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.07, 0.55, 8), trunkMaterial)
    trunk.position.y = 0.28
    const crown = new THREE.Mesh(
      new THREE.SphereGeometry(0.38 + Math.random() * 0.16, 12, 8),
      treeTopMaterial
    )
    crown.scale.set(1.15, 0.9, 1.15)
    crown.position.y = 0.72
    tree.add(trunk, crown)
    cityGroup.add(tree)
  }
}

function createSoftHudRings() {
  if (!cityGroup) return
  const material = new THREE.MeshBasicMaterial({
    color: 0x87e6ff,
    transparent: true,
    opacity: 0.12,
    depthWrite: false
  })
  ;[11.5, 16.5, 22.5].forEach((radius, index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.018, 8, 180), material.clone())
    ring.position.y = 7.5 + index * 1.55
    ring.rotation.x = Math.PI / 2
    cityGroup?.add(ring)
    animatedObjects.push(ring)
  })
}

function loadGltfExhibitionModel() {
  if (!scene || !cityGroup) return
  const loader = new GLTFLoader()
  loader.load(
    '/models/ai-exhibition-hall.glb',
    (gltf) => {
      externalModel = gltf.scene
      externalModel.name = 'ExternalExhibitionModel'
      externalModel.visible = false
      externalModel.scale.setScalar(4.8)
      externalModel.position.set(0, 0, 0)
      externalModel.traverse((child) => {
        const mesh = child as THREE.Mesh
        if (mesh.isMesh) {
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      cityGroup?.add(externalModel)
      emit('model-state', '已检测到GLB模型，当前使用内置立体展馆')
    },
    undefined,
    () => {
      emit('model-state', '内置立体展馆模型')
    }
  )
}

function bindRendererEvents() {
  if (!renderer) return
  const canvas = renderer.domElement
  canvas.addEventListener('click', handleCanvasClick)
  canvas.addEventListener('dblclick', handleCanvasDoubleClick)
  canvas.addEventListener('pointermove', handlePointerMove)
  canvas.addEventListener('pointerleave', handlePointerLeave)
}

function handleCanvasClick(event: MouseEvent) {
  const hall = pickHallFromPointer(event)
  if (hall) focusHall(hall.key)
}

function handleCanvasDoubleClick(event: MouseEvent) {
  const hall = pickHallFromPointer(event)
  if (hall) emit('enter-hall', hall.path)
}

function handlePointerMove(event: PointerEvent) {
  if (!sceneHost.value) return
  const rect = sceneHost.value.getBoundingClientRect()
  pointerInsideScene = true
  scenePointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
  scenePointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2

  const hall = pickHallFromPointer(event)
  if (!hall) {
    clearHover()
    return
  }

  if (renderer) renderer.domElement.style.cursor = 'pointer'
  hoveredKey = hall.key
  hoverTooltip.value = {
    visible: true,
    x: Math.min(Math.max(event.clientX - rect.left + 18, 18), rect.width - 350),
    y: Math.min(Math.max(event.clientY - rect.top + 18, 76), rect.height - 260),
    hall
  }
  updateHallMaterials()
}

function handlePointerLeave() {
  pointerInsideScene = false
  scenePointer.set(0, 0)
  clearHover()
}

function clearHover() {
  hoveredKey = null
  if (renderer) renderer.domElement.style.cursor = 'grab'
  hoverTooltip.value.visible = false
  hoverTooltip.value.hall = null
  updateHallMaterials()
}

function pickHallFromPointer(event: MouseEvent | PointerEvent) {
  if (!renderer || !camera || !sceneHost.value) return null
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const intersects = raycaster.intersectObjects(pickMeshes, true)
  const key = intersects.find((item) => item.object.userData.hallKey)?.object.userData.hallKey as
    | HallKey
    | undefined
  return key ? props.halls.find((item) => item.key === key) ?? null : null
}

function focusHall(key: HallKey, silent = false) {
  const hall = props.halls.find((item) => item.key === key)
  if (!hall) return
  if (!silent && key !== props.activeKey) emit('update:activeKey', key)

  const position = new THREE.Vector3(...hall.position)
  const direction = position.clone().setY(0).normalize()
  if (direction.lengthSq() < 0.01) direction.set(0.4, 0, 1)
  const side = new THREE.Vector3(-direction.z, 0, direction.x).multiplyScalar(3.4)
  controlsTarget.copy(position).add(new THREE.Vector3(0, 2.2, 0))
  cameraTarget
    .copy(position)
    .add(direction.multiplyScalar(18.5))
    .add(side)
    .add(new THREE.Vector3(0, 9.6, 0))
  isCameraTransitioning = true
  updateHallMaterials()
}

function resetCamera() {
  cameraTarget.set(30, 23, 35)
  controlsTarget.set(0, 3.6, 0)
  isCameraTransitioning = true
}

function stopCameraTransition() {
  isCameraTransitioning = false
}

function updateHallMaterials() {
  props.halls.forEach((hall) => {
    const isActive = hall.key === props.activeKey
    const isHover = hall.key === hoveredKey
    const color = new THREE.Color(hall.color)

    hallMaterials.get(hall.key)?.forEach((material, index) => {
      const role = material.userData?.role ?? (index === 0 ? 'shell' : 'body')
      if (role === 'shell') {
        material.color.set(
          isActive || isHover ? 0xf6fbfd : Number(material.userData?.baseTone ?? 0xe2edf3)
        )
        material.emissive.copy(color).multiplyScalar(isActive ? 0.048 : isHover ? 0.038 : 0.026)
        material.emissiveIntensity = isActive ? 0.44 : isHover ? 0.38 : 0.3
      } else {
        const baseFactor = Number(material.userData?.factor ?? 0.4)
        const activeFactor = Math.min(baseFactor + 0.12, 0.62)
        const hoverFactor = Math.min(baseFactor + 0.08, 0.58)
        material.color
          .copy(color)
          .multiplyScalar(isActive ? activeFactor : isHover ? hoverFactor : baseFactor)
        material.emissive.copy(color).multiplyScalar(isActive ? 0.2 : isHover ? 0.18 : 0.15)
        material.emissiveIntensity = isActive ? 0.58 : isHover ? 0.5 : 0.42
      }
    })

    hallGlassMaterials.get(hall.key)?.forEach((material) => {
      material.opacity = isActive ? 0.23 : isHover ? 0.2 : 0.16
    })

    hallGlowMaterials.get(hall.key)?.forEach((material) => {
      material.opacity = isActive ? 0.42 : isHover ? 0.36 : 0.28
    })

    hallRings.get(hall.key)?.forEach((ring, index) => {
      const baseScale = isActive ? 1.08 : isHover ? 1.04 : 1
      if (index === 3) {
        ring.scale.setScalar(isActive ? 1.1 : isHover ? 1.06 : 1)
      } else {
        ring.scale.setScalar(baseScale)
      }
    })

    const decor = hallDecor.get(hall.key)
    if (decor) {
      const nameMaterial = decor.nameBoard.material as THREE.SpriteMaterial
      const facadeMaterial = decor.facadeBoard.material as THREE.SpriteMaterial
      const ctaMaterial = decor.ctaBoard.material as THREE.SpriteMaterial
      const haloMaterial = decor.halo.material as THREE.MeshBasicMaterial
      const entranceMaterial = decor.entranceGlow.material as THREE.MeshBasicMaterial

      nameMaterial.opacity = isActive ? 1 : isHover ? 0.96 : 0.76
      facadeMaterial.opacity = isActive || isHover ? 0.96 : 0.72
      ctaMaterial.opacity = isHover ? 0.95 : 0
      decor.ctaBoard.visible = isHover
      haloMaterial.opacity = isActive ? 0.075 : isHover ? 0.062 : 0.042
      entranceMaterial.opacity = isActive ? 0.22 : isHover ? 0.19 : 0.14
      decor.nameBoard.scale.lerp(
        new THREE.Vector3(isActive ? 4.28 : isHover ? 4.08 : 3.9, isActive ? 1.14 : 1.06, 1),
        0.45
      )
    }
  })
}

function animateScene() {
  if (!scene || !camera || !renderer || !controls) return
  const elapsed = clock.getElapsedTime()
  const delta = clock.getDelta()
  const introProgress = Math.min((performance.now() - introStart) / INTRO_DURATION, 1)
  const introEase = easeOutCubic(introProgress)

  if (cityGroup) {
    const targetScale = THREE.MathUtils.lerp(0.78, 1, introEase)
    introScaleVector.set(targetScale, targetScale, targetScale)
    cityGroup.scale.lerp(introScaleVector, 0.18)
    cityGroup.position.y +=
      (THREE.MathUtils.lerp(-1.35, 0, introEase) - cityGroup.position.y) * 0.16

    const pointerYaw = pointerInsideScene ? scenePointer.x * 0.032 : 0
    const pointerTilt = pointerInsideScene ? -scenePointer.y * 0.014 : 0
    const targetYaw = THREE.MathUtils.lerp(-0.72, 0, introEase) + pointerYaw
    const targetPitch = THREE.MathUtils.lerp(-0.08, 0, introEase) + pointerTilt
    cityGroup.rotation.y += (targetYaw - cityGroup.rotation.y) * 0.075
    cityGroup.rotation.x += (targetPitch - cityGroup.rotation.x) * 0.075
    cityGroup.rotation.z +=
      ((pointerInsideScene ? -scenePointer.x * 0.006 : 0) - cityGroup.rotation.z) * 0.06
  }

  animatedObjects.forEach((object, index) => {
    object.rotation.y += (index % 2 === 0 ? 1 : -1) * delta * (0.045 + (index % 4) * 0.012)
    object.position.y += Math.sin(elapsed * 0.72 + index) * 0.00045
  })

  flowMarkers.forEach((marker) => {
    marker.offset = (marker.offset + delta * marker.speed) % 1
    const point = marker.curve.getPoint(marker.offset)
    marker.mesh.position.copy(point)
    marker.mesh.position.y += 0.18 + Math.sin(elapsed * 2.8 + marker.offset * 8) * 0.04
  })

  hallGroups.forEach((group, key) => {
    const active = key === props.activeKey
    const hover = key === hoveredKey
    const targetScale = active ? 1.07 : hover ? 1.035 : 1
    const baseY = Number(group.userData.baseY ?? 0)
    const targetY = baseY + (active ? 0.1 : hover ? 0.055 : 0)
    group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.075)
    group.position.y += (targetY - group.position.y) * 0.08
  })

  if (isCameraTransitioning && camera && controls) {
    camera.position.lerp(cameraTarget, 0.035)
    controls.target.lerp(controlsTarget, 0.055)
    if (
      camera.position.distanceTo(cameraTarget) < 0.08 &&
      controls.target.distanceTo(controlsTarget) < 0.05
    ) {
      isCameraTransitioning = false
    }
  }

  controls.update()
  if (composer && props.qualityMode === 'high') composer.render()
  else renderer.render(scene, camera)
  animationId = requestAnimationFrame(animateScene)
}

function resizeRenderer() {
  if (!sceneHost.value || !renderer || !camera) return
  const width = sceneHost.value.clientWidth || 960
  const height = sceneHost.value.clientHeight || 640
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  composer?.setSize(width, height)
  bloomPass?.resolution.set(width, height)
}

function destroyThreeScene() {
  cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  if (renderer) {
    const canvas = renderer.domElement
    canvas.removeEventListener('click', handleCanvasClick)
    canvas.removeEventListener('dblclick', handleCanvasDoubleClick)
    canvas.removeEventListener('pointermove', handlePointerMove)
    canvas.removeEventListener('pointerleave', handlePointerLeave)
  }
  controls?.dispose()
  composer?.dispose()
  renderer?.dispose()
  scene?.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (mesh.geometry) mesh.geometry.dispose()
    const material = mesh.material
    if (Array.isArray(material)) material.forEach((item) => item.dispose())
    else material?.dispose?.()
  })
  sceneHost.value?.replaceChildren()
}

function roundedBoxGeometry(width: number, height: number, depth: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2)
  const x = -width / 2
  const y = -height / 2
  const shape = new THREE.Shape()

  shape.moveTo(x + r, y)
  shape.lineTo(x + width - r, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + r)
  shape.lineTo(x + width, y + height - r)
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  shape.lineTo(x + r, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 8
  })
  geometry.center()
  return geometry
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3)
}

function createTextSprite(
  text: string,
  color: string,
  background: string,
  fontSize = 96,
  width = 512,
  height = 180
) {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = width
  canvas.height = height
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = background
  roundRect(context, 24, 24, width - 48, height - 56, Math.min(32, (height - 56) / 3))
  context.fill()
  context.strokeStyle = 'rgba(144, 220, 255, 0.24)'
  context.lineWidth = 2
  context.stroke()

  let finalFontSize = fontSize
  context.font = `700 ${finalFontSize}px Microsoft YaHei, PingFang SC, Arial`
  while (context.measureText(text).width > width - 92 && finalFontSize > 28) {
    finalFontSize -= 3
    context.font = `700 ${finalFontSize}px Microsoft YaHei, PingFang SC, Arial`
  }
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillStyle = color
  context.shadowColor = 'rgba(90, 217, 255, 0.28)'
  context.shadowBlur = 12
  context.fillText(text, width / 2, height / 2 - 6)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    toneMapped: false
  })
  return new THREE.Sprite(material)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function getPixelRatio() {
  return props.qualityMode === 'high'
    ? Math.min(window.devicePixelRatio || 1, 2)
    : Math.min(window.devicePixelRatio || 1, 1.35)
}

function getBloomStrength() {
  return props.qualityMode === 'high' ? 0.22 : 0.1
}

function applyTourSettings() {
  if (!controls) return
  controls.autoRotate = props.isTouring
  controls.autoRotateSpeed = props.isTouring ? 0.36 : 0
}

function applyQualitySettings() {
  renderer?.setPixelRatio(getPixelRatio())
  if (bloomPass) {
    bloomPass.strength = getBloomStrength()
    bloomPass.threshold = props.qualityMode === 'high' ? 0.34 : 0.42
    bloomPass.radius = props.qualityMode === 'high' ? 0.28 : 0.2
  }
}

function captureScene() {
  if (!renderer) return
  renderer.render(scene!, camera!)
  const link = document.createElement('a')
  link.href = renderer.domElement.toDataURL('image/png')
  link.download = `AI创业就业助手数字展厅-${Date.now()}.png`
  link.click()
}

defineExpose({
  focusHall,
  resetCamera,
  captureScene
})
</script>

<style scoped lang="scss">
.scene-shell,
.three-host {
  position: absolute;
  inset: 0;
}

.scene-shell {
  overflow: hidden;
  background: radial-gradient(circle at 50% 20%, rgba(92, 190, 245, 0.14), transparent 34%),
    radial-gradient(circle at 18% 82%, rgba(79, 140, 255, 0.1), transparent 30%),
    linear-gradient(180deg, #0a1a2d 0%, #081523 100%);
}

.three-host {
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  pointer-events: none;
}

.current-hall-card {
  min-width: 238px;
  padding: 12px 16px;
  background: rgba(9, 22, 38, 0.56);
  border: 1px solid rgba(148, 206, 255, 0.16);
  border-radius: 18px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
}

.scene-label {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: rgba(231, 243, 255, 0.54);
}

.current-hall-card strong {
  display: block;
  font-size: 25px;
  color: #f7fbff;
  letter-spacing: 0.04em;
}

.current-hall-card em {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  font-style: normal;
  color: rgba(131, 220, 255, 0.72);
}

.scene-tip {
  max-width: 520px;
  padding: 9px 13px;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.66);
  background: rgba(9, 22, 38, 0.48);
  border: 1px solid rgba(148, 206, 255, 0.12);
  border-radius: 999px;
  backdrop-filter: blur(14px);
}

.scene-value-bar {
  position: absolute;
  bottom: 104px;
  left: 18px;
  z-index: 2;
  display: flex;
  gap: 10px;
  max-width: min(54vw, 620px);
  pointer-events: none;
}

.value-chip {
  min-width: 104px;
  padding: 10px 12px;
  background: rgba(8, 22, 39, 0.56);
  border: 1px solid rgba(127, 214, 255, 0.14);
  border-radius: 16px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(14px);
}

.value-chip span,
.value-chip em {
  display: block;
  font-size: 11px;
  font-style: normal;
  color: rgba(230, 241, 255, 0.52);
}

.value-chip strong {
  display: block;
  margin: 4px 0;
  font-size: 18px;
  color: #ffffff;
}

.judge-ribbon {
  position: absolute;
  top: 154px;
  left: 18px;
  z-index: 2;
  display: flex;
  gap: 10px;
  align-items: center;
  max-width: 620px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(255, 187, 104, 0.15), rgba(56, 152, 228, 0.09));
  border: 1px solid rgba(255, 205, 125, 0.24);
  border-radius: 999px;
  backdrop-filter: blur(14px);
}

.judge-ribbon span {
  padding: 4px 8px;
  font-size: 12px;
  color: #ffd39c;
  background: rgba(255, 185, 88, 0.1);
  border-radius: 999px;
}

.judge-ribbon strong {
  overflow: hidden;
  font-size: 12px;
  color: rgba(255, 244, 224, 0.86);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hall-tooltip {
  position: absolute;
  z-index: 5;
  width: 330px;
  padding: 14px;
  pointer-events: none;
  background: rgba(7, 17, 31, 0.9);
  border: 1px solid rgba(133, 216, 255, 0.26);
  border-radius: 18px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.34), 0 0 26px rgba(54, 177, 255, 0.12);
  backdrop-filter: blur(18px);
}

.tooltip-head {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-bottom: 8px;
}

.tooltip-head span {
  padding: 4px 7px;
  font-size: 11px;
  color: #88e7ff;
  background: rgba(79, 140, 255, 0.13);
  border-radius: 999px;
}

.tooltip-head strong {
  font-size: 16px;
  color: #ffffff;
}

.hall-tooltip p {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.65;
  color: rgba(230, 241, 255, 0.72);
}

.tooltip-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.tooltip-grid div {
  padding: 8px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
}

.tooltip-grid em,
.tooltip-features span {
  display: block;
  font-size: 11px;
  font-style: normal;
  color: rgba(230, 241, 255, 0.5);
}

.tooltip-grid span {
  display: block;
  margin-top: 4px;
  overflow: hidden;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.82);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tooltip-features {
  display: grid;
  gap: 6px;
}

.tooltip-features span {
  color: rgba(230, 241, 255, 0.68);
}

.hall-tooltip button {
  width: 100%;
  height: 32px;
  margin-top: 12px;
  font-size: 12px;
  color: #eafaff;
  background: rgba(39, 86, 130, 0.66);
  border: 1px solid rgba(126, 218, 255, 0.26);
  border-radius: 999px;
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

.dock-item {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 4px 9px;
  align-items: center;
  min-width: 0;
  padding: 11px 12px;
  font-family: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  background: rgba(11, 26, 44, 0.68);
  border: 1px solid rgba(142, 199, 255, 0.14);
  border-radius: 16px;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
  transition: all 0.2s ease;
}

.dock-item i {
  display: grid;
  grid-row: span 2;
  width: 32px;
  height: 32px;
  font-style: normal;
  color: #eefbff;
  place-items: center;
  background: rgba(79, 140, 255, 0.13);
  border: 1px solid rgba(130, 221, 255, 0.18);
  border-radius: 12px;
}

.dock-item span {
  font-size: 12px;
  color: #86ddff;
}

.dock-item strong {
  overflow: hidden;
  font-size: 14px;
  color: #f3f8ff;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dock-item.active,
.dock-item:hover {
  background: rgba(38, 86, 137, 0.78);
  border-color: rgba(132, 220, 255, 0.46);
  box-shadow: 0 14px 30px rgba(41, 164, 255, 0.16);
  transform: translateY(-2px);
}

@media (max-width: 1280px) {
  .module-dock {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 980px) {
  .scene-value-bar {
    right: 18px;
    bottom: 120px;
    flex-wrap: wrap;
    max-width: none;
  }

  .judge-ribbon {
    top: 194px;
    right: 18px;
  }
}
</style>

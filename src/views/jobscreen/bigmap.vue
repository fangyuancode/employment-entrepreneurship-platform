<template>
  <div class="job-bigmap-page" v-loading="loading" element-loading-text="岗位地图数据加载中..." element-loading-background="rgba(3, 12, 30, 0.72)">
    <div class="screen-bg screen-bg--left"></div>
    <div class="screen-bg screen-bg--right"></div>

    <header class="bigmap-header">
      <div class="header-left">
        <button class="back-btn" type="button" @click="closeOrBack">返回</button>
        <div>
          <div class="header-title">{{ currentMode === 'national' ? '全国岗位分布总览' : `${currentProvince} 岗位城市分布` }}</div>
          <div class="header-subtitle">
            {{ currentMode === 'national' ? 'National Job Distribution Big Map' : 'Province Job Distribution Big Map' }}
          </div>
        </div>
      </div>

      <div class="header-center">
        <div class="system-title">就业岗位分布详细地图</div>
        <div class="system-line"></div>
      </div>

      <div class="header-right">
        <div class="time-box">
          <span>{{ currentDate }}</span>
          <strong>{{ currentTime }}</strong>
        </div>
        <el-select v-model="queryForm.province" class="province-select" filterable clearable placeholder="全国 / 选择省份" @change="handleProvinceSelect">
          <el-option label="全国" value="" />
          <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
        </el-select>
        <el-button class="screen-btn" size="small" @click="backToNational">全国</el-button>
        <el-button class="screen-btn" size="small" :loading="loading" @click="refreshCurrentScreen">刷新</el-button>
        <el-button class="screen-btn" size="small" @click="toggleFullScreen">全屏</el-button>
      </div>
    </header>

    <main class="bigmap-body">
      <section class="bigmap-card">
        <div class="map-topbar">
          <div>
            <span>{{ modeLabel }}</span>
            <p>{{ currentMode === 'national' ? '点击省份进入省级岗位分布，支持滚轮缩放与拖拽移动' : '当前展示省内城市岗位分布，支持滚轮缩放与拖拽移动' }}</p>
          </div>

          <div class="map-kpis">
            <div>
              <strong>{{ formatLargeNumber(summary.jobCount) }}</strong>
              <span>岗位总量</span>
            </div>
            <div>
              <strong>{{ formatLargeNumber(summary.cityCount) }}</strong>
              <span>覆盖城市</span>
            </div>
            <div>
              <strong>{{ Number(summary.avgSalaryK || 0).toFixed(1) }}K</strong>
              <span>平均薪资</span>
            </div>
            <div>
              <strong>{{ topRegionName }}</strong>
              <span>热度最高</span>
            </div>
          </div>
        </div>

        <div ref="mapRef" class="big-map-box"></div>

        <div class="map-footer">
          鼠标滚轮缩放地图，按住地图拖拽移动；悬停可查看岗位数、平均薪资、热门岗位类别与热门技能。
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getJobScreenNational,
  getJobScreenOptions,
  getJobScreenProvince,
  type NationalScreenData,
  type ProvinceScreenData
} from '@/api/job-screen'
import { registerChinaMap, registerProvinceMap } from '@/utils/echarts-map'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const mapRef = ref<HTMLDivElement | null>(null)
const currentMode = ref<'national' | 'province'>('national')
const currentProvince = ref('')
const provinceOptions = ref<string[]>([])
const nationalData = ref<NationalScreenData | null>(null)
const provinceData = ref<ProvinceScreenData | null>(null)

let mapChart: echarts.ECharts | null = null
let clockTimer: number | null = null

const MAP_SIDE_LAYER_COUNT = 7
const MAP_ZOOM_MIN = 0.82
const MAP_ZOOM_MAX = 3.5

const mapZoom = ref(1)
const mapPanOffset = reactive({ x: 0, y: 0 })
let renderedMapNameForZoom = ''
let mapBaseLayoutCenter: [string, string] = ['50%', '52%']
let syncingMapRoam = false

const queryForm = reactive({
  keyword: getQueryText(route.query.keyword),
  categoryMain: getQueryText(route.query.categoryMain),
  degree: getQueryText(route.query.degree),
  experience: getQueryText(route.query.experience),
  province: getQueryText(route.query.province)
})

const provinceNameMap: Record<string, boolean> = {
  北京: true,
  天津: true,
  上海: true,
  重庆: true,
  河北: true,
  山西: true,
  辽宁: true,
  吉林: true,
  黑龙江: true,
  江苏: true,
  浙江: true,
  安徽: true,
  福建: true,
  江西: true,
  山东: true,
  河南: true,
  湖北: true,
  湖南: true,
  广东: true,
  海南: true,
  四川: true,
  贵州: true,
  云南: true,
  陕西: true,
  甘肃: true,
  青海: true,
  台湾: true,
  内蒙古: true,
  广西: true,
  西藏: true,
  宁夏: true,
  新疆: true,
  香港: true,
  澳门: true
}

const provinceCenterMap: Record<string, [number, number]> = {
  北京: [116.4074, 39.9042],
  天津: [117.2009, 39.0842],
  上海: [121.4737, 31.2304],
  重庆: [106.5516, 29.563],
  河北: [114.5025, 38.0455],
  山西: [112.5492, 37.857],
  辽宁: [123.4315, 41.8057],
  吉林: [125.3245, 43.8868],
  黑龙江: [126.6425, 45.7567],
  江苏: [118.7969, 32.0603],
  浙江: [120.1551, 30.2741],
  安徽: [117.283, 31.8612],
  福建: [119.2965, 26.0745],
  江西: [115.8582, 28.6829],
  山东: [117.1201, 36.6512],
  河南: [113.6254, 34.7466],
  湖北: [114.3054, 30.5931],
  湖南: [112.9388, 28.2282],
  广东: [113.2644, 23.1291],
  海南: [110.3312, 20.0311],
  四川: [104.0668, 30.5728],
  贵州: [106.6302, 26.647],
  云南: [102.8329, 24.8801],
  陕西: [108.9398, 34.3416],
  甘肃: [103.8343, 36.0611],
  青海: [101.7782, 36.6171],
  台湾: [121.5654, 25.033],
  内蒙古: [111.7519, 40.8415],
  广西: [108.3665, 22.817],
  西藏: [91.1172, 29.6469],
  宁夏: [106.2309, 38.4872],
  新疆: [87.6168, 43.8256],
  香港: [114.1694, 22.3193],
  澳门: [113.5439, 22.1987]
}

const summary = computed(() => {
  if (currentMode.value === 'national') {
    return (
      nationalData.value?.summary || {
        jobCount: 0,
        cityCount: 0,
        avgSalaryK: 0,
        skillWordCount: 0
      }
    )
  }

  return (
    provinceData.value?.summary || {
      province: currentProvince.value,
      jobCount: 0,
      cityCount: 0,
      avgSalaryK: 0,
      skillWordCount: 0
    }
  )
})

const modeLabel = computed(() => {
  return currentMode.value === 'national'
    ? '全国岗位分布总览'
    : `${currentProvince.value || '-'} 岗位城市分布`
})

const topRegionName = computed(() => {
  const rawMapData =
    currentMode.value === 'national'
      ? nationalData.value?.mapData || []
      : provinceData.value?.mapData || []
  const top = [...rawMapData].sort(
    (a: any, b: any) => Number(b.value || 0) - Number(a.value || 0)
  )[0]
  return top?.name || '-'
})

const currentDate = ref('')
const currentTime = ref('')

function getQueryText(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '')
  return String(value || '')
}

function formatLargeNumber(value: number | string | undefined) {
  const num = Number(value || 0)
  if (!Number.isFinite(num)) return '0'
  if (num >= 10000) return `${(num / 10000).toFixed(num >= 100000 ? 1 : 2).replace(/\.0$/, '')}万`
  return num.toLocaleString('zh-CN')
}

function updateClock() {
  const now = new Date()
  const weekList = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  currentDate.value = `${year}-${month}-${day} ${weekList[now.getDay()]}`
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
}

async function toggleFullScreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (error) {
    console.error(error)
    ElMessage.warning('当前浏览器暂不支持全屏切换')
  }
}

function closeOrBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }
  window.close()
}

function updateRouteQuery() {
  const nextQuery: Record<string, string> = {
    mode: currentMode.value
  }

  if (currentMode.value === 'province' && currentProvince.value) {
    nextQuery.province = currentProvince.value
  }

  const queryKeys: Array<keyof typeof queryForm> = [
    'keyword',
    'categoryMain',
    'degree',
    'experience'
  ]
  queryKeys.forEach((key) => {
    const value = String(queryForm[key] || '').trim()
    if (value) nextQuery[key] = value
  })

  router.replace({ path: '/jobscreen/bigmap', query: nextQuery }).catch(() => {})
}

async function loadOptions() {
  try {
    const res = await getJobScreenOptions({
      keyword: queryForm.keyword,
      categoryMain: queryForm.categoryMain,
      degree: queryForm.degree,
      experience: queryForm.experience
    })
    provinceOptions.value = res?.provinces || []
  } catch (error) {
    provinceOptions.value = []
  }
}

async function refreshCurrentScreen() {
  if (currentMode.value === 'province' && currentProvince.value) {
    await loadProvince(currentProvince.value)
  } else {
    await loadNational()
  }
}

async function loadNational() {
  try {
    loading.value = true
    currentMode.value = 'national'
    currentProvince.value = ''
    queryForm.province = ''

    await registerChinaMap()

    const res = await getJobScreenNational({
      keyword: queryForm.keyword,
      categoryMain: queryForm.categoryMain,
      degree: queryForm.degree,
      experience: queryForm.experience
    })

    nationalData.value = res
    provinceData.value = null

    await nextTick()
    updateRouteQuery()
    renderMap()
  } catch (error) {
    console.error(error)
    ElMessage.error('全国岗位地图加载失败')
  } finally {
    loading.value = false
  }
}

async function loadProvince(provinceName?: string) {
  const targetProvince = provinceName || queryForm.province
  if (!targetProvince) {
    await loadNational()
    return
  }

  try {
    loading.value = true
    currentMode.value = 'province'
    currentProvince.value = targetProvince
    queryForm.province = targetProvince

    await registerProvinceMap(targetProvince)

    const res = await getJobScreenProvince({
      keyword: queryForm.keyword,
      categoryMain: queryForm.categoryMain,
      degree: queryForm.degree,
      experience: queryForm.experience,
      province: targetProvince
    })

    provinceData.value = res

    await nextTick()
    updateRouteQuery()
    renderMap()
  } catch (error) {
    console.error(error)
    ElMessage.error('省级岗位地图加载失败')
  } finally {
    loading.value = false
  }
}

async function handleProvinceSelect(value: string) {
  if (!value) {
    await loadNational()
    return
  }
  await loadProvince(value)
}

function backToNational() {
  loadNational()
}

function initChart(dom: HTMLDivElement | null, oldChart: echarts.ECharts | null) {
  if (!dom) return null
  if (oldChart) oldChart.dispose()
  return echarts.init(dom)
}

function clampMapZoom(value: number) {
  return Math.min(MAP_ZOOM_MAX, Math.max(MAP_ZOOM_MIN, Number(value.toFixed(2))))
}

function toPercentNumber(value: string) {
  const num = Number(String(value || '').replace('%', ''))
  return Number.isFinite(num) ? num : 50
}

function getPanLayoutCenter(baseCenter: [string, string], yOffsetPercent = 0): [string, string] {
  const width = mapRef.value?.clientWidth || 1
  const height = mapRef.value?.clientHeight || 1
  const x = toPercentNumber(baseCenter[0]) + (mapPanOffset.x / width) * 100
  const y = toPercentNumber(baseCenter[1]) + (mapPanOffset.y / height) * 100 + yOffsetPercent

  return [`${Number(x.toFixed(4))}%`, `${Number(y.toFixed(4))}%`]
}

function buildSideLayerRoamOptions(zoom = mapZoom.value) {
  return Array.from({ length: MAP_SIDE_LAYER_COUNT }).map((_, index) => ({
    id: `map-side-layer-${index}`,
    zoom,
    layoutCenter: getPanLayoutCenter(mapBaseLayoutCenter, 0.42 * (index + 1))
  }))
}

function syncSideLayerRoam() {
  if (!mapChart) return
  syncingMapRoam = true
  mapChart.setOption(
    {
      series: buildSideLayerRoamOptions()
    },
    false
  )

  window.setTimeout(() => {
    syncingMapRoam = false
  }, 0)
}

function normalizeRegionName(name: string) {
  if (!name) return ''
  return String(name)
    .trim()
    .replace('北京市', '北京')
    .replace('天津市', '天津')
    .replace('上海市', '上海')
    .replace('重庆市', '重庆')
}

function stripRegionSuffix(name: string) {
  return normalizeRegionName(name)
    .replace(/特别行政区$/, '')
    .replace(/壮族自治区$/, '')
    .replace(/回族自治区$/, '')
    .replace(/维吾尔自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '')
    .replace(/地区$/, '')
    .replace(/盟$/, '')
    .trim()
}

function getMapFeatureNames(mapName: string): string[] {
  const mapInfo = (echarts as any).getMap?.(mapName)
  const geoJson = mapInfo?.geoJson || mapInfo?.geoJSON
  const features = geoJson?.features || []
  return features.map((item: any) => String(item?.properties?.name || '').trim()).filter(Boolean)
}

function matchMapFeatureName(name: string, mapName: string) {
  const currentName = normalizeRegionName(name)
  const featureNames = getMapFeatureNames(mapName)

  if (!currentName || !featureNames.length) return currentName
  if (featureNames.includes(currentName)) return currentName

  const currentKey = stripRegionSuffix(currentName)
  const matchedName = featureNames.find(
    (featureName) => stripRegionSuffix(featureName) === currentKey
  )

  return matchedName || currentName
}

function getProvinceShortName(name: string) {
  const targetKey = stripRegionSuffix(name)
  return (
    Object.keys(provinceNameMap).find((province) => stripRegionSuffix(province) === targetKey) ||
    normalizeRegionName(name)
  )
}

function getRegionCoord(item: any, isNational: boolean): [number, number] | null {
  const lng = Number(item?.longitude)
  const lat = Number(item?.latitude)
  if (!isNational && Number.isFinite(lng) && Number.isFinite(lat) && lng && lat) {
    return [lng, lat]
  }

  const shortName = getProvinceShortName(item?.name || '')
  return provinceCenterMap[shortName] || null
}

function getTopMapItems(mapData: any[], isNational: boolean, maxCount = 8) {
  return [...(mapData || [])]
    .filter((item) => Number(item?.value || 0) > 0 && getRegionCoord(item, isNational))
    .sort((a, b) => Number(b.value || 0) - Number(a.value || 0))
    .slice(0, maxCount)
}

function buildMapHotSpotData(mapData: any[], isNational: boolean) {
  return getTopMapItems(mapData, isNational, isNational ? 9 : 12).map((item) => {
    const coord = getRegionCoord(item, isNational) as [number, number]
    return {
      name: item.name,
      value: [coord[0], coord[1], Number(item.value || 0)],
      raw: item,
      avgSalary: item.avgSalary,
      hotCategory: item.hotCategory,
      hotSkill: item.hotSkill
    }
  })
}

function buildMapLineData(hotSpotData: any[]) {
  if (!hotSpotData.length) return []

  const hub = hotSpotData[0]
  const hubCoord = [hub.value[0], hub.value[1]]

  return hotSpotData.slice(1, 8).map((item, index) => ({
    name: `${hub.name}-${item.name}`,
    coords: [hubCoord, [item.value[0], item.value[1]]],
    value: item.value[2],
    lineStyle: {
      width: index < 3 ? 1.35 : 0.9,
      opacity: index < 3 ? 0.72 : 0.48,
      curveness: index % 2 === 0 ? 0.24 : -0.2
    }
  }))
}

function buildMapPillarData(hotSpotData: any[]) {
  return hotSpotData.slice(0, 8).map((item: any) => ({
    name: item.name,
    value: [item.value[0], item.value[1], item.value[2], item.name],
    raw: item.raw || item
  }))
}

function formatMapTooltip(params: any) {
  const data = params?.data || {}
  const source = data.raw || data
  const valueText = Array.isArray(data.value) ? data.value[2] ?? 0 : data.value ?? 0
  return `
    <div style="min-width:150px;line-height:1.8;padding:4px 2px;">
      <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#ffffff;">${
        params.name || source.name || '-'
      }</div>
      <div>岗位数：<span style="color:#5de7ff;font-weight:700;">${valueText}</span></div>
      <div>平均薪资：<span style="color:#ffd36c;font-weight:700;">${
        source.avgSalary ?? 0
      } K</span></div>
      <div>热门类别：${source.hotCategory || '-'}</div>
      <div>热门技能：${source.hotSkill || '-'}</div>
    </div>
  `
}

function renderMap() {
  mapChart = initChart(mapRef.value, mapChart)
  if (!mapChart) return

  const isNational = currentMode.value === 'national'
  const mapName = isNational ? 'china' : currentProvince.value
  const rawMapData = isNational
    ? nationalData.value?.mapData || []
    : provinceData.value?.mapData || []

  const mapData = rawMapData.map((item: any) => ({
    ...item,
    name: matchMapFeatureName(item.name, mapName),
    value: Number(item.value || 0)
  }))

  const maxValue = Math.max(...mapData.map((item: any) => Number(item.value || 0)), 10)
  const hotSpotData = buildMapHotSpotData(mapData, isNational)
  const lineData = buildMapLineData(hotSpotData)
  const pillarData = buildMapPillarData(hotSpotData)
  const layoutSize = isNational ? '114%' : '108%'
  const layoutCenter: [string, string] = isNational ? ['50%', '53%'] : ['50%', '52%']
  const aspectScale = isNational ? 0.88 : 0.95
  mapBaseLayoutCenter = layoutCenter

  if (renderedMapNameForZoom !== mapName) {
    mapZoom.value = 1
    mapPanOffset.x = 0
    mapPanOffset.y = 0
    renderedMapNameForZoom = mapName
  }

  const sideMapLayers = Array.from({ length: MAP_SIDE_LAYER_COUNT }).map((_, index) => ({
    id: `map-side-layer-${index}`,
    name: `地图侧壁-${index}`,
    type: 'map',
    map: mapName,
    silent: true,
    zlevel: 0,
    z: index,
    layoutCenter: getPanLayoutCenter(layoutCenter, 0.42 * (index + 1)),
    layoutSize,
    aspectScale,
    zoom: mapZoom.value,
    scaleLimit: {
      min: MAP_ZOOM_MIN,
      max: MAP_ZOOM_MAX
    },
    label: { show: false },
    itemStyle: {
      areaColor: `rgba(4, ${36 + index * 4}, ${88 + index * 6}, ${0.42 - index * 0.025})`,
      borderColor: `rgba(37, 154, 255, ${0.34 - index * 0.025})`,
      borderWidth: 0.8,
      shadowBlur: 0
    },
    emphasis: {
      disabled: true,
      label: { show: false }
    },
    data: []
  }))

  mapChart.setOption(
    {
      backgroundColor: 'transparent',
      animation: true,
      animationDurationUpdate: 800,
      tooltip: {
        trigger: 'item',
        confine: true,
        appendToBody: true,
        backgroundColor: 'rgba(3, 13, 32, 0.94)',
        borderColor: 'rgba(79, 214, 255, 0.58)',
        borderWidth: 1,
        padding: [10, 12],
        textStyle: {
          color: '#dff6ff',
          fontSize: 12
        },
        extraCssText: 'box-shadow:0 0 18px rgba(50,190,255,.28);border-radius:8px;',
        formatter: formatMapTooltip
      },
      visualMap: {
        show: false,
        min: 0,
        max: maxValue,
        seriesIndex: MAP_SIDE_LAYER_COUNT,
        inRange: {
          color: ['#0b2d61', '#1555c8', '#1fa4ff', '#48f0ff']
        }
      },
      geo: {
        map: mapName,
        silent: false,
        roam: true,
        zoom: mapZoom.value,
        scaleLimit: {
          min: MAP_ZOOM_MIN,
          max: MAP_ZOOM_MAX
        },
        layoutCenter,
        layoutSize,
        aspectScale,
        zlevel: 2,
        label: {
          show: true,
          color: 'rgba(223, 244, 255, 0.9)',
          fontSize: isNational ? 12 : 11,
          fontWeight: 600,
          textShadowColor: 'rgba(0, 20, 48, 0.95)',
          textShadowBlur: 5
        },
        itemStyle: {
          areaColor: '#0c3470',
          borderColor: '#46c6ff',
          borderWidth: 1.15,
          shadowBlur: 28,
          shadowColor: 'rgba(30, 170, 255, 0.52)',
          shadowOffsetY: 9
        },
        emphasis: {
          label: {
            show: true,
            color: '#ffffff'
          },
          itemStyle: {
            areaColor: '#2387ff',
            borderColor: '#9ff4ff',
            borderWidth: 1.5,
            shadowBlur: 34,
            shadowColor: 'rgba(70, 220, 255, 0.75)'
          }
        }
      },
      series: [
        ...sideMapLayers,
        {
          id: 'job-map-main',
          name: '岗位分布',
          type: 'map',
          map: mapName,
          geoIndex: 0,
          zlevel: 3,
          zoom: mapZoom.value,
          data: mapData,
          selectedMode: false,
          label: {
            show: true,
            color: '#dcefff',
            fontSize: isNational ? 12 : 11,
            fontWeight: 600,
            textShadowColor: 'rgba(0, 16, 40, 0.95)',
            textShadowBlur: 6
          },
          itemStyle: {
            areaColor: '#113e82',
            borderColor: 'rgba(96, 210, 255, 0.88)',
            borderWidth: 1.05,
            shadowBlur: 16,
            shadowColor: 'rgba(45, 180, 255, 0.34)'
          },
          emphasis: {
            label: {
              show: true,
              color: '#ffffff',
              fontWeight: 800
            },
            itemStyle: {
              areaColor: '#2d8cff',
              borderColor: '#d4fbff',
              borderWidth: 1.6,
              shadowBlur: 30,
              shadowColor: 'rgba(83, 231, 255, 0.72)'
            }
          }
        },
        {
          id: 'job-map-lines',
          name: '岗位联系流线',
          type: 'lines',
          coordinateSystem: 'geo',
          zlevel: 5,
          silent: true,
          blendMode: 'lighter',
          effect: {
            show: true,
            period: 4.6,
            trailLength: 0.24,
            symbol: 'circle',
            symbolSize: 4,
            color: '#ffd66b'
          },
          lineStyle: {
            color: '#39e6ff',
            width: 1,
            opacity: 0.58,
            curveness: 0.24,
            type: 'dashed'
          },
          data: lineData
        },
        {
          id: 'job-map-hotspot',
          name: '城市热力光圈',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          zlevel: 6,
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 5.6,
            period: 3.2
          },
          symbolSize: (val: any) => {
            const count = Number(val?.[2] || 0)
            return Math.max(9, Math.min(34, 9 + (count / maxValue) * 24))
          },
          itemStyle: {
            color: '#49f3ff',
            shadowBlur: 18,
            shadowColor: '#48eaff'
          },
          label: {
            show: !isNational,
            formatter: '{b}',
            position: 'right',
            color: '#e9fbff',
            fontSize: 11,
            textShadowColor: 'rgba(0, 10, 28, 0.9)',
            textShadowBlur: 5
          },
          emphasis: {
            scale: 1.15
          },
          data: hotSpotData
        },
        {
          id: 'job-map-pillars',
          name: '重点区域立体柱',
          type: 'custom',
          coordinateSystem: 'geo',
          zlevel: 7,
          data: pillarData,
          renderItem: (params: any, api: any) => {
            const lng = api.value(0)
            const lat = api.value(1)
            const value = Number(api.value(2) || 0)
            const name = String(api.value(3) || '')
            const coord = api.coord([lng, lat])
            const height = Math.max(
              38,
              Math.min(isNational ? 165 : 138, 36 + (value / maxValue) * 148)
            )
            const width = isNational ? 14 : 12
            const x = coord[0]
            const y = coord[1]

            return {
              type: 'group',
              children: [
                {
                  type: 'ellipse',
                  shape: { cx: x, cy: y + 2, rx: 29, ry: 11 },
                  style: {
                    fill: 'rgba(40, 152, 255, 0.18)',
                    stroke: 'rgba(85, 225, 255, 0.85)',
                    lineWidth: 1.2,
                    shadowBlur: 18,
                    shadowColor: 'rgba(64, 211, 255, 0.78)'
                  }
                },
                {
                  type: 'ellipse',
                  shape: { cx: x, cy: y + 2, rx: 16, ry: 6 },
                  style: {
                    fill: 'rgba(112, 223, 255, 0.28)',
                    stroke: 'rgba(180, 248, 255, 0.84)',
                    lineWidth: 1
                  }
                },
                {
                  type: 'rect',
                  shape: { x: x - width / 2, y: y - height, width, height, r: 5 },
                  style: {
                    fill: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                      { offset: 0, color: 'rgba(255, 154, 58, 0.22)' },
                      { offset: 0.45, color: 'rgba(255, 188, 91, 0.88)' },
                      { offset: 1, color: 'rgba(255, 248, 203, 0.98)' }
                    ]),
                    shadowBlur: 18,
                    shadowColor: 'rgba(255, 185, 86, 0.72)'
                  }
                },
                {
                  type: 'circle',
                  shape: { cx: x, cy: y - height, r: 6.5 },
                  style: {
                    fill: '#fff4bb',
                    shadowBlur: 18,
                    shadowColor: '#fff2a6'
                  }
                },
                {
                  type: 'text',
                  silent: true,
                  style: {
                    text: `${name}\n${formatLargeNumber(value)}`,
                    x: x + 17,
                    y: y - height - 8,
                    fill: '#ffffff',
                    font: '700 12px Microsoft YaHei',
                    lineHeight: 16,
                    textShadowBlur: 8,
                    textShadowColor: 'rgba(0, 8, 28, 0.95)'
                  }
                }
              ]
            }
          },
          tooltip: {
            formatter: formatMapTooltip
          }
        }
      ]
    },
    true
  )

  mapChart.off('click')
  mapChart.off('georoam')

  mapChart.on('georoam', (params: any) => {
    if (syncingMapRoam) return

    if (typeof params?.zoom === 'number') {
      mapZoom.value = clampMapZoom(mapZoom.value * params.zoom)
    }

    if (typeof params?.dx === 'number') {
      mapPanOffset.x += params.dx
    }

    if (typeof params?.dy === 'number') {
      mapPanOffset.y += params.dy
    }

    syncSideLayerRoam()
  })

  if (isNational) {
    mapChart.on('click', (params: any) => {
      const provinceName = getProvinceShortName(params?.name || '')
      if (provinceName && provinceNameMap[provinceName]) {
        loadProvince(provinceName)
      }
    })
  }
}

function handleResize() {
  mapChart?.resize()
}

async function initPage() {
  updateClock()
  clockTimer = window.setInterval(updateClock, 1000)
  await registerChinaMap()
  await loadOptions()

  const mode = getQueryText(route.query.mode)
  const province = queryForm.province

  if (mode === 'province' && province) {
    await loadProvince(province)
  } else {
    await loadNational()
  }

  window.addEventListener('resize', handleResize)
}

onMounted(() => {
  initPage().catch((error) => {
    console.error(error)
    ElMessage.error('岗位地图初始化失败')
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (clockTimer) window.clearInterval(clockTimer)
  mapChart?.dispose()
})
</script>

<style scoped lang="scss">
.job-bigmap-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #e7f6ff;
  background: radial-gradient(circle at 50% 30%, rgba(20, 88, 178, 0.32), transparent 44%),
    linear-gradient(180deg, #06152d 0%, #030a17 100%);
}

.screen-bg {
  position: absolute;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(10px);
}

.screen-bg--left {
  top: -160px;
  left: -170px;
  width: 430px;
  height: 430px;
  background: rgba(36, 130, 255, 0.18);
}

.screen-bg--right {
  right: -160px;
  bottom: -160px;
  width: 460px;
  height: 460px;
  background: rgba(35, 224, 255, 0.12);
}

.bigmap-header {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  gap: 18px;
  height: 86px;
  padding: 0 28px;
  border-bottom: 1px solid rgba(81, 178, 255, 0.18);
  background: linear-gradient(180deg, rgba(4, 18, 42, 0.96), rgba(4, 18, 42, 0.58));
  box-shadow: 0 10px 34px rgba(0, 8, 22, 0.22);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-right {
  justify-content: flex-end;
}

.header-center {
  text-align: center;
}

.system-title {
  color: #ffffff;
  font-size: 25px;
  font-weight: 900;
  letter-spacing: 4px;
  text-shadow: 0 0 18px rgba(62, 205, 255, 0.36);
}

.system-line {
  width: 260px;
  height: 2px;
  margin: 10px auto 0;
  background: linear-gradient(90deg, transparent, #44d5ff, transparent);
  box-shadow: 0 0 14px rgba(68, 213, 255, 0.62);
}

.header-title {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
}

.header-subtitle {
  margin-top: 4px;
  color: #84b8d8;
  font-size: 12px;
}

.back-btn,
.screen-btn {
  border: 1px solid rgba(77, 174, 255, 0.34);
  color: #dcefff;
  background: rgba(11, 39, 80, 0.64);
  box-shadow: inset 0 0 16px rgba(73, 173, 255, 0.08);
}

.back-btn {
  height: 32px;
  padding: 0 16px;
  border-radius: 6px;
  cursor: pointer;
}

.back-btn:hover,
.screen-btn:hover {
  border-color: rgba(113, 228, 255, 0.72);
  color: #ffffff;
  background: rgba(24, 93, 172, 0.64);
}

.time-box {
  display: grid;
  gap: 2px;
  min-width: 142px;
  text-align: right;

  span {
    color: #7faacb;
    font-size: 11px;
  }

  strong {
    color: #ffffff;
    font-size: 15px;
    letter-spacing: 1px;
  }
}

.province-select {
  width: 168px;
}

:deep(.province-select .el-select__wrapper) {
  min-height: 32px;
  border: 1px solid rgba(77, 174, 255, 0.24);
  border-radius: 6px;
  background: rgba(6, 25, 55, 0.68);
  box-shadow: none;
}

:deep(.province-select .el-select__placeholder),
:deep(.province-select .el-select__selected-item) {
  color: #dcefff;
}

.bigmap-body {
  position: relative;
  z-index: 2;
  height: calc(100vh - 86px);
  padding: 18px 24px 24px;
}

.bigmap-card {
  position: relative;
  height: 100%;
  overflow: hidden;
  border: 1px solid rgba(74, 184, 255, 0.24);
  border-radius: 18px;
  background: radial-gradient(ellipse at 50% 45%, rgba(16, 100, 205, 0.42), transparent 62%),
    linear-gradient(180deg, rgba(8, 27, 56, 0.98), rgba(5, 15, 33, 0.96));
  box-shadow: 0 0 42px rgba(22, 100, 214, 0.14), inset 0 0 42px rgba(64, 180, 255, 0.06);
}

.bigmap-card::after {
  position: absolute;
  inset: 66px 12px 46px;
  z-index: 0;
  pointer-events: none;
  content: '';
  opacity: 0.48;
  background-image: linear-gradient(rgba(74, 169, 255, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 169, 255, 0.09) 1px, transparent 1px),
    radial-gradient(circle at 50% 52%, rgba(80, 221, 255, 0.14), transparent 35%);
  background-size: 48px 48px, 48px 48px, 100% 100%;
  mask-image: radial-gradient(
    ellipse at center,
    #000 34%,
    rgba(0, 0, 0, 0.72) 56%,
    transparent 78%
  );
}

.map-topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 88px;
  padding: 18px 22px 12px;
  border-bottom: 1px solid rgba(83, 184, 255, 0.13);

  > div:first-child span {
    color: #ffffff;
    font-size: 18px;
    font-weight: 900;
  }

  p {
    margin: 7px 0 0;
    color: #88b9d8;
    font-size: 12px;
  }
}

.map-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(110px, 1fr));
  gap: 10px;
  min-width: 520px;

  div {
    padding: 10px 12px;
    border: 1px solid rgba(74, 184, 255, 0.18);
    border-radius: 12px;
    background: rgba(4, 14, 30, 0.58);
  }

  strong {
    display: block;
    color: #5de7ff;
    font-size: 18px;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 5px;
    color: #8fb7d3;
    font-size: 11px;
  }
}

.big-map-box {
  position: relative;
  z-index: 1;
  width: calc(100% - 28px);
  height: calc(100% - 132px);
  min-height: 560px;
  margin: 0 14px;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  border-radius: 14px;
  background: radial-gradient(ellipse at 50% 48%, rgba(44, 148, 255, 0.2), transparent 58%),
    radial-gradient(circle at 18% 24%, rgba(51, 223, 255, 0.13), transparent 26%),
    radial-gradient(circle at 80% 22%, rgba(42, 105, 255, 0.16), transparent 28%);
}

.big-map-box:active,
.big-map-box canvas:active {
  cursor: grabbing;
}

.big-map-box canvas {
  cursor: grab;
}

.big-map-box::before {
  position: absolute;
  inset: 5% 5%;
  z-index: 0;
  pointer-events: none;
  content: '';
  border-radius: 50%;
  background: repeating-radial-gradient(
      circle at center,
      rgba(70, 207, 255, 0.16) 0 1px,
      transparent 1px 42px
    ),
    radial-gradient(ellipse at center, rgba(26, 128, 255, 0.18), transparent 58%);
  filter: blur(0.2px);
  transform: perspective(760px) rotateX(64deg) scaleX(1.08);
}

.big-map-box::after {
  position: absolute;
  right: 24px;
  bottom: 22px;
  z-index: 0;
  width: 168px;
  height: 96px;
  pointer-events: none;
  content: '';
  border: 1px solid rgba(72, 214, 255, 0.34);
  border-radius: 10px;
  background: radial-gradient(circle at 36% 42%, rgba(68, 217, 255, 0.18), transparent 56%);
  box-shadow: inset 0 0 18px rgba(62, 194, 255, 0.08), 0 0 18px rgba(44, 165, 255, 0.08);
}

.map-footer {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 22px;
  color: #8fb7d3;
  font-size: 12px;
  border-top: 1px solid rgba(83, 184, 255, 0.1);
}

:deep(.el-loading-mask) {
  z-index: 20;
}

@media (max-width: 1280px) {
  .bigmap-header {
    grid-template-columns: 1fr;
    height: auto;
    padding: 14px 18px;
  }

  .header-center {
    order: -1;
  }

  .header-right {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .bigmap-body {
    height: auto;
    min-height: calc(100vh - 160px);
    padding: 14px;
  }

  .bigmap-card {
    height: auto;
  }

  .map-topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .map-kpis {
    grid-template-columns: repeat(2, 1fr);
    min-width: 0;
    width: 100%;
  }

  .big-map-box {
    height: 640px;
  }
}
</style>

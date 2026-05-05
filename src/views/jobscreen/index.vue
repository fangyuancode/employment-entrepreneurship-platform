<template>
  <div class="job-screen-page">
    <div class="screen-bg screen-bg--left"></div>
    <div class="screen-bg screen-bg--right"></div>

    <header class="screen-header">
      <div class="header-left">
        <div class="header-title">AI创业就业助手 · 岗位数据大屏</div>
        <div class="header-subtitle">Employment Data Mining & Job Visualization Overview</div>
      </div>

      <div class="header-center">
        <div class="system-title">就业岗位智能分析中心</div>
        <div class="system-line"></div>
      </div>

      <div class="header-right">
        <div class="time-box">
          <span>{{ currentDate }}</span>
          <strong>{{ currentTime }}</strong>
        </div>
        <el-button class="screen-btn" size="small" :loading="loading" @click="refreshCurrentScreen">刷新</el-button>
        <el-button class="screen-btn" size="small" @click="toggleFullScreen">全屏</el-button>
      </div>
    </header>

    <main v-loading="loading" class="screen-body" element-loading-text="岗位大屏数据加载中..." element-loading-background="rgba(3, 12, 30, 0.72)">
      <section class="filter-bar">
        <div class="filter-title">
          <strong>{{ modeLabel }}</strong>
          <span>{{ currentMode === 'national' ? '点击地图省份可进入省级下钻' : currentMode === 'province' ? '点击城市可进入区县下钻，可返回全国' : '当前展示城市区县分布，可返回省级' }}</span>
        </div>

        <el-form :inline="true" :model="queryForm" class="filter-form">
          <el-form-item label="关键词">
            <el-input v-model="queryForm.keyword" clearable placeholder="技能 / 行业 / 公司" />
          </el-form-item>
          <el-form-item label="一级分类">
            <el-input v-model="queryForm.categoryMain" clearable placeholder="如：技术" />
          </el-form-item>
          <el-form-item label="学历">
            <el-input v-model="queryForm.degree" clearable placeholder="如：本科" />
          </el-form-item>
          <el-form-item label="经验">
            <el-input v-model="queryForm.experience" clearable placeholder="如：1-3年" />
          </el-form-item>
          <el-form-item label="快速切省">
            <el-select v-model="queryForm.province" filterable clearable placeholder="选择省份" @change="handleProvinceSelect">
              <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button class="screen-btn" @click="resetQuery">重置</el-button>
            <el-button class="screen-btn screen-btn--primary" :loading="loading" @click="searchByFilter">查询</el-button>
          </el-form-item>
        </el-form>
      </section>

      <section class="kpi-grid">
        <div v-for="item in kpiCards" :key="item.label" class="stat-card">
          <div class="stat-card__icon">{{ item.icon }}</div>
          <div class="stat-card__content">
            <div class="stat-card__value">{{ item.value }}</div>
            <div class="stat-card__label">{{ item.label }}</div>
            <div class="stat-card__sub">{{ item.sub }}</div>
          </div>
        </div>
      </section>

      <section class="screen-layout">
        <aside class="left-panel">
          <div class="panel-card status-panel">
            <div class="panel-title">
              <span>岗位数据运行状态</span>
              <em>JOB STATUS</em>
            </div>

            <div class="status-list">
              <div v-for="item in jobRunCards" :key="item.title" class="status-item">
                <div class="status-item__head">
                  <div class="status-icon">{{ item.icon }}</div>
                  <div class="status-info">
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.subtitle }}</p>
                  </div>
                  <div class="status-badge">{{ item.status }}</div>
                </div>
                <div class="status-metrics">
                  <div v-for="metric in item.metrics" :key="metric.label">
                    <span>{{ metric.label }}</span>
                    <strong>{{ metric.value }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="panel-card">
            <div class="panel-title">
              <span>{{ currentMode === 'national' ? '岗位数量 TOP10 省份' : currentMode === 'province' ? '城市岗位 TOP10' : '区县岗位 TOP10' }}</span>
              <em>JOB RANK</em>
            </div>
            <div ref="leftTopRef" class="chart-box"></div>
          </div>

          <div class="panel-card">
            <div class="panel-title">
              <span>{{ currentMode === 'national' ? '岗位类别占比' : '热门职位类别' }}</span>
              <em>CATEGORY</em>
            </div>
            <div ref="leftMiddleRef" class="chart-box"></div>
          </div>
        </aside>

        <section class="center-panel">
          <div class="panel-card map-card">
            <div class="panel-title panel-title--map">
              <div>
                <span>{{ currentMode === 'national' ? '全国岗位分布总览' : currentMode === 'province' ? `${currentProvince} 岗位城市分布` : `${currentCity} 岗位区县分布` }}</span>
                <p>{{ currentMode === 'national' ? 'Map Drilldown · 点击省份进入详情' : currentMode === 'province' ? 'Province Detail · 点击城市进入区县' : 'City Detail · 区县级岗位画像' }}</p>
              </div>
              <div class="map-actions">
                <el-tag class="map-tag" effect="plain">{{ currentMode === 'national' ? '全国地图' : currentMode === 'province' ? '省级地图' : '城市地图' }}</el-tag>
                <el-button class="screen-btn map-open-btn" size="small" @click="openBigMapPage">打开大图</el-button>
                <el-button v-if="currentMode !== 'national'" class="screen-btn" size="small" @click="backToPreviousMap">{{ currentMode === 'city' ? '返回省级' : '返回全国' }}</el-button>
              </div>
            </div>

            <!-- <div class="map-summary">
              <div class="summary-core">
                <div class="summary-core__value">{{ formatLargeNumber(summary.jobCount) }}</div>
                <div class="summary-core__label">当前区域岗位总量</div>
              </div>
              <div class="summary-mini-grid">
                <div>
                  <strong>{{ formatLargeNumber(summary.cityCount) }}</strong>
                  <span>覆盖城市</span>
                </div>
                <div>
                  <strong>{{ Number(summary.avgSalaryK || 0).toFixed(1) }}K</strong>
                  <span>平均薪资</span>
                </div>
                <div>
                  <strong>{{ highSalarySummary.highSalaryRate || 0 }}%</strong>
                  <span>高薪占比</span>
                </div>
              </div>
            </div> -->

            <div ref="mapRef" class="map-box"></div>

            <div class="map-footer">
              {{
                currentMode === 'national'
                  ? '悬停查看岗位数、平均薪资、热门岗位类别、热门技能；点击省份进入详情。'
                  : currentMode === 'province'
                  ? '悬停查看城市岗位数、平均薪资、热门类别、热门技能；点击城市进入区县分布。'
                  : '悬停查看区县岗位数、平均薪资、热门类别、热门技能。'
              }}
            </div>
          </div>

          <div class="panel-card center-bottom-card">
            <div class="panel-title">
              <span>学历 / 经验分布</span>
              <em>EDUCATION & EXPERIENCE</em>
            </div>
            <div ref="leftBottomRef" class="chart-box chart-box--wide"></div>
          </div>
        </section>

        <aside class="right-panel">
          <div class="panel-card">
            <div class="panel-title">
              <span>{{ currentMode === 'national' ? '平均薪资 TOP10 地区' : currentMode === 'province' ? '城市平均薪资 TOP10' : '区县平均薪资 TOP10' }}</span>
              <em>SALARY RANK</em>
            </div>
            <div ref="rightTopRef" class="chart-box"></div>
          </div>

          <div class="panel-card">
            <div class="panel-title">
              <span>{{ currentMode === 'national' ? '技能需求 TOP20' : '技能需求 TOP15' }}</span>
              <em>SKILL DEMAND</em>
            </div>
            <div ref="rightMiddleRef" class="chart-box"></div>
          </div>

          <div class="panel-card">
            <div class="panel-title">
              <span>{{ currentMode === 'national' ? '企业画像' : '行业 / 规模 / 福利热词' }}</span>
              <em>COMPANY PROFILE</em>
            </div>
            <div ref="rightBottomRef" class="chart-box"></div>
          </div>
        </aside>
      </section>

      <section class="bottom-grid">
        <div class="panel-card insight-panel">
          <div class="panel-title">
            <span>AI 岗位洞察</span>
            <em>AI INSIGHTS</em>
          </div>
          <div class="insight-list">
            <div v-for="(item, index) in aiInsightList" :key="index" class="insight-item">
              <span class="insight-index">{{ index + 1 }}</span>
              <span class="insight-text">{{ item }}</span>
            </div>
            <div v-if="!aiInsightList.length" class="insight-empty">当前暂无可展示的智能洞察</div>
          </div>
        </div>

        <div class="panel-card high-salary-panel">
          <div class="panel-title">
            <span>高薪岗位概览</span>
            <em>HIGH SALARY</em>
          </div>
          <div class="high-salary-summary">
            <div>
              <span>高薪阈值</span>
              <strong>{{ highSalarySummary.highSalaryThreshold }}K</strong>
            </div>
            <div>
              <span>高薪岗位数</span>
              <strong>{{ formatLargeNumber(highSalarySummary.highSalaryCount) }}</strong>
            </div>
            <div>
              <span>高薪岗位占比</span>
              <strong>{{ highSalarySummary.highSalaryRate }}%</strong>
            </div>
          </div>
        </div>

        <div class="panel-card bottom-rank-panel">
          <div class="panel-title">
            <span>高薪岗位占比 TOP10 地区</span>
            <em>HIGH SALARY TOP</em>
          </div>
          <div ref="bottomLeftRef" class="bottom-chart-box"></div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getJobScreenNational,
  getJobScreenOptions,
  getJobScreenProvince,
  getJobScreenCity,
  getJobScreenInsight,
  getJobScreenHighSalary,
  type NameValueItem,
  type NationalScreenData,
  type ProvinceScreenData,
  type CityScreenData,
  type InsightData,
  type HighSalaryData
} from '@/api/job-screen'
import {
  getMapFeatureByName,
  getMapFeatures,
  registerChinaMap,
  registerCityMap,
  registerProvinceMap
} from '@/utils/echarts-map'

const loading = ref(false)
const router = useRouter()

const queryForm = reactive({
  keyword: '',
  categoryMain: '',
  degree: '',
  experience: '',
  province: ''
})

const provinceOptions = ref<string[]>([])
const currentMode = ref<'national' | 'province' | 'city'>('national')
const currentProvince = ref('')
const currentCity = ref('')
const currentCityAdcode = ref('')
const currentMapName = ref('china')

const nationalData = ref<NationalScreenData | null>(null)
const provinceData = ref<ProvinceScreenData | null>(null)
const cityData = ref<CityScreenData | null>(null)
const insightData = ref<InsightData | null>(null)
const highSalaryData = ref<HighSalaryData | null>(null)

const mapRef = ref<HTMLDivElement | null>(null)
const leftTopRef = ref<HTMLDivElement | null>(null)
const leftMiddleRef = ref<HTMLDivElement | null>(null)
const leftBottomRef = ref<HTMLDivElement | null>(null)
const rightTopRef = ref<HTMLDivElement | null>(null)
const rightMiddleRef = ref<HTMLDivElement | null>(null)
const rightBottomRef = ref<HTMLDivElement | null>(null)
const bottomLeftRef = ref<HTMLDivElement | null>(null)

let mapChart: echarts.ECharts | null = null
let leftTopChart: echarts.ECharts | null = null
let leftMiddleChart: echarts.ECharts | null = null
let leftBottomChart: echarts.ECharts | null = null
let rightTopChart: echarts.ECharts | null = null
let rightMiddleChart: echarts.ECharts | null = null
let rightBottomChart: echarts.ECharts | null = null
let bottomLeftChart: echarts.ECharts | null = null

const MAP_SIDE_LAYER_COUNT = 7
const MAP_ZOOM_MIN = 0.82
const MAP_ZOOM_MAX = 3.2

const mapZoom = ref(1)
const mapPanOffset = reactive({ x: 0, y: 0 })
let renderedMapNameForZoom = ''
let mapBaseLayoutCenter: [string, string] = ['50%', '52%']
let syncingMapRoam = false

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

/**
 * 全国地图热点坐标：用于在 2D ECharts 地图上模拟参考图中的“立体柱、光圈、飞线”效果。
 * 后端全国聚合数据通常只有省份名称，没有经纬度，因此前端补充省级中心点。
 */
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

  if (currentMode.value === 'city') {
    return (
      cityData.value?.summary || {
        province: currentProvince.value,
        city: currentCity.value,
        jobCount: 0,
        districtCount: 0,
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

const aiInsightList = computed(() => insightData.value?.insights || [])

const highSalarySummary = computed(() => {
  return (
    highSalaryData.value?.summary || {
      highSalaryThreshold: 20,
      totalCount: 0,
      highSalaryCount: 0,
      highSalaryRate: 0
    }
  )
})

const currentDate = ref('')
const currentTime = ref('')
let clockTimer: number | null = null

const modeLabel = computed(() => {
  if (currentMode.value === 'national') return '全国总览'
  if (currentMode.value === 'city') return `${currentCity.value || '-'} 城市下钻`
  return `${currentProvince.value || '-'} 省级下钻`
})

const kpiCards = computed(() => [
  {
    icon: '岗',
    label: currentMode.value === 'national' ? '全国岗位总数' : currentMode.value === 'city' ? '城市岗位总数' : '省内岗位总数',
    value: formatLargeNumber(summary.value.jobCount),
    sub: 'Job Volume'
  },
  {
    icon: '城',
    label: currentMode.value === 'city' ? '覆盖区县数' : '覆盖城市数',
    value: formatLargeNumber(summary.value.cityCount),
    sub: 'Covered Cities'
  },
  {
    icon: '薪',
    label: '平均薪资',
    value: `${Number(summary.value.avgSalaryK || 0).toFixed(1)}K`,
    sub: 'Average Salary'
  },
  {
    icon: '技',
    label: '技能词总量',
    value: formatLargeNumber(summary.value.skillWordCount),
    sub: 'Skill Keywords'
  }
])

const jobRunCards = computed(() => [
  {
    icon: '图',
    title:
      currentMode.value === 'national'
        ? '全国岗位分布地图'
        : currentMode.value === 'city'
          ? `${currentCity.value} 区县分布地图`
          : `${currentProvince.value} 城市分布地图`,
    subtitle:
      currentMode.value === 'national'
        ? 'china_job_distribution'
        : currentMode.value === 'city'
          ? 'city_district_distribution'
          : 'province_city_distribution',
    status: '正常',
    metrics: [
      { label: '地图层级', value: currentMode.value === 'national' ? '全国' : currentMode.value === 'city' ? '城市' : '省级' },
      { label: '下钻能力', value: currentMode.value === 'national' ? '省份' : currentMode.value === 'province' ? '城市' : '区县' },
      { label: '交互状态', value: '可用' }
    ]
  },
  {
    icon: '薪',
    title: '高薪岗位监测',
    subtitle: 'high_salary_monitor',
    status: '正常',
    metrics: [
      { label: '高薪阈值', value: `${highSalarySummary.value.highSalaryThreshold || 20}K` },
      { label: '高薪岗位', value: formatLargeNumber(highSalarySummary.value.highSalaryCount) },
      { label: '岗位占比', value: `${highSalarySummary.value.highSalaryRate || 0}%` }
    ]
  },
  {
    icon: '技',
    title: '岗位技能需求画像',
    subtitle: 'skill_demand_profile',
    status: '正常',
    metrics: [
      { label: '技能词量', value: formatLargeNumber(summary.value.skillWordCount) },
      { label: '岗位总量', value: formatLargeNumber(summary.value.jobCount) },
      { label: '分析维度', value: '8+' }
    ]
  }
])

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

async function refreshCurrentScreen() {
  if (currentMode.value === 'city' && currentCity.value && currentCityAdcode.value) {
    await loadCity(currentCity.value, currentCityAdcode.value)
  } else if (currentMode.value === 'province' && currentProvince.value) {
    await loadProvince(currentProvince.value)
  } else {
    await loadNational()
  }
}

async function searchByFilter() {
  await loadOptions()
  if (currentMode.value === 'city' && currentCity.value && currentCityAdcode.value) {
    await loadCity(currentCity.value, currentCityAdcode.value)
  } else if (queryForm.province) {
    await loadProvince(queryForm.province)
  } else {
    await loadNational()
  }
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

async function loadInsightAndHighSalary() {
  const params = {
    keyword: queryForm.keyword,
    categoryMain: queryForm.categoryMain,
    degree: queryForm.degree,
    experience: queryForm.experience,
    province: currentMode.value !== 'national' ? currentProvince.value : queryForm.province,
    city: currentMode.value === 'city' ? currentCity.value : undefined
  }

  const [insightRes, highSalaryRes] = await Promise.all([
    getJobScreenInsight(params),
    getJobScreenHighSalary(params)
  ])

  insightData.value = insightRes
  highSalaryData.value = highSalaryRes
}

async function loadNational() {
  try {
    loading.value = true
    currentMode.value = 'national'
    currentProvince.value = ''
    currentCity.value = ''
    currentCityAdcode.value = ''
    currentMapName.value = 'china'
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
    cityData.value = null

    await loadInsightAndHighSalary()

    await nextTick()
    renderAll()
  } catch (error) {
    console.error(error)
    ElMessage.error('全国大屏数据加载失败')
  } finally {
    loading.value = false
  }
}

async function loadProvince(provinceName?: string) {
  const targetProvince = getProvinceShortName(provinceName || queryForm.province)
  if (!targetProvince) {
    ElMessage.warning('请选择省份后再查看详情')
    return
  }

  try {
    loading.value = true
    currentMode.value = 'province'
    currentProvince.value = targetProvince
    currentCity.value = ''
    currentCityAdcode.value = ''
    currentMapName.value = targetProvince
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
    cityData.value = null

    await loadInsightAndHighSalary()

    await nextTick()
    renderAll()
  } catch (error) {
    console.error(error)
    ElMessage.error('省级详情加载失败')
  } finally {
    loading.value = false
  }
}


function parseFeatureCenter(center: any): [number, number] | null {
  if (Array.isArray(center) && center.length >= 2) {
    const lng = Number(center[0])
    const lat = Number(center[1])
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null
  }

  if (typeof center === 'string') {
    const [lngText, latText] = center.split(',')
    const lng = Number(lngText)
    const lat = Number(latText)
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null
  }

  return null
}

function buildEmptyCityScreenData(cityName: string, mapName: string): CityScreenData {
  const features = getMapFeatures(mapName)
  const mapData = features
    .map((feature: any) => {
      const properties = feature?.properties || {}
      const name = String(properties.name || '').trim()
      const center = parseFeatureCenter(properties.center || properties.centroid)
      return {
        name,
        value: 0,
        avgSalary: 0,
        hotCategory: '-',
        hotSkill: '-',
        longitude: center?.[0],
        latitude: center?.[1]
      }
    })
    .filter((item: any) => item.name)

  return {
    summary: {
      province: currentProvince.value,
      city: cityName,
      jobCount: 0,
      districtCount: mapData.length,
      cityCount: mapData.length,
      avgSalaryK: 0,
      skillWordCount: 0
    },
    province: currentProvince.value,
    city: cityName,
    mapData,
    cityJobTop10: [],
    citySalaryTop10: [],
    categoryTop10: [],
    skillTop15: [],
    degreeDistribution: [],
    experienceDistribution: [],
    industryTop10: [],
    companySizeTop10: [],
    welfareTop20: [],
    mode: 'city'
  }
}

async function loadCity(cityName: string, cityAdcode: string) {
  const targetCity = normalizeRegionName(cityName)
  const targetAdcode = String(cityAdcode || '').trim()

  if (!targetCity || !targetAdcode) {
    ElMessage.warning('当前城市地图数据不完整，暂不能继续下钻')
    return
  }

  try {
    loading.value = true
    const cityMapName = await registerCityMap(targetCity, targetAdcode)

    currentMode.value = 'city'
    currentCity.value = targetCity
    currentCityAdcode.value = targetAdcode
    currentMapName.value = cityMapName

    try {
      const res = await getJobScreenCity({
        keyword: queryForm.keyword,
        categoryMain: queryForm.categoryMain,
        degree: queryForm.degree,
        experience: queryForm.experience,
        province: currentProvince.value,
        city: targetCity
      })
      cityData.value = res
    } catch (error) {
      console.warn('城市区县岗位数据接口不可用，先展示城市区县地图。', error)
      cityData.value = buildEmptyCityScreenData(targetCity, cityMapName)
    }

    await loadInsightAndHighSalary()
    await nextTick()
    renderAll()
  } catch (error) {
    console.error(error)
    ElMessage.warning('当前城市暂未找到区县地图，不能继续下钻')
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
  queryForm.province = ''
  loadNational()
}

function backToPreviousMap() {
  if (currentMode.value === 'city' && currentProvince.value) {
    loadProvince(currentProvince.value)
    return
  }
  backToNational()
}

function resetQuery() {
  queryForm.keyword = ''
  queryForm.categoryMain = ''
  queryForm.degree = ''
  queryForm.experience = ''
  queryForm.province = ''
  loadOptions()
  loadNational()
}

function openBigMapPage() {
  const query: Record<string, string> = {
    mode: currentMode.value
  }

  if (currentMode.value !== 'national' && currentProvince.value) {
    query.province = currentProvince.value
  }

  if (currentMode.value === 'city' && currentCity.value && currentCityAdcode.value) {
    query.city = currentCity.value
    query.cityAdcode = currentCityAdcode.value
  }

  const queryKeys: Array<keyof typeof queryForm> = [
    'keyword',
    'categoryMain',
    'degree',
    'experience'
  ]
  queryKeys.forEach((key) => {
    const value = String(queryForm[key] || '').trim()
    if (value) query[key] = value
  })

  // 这里不要手动拼接 #/xxx，统一交给 vue-router 生成地址。
  // 这样无论项目使用 hash history、web history，还是部署在二级目录，都不会打开错误地址。
  const target = router.resolve({
    path: '/jobscreen/bigmap',
    query
  })

  if (!router.hasRoute('JobScreenBigMap')) {
    ElMessage.warning('岗位分布大地图路由尚未注册，请先添加 /jobscreen/bigmap 路由')
  }

  window.open(target.href, '_blank', 'noopener,noreferrer')
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

function renderAll() {
  renderMap()
  renderLeftTop()
  renderLeftMiddle()
  renderLeftBottom()
  renderRightTop()
  renderRightMiddle()
  renderRightBottom()
  renderBottomLeft()
}

function mergeOtherData(data: NameValueItem[], topN = 8): NameValueItem[] {
  if (!data || data.length <= topN) return data || []

  const sorted = [...data].sort((a, b) => b.value - a.value)
  const topList = sorted.slice(0, topN)
  const otherList = sorted.slice(topN)

  const otherValue = otherList.reduce((sum, item) => sum + Number(item.value || 0), 0)

  if (otherValue > 0) {
    topList.push({
      name: '其他',
      value: otherValue
    })
  }

  return topList
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
    .replace(/自治州$/, '')
    .replace(/地区$/, '')
    .replace(/盟$/, '')
    .replace(/州$/, '')
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
  return hotSpotData.slice(0, 7).map((item: any) => ({
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
  const isCity = currentMode.value === 'city'
  const mapName = currentMapName.value || (isNational ? 'china' : currentProvince.value)
  const rawMapData = isNational
    ? nationalData.value?.mapData || []
    : isCity
      ? cityData.value?.mapData || []
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
  const layoutSize = isNational ? '112%' : '104%'
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
          fontSize: isNational ? 11 : 10,
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
            fontSize: isNational ? 11 : 10,
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
            return Math.max(8, Math.min(28, 8 + (count / maxValue) * 20))
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
            fontSize: 10,
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
              34,
              Math.min(isNational ? 145 : 118, 32 + (value / maxValue) * 130)
            )
            const width = isNational ? 13 : 11
            const x = coord[0]
            const y = coord[1]

            return {
              type: 'group',
              children: [
                {
                  type: 'ellipse',
                  shape: { cx: x, cy: y + 2, rx: 26, ry: 10 },
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
                  shape: { cx: x, cy: y + 2, rx: 15, ry: 5.5 },
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
                    x: x + 16,
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

  mapChart.on('click', handleMapClick)
}

function getFeaturePropertiesFromClick(params: any) {
  const clickName = String(params?.name || '').trim()
  if (!clickName) return null
  const feature = getMapFeatureByName(currentMapName.value, clickName)
  return feature?.properties || null
}

async function handleMapClick(params: any) {
  const properties = getFeaturePropertiesFromClick(params)
  const name = String(properties?.name || params?.name || '').trim()
  const adcode = String(properties?.adcode || '').trim()
  const level = String(properties?.level || '').trim()

  if (!name || !adcode) return

  if (currentMode.value === 'national') {
    const provinceName = getProvinceShortName(name)
    if (provinceName && provinceNameMap[provinceName]) {
      await loadProvince(provinceName)
    }
    return
  }

  if (currentMode.value === 'province') {
    if (level && level !== 'city') {
      ElMessage.info('当前已经是区县层级，不能继续下钻')
      return
    }
    await loadCity(name, adcode)
  }
}
function renderLeftTop() {
  leftTopChart = initChart(leftTopRef.value, leftTopChart)
  if (!leftTopChart) return

  const data =
    currentMode.value === 'national'
      ? nationalData.value?.provinceTop10 || []
      : currentMode.value === 'city'
        ? cityData.value?.cityJobTop10 || []
        : provinceData.value?.cityJobTop10 || []

  leftTopChart.setOption(buildHorizontalBarOption(data, '岗位数量'))
}

function renderLeftMiddle() {
  leftMiddleChart = initChart(leftMiddleRef.value, leftMiddleChart)
  if (!leftMiddleChart) return

  const rawData =
    currentMode.value === 'national'
      ? nationalData.value?.categoryMainTop || []
      : currentMode.value === 'city'
        ? cityData.value?.categoryTop10 || []
        : provinceData.value?.categoryTop10 || []

  const data = mergeOtherData(rawData, 10).slice(0, 10).reverse()

  leftMiddleChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = params?.[0]
        if (!item) return ''
        return `${item.name}<br/>岗位数量：${item.value}`
      }
    },
    grid: {
      left: 90,
      right: 24,
      top: 20,
      bottom: 20
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: '#cfe1ff'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255,255,255,0.08)'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: data.map((item) => item.name),
      axisLabel: {
        color: '#dce9ff',
        fontSize: 12,
        formatter: (value: string) => {
          return value.length > 8 ? `${value.slice(0, 8)}...` : value
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        show: false
      }
    },
    series: [
      {
        name: '岗位类别',
        type: 'bar',
        barMaxWidth: 16,
        data: data.map((item) => item.value),
        label: {
          show: true,
          position: 'right',
          color: '#dce9ff',
          fontSize: 12
        },
        itemStyle: {
          borderRadius: [0, 8, 8, 0]
        }
      }
    ]
  })
}

function renderLeftBottom() {
  leftBottomChart = initChart(leftBottomRef.value, leftBottomChart)
  if (!leftBottomChart) return

  const degreeData =
    currentMode.value === 'national'
      ? nationalData.value?.degreeDistribution || []
      : currentMode.value === 'city'
        ? cityData.value?.degreeDistribution || []
        : provinceData.value?.degreeDistribution || []

  const expData =
    currentMode.value === 'national'
      ? nationalData.value?.experienceDistribution || []
      : currentMode.value === 'city'
        ? cityData.value?.experienceDistribution || []
        : provinceData.value?.experienceDistribution || []

  const names = Array.from(
    new Set([...degreeData.map((i) => i.name), ...expData.map((i) => i.name)])
  )
  const degreeMap = Object.fromEntries(degreeData.map((i) => [i.name, i.value]))
  const expMap = Object.fromEntries(expData.map((i) => [i.name, i.value]))

  leftBottomChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: {
      top: 0,
      textStyle: { color: '#dce9ff' }
    },
    grid: {
      left: 40,
      right: 20,
      top: 36,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: names,
      axisLabel: { color: '#cfe1ff', rotate: 20 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#cfe1ff' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    series: [
      {
        name: '学历',
        type: 'bar',
        barMaxWidth: 18,
        data: names.map((name) => degreeMap[name] || 0)
      },
      {
        name: '经验',
        type: 'bar',
        barMaxWidth: 18,
        data: names.map((name) => expMap[name] || 0)
      }
    ]
  })
}

function renderRightTop() {
  rightTopChart = initChart(rightTopRef.value, rightTopChart)
  if (!rightTopChart) return

  const data =
    currentMode.value === 'national'
      ? nationalData.value?.avgSalaryProvinceTop10 || []
      : currentMode.value === 'city'
        ? cityData.value?.citySalaryTop10 || []
        : provinceData.value?.citySalaryTop10 || []

  rightTopChart.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: {
      left: 45,
      right: 16,
      top: 20,
      bottom: 56
    },
    xAxis: {
      type: 'category',
      data: data.map((i) => i.name),
      axisLabel: { color: '#cfe1ff', rotate: 28 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#cfe1ff' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
    },
    series: [
      {
        type: 'bar',
        barMaxWidth: 26,
        data: data.map((i) => i.value)
      }
    ]
  })
}

function renderRightMiddle() {
  rightMiddleChart = initChart(rightMiddleRef.value, rightMiddleChart)
  if (!rightMiddleChart) return

  const rawData =
    currentMode.value === 'national'
      ? nationalData.value?.skillTop20 || []
      : currentMode.value === 'city'
        ? cityData.value?.skillTop15 || []
        : provinceData.value?.skillTop15 || []

  const data = rawData.filter((item: any) => {
    const name = String(item.name || '').trim()
    if (!name) return false
    if (name === '[' || name === ']' || name === '[]') return false
    if (name.toLowerCase() === 'null' || name.toLowerCase() === 'none') return false
    return true
  })

  rightMiddleChart.setOption(buildHorizontalBarOption(data, '技能需求'))
}

function renderRightBottom() {
  rightBottomChart = initChart(rightBottomRef.value, rightBottomChart)
  if (!rightBottomChart) return

  if (currentMode.value === 'national') {
    const industry = nationalData.value?.enterpriseProfile?.industryTop10 || []
    const size = nationalData.value?.enterpriseProfile?.companySizeTop10 || []
    const finance = nationalData.value?.enterpriseProfile?.financingTop10 || []

    rightBottomChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        textStyle: { color: '#dce9ff' }
      },
      grid: {
        left: 36,
        right: 20,
        top: 38,
        bottom: 45
      },
      xAxis: {
        type: 'category',
        data: industry.slice(0, 6).map((i) => i.name),
        axisLabel: { color: '#cfe1ff', rotate: 20 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#cfe1ff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      series: [
        {
          name: '行业',
          type: 'line',
          smooth: true,
          data: industry.slice(0, 6).map((i) => i.value)
        },
        {
          name: '公司规模',
          type: 'line',
          smooth: true,
          data: size.slice(0, 6).map((i) => i.value)
        },
        {
          name: '融资阶段',
          type: 'line',
          smooth: true,
          data: finance.slice(0, 6).map((i) => i.value)
        }
      ]
    })
  } else {
    const sourceData = currentMode.value === 'city' ? cityData.value : provinceData.value
    const industry = sourceData?.industryTop10 || []
    const welfare = sourceData?.welfareTop20 || []

    rightBottomChart.setOption({
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        textStyle: { color: '#dce9ff' }
      },
      grid: {
        left: 38,
        right: 20,
        top: 38,
        bottom: 48
      },
      xAxis: {
        type: 'category',
        data: industry.slice(0, 6).map((i) => i.name),
        axisLabel: { color: '#cfe1ff', rotate: 18 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#cfe1ff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      series: [
        {
          name: '热门行业',
          type: 'bar',
          barMaxWidth: 20,
          data: industry.slice(0, 6).map((i) => i.value)
        },
        {
          name: '福利热词',
          type: 'line',
          smooth: true,
          data: welfare.slice(0, 6).map((i) => i.value)
        }
      ]
    })
  }
}

function renderBottomLeft() {
  bottomLeftChart = initChart(bottomLeftRef.value, bottomLeftChart)
  if (!bottomLeftChart) return

  const data = highSalaryData.value?.regionRateTop10 || []

  bottomLeftChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const item = params?.[0]?.data
        if (!item) return ''
        return `
            <div style="line-height:1.8;">
              <div style="font-weight:600;margin-bottom:4px;">${item.name}</div>
              <div>高薪占比：${item.value}%</div>
              <div>高薪岗位数：${item.highCount}</div>
              <div>岗位总数：${item.totalCount}</div>
            </div>
          `
      }
    },
    grid: {
      left: 70,
      right: 24,
      top: 20,
      bottom: 28
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#cfe1ff' },
      splitLine: {
        lineStyle: { color: 'rgba(255,255,255,0.08)' }
      }
    },
    yAxis: {
      type: 'category',
      data: data
        .slice()
        .reverse()
        .map((i: any) => i.name),
      axisLabel: { color: '#dce9ff' }
    },
    series: [
      {
        name: '高薪占比',
        type: 'bar',
        barMaxWidth: 18,
        data: data
          .slice()
          .reverse()
          .map((i: any) => ({
            ...i,
            value: i.value
          })),
        label: {
          show: true,
          position: 'right',
          color: '#dce9ff',
          formatter: (params: any) => `${params.value}%`
        }
      }
    ]
  })
}

function buildHorizontalBarOption(data: NameValueItem[], seriesName: string) {
  const sorted = [...(data || [])].slice(0, 10).reverse()
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(4, 16, 38, 0.92)',
      borderColor: 'rgba(57, 201, 255, 0.35)',
      textStyle: { color: '#eaf7ff' }
    },
    grid: {
      left: 72,
      right: 26,
      top: 18,
      bottom: 18
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#a9c7e8' },
      splitLine: { lineStyle: { color: 'rgba(99, 179, 237, 0.14)' } }
    },
    yAxis: {
      type: 'category',
      data: sorted.map((i) => i.name),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: '#d8edff',
        formatter: (value: string) => (value.length > 7 ? `${value.slice(0, 7)}...` : value)
      }
    },
    series: [
      {
        name: seriesName,
        type: 'bar',
        barMaxWidth: 16,
        data: sorted.map((i) => i.value),
        label: {
          show: true,
          position: 'right',
          color: '#e8f7ff',
          fontSize: 11
        },
        itemStyle: {
          borderRadius: [0, 10, 10, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#1d8cff' },
            { offset: 1, color: '#49e6ff' }
          ])
        }
      }
    ]
  }
}

function handleResize() {
  mapChart?.resize()
  window.setTimeout(syncSideLayerRoam, 0)
  leftTopChart?.resize()
  leftMiddleChart?.resize()
  leftBottomChart?.resize()
  rightTopChart?.resize()
  rightMiddleChart?.resize()
  rightBottomChart?.resize()
  bottomLeftChart?.resize()
}

onMounted(async () => {
  try {
    updateClock()
    clockTimer = window.setInterval(updateClock, 1000)
    await registerChinaMap()
    await loadOptions()
    await loadNational()
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error(error)
    ElMessage.error('地图初始化失败')
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (clockTimer) window.clearInterval(clockTimer)
  mapChart?.dispose()
  leftTopChart?.dispose()
  leftMiddleChart?.dispose()
  leftBottomChart?.dispose()
  rightTopChart?.dispose()
  rightMiddleChart?.dispose()
  rightBottomChart?.dispose()
  bottomLeftChart?.dispose()
})
</script>

<style scoped lang="scss">
.job-screen-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  padding: 0 16px 18px;
  color: #eaf6ff;
  background: radial-gradient(circle at 7% 12%, rgba(18, 205, 255, 0.18), transparent 24%),
    radial-gradient(circle at 92% 8%, rgba(61, 117, 255, 0.2), transparent 26%),
    linear-gradient(180deg, #061426 0%, #07162b 48%, #081021 100%);
}

.screen-bg {
  position: absolute;
  z-index: 0;
  width: 440px;
  height: 440px;
  pointer-events: none;
  border-radius: 50%;
  filter: blur(8px);
  opacity: 0.38;
}

.screen-bg--left {
  top: 78px;
  left: -180px;
  background: radial-gradient(circle, rgba(41, 215, 255, 0.36), transparent 66%);
}

.screen-bg--right {
  top: -140px;
  right: -160px;
  background: radial-gradient(circle, rgba(61, 116, 255, 0.36), transparent 64%);
}

.screen-header,
.screen-body {
  position: relative;
  z-index: 1;
}

.screen-header {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1fr;
  align-items: center;
  height: 96px;
  border-bottom: 1px solid rgba(68, 202, 255, 0.16);
}

.header-title {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.3px;
}

.header-subtitle {
  margin-top: 8px;
  color: #62d7ff;
  font-size: 13px;
  letter-spacing: 0.8px;
}

.header-center {
  text-align: center;
}

.system-title {
  display: inline-block;
  position: relative;
  color: #f7fbff;
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 7px;
  text-shadow: 0 0 22px rgba(86, 215, 255, 0.28);
}

.system-line {
  width: 520px;
  height: 1px;
  margin: 18px auto 0;
  background: linear-gradient(90deg, transparent, rgba(69, 213, 255, 0.62), transparent);
  box-shadow: 0 0 16px rgba(69, 213, 255, 0.38);
}

.header-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.time-box {
  min-width: 138px;
  text-align: right;

  span {
    display: block;
    color: #80dfff;
    font-size: 13px;
  }

  strong {
    display: block;
    margin-top: 6px;
    color: #ffffff;
    font-size: 25px;
    letter-spacing: 1px;
  }
}

.screen-btn {
  --el-button-bg-color: rgba(13, 40, 72, 0.76);
  --el-button-border-color: rgba(76, 181, 255, 0.42);
  --el-button-text-color: #dff6ff;
  --el-button-hover-bg-color: rgba(25, 91, 146, 0.84);
  --el-button-hover-border-color: rgba(102, 220, 255, 0.78);
  --el-button-hover-text-color: #ffffff;
  --el-button-active-bg-color: rgba(20, 78, 128, 0.9);
  border-radius: 6px;
}

.screen-btn--primary {
  --el-button-bg-color: linear-gradient(180deg, rgba(64, 204, 255, 0.92), rgba(22, 126, 255, 0.92));
  --el-button-border-color: rgba(88, 220, 255, 0.92);
  --el-button-text-color: #00182c;
  font-weight: 700;
  color: #ffffff;
}

.screen-body {
  padding-top: 18px;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 70px;
  padding: 12px 18px;
  border: 1px solid rgba(50, 151, 213, 0.26);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(12, 33, 60, 0.9), rgba(8, 22, 43, 0.8));
  box-shadow: inset 0 0 22px rgba(62, 199, 255, 0.04);
}

.filter-title {
  min-width: 270px;

  strong {
    display: block;
    color: #ffffff;
    font-size: 18px;
  }

  span {
    display: block;
    margin-top: 7px;
    color: #7ccfff;
    font-size: 12px;
  }
}

.filter-form {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 2px 6px;

  :deep(.el-form-item) {
    margin-right: 0;
    margin-bottom: 0;
  }

  :deep(.el-form-item__label) {
    color: #b8d6ef;
  }

  :deep(.el-input) {
    width: 150px;
  }

  :deep(.el-select) {
    width: 162px;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    background: rgba(3, 14, 32, 0.62);
    border-radius: 7px;
    box-shadow: inset 0 0 0 1px rgba(82, 170, 230, 0.26);
  }

  :deep(.el-input__inner) {
    color: #eaf7ff;
  }
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.stat-card {
  display: flex;
  align-items: center;
  min-height: 104px;
  padding: 18px 22px;
  border: 1px solid rgba(58, 151, 212, 0.28);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(20, 58, 92, 0.92), rgba(14, 29, 55, 0.86)),
    radial-gradient(circle at 15% 20%, rgba(70, 221, 255, 0.2), transparent 35%);
  box-shadow: inset 0 0 28px rgba(77, 206, 255, 0.04), 0 12px 24px rgba(0, 0, 0, 0.14);
}

.stat-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 58px;
  width: 58px;
  height: 58px;
  margin-right: 18px;
  color: #00192c;
  font-weight: 900;
  border-radius: 16px;
  background: linear-gradient(180deg, #5ce7ff, #68c8ff);
  box-shadow: 0 12px 28px rgba(52, 208, 255, 0.28);
}

.stat-card__value {
  color: #ffffff;
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.stat-card__label {
  margin-top: 8px;
  color: #9fd8ff;
  font-size: 14px;
}

.stat-card__sub {
  margin-top: 4px;
  color: rgba(172, 207, 231, 0.6);
  font-size: 11px;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.screen-layout {
  display: grid;
  grid-template-columns: 455px minmax(640px, 1fr) 455px;
  gap: 18px;
  margin-top: 18px;
}

.left-panel,
.right-panel,
.center-panel {
  display: grid;
  gap: 18px;
  min-width: 0;
}

.left-panel,
.right-panel {
  align-content: start;
}

.panel-card {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(48, 147, 210, 0.34);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(9, 26, 49, 0.96), rgba(7, 18, 37, 0.94));
  box-shadow: inset 0 0 30px rgba(69, 201, 255, 0.035), 0 15px 30px rgba(0, 0, 0, 0.16);
}

.panel-card::before {
  position: absolute;
  inset: 0;
  pointer-events: none;
  content: '';
  background: linear-gradient(
    135deg,
    rgba(78, 210, 255, 0.1),
    transparent 28%,
    transparent 70%,
    rgba(41, 107, 255, 0.08)
  );
}

.panel-title {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 10px;

  span {
    color: #ffffff;
    font-size: 17px;
    font-weight: 800;
  }

  em {
    color: #69cdf5;
    font-size: 12px;
    font-style: normal;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
}

.panel-title--map {
  align-items: flex-start;

  p {
    margin: 6px 0 0;
    color: #6ecfff;
    font-size: 12px;
    letter-spacing: 0.6px;
  }
}

.chart-box {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 250px;
  padding: 0 8px 12px;
}

.status-panel {
  padding-bottom: 14px;
}

.status-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 12px;
  padding: 4px 18px 0;
}

.status-item {
  padding: 14px;
  border: 1px solid rgba(73, 141, 212, 0.24);
  border-radius: 14px;
  background: rgba(9, 25, 48, 0.82);
}

.status-item__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  color: #001a2c;
  font-weight: 900;
  border-radius: 13px;
  background: linear-gradient(180deg, #55dfff, #68bfff);
}

.status-info {
  flex: 1;
  min-width: 0;

  h3 {
    overflow: hidden;
    margin: 0;
    color: #eff9ff;
    font-size: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    overflow: hidden;
    margin: 7px 0 0;
    color: #67d2ff;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.status-badge {
  padding: 5px 9px;
  color: #7af2ae;
  font-size: 12px;
  font-weight: 700;
  border: 1px solid rgba(96, 255, 177, 0.26);
  border-radius: 999px;
  background: rgba(52, 211, 153, 0.12);
}

.status-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 12px;

  div {
    min-width: 0;
    padding: 9px 10px;
    border-radius: 9px;
    background: rgba(3, 13, 29, 0.62);
  }

  span {
    display: block;
    overflow: hidden;
    color: #8caeca;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    display: block;
    overflow: hidden;
    margin-top: 6px;
    color: #ffffff;
    font-size: 14px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.map-card {
  min-height: 742px;
  background: radial-gradient(ellipse at 50% 44%, rgba(16, 100, 205, 0.38), transparent 62%),
    linear-gradient(180deg, rgba(8, 27, 56, 0.98), rgba(5, 15, 33, 0.96));
}

.map-card::after {
  position: absolute;
  inset: 58px 10px 44px;
  z-index: 0;
  pointer-events: none;
  content: '';
  opacity: 0.46;
  background-image: linear-gradient(rgba(74, 169, 255, 0.09) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 169, 255, 0.09) 1px, transparent 1px),
    radial-gradient(circle at 50% 52%, rgba(80, 221, 255, 0.14), transparent 35%);
  background-size: 46px 46px, 46px 46px, 100% 100%;
  mask-image: radial-gradient(
    ellipse at center,
    #000 34%,
    rgba(0, 0, 0, 0.72) 56%,
    transparent 78%
  );
}

.map-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.map-tag {
  color: #7df0ff;
  border-color: rgba(111, 226, 255, 0.36);
  background: rgba(54, 211, 255, 0.08);
}

.map-open-btn {
  border-color: rgba(90, 215, 255, 0.5);
  color: #dffbff;
  background: linear-gradient(90deg, rgba(31, 124, 255, 0.22), rgba(39, 221, 255, 0.14));
}

.map-open-btn:hover {
  border-color: rgba(134, 238, 255, 0.8);
  color: #ffffff;
  background: linear-gradient(90deg, rgba(36, 143, 255, 0.34), rgba(45, 232, 255, 0.22));
}

.map-summary {
  position: absolute;
  z-index: 2;
  top: 92px;
  left: 28px;
  display: grid;
  gap: 12px;
  width: 230px;
  pointer-events: none;
}

.summary-core {
  padding: 18px;
  border: 1px solid rgba(74, 184, 255, 0.28);
  border-radius: 50%;
  width: 140px;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(22, 61, 93, 0.92), rgba(7, 17, 34, 0.72));
  box-shadow: 0 0 34px rgba(55, 180, 255, 0.16), inset 0 0 28px rgba(77, 210, 255, 0.08);
}

.summary-core__value {
  color: #ffffff;
  font-size: 25px;
  font-weight: 900;
}

.summary-core__label {
  margin-top: 8px;
  color: #7dd9ff;
  font-size: 12px;
}

.summary-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  width: 310px;

  div {
    padding: 10px 12px;
    border: 1px solid rgba(74, 184, 255, 0.18);
    border-radius: 10px;
    background: rgba(4, 14, 30, 0.64);
  }

  strong {
    display: block;
    color: #ffffff;
    font-size: 17px;
  }

  span {
    display: block;
    margin-top: 5px;
    color: #8fb7d3;
    font-size: 11px;
  }
}

.map-box {
  position: relative;
  z-index: 1;
  width: calc(100% - 20px);
  height: 648px;
  margin: 0 10px;
  overflow: hidden;
  cursor: grab;
  user-select: none;
  border-radius: 14px;
  background: radial-gradient(ellipse at 50% 48%, rgba(44, 148, 255, 0.2), transparent 58%),
    radial-gradient(circle at 18% 24%, rgba(51, 223, 255, 0.13), transparent 26%),
    radial-gradient(circle at 80% 22%, rgba(42, 105, 255, 0.16), transparent 28%);
}

.map-box:active,
.map-box canvas:active {
  cursor: grabbing;
}

.map-box canvas {
  cursor: grab;
}

.map-box::before {
  position: absolute;
  inset: 6% 5%;
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

// .map-box::after {
//   position: absolute;
//   right: 22px;
//   bottom: 18px;
//   z-index: 0;
//   width: 150px;
//   height: 88px;
//   pointer-events: none;
//   content: '';
//   border: 1px solid rgba(72, 214, 255, 0.34);
//   border-radius: 10px;
//   background: radial-gradient(circle at 36% 42%, rgba(68, 217, 255, 0.18), transparent 56%);
//   box-shadow: inset 0 0 18px rgba(62, 194, 255, 0.08), 0 0 18px rgba(44, 165, 255, 0.08);
// }

.map-footer {
  position: relative;
  z-index: 1;
  padding: 0 22px 18px;
  color: #8fb7d3;
  font-size: 12px;
  line-height: 1.7;
}

.center-bottom-card .chart-box--wide {
  height: 250px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1.25fr 0.85fr 1.2fr;
  gap: 18px;
  margin-top: 18px;
}

.insight-panel,
.high-salary-panel,
.bottom-rank-panel {
  min-height: 260px;
}

.insight-list {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 10px;
  padding: 4px 18px 18px;
  max-height: 240px;
  overflow: auto;
}
.insight-list::-webkit-scrollbar {
  display: none;
}

.insight-item {
  display: flex;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid rgba(74, 184, 255, 0.16);
  border-radius: 10px;
  background: rgba(3, 13, 29, 0.56);
}

.insight-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  color: #00182c;
  font-size: 12px;
  font-weight: 900;
  border-radius: 50%;
  background: linear-gradient(180deg, #58e6ff, #5dbfff);
}

.insight-text {
  color: #d8edff;
  font-size: 13px;
  line-height: 1.72;
}

.insight-empty {
  padding: 14px 0;
  color: #8fb7d3;
  font-size: 13px;
}

.high-salary-summary {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  padding: 6px 18px 18px;

  div {
    padding: 16px;
    border: 1px solid rgba(74, 184, 255, 0.18);
    border-radius: 12px;
    background: rgba(4, 14, 30, 0.62);
  }

  span {
    display: block;
    color: #91b7d2;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 8px;
    color: #ffffff;
    font-size: 26px;
    font-weight: 900;
  }
}

.bottom-chart-box {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 220px;
  padding: 0 8px 12px;
}

:deep(.el-loading-mask) {
  border-radius: 16px;
}

@media (max-width: 1800px) {
  .screen-layout {
    grid-template-columns: 410px minmax(580px, 1fr) 410px;
  }

  .system-title {
    font-size: 30px;
  }

  .map-summary {
    transform: scale(0.92);
    transform-origin: left top;
  }
}

@media (max-width: 1500px) {
  .screen-header {
    grid-template-columns: 1fr;
    gap: 10px;
    height: auto;
    padding: 16px 0;
    text-align: center;
  }

  .header-right {
    justify-content: center;
  }

  .time-box {
    text-align: center;
  }

  .filter-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .filter-form {
    justify-content: flex-start;
  }

  .screen-layout,
  .bottom-grid {
    grid-template-columns: 1fr;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .job-screen-page {
    padding: 0 10px 14px;
  }

  .system-title {
    font-size: 22px;
    letter-spacing: 3px;
  }

  .system-line {
    width: 260px;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .stat-card__value {
    font-size: 28px;
  }

  .map-summary {
    position: relative;
    top: auto;
    left: auto;
    width: auto;
    padding: 0 18px 8px;
    transform: none;
  }

  .summary-core {
    width: 160px;
    height: 160px;
  }

  .summary-mini-grid {
    width: 100%;
  }

  .map-box {
    width: 100%;
    height: 520px;
    margin: 0;
  }
}
</style>

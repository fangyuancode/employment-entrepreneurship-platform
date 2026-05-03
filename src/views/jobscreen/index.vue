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
          <span>{{ currentMode === 'national' ? '点击地图省份可进入省级下钻' : '当前展示省内城市分布，可返回全国' }}</span>
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
              <span>{{ currentMode === 'national' ? '岗位数量 TOP10 省份' : '城市岗位 TOP10' }}</span>
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
                <span>{{ currentMode === 'national' ? '全国岗位分布总览' : `${currentProvince} 岗位城市分布` }}</span>
                <p>{{ currentMode === 'national' ? 'Map Drilldown · 点击省份进入详情' : 'Province Detail · 城市级岗位画像' }}</p>
              </div>
              <div class="map-actions">
                <el-tag class="map-tag" effect="plain">{{ currentMode === 'national' ? '全国地图' : '省级地图' }}</el-tag>
                <el-button v-if="currentMode === 'province'" class="screen-btn" size="small" @click="backToNational">返回全国</el-button>
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
                  : '悬停查看城市岗位数、平均薪资、热门类别、热门技能。'
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
              <span>{{ currentMode === 'national' ? '平均薪资 TOP10 地区' : '城市平均薪资 TOP10' }}</span>
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
import {
  getJobScreenNational,
  getJobScreenOptions,
  getJobScreenProvince,
  getJobScreenInsight,
  getJobScreenHighSalary,
  type NameValueItem,
  type NationalScreenData,
  type ProvinceScreenData,
  type InsightData,
  type HighSalaryData
} from '@/api/job-screen'
import { registerChinaMap, registerProvinceMap } from '@/utils/echarts-map'

const loading = ref(false)

const queryForm = reactive({
  keyword: '',
  categoryMain: '',
  degree: '',
  experience: '',
  province: ''
})

const provinceOptions = ref<string[]>([])
const currentMode = ref<'national' | 'province'>('national')
const currentProvince = ref('')

const nationalData = ref<NationalScreenData | null>(null)
const provinceData = ref<ProvinceScreenData | null>(null)
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
      province: '',
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
  return currentMode.value === 'national' ? '全国总览' : `${currentProvince.value || '-'} 省级下钻`
})

const kpiCards = computed(() => [
  {
    icon: '岗',
    label: currentMode.value === 'national' ? '全国岗位总数' : '省内岗位总数',
    value: formatLargeNumber(summary.value.jobCount),
    sub: 'Job Volume'
  },
  {
    icon: '城',
    label: '覆盖城市数',
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
        : `${currentProvince.value} 城市分布地图`,
    subtitle:
      currentMode.value === 'national' ? 'china_job_distribution' : 'province_city_distribution',
    status: '正常',
    metrics: [
      { label: '地图层级', value: currentMode.value === 'national' ? '全国' : '省级' },
      { label: '下钻能力', value: currentMode.value === 'national' ? '省份' : '城市' },
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
  if (currentMode.value === 'province' && currentProvince.value) {
    await loadProvince(currentProvince.value)
  } else {
    await loadNational()
  }
}

async function searchByFilter() {
  await loadOptions()
  if (queryForm.province) {
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
    province: currentMode.value === 'province' ? currentProvince.value : queryForm.province
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
  const targetProvince = provinceName || queryForm.province
  if (!targetProvince) {
    ElMessage.warning('请选择省份后再查看详情')
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

async function handleProvinceSelect(value: string) {
  if (!value) return
  await loadProvince(value)
}

function backToNational() {
  queryForm.province = ''
  loadNational()
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

function initChart(dom: HTMLDivElement | null, oldChart: echarts.ECharts | null) {
  if (!dom) return null
  if (oldChart) oldChart.dispose()
  return echarts.init(dom)
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
    .replace('北京市', '')
    .replace('天津市', '')
    .replace('上海市', '')
    .replace('重庆市', '')
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
    name: normalizeRegionName(item.name)
  }))

  const scatterData = !isNational
    ? (provinceData.value?.mapData || [])
        .filter((item: any) => item.longitude && item.latitude)
        .map((item: any) => ({
          name: item.name,
          value: [item.longitude, item.latitude, item.value],
          avgSalary: item.avgSalary,
          hotCategory: item.hotCategory,
          hotSkill: item.hotSkill
        }))
    : []

  mapChart.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = params.data || {}
        const valueText = Array.isArray(data.value) ? data.value[2] ?? 0 : data.value ?? 0
        return `
            <div style="line-height:1.8;">
              <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${
                params.name || '-'
              }</div>
              <div>岗位数：${valueText}</div>
              <div>平均薪资：${data.avgSalary ?? 0} K</div>
              <div>热门类别：${data.hotCategory || '-'}</div>
              <div>热门技能：${data.hotSkill || '-'}</div>
            </div>
          `
      }
    },
    visualMap: {
      min: 0,
      max: Math.max(...mapData.map((item: any) => Number(item.value || 0)), 10),
      text: ['高', '低'],
      realtime: false,
      calculable: true,
      left: 20,
      bottom: 20,
      textStyle: {
        color: '#cfe1ff'
      },
      inRange: {
        color: ['#102d5c', '#1f64ff', '#57b7ff']
      }
    },
    geo: {
      map: mapName,
      roam: true,
      zoom: isNational ? 1.15 : 1.0,
      label: {
        show: true,
        color: '#d9e8ff',
        fontSize: 11
      },
      itemStyle: {
        areaColor: '#0e2548',
        borderColor: '#3a7bff',
        borderWidth: 1
      },
      emphasis: {
        label: {
          color: '#ffffff'
        },
        itemStyle: {
          areaColor: '#2a63e6'
        }
      }
    },
    series: [
      {
        name: '岗位分布',
        type: 'map',
        geoIndex: 0,
        data: mapData
      },
      {
        name: '城市散点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        showEffectOn: 'render',
        rippleEffect: {
          scale: 4
        },
        symbolSize: (val: any) => {
          const count = Number(val?.[2] || 0)
          return Math.max(8, Math.min(26, count / 20))
        },
        itemStyle: {
          color: '#67e8f9'
        },
        label: {
          show: true,
          formatter: '{b}',
          position: 'right',
          color: '#dff4ff',
          fontSize: 10
        },
        data: scatterData
      }
    ]
  })

  mapChart.off('click')

  if (isNational) {
    mapChart.on('click', (params: any) => {
      if (params?.name && provinceNameMap[params.name]) {
        loadProvince(params.name)
      }
    })
  }
}

function renderLeftTop() {
  leftTopChart = initChart(leftTopRef.value, leftTopChart)
  if (!leftTopChart) return

  const data =
    currentMode.value === 'national'
      ? nationalData.value?.provinceTop10 || []
      : provinceData.value?.cityJobTop10 || []

  leftTopChart.setOption(buildHorizontalBarOption(data, '岗位数量'))
}

function renderLeftMiddle() {
  leftMiddleChart = initChart(leftMiddleRef.value, leftMiddleChart)
  if (!leftMiddleChart) return

  const rawData =
    currentMode.value === 'national'
      ? nationalData.value?.categoryMainTop || []
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
      : provinceData.value?.degreeDistribution || []

  const expData =
    currentMode.value === 'national'
      ? nationalData.value?.experienceDistribution || []
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
    const industry = provinceData.value?.industryTop10 || []
    const welfare = provinceData.value?.welfareTop20 || []

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
  min-height: 710px;
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
  width: 100%;
  height: 610px;
}

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
  max-height: 210px;
  overflow: auto;
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
    height: 520px;
  }
}
</style>

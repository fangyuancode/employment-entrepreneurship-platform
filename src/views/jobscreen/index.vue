<template>
  <div class="job-screen-page">
    <el-card shadow="never" class="screen-top-card">
      <div class="top-header">
        <div>
          <div class="page-title">岗位大屏可视化分析中心</div>
          <div class="page-desc">
            支持全国总览与单省/直辖市下钻分析，从宏观岗位分布到局部城市画像进行多维可视化展示
          </div>
        </div>

        <div class="top-actions">
          <el-button @click="resetQuery">重置条件</el-button>
          <el-button type="primary" :loading="loading" @click="loadNational">刷新大屏</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            clearable
            placeholder="技能 / 行业 / 公司"
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="一级分类">
          <el-input
            v-model="queryForm.categoryMain"
            clearable
            placeholder="如：技术"
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="学历">
          <el-input
            v-model="queryForm.degree"
            clearable
            placeholder="如：本科"
            style="width: 160px"
          />
        </el-form-item>

        <el-form-item label="经验">
          <el-input
            v-model="queryForm.experience"
            clearable
            placeholder="如：1-3年"
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="快速切省">
          <el-select
            v-model="queryForm.province"
            filterable
            clearable
            placeholder="选择省份"
            style="width: 180px"
            @change="handleProvinceSelect"
          >
            <el-option v-for="item in provinceOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="summary-grid" v-loading="loading" element-loading-text="加载大屏数据中...">
      <div class="summary-card">
        <div class="summary-label">{{
          currentMode === 'national' ? '全国岗位总数' : '省内岗位总数'
        }}</div>
        <div class="summary-value">{{ summary.jobCount || 0 }}</div>
      </div>

      <div class="summary-card">
        <div class="summary-label">覆盖城市数</div>
        <div class="summary-value">{{ summary.cityCount || 0 }}</div>
      </div>

      <div class="summary-card">
        <div class="summary-label">平均薪资(K)</div>
        <div class="summary-value">{{ summary.avgSalaryK || 0 }}</div>
      </div>

      <div class="summary-card">
        <div class="summary-label">技能词总量</div>
        <div class="summary-value">{{ summary.skillWordCount || 0 }}</div>
      </div>

      <div class="summary-card">
        <div class="summary-label">高薪岗位占比</div>
        <div class="summary-value">{{ highSalarySummary.highSalaryRate || 0 }}%</div>
      </div>

      <div class="summary-card">
        <div class="summary-label">高薪岗位数</div>
        <div class="summary-value">{{ highSalarySummary.highSalaryCount || 0 }}</div>
      </div>
    </div>

    <div class="screen-main" v-loading="loading" element-loading-text="图表渲染中...">
      <div class="side-col">
        <el-card shadow="never" class="screen-card">
          <template #header>
            <span>{{ currentMode === 'national' ? '岗位数量 TOP10 省份' : '城市岗位 TOP10' }}</span>
          </template>
          <div ref="leftTopRef" class="chart-box"></div>
        </el-card>

        <el-card shadow="never" class="screen-card">
          <template #header>
            <span>{{ currentMode === 'national' ? '岗位类别占比' : '热门职位类别' }}</span>
          </template>
          <div ref="leftMiddleRef" class="chart-box"></div>
        </el-card>

        <el-card shadow="never" class="screen-card">
          <template #header>
            <span>学历 / 经验分布</span>
          </template>
          <div ref="leftBottomRef" class="chart-box"></div>
        </el-card>
      </div>

      <div class="center-col">
        <el-card shadow="never" class="screen-card map-card">
          <template #header>
            <div class="map-header">
              <span>
                {{
                  currentMode === 'national'
                    ? '全国岗位分布总览'
                    : `${currentProvince} 岗位城市分布`
                }}
              </span>
              <div class="map-actions">
                <el-tag type="info" effect="plain">
                  {{ currentMode === 'national' ? '点击省份下钻' : '省内详情' }}
                </el-tag>
                <el-button
                  v-if="currentMode === 'province'"
                  size="small"
                  type="primary"
                  plain
                  @click="backToNational"
                >
                  返回全国
                </el-button>
              </div>
            </div>
          </template>

          <div ref="mapRef" class="map-box"></div>

          <div class="map-footer">
            <div class="map-tip">
              {{
                currentMode === 'national'
                  ? '悬停查看岗位数、平均薪资、热门岗位类别、热门技能；点击省份进入详情'
                  : '悬停查看城市岗位数、平均薪资、热门类别、热门技能'
              }}
            </div>
          </div>
        </el-card>
      </div>

      <div class="side-col">
        <el-card shadow="never" class="screen-card">
          <template #header>
            <span>{{
              currentMode === 'national' ? '平均薪资 TOP10 地区' : '城市平均薪资 TOP10'
            }}</span>
          </template>
          <div ref="rightTopRef" class="chart-box"></div>
        </el-card>

        <el-card shadow="never" class="screen-card">
          <template #header>
            <span>{{ currentMode === 'national' ? '技能需求 TOP20' : '技能需求 TOP15' }}</span>
          </template>
          <div ref="rightMiddleRef" class="chart-box"></div>
        </el-card>

        <el-card shadow="never" class="screen-card">
          <template #header>
            <span>{{ currentMode === 'national' ? '企业画像' : '行业 / 规模 / 福利热词' }}</span>
          </template>
          <div ref="rightBottomRef" class="chart-box"></div>
        </el-card>
      </div>
    </div>
    <div class="insight-high-grid" v-loading="loading">
      <el-card shadow="never" class="screen-card insight-card">
        <template #header>
          <span>AI 洞察</span>
        </template>

        <div class="insight-list">
          <div v-for="(item, index) in aiInsightList" :key="index" class="insight-item">
            <span class="insight-index">{{ index + 1 }}</span>
            <span class="insight-text">{{ item }}</span>
          </div>

          <div v-if="!aiInsightList.length" class="insight-empty"> 当前暂无可展示的智能洞察 </div>
        </div>
      </el-card>

      <el-card shadow="never" class="screen-card">
        <template #header>
          <span>高薪岗位概览</span>
        </template>

        <div class="high-salary-summary">
          <div class="high-salary-item">
            <div class="high-salary-label">高薪阈值</div>
            <div class="high-salary-value">{{ highSalarySummary.highSalaryThreshold }}K</div>
          </div>
          <div class="high-salary-item">
            <div class="high-salary-label">高薪岗位数</div>
            <div class="high-salary-value">{{ highSalarySummary.highSalaryCount }}</div>
          </div>
          <div class="high-salary-item">
            <div class="high-salary-label">高薪岗位占比</div>
            <div class="high-salary-value">{{ highSalarySummary.highSalaryRate }}%</div>
          </div>
        </div>
      </el-card>
    </div>
    <div class="bottom-row" v-loading="loading">
      <el-card shadow="never" class="screen-card">
        <template #header>
          <span>高薪岗位占比 TOP10 地区</span>
        </template>
        <div ref="bottomLeftRef" class="bottom-chart-box"></div>
      </el-card>
    </div>
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
          const valueText = Array.isArray(data.value) ? (data.value[2] ?? 0) : (data.value ?? 0)
          return `
            <div style="line-height:1.8;">
              <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${params.name || '-'}</div>
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
    const sorted = [...data].slice(0, 10).reverse()
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      grid: {
        left: 70,
        right: 20,
        top: 20,
        bottom: 20
      },
      xAxis: {
        type: 'value',
        axisLabel: { color: '#cfe1ff' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } }
      },
      yAxis: {
        type: 'category',
        data: sorted.map((i) => i.name),
        axisLabel: { color: '#cfe1ff' }
      },
      series: [
        {
          name: seriesName,
          type: 'bar',
          barMaxWidth: 18,
          data: sorted.map((i) => i.value)
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
    min-height: 100%;
    padding: 16px;
    background:
      radial-gradient(circle at top left, rgba(61, 119, 255, 0.18), transparent 28%),
      radial-gradient(circle at top right, rgba(0, 204, 255, 0.12), transparent 24%),
      linear-gradient(180deg, #071427 0%, #0a1830 46%, #0d1c36 100%);
    border-radius: 16px;
  }

  .screen-top-card,
  .screen-card {
    border: 1px solid rgba(86, 138, 255, 0.24);
    background: rgba(9, 22, 45, 0.78);
    backdrop-filter: blur(10px);
  }

  .top-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
  }

  .page-title {
    color: #f4f8ff;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .page-desc {
    margin-top: 6px;
    color: #a9bedf;
    font-size: 14px;
    line-height: 1.7;
  }

  .top-actions {
    display: flex;
    gap: 10px;
  }

  :deep(.el-form-item__label) {
    color: #d9e6ff;
  }

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    background: rgba(255, 255, 255, 0.06);
    box-shadow: inset 0 0 0 1px rgba(104, 149, 255, 0.2);
  }

  .summary-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 16px;
  }

  .summary-card {
    padding: 18px 20px;
    border-radius: 14px;
    background: linear-gradient(180deg, rgba(18, 40, 78, 0.96), rgba(10, 26, 55, 0.94));
    border: 1px solid rgba(86, 138, 255, 0.24);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  }

  .summary-label {
    color: #9fb4d8;
    font-size: 13px;
  }

  .summary-value {
    margin-top: 8px;
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
  }

  .insight-high-grid {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 16px;
  }

  .insight-card {
    min-height: 180px;
  }

  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .insight-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
  }

  .insight-index {
    width: 22px;
    height: 22px;
    line-height: 22px;
    text-align: center;
    border-radius: 50%;
    background: rgba(78, 128, 255, 0.25);
    color: #dce9ff;
    font-size: 12px;
    flex-shrink: 0;
  }

  .insight-text {
    color: #dce9ff;
    line-height: 1.75;
    font-size: 13px;
  }

  .insight-empty {
    color: #8ea6cf;
    font-size: 13px;
    line-height: 1.8;
  }

  .high-salary-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding-top: 10px;
  }

  .high-salary-item {
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(180deg, rgba(18, 40, 78, 0.96), rgba(10, 26, 55, 0.94));
    border: 1px solid rgba(86, 138, 255, 0.18);
  }

  .high-salary-label {
    color: #9fb4d8;
    font-size: 13px;
  }

  .high-salary-value {
    margin-top: 8px;
    color: #ffffff;
    font-size: 24px;
    font-weight: 700;
  }

  .screen-main {
    margin-top: 16px;
    display: grid;
    grid-template-columns: 350px minmax(480px, 1fr) 350px;
    gap: 16px;
    min-height: 760px;
  }

  .side-col {
    display: grid;
    grid-template-rows: repeat(3, minmax(220px, 1fr));
    gap: 16px;
  }

  .center-col {
    min-width: 0;
  }

  .screen-card {
    height: 100%;
    color: #dce9ff;
  }

  .chart-box {
    height: 250px;
    width: 100%;
  }

  .map-card {
    height: 100%;
  }

  .map-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .map-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .map-box {
    height: 640px;
    width: 100%;
  }

  .map-footer {
    padding-top: 10px;
  }

  .map-tip {
    color: #8ea6cf;
    font-size: 13px;
  }

  .bottom-row {
    margin-top: 16px;
  }

  .bottom-chart-box {
    height: 320px;
    width: 100%;
  }

  :deep(.el-card__header) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    color: #f1f6ff;
    font-weight: 600;
  }

  :deep(.el-card__body) {
    color: #dce9ff;
  }

  @media (max-width: 1700px) {
    .summary-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 1600px) {
    .screen-main {
      grid-template-columns: 320px minmax(420px, 1fr) 320px;
    }
  }

  @media (max-width: 1360px) {
    .summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .insight-high-grid {
      grid-template-columns: 1fr;
    }

    .screen-main {
      grid-template-columns: 1fr;
    }

    .side-col {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
    }

    .chart-box {
      height: 300px;
    }

    .map-box {
      height: 560px;
    }

    .high-salary-summary {
      grid-template-columns: 1fr;
    }
  }
</style>

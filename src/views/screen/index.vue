<template>
  <div class="visual-screen-page">
    <div class="screen-header">
      <div class="header-left">
        <div class="screen-title">区域数据可视化大屏</div>
        <div class="screen-subtitle">Region Data Visualization Dashboard</div>
      </div>

      <div class="header-center">
        <div class="region-switch">
          <span
            v-for="item in regionOptions"
            :key="item"
            class="region-item"
            :class="{ active: currentRegion === item }"
            @click="changeRegion(item)"
          >
            {{ item }}
          </span>
        </div>
      </div>

      <div class="header-right">
        <el-button class="back-btn" @click="goHome">返回官网</el-button>
      </div>
    </div>

    <div class="screen-body">
      <div class="side-column">
        <div class="screen-card">
          <div class="card-title">景点人流排名</div>
          <div class="rank-list">
            <div class="rank-item" v-for="(item, index) in currentData.scenicRank" :key="item.name">
              <div class="rank-top">
                <span class="rank-no">No.{{ index + 1 }}</span>
                <span class="rank-name">{{ item.name }}</span>
                <span class="rank-value">{{ item.value }} 万人</span>
              </div>
              <div class="rank-bar">
                <div
                  class="rank-bar-inner"
                  :style="{ width: getRankPercent(item.value, currentData.scenicRank) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div class="screen-card chart-card">
          <div class="card-title">游客年龄分布</div>
          <div ref="ageChartRef" class="chart-box"></div>
        </div>

        <div class="screen-card chart-card">
          <div class="card-title">年度接待游客趋势</div>
          <div ref="yearTrendChartRef" class="chart-box"></div>
        </div>
      </div>

      <div class="center-column">
        <div class="map-panel">
          <div class="map-title"> {{ currentRegion }}数据总览 </div>

          <div class="map-subtitle"> 当前展示该地区核心旅游数据、行业收入、游客结构与热词信息 </div>

          <div class="pseudo-map">
            <div class="map-glow"></div>
            <div class="map-core">{{ currentRegion }}</div>

            <div
              class="city-marker"
              v-for="(item, index) in currentData.cityHotspot"
              :key="item.name"
              :style="item.style"
            >
              <div class="marker-index">{{ index + 1 }}</div>
              <div class="marker-content">
                <div class="marker-name">{{ item.name }}</div>
                <div class="marker-value">{{ item.value }} 万人</div>
              </div>
            </div>
          </div>

          <div class="center-summary">
            <div class="summary-card" v-for="item in currentData.summary" :key="item.label">
              <div class="summary-value">{{ item.value }}</div>
              <div class="summary-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="side-column">
        <div class="screen-card chart-card">
          <div class="card-title">各行业收入</div>
          <div ref="incomeChartRef" class="chart-box"></div>
        </div>

        <div class="screen-card chart-card">
          <div class="card-title">接待游客人数 TOP5</div>
          <div ref="touristTopChartRef" class="chart-box"></div>
        </div>

        <div class="screen-card">
          <div class="card-title">旅游实时热词</div>
          <div class="hotword-wrap">
            <div
              class="hotword-item"
              v-for="item in currentData.hotWords"
              :key="item.name"
              :style="{ width: item.size + 'px', height: item.size + 'px' }"
            >
              <span>{{ item.name }}</span>
              <small>{{ item.percent }}%</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as echarts from 'echarts'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'

  const router = useRouter()
  const route = useRoute()

  const ageChartRef = ref<HTMLDivElement | null>(null)
  const yearTrendChartRef = ref<HTMLDivElement | null>(null)
  const incomeChartRef = ref<HTMLDivElement | null>(null)
  const touristTopChartRef = ref<HTMLDivElement | null>(null)

  let ageChart: echarts.ECharts | null = null
  let yearTrendChart: echarts.ECharts | null = null
  let incomeChart: echarts.ECharts | null = null
  let touristTopChart: echarts.ECharts | null = null

  const regionOptions = ['河南省', '浙江省', '江苏省']

  const regionDataMap: Record<string, any> = {
    河南省: {
      scenicRank: [
        { name: '洛阳龙门石窟', value: 13.6 },
        { name: '洛阳白马寺', value: 11.0 },
        { name: '登封嵩山少林寺', value: 8.9 },
        { name: '新乡八里沟', value: 3.2 },
        { name: '洛阳老君山', value: 1.7 }
      ],
      age: {
        labels: ['20以下', '20-30', '30-40', '40-50', '50以上'],
        values: [143, 93, 167, 138, 59]
      },
      yearTrend: {
        labels: ['1月', '3月', '5月', '7月', '9月', '11月'],
        value2021: [120, 180, 160, 220, 190, 140],
        value2022: [160, 210, 200, 260, 230, 180]
      },
      income: {
        labels: ['旅游', '住宿', '餐饮', '零售', '交通'],
        values: [200, 143, 80, 41, 20]
      },
      touristTop: {
        labels: ['洛阳市', '开封市', '郑州市', '新乡市', '安阳市'],
        values: [74, 53, 46, 40, 29]
      },
      hotWords: [
        { name: '石窟', percent: 19, size: 110 },
        { name: '家宴', percent: 8, size: 84 },
        { name: '少林寺', percent: 8, size: 84 },
        { name: '人多', percent: 4, size: 74 },
        { name: '老街儿', percent: 2, size: 68 }
      ],
      summary: [
        { label: '2022旅游业收入', value: '200亿' },
        { label: '2022来访游客数', value: '267万人' },
        { label: '2022省内旅游支出', value: '86亿' }
      ],
      cityHotspot: [
        { name: '洛阳市', value: 267, style: { left: '26%', top: '23%' } },
        { name: '开封市', value: 200, style: { left: '71%', top: '20%' } },
        { name: '郑州市', value: 129, style: { left: '49%', top: '25%' } },
        { name: '驻马店市', value: 107, style: { left: '57%', top: '64%' } },
        { name: '南阳市', value: 86, style: { left: '37%', top: '76%' } }
      ]
    },
    浙江省: {
      scenicRank: [
        { name: '杭州西湖', value: 16.8 },
        { name: '乌镇', value: 12.6 },
        { name: '千岛湖', value: 9.4 },
        { name: '横店影视城', value: 6.3 },
        { name: '普陀山', value: 4.5 }
      ],
      age: {
        labels: ['20以下', '20-30', '30-40', '40-50', '50以上'],
        values: [122, 144, 171, 129, 66]
      },
      yearTrend: {
        labels: ['1月', '3月', '5月', '7月', '9月', '11月'],
        value2021: [150, 190, 210, 250, 230, 170],
        value2022: [180, 230, 240, 290, 265, 200]
      },
      income: {
        labels: ['旅游', '住宿', '餐饮', '零售', '交通'],
        values: [260, 176, 102, 64, 33]
      },
      touristTop: {
        labels: ['杭州市', '嘉兴市', '湖州市', '金华市', '舟山市'],
        values: [88, 62, 49, 43, 36]
      },
      hotWords: [
        { name: '西湖', percent: 22, size: 112 },
        { name: '古镇', percent: 11, size: 90 },
        { name: '夜游', percent: 7, size: 82 },
        { name: '民宿', percent: 6, size: 78 },
        { name: '美食', percent: 5, size: 74 }
      ],
      summary: [
        { label: '2022旅游业收入', value: '260亿' },
        { label: '2022来访游客数', value: '318万人' },
        { label: '2022省内旅游支出', value: '102亿' }
      ],
      cityHotspot: [
        { name: '杭州市', value: 318, style: { left: '31%', top: '26%' } },
        { name: '嘉兴市', value: 206, style: { left: '64%', top: '20%' } },
        { name: '宁波市', value: 178, style: { left: '76%', top: '42%' } },
        { name: '金华市', value: 123, style: { left: '48%', top: '58%' } },
        { name: '温州市', value: 95, style: { left: '61%', top: '78%' } }
      ]
    },
    江苏省: {
      scenicRank: [
        { name: '苏州园林', value: 15.1 },
        { name: '夫子庙', value: 11.8 },
        { name: '周庄古镇', value: 8.2 },
        { name: '瘦西湖', value: 5.9 },
        { name: '鼋头渚', value: 4.4 }
      ],
      age: {
        labels: ['20以下', '20-30', '30-40', '40-50', '50以上'],
        values: [118, 138, 165, 135, 71]
      },
      yearTrend: {
        labels: ['1月', '3月', '5月', '7月', '9月', '11月'],
        value2021: [145, 175, 205, 235, 214, 168],
        value2022: [175, 220, 235, 278, 246, 190]
      },
      income: {
        labels: ['旅游', '住宿', '餐饮', '零售', '交通'],
        values: [248, 168, 96, 59, 30]
      },
      touristTop: {
        labels: ['苏州市', '南京市', '无锡市', '扬州市', '常州市'],
        values: [82, 68, 51, 42, 34]
      },
      hotWords: [
        { name: '园林', percent: 20, size: 108 },
        { name: '古镇', percent: 10, size: 88 },
        { name: '夜景', percent: 7, size: 82 },
        { name: '秦淮河', percent: 6, size: 78 },
        { name: '赏花', percent: 4, size: 72 }
      ],
      summary: [
        { label: '2022旅游业收入', value: '248亿' },
        { label: '2022来访游客数', value: '302万人' },
        { label: '2022省内旅游支出', value: '96亿' }
      ],
      cityHotspot: [
        { name: '南京市', value: 302, style: { left: '34%', top: '24%' } },
        { name: '苏州市', value: 228, style: { left: '69%', top: '46%' } },
        { name: '无锡市', value: 166, style: { left: '57%', top: '42%' } },
        { name: '扬州市', value: 119, style: { left: '49%', top: '23%' } },
        { name: '徐州市', value: 101, style: { left: '25%', top: '12%' } }
      ]
    }
  }

  const currentRegion = ref((route.query.region as string) || '河南省')

  const currentData = computed(() => {
    return regionDataMap[currentRegion.value] || regionDataMap['河南省']
  })

  const getRankPercent = (value: number, list: Array<{ value: number }>) => {
    const max = Math.max(...list.map((item) => item.value))
    return (value / max) * 100
  }

  const goHome = () => {
    router.push('/home')
  }

  const changeRegion = (region: string) => {
    currentRegion.value = region
    router.replace({
      path: '/visual-screen',
      query: { region }
    })
  }

  const buildAgeChart = () => {
    if (!ageChartRef.value) return
    ageChart?.dispose()
    ageChart = echarts.init(ageChartRef.value)

    ageChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 30, right: 20, top: 30, bottom: 25 },
      xAxis: {
        type: 'category',
        data: currentData.value.age.labels,
        axisLine: { lineStyle: { color: '#5c6f9f' } },
        axisLabel: { color: '#d8e4ff' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: '#a9b8db' }
      },
      series: [
        {
          type: 'bar',
          barWidth: 22,
          data: currentData.value.age.values,
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ffd36b' },
              { offset: 1, color: '#6f8dff' }
            ])
          }
        }
      ]
    })
  }

  const buildYearTrendChart = () => {
    if (!yearTrendChartRef.value) return
    yearTrendChart?.dispose()
    yearTrendChart = echarts.init(yearTrendChartRef.value)

    yearTrendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: {
        top: 0,
        textStyle: { color: '#dbe7ff' }
      },
      grid: { left: 35, right: 20, top: 36, bottom: 25 },
      xAxis: {
        type: 'category',
        data: currentData.value.yearTrend.labels,
        axisLine: { lineStyle: { color: '#5c6f9f' } },
        axisLabel: { color: '#d8e4ff' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: '#a9b8db' }
      },
      series: [
        {
          name: '2021年',
          type: 'line',
          smooth: true,
          data: currentData.value.yearTrend.value2021
        },
        {
          name: '2022年',
          type: 'line',
          smooth: true,
          data: currentData.value.yearTrend.value2022
        }
      ]
    })
  }

  const buildIncomeChart = () => {
    if (!incomeChartRef.value) return
    incomeChart?.dispose()
    incomeChart = echarts.init(incomeChartRef.value)

    incomeChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 35, right: 20, top: 30, bottom: 30 },
      xAxis: {
        type: 'category',
        data: currentData.value.income.labels,
        axisLine: { lineStyle: { color: '#5c6f9f' } },
        axisLabel: { color: '#d8e4ff' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: '#a9b8db' }
      },
      series: [
        {
          type: 'bar',
          barWidth: 18,
          data: currentData.value.income.values,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: '#7c9dff'
          }
        }
      ]
    })
  }

  const buildTouristTopChart = () => {
    if (!touristTopChartRef.value) return
    touristTopChart?.dispose()
    touristTopChart = echarts.init(touristTopChartRef.value)

    touristTopChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 30, bottom: 50 },
      xAxis: {
        type: 'category',
        data: currentData.value.touristTop.labels,
        axisLabel: {
          color: '#d8e4ff',
          rotate: 20
        },
        axisLine: { lineStyle: { color: '#5c6f9f' } }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
        axisLabel: { color: '#a9b8db' }
      },
      series: [
        {
          type: 'line',
          smooth: true,
          symbolSize: 8,
          areaStyle: {
            color: 'rgba(109, 156, 255, 0.18)'
          },
          data: currentData.value.touristTop.values
        }
      ]
    })
  }

  const renderAllCharts = async () => {
    await nextTick()
    buildAgeChart()
    buildYearTrendChart()
    buildIncomeChart()
    buildTouristTopChart()
  }

  const handleResize = () => {
    ageChart?.resize()
    yearTrendChart?.resize()
    incomeChart?.resize()
    touristTopChart?.resize()
  }

  watch(
    () => currentRegion.value,
    () => {
      renderAllCharts()
    }
  )

  watch(
    () => route.query.region,
    (val) => {
      if (val && typeof val === 'string') {
        currentRegion.value = val
      }
    }
  )

  onMounted(() => {
    renderAllCharts()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    ageChart?.dispose()
    yearTrendChart?.dispose()
    incomeChart?.dispose()
    touristTopChart?.dispose()
  })
</script>

<style scoped lang="scss">
  .visual-screen-page {
    min-height: 100vh;
    padding: 20px;
    background:
      radial-gradient(circle at top, rgba(87, 112, 255, 0.18), transparent 35%),
      radial-gradient(circle at bottom right, rgba(255, 181, 92, 0.12), transparent 28%),
      linear-gradient(180deg, #09111f 0%, #0b1325 100%);
    color: #eef4ff;
    overflow: hidden;
  }

  .screen-header {
    height: 74px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    padding: 0 22px;
    border: 1px solid rgba(116, 148, 255, 0.18);
    background: rgba(10, 18, 36, 0.72);
    box-shadow: inset 0 0 20px rgba(89, 126, 255, 0.08);
    border-radius: 18px;
  }

  .screen-title {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .screen-subtitle {
    margin-top: 6px;
    font-size: 12px;
    color: #8ea0c9;
  }

  .region-switch {
    display: flex;
    gap: 12px;
  }

  .region-item {
    min-width: 90px;
    padding: 10px 16px;
    text-align: center;
    border-radius: 999px;
    border: 1px solid rgba(113, 144, 255, 0.2);
    background: rgba(255, 255, 255, 0.04);
    color: #b9caee;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .region-item:hover,
  .region-item.active {
    color: #fff;
    border-color: rgba(255, 201, 94, 0.6);
    background: rgba(255, 201, 94, 0.12);
    box-shadow: 0 0 18px rgba(255, 201, 94, 0.12);
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.05);
    color: #dce8ff;
    border: 1px solid rgba(255, 255, 255, 0.16);
  }

  .screen-body {
    display: grid;
    grid-template-columns: 360px 1fr 360px;
    gap: 18px;
    min-height: calc(100vh - 132px);
  }

  .side-column {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .screen-card {
    position: relative;
    padding: 18px;
    border-radius: 20px;
    border: 1px solid rgba(106, 130, 211, 0.18);
    background: linear-gradient(180deg, rgba(18, 31, 58, 0.86), rgba(11, 21, 40, 0.92));
    box-shadow:
      inset 0 0 24px rgba(123, 149, 255, 0.05),
      0 10px 30px rgba(0, 0, 0, 0.22);
  }

  .card-title {
    position: relative;
    margin-bottom: 16px;
    padding-left: 14px;
    font-size: 18px;
    font-weight: 600;
    color: #f6d37b;
  }

  .card-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px;
    width: 6px;
    height: 18px;
    border-radius: 4px;
    background: linear-gradient(180deg, #ffd56f 0%, #7ba1ff 100%);
  }

  .chart-card {
    flex: 1;
    min-height: 260px;
  }

  .chart-box {
    height: 240px;
  }

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .rank-top {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
  }

  .rank-no {
    width: 58px;
    color: #ffc85d;
    font-weight: 700;
  }

  .rank-name {
    flex: 1;
    color: #d9e6ff;
  }

  .rank-value {
    color: #a8b7d9;
  }

  .rank-bar {
    margin-top: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    overflow: hidden;
  }

  .rank-bar-inner {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #ffcd61 0%, #7c97ff 100%);
  }

  .center-column {
    min-width: 0;
  }

  .map-panel {
    height: 100%;
    padding: 20px;
    border-radius: 22px;
    border: 1px solid rgba(114, 138, 224, 0.22);
    background:
      radial-gradient(circle at center, rgba(255, 202, 96, 0.06), transparent 34%),
      linear-gradient(180deg, rgba(17, 29, 54, 0.9), rgba(8, 15, 28, 0.95));
    position: relative;
    overflow: hidden;
  }

  .map-title {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    color: #fff3c8;
    letter-spacing: 1px;
  }

  .map-subtitle {
    margin-top: 10px;
    text-align: center;
    color: #b3c1e1;
    font-size: 14px;
  }

  .pseudo-map {
    position: relative;
    height: calc(100% - 170px);
    margin-top: 24px;
    border-radius: 28px;
    background:
      radial-gradient(
        circle at center,
        rgba(120, 140, 255, 0.18),
        rgba(30, 39, 70, 0.2) 40%,
        transparent 70%
      ),
      linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
    border: 1px solid rgba(121, 146, 255, 0.14);
    overflow: hidden;
  }

  .pseudo-map::before {
    content: '';
    position: absolute;
    inset: 8% 10%;
    border-radius: 42% 58% 47% 53% / 41% 45% 55% 59%;
    border: 2px solid rgba(255, 205, 97, 0.65);
    box-shadow:
      0 0 30px rgba(255, 205, 97, 0.25),
      inset 0 0 30px rgba(120, 151, 255, 0.12);
    opacity: 0.95;
  }

  .map-glow {
    position: absolute;
    inset: 14% 18%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(95, 126, 255, 0.26), transparent 68%);
    filter: blur(10px);
  }

  .map-core {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 76px;
    font-weight: 800;
    letter-spacing: 10px;
    color: rgba(228, 238, 255, 0.12);
    text-shadow: 0 0 24px rgba(120, 146, 255, 0.2);
  }

  .city-marker {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .marker-index {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    background: radial-gradient(circle, #ffcd63 0%, #df8b2b 100%);
    box-shadow: 0 0 16px rgba(255, 201, 84, 0.38);
  }

  .marker-content {
    min-width: 110px;
    padding: 8px 10px;
    border-radius: 12px;
    background: rgba(15, 26, 50, 0.82);
    border: 1px solid rgba(132, 156, 255, 0.22);
  }

  .marker-name {
    color: #dce7ff;
    font-size: 14px;
    font-weight: 600;
  }

  .marker-value {
    margin-top: 4px;
    color: #ffcf6c;
    font-size: 20px;
    font-weight: 700;
  }

  .center-summary {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .summary-card {
    padding: 16px;
    border-radius: 16px;
    text-align: center;
    border: 1px solid rgba(116, 145, 255, 0.16);
    background: rgba(255, 255, 255, 0.04);
  }

  .summary-value {
    font-size: 28px;
    font-weight: 800;
    color: #ffd67f;
  }

  .summary-label {
    margin-top: 8px;
    font-size: 13px;
    color: #b8c7e7;
  }

  .hotword-wrap {
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    flex-wrap: wrap;
    padding: 8px 0 6px;
  }

  .hotword-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #eaf1ff;
    background: radial-gradient(circle, rgba(255, 201, 96, 0.18), rgba(101, 128, 255, 0.14));
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.04);
    text-align: center;
  }

  .hotword-item span {
    font-size: 15px;
    font-weight: 700;
  }

  .hotword-item small {
    margin-top: 4px;
    font-size: 13px;
    color: #ffc968;
  }

  @media (max-width: 1440px) {
    .screen-body {
      grid-template-columns: 320px 1fr 320px;
    }

    .map-core {
      font-size: 56px;
    }
  }

  @media (max-width: 1200px) {
    .screen-body {
      grid-template-columns: 1fr;
    }

    .pseudo-map {
      min-height: 520px;
    }
  }
</style>

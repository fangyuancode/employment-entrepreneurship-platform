<template>
  <div class="job-analysis-page">
    <div class="top-panel">
      <el-card shadow="never" class="filter-card">
        <div class="filter-header">
          <div>
            <h2 class="page-title">岗位数据分析</h2>
            <p class="page-desc">基于岗位数据库进行统计分析与 AI 推荐</p>
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleQuery">查询分析</el-button>
            <el-button @click="handleReset">重置条件</el-button>
          </div>
        </div>

        <el-form :inline="true" :model="queryForm" class="filter-form">
          <el-form-item label="关键词">
            <el-input v-model="queryForm.keyword" placeholder="职位 / 公司 / 技能" clearable style="width: 220px" />
          </el-form-item>
          <el-form-item label="城市">
            <el-input v-model="queryForm.city" placeholder="如：北京" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="分类">
            <el-input v-model="queryForm.categoryMain" placeholder="如：后端开发" clearable style="width: 180px" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="metric-grid">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">岗位总数</div>
        <div class="metric-value">{{ dashboard.jobCount }}</div>
      </el-card>
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">公司总数</div>
        <div class="metric-value">{{ dashboard.companyCount }}</div>
      </el-card>
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">城市总数</div>
        <div class="metric-value">{{ dashboard.cityCount }}</div>
      </el-card>
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">分类总数</div>
        <div class="metric-value">{{ dashboard.categoryCount }}</div>
      </el-card>
    </div>

    <div class="chart-grid">
      <el-card shadow="never" class="chart-card">
        <template #header><span>热门岗位 Top10</span></template>
        <div ref="topJobsRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>热门公司 Top10</span></template>
        <div ref="topCompaniesRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>学历要求分布</span></template>
        <div ref="degreeRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>经验要求分布</span></template>
        <div ref="experienceRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card chart-card-wide">
        <template #header><span>城市岗位分布</span></template>
        <div ref="cityRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card chart-card-wide">
        <template #header><span>一级分类分布</span></template>
        <div ref="categoryRef" class="chart-box"></div>
      </el-card>
    </div>

    <div class="ai-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never" class="ai-card">
            <template #header><span>AI 推荐输入</span></template>

            <el-form :model="aiForm" label-width="88px">
              <el-form-item label="目标岗位">
                <el-input v-model="aiForm.targetJob" placeholder="如：Java开发工程师" clearable />
              </el-form-item>
              <el-form-item label="学历">
                <el-input v-model="aiForm.degree" placeholder="如：本科" clearable />
              </el-form-item>
              <el-form-item label="经验">
                <el-input v-model="aiForm.experience" placeholder="如：1-3年" clearable />
              </el-form-item>
              <el-form-item label="技能">
                <el-input v-model="aiForm.skills" type="textarea" :rows="4" placeholder="如：Java, Spring Boot, MySQL, Redis" />
              </el-form-item>
              <el-form-item label="目标城市">
                <el-input v-model="aiForm.city" placeholder="如：北京" clearable />
              </el-form-item>

              <el-form-item label-width="40px">
                <el-button @click="handleFillExample">一键填充示例</el-button>
                <el-button type="primary" :loading="aiLoading" @click="handleAiRecommend">
                  生成 AI 推荐
                </el-button>
                <el-button @click="handleAiReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-card shadow="never" class="ai-card">
            <template #header><span>AI 推荐结果</span></template>

            <div v-loading="aiLoading" class="ai-result">
              <template v-if="aiResult.summary">
                <div class="result-block">
                  <div class="block-title">推荐总结</div>
                  <div class="summary-box">{{ aiResult.summary }}</div>
                </div>

                <div class="result-block">
                  <div class="block-title">推荐技能</div>
                  <div class="tag-wrap">
                    <el-tag v-for="(item, index) in aiResult.recommendedSkills" :key="'skill-' + index" class="tag-item">
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">推荐企业</div>
                  <div class="tag-wrap">
                    <el-tag v-for="(item, index) in aiResult.recommendedCompanies" :key="'company-' + index" type="success" effect="plain" class="tag-item">
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">推荐城市</div>
                  <div class="tag-wrap">
                    <el-tag v-for="(item, index) in aiResult.recommendedCities" :key="'city-' + index" type="warning" effect="plain" class="tag-item">
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">投递关键词</div>
                  <div class="tag-wrap">
                    <el-tag v-for="(item, index) in aiResult.deliveryKeywords" :key="'keyword-' + index" type="info" effect="plain" class="tag-item">
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">学习路径</div>
                  <el-timeline>
                    <el-timeline-item v-for="(item, index) in aiResult.learningPath" :key="'path-' + index">
                      {{ item }}
                    </el-timeline-item>
                  </el-timeline>
                </div>

                <div class="result-block">
                  <div class="block-title">建议事项</div>
                  <ul class="suggestion-list">
                    <li v-for="(item, index) in aiResult.suggestions" :key="'suggestion-' + index">
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </template>

              <el-empty v-else description="请输入目标岗位信息后生成 AI 推荐" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import {
  getJobAiRecommend,
  getJobDashboard,
  type AiRecommendData,
  type DashboardData
} from '@/api/job-analysis'

const queryForm = reactive({
  keyword: '',
  city: '',
  categoryMain: ''
})

const aiForm = reactive({
  targetJob: '',
  degree: '',
  experience: '',
  skills: '',
  city: ''
})

const dashboard = reactive<DashboardData>({
  jobCount: 0,
  companyCount: 0,
  cityCount: 0,
  categoryCount: 0,
  topJobs: [],
  topCompanies: [],
  degreeDistribution: [],
  experienceDistribution: [],
  categoryDistribution: [],
  cityDistribution: []
})

const aiResult = reactive<AiRecommendData>({
  targetJob: '',
  recommendedSkills: [],
  recommendedCompanies: [],
  recommendedCities: [],
  deliveryKeywords: [],
  learningPath: [],
  summary: '',
  suggestions: []
})

const aiLoading = ref(false)
const loading = ref(false)

const topJobsRef = ref<HTMLDivElement | null>(null)
const topCompaniesRef = ref<HTMLDivElement | null>(null)
const degreeRef = ref<HTMLDivElement | null>(null)
const experienceRef = ref<HTMLDivElement | null>(null)
const categoryRef = ref<HTMLDivElement | null>(null)
const cityRef = ref<HTMLDivElement | null>(null)

let topJobsChart: echarts.ECharts | null = null
let topCompaniesChart: echarts.ECharts | null = null
let degreeChart: echarts.ECharts | null = null
let experienceChart: echarts.ECharts | null = null
let categoryChart: echarts.ECharts | null = null
let cityChart: echarts.ECharts | null = null

const initCharts = () => {
  if (topJobsRef.value) topJobsChart = echarts.init(topJobsRef.value)
  if (topCompaniesRef.value) topCompaniesChart = echarts.init(topCompaniesRef.value)
  if (degreeRef.value) degreeChart = echarts.init(degreeRef.value)
  if (experienceRef.value) experienceChart = echarts.init(experienceRef.value)
  if (categoryRef.value) categoryChart = echarts.init(categoryRef.value)
  if (cityRef.value) cityChart = echarts.init(cityRef.value)
}

const renderCharts = () => {
  topJobsChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dashboard.topJobs.map((i) => i.name),
      axisLabel: { rotate: 25 }
    },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: dashboard.topJobs.map((i) => i.value), barMaxWidth: 38 }]
  })

  topCompaniesChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dashboard.topCompanies.map((i) => i.name),
      axisLabel: { rotate: 25 }
    },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: dashboard.topCompanies.map((i) => i.value), barMaxWidth: 38 }]
  })

  degreeChart?.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        data: dashboard.degreeDistribution
      }
    ]
  })

  experienceChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dashboard.experienceDistribution.map((i) => i.name),
      axisLabel: { rotate: 20 }
    },
    yAxis: { type: 'value' },
    series: [
      { type: 'line', smooth: true, data: dashboard.experienceDistribution.map((i) => i.value) }
    ]
  })

  categoryChart?.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: '65%',
        data: dashboard.categoryDistribution
      }
    ]
  })

  cityChart?.setOption({
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: dashboard.cityDistribution.map((i) => i.name),
      axisLabel: { rotate: 25 }
    },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: dashboard.cityDistribution.map((i) => i.value), barMaxWidth: 42 }]
  })
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const data = (await getJobDashboard({ ...queryForm })) || {}

    dashboard.jobCount = data.jobCount || 0
    dashboard.companyCount = data.companyCount || 0
    dashboard.cityCount = data.cityCount || 0
    dashboard.categoryCount = data.categoryCount || 0

    dashboard.topJobs = data.topJobs || []
    dashboard.topCompanies = data.topCompanies || []
    dashboard.degreeDistribution = data.degreeDistribution || []
    dashboard.experienceDistribution =
      data.experienceDistribution.map((item) => {
        if (item.name) {
          return item
        } else {
          return {
            name: '无要求',
            value: item.value
          }
        }
      }) || []
    dashboard.categoryDistribution = data.categoryDistribution || []
    dashboard.cityDistribution = data.cityDistribution || []

    await nextTick()
    renderCharts()
  } catch (error) {
    console.error('岗位分析数据加载失败：', error)
    ElMessage.error('岗位分析数据加载失败')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  loadDashboard()
}

const handleReset = () => {
  queryForm.keyword = ''
  queryForm.city = ''
  queryForm.categoryMain = ''
  loadDashboard()
}

const handleAiRecommend = async () => {
  aiLoading.value = true
  try {
    const data = (await getJobAiRecommend({ ...aiForm })) || {}

    aiResult.targetJob = data.targetJob || ''
    aiResult.recommendedSkills = data.recommendedSkills || []
    aiResult.recommendedCompanies = data.recommendedCompanies || []
    aiResult.recommendedCities = data.recommendedCities || []
    aiResult.deliveryKeywords = data.deliveryKeywords || []
    aiResult.learningPath = data.learningPath || []
    aiResult.summary = data.summary || ''
    aiResult.suggestions = data.suggestions || []
  } catch (error) {
    console.error('AI推荐生成失败：', error)
    ElMessage.error('AI推荐生成失败')
  } finally {
    aiLoading.value = false
  }
}
const handleFillExample = () => {
  aiForm.targetJob = 'Java开发工程师'
  aiForm.degree = '本科'
  aiForm.experience = '1-3年'
  aiForm.skills = 'Java, Spring Boot, Spring Cloud, MySQL, Redis, RabbitMQ, Docker, Git'
  aiForm.city = '北京'

  ElMessage.success('已自动填充示例内容')
}
const handleAiReset = () => {
  aiForm.targetJob = ''
  aiForm.degree = ''
  aiForm.experience = ''
  aiForm.skills = ''
  aiForm.city = ''

  aiResult.targetJob = ''
  aiResult.recommendedSkills = []
  aiResult.recommendedCompanies = []
  aiResult.recommendedCities = []
  aiResult.deliveryKeywords = []
  aiResult.learningPath = []
  aiResult.summary = ''
  aiResult.suggestions = []
}

const resizeCharts = () => {
  topJobsChart?.resize()
  topCompaniesChart?.resize()
  degreeChart?.resize()
  experienceChart?.resize()
  categoryChart?.resize()
  cityChart?.resize()
}

onMounted(async () => {
  await nextTick()
  initCharts()
  await loadDashboard()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  topJobsChart?.dispose()
  topCompaniesChart?.dispose()
  degreeChart?.dispose()
  experienceChart?.dispose()
  categoryChart?.dispose()
  cityChart?.dispose()
})
</script>

<style scoped>
.job-analysis-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
  box-sizing: border-box;
}

.filter-card,
.metric-card,
.chart-card,
.ai-card {
  border-radius: 14px;
}

.filter-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.page-title {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: #303133;
}

.page-desc {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.metric-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-card {
  padding: 8px 4px;
}

.metric-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
}

.metric-value {
  font-size: 30px;
  font-weight: 700;
  color: #409eff;
}

.chart-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chart-card-wide {
  grid-column: span 2;
}

.chart-box {
  width: 100%;
  height: 320px;
}

.ai-section {
  margin-top: 20px;
}

.ai-result {
  min-height: 420px;
}

.result-block + .result-block {
  margin-top: 18px;
}

.block-title {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #303133;
}

.summary-box {
  padding: 14px;
  border-radius: 12px;
  background: #f8fbff;
  border: 1px solid #d9ecff;
  line-height: 1.8;
  color: #606266;
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  margin-right: 0;
}

.suggestion-list {
  margin: 0;
  padding-left: 18px;
  line-height: 1.9;
  color: #606266;
}

@media screen and (max-width: 1200px) {
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-grid {
    grid-template-columns: 1fr;
  }

  .chart-card-wide {
    grid-column: span 1;
  }
}

@media screen and (max-width: 768px) {
  .job-analysis-page {
    padding: 12px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .chart-box {
    height: 280px;
  }
}
</style>

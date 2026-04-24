<template>
  <div class="quantity-page">
    <el-card shadow="never" class="top-card">
      <div class="header-row">
        <div>
          <div class="page-title">岗位数据挖掘分析中心</div>
          <div class="page-desc">
            基于岗位数据库进行就业分析、创业机会挖掘、技能热点识别与职业规划建议
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="loadOverview">开始分析</el-button>
          <el-button @click="resetQuery">重置条件</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="职位 / 公司 / 技能"
            clearable
            style="width: 220px"
          />
        </el-form-item>

        <el-form-item label="城市">
          <el-select
            v-model="queryForm.city"
            filterable
            clearable
            placeholder="请选择城市"
            style="width: 180px"
          >
            <el-option v-for="item in options.cities" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="一级分类">
          <el-select
            v-model="queryForm.categoryMain"
            filterable
            clearable
            placeholder="请选择分类"
            style="width: 180px"
          >
            <el-option v-for="item in options.categories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="学历">
          <el-select
            v-model="queryForm.degree"
            filterable
            clearable
            placeholder="请选择学历"
            style="width: 160px"
          >
            <el-option v-for="item in options.degrees" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="经验">
          <el-select
            v-model="queryForm.experience"
            filterable
            clearable
            placeholder="请选择经验"
            style="width: 180px"
          >
            <el-option
              v-for="item in options.experiences"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="metric-grid" v-loading="loading" element-loading-text="加载中...">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">岗位总数</div>
        <div class="metric-value">{{ overview.metrics.jobCount || 0 }}</div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">企业总数</div>
        <div class="metric-value">{{ overview.metrics.companyCount || 0 }}</div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">覆盖城市</div>
        <div class="metric-value">{{ overview.metrics.cityCount || 0 }}</div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">一级类目</div>
        <div class="metric-value">{{ overview.metrics.categoryCount || 0 }}</div>
      </el-card>
    </div>

    <div class="chart-grid">
      <el-card shadow="never" class="chart-card">
        <template #header><span>热门岗位 Top10</span></template>
        <div ref="topJobsRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>热门城市 Top12</span></template>
        <div ref="topCitiesRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>热门一级分类</span></template>
        <div ref="topCategoriesRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>技能热点 Top20</span></template>
        <div ref="skillHotRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card chart-card-wide">
        <template #header><span>城市平均薪资（K）</span></template>
        <div ref="salaryCityRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card chart-card-wide">
        <template #header><span>一级分类平均薪资（K）</span></template>
        <div ref="salaryCategoryRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>学历分布</span></template>
        <div ref="degreeRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header><span>经验分布</span></template>
        <div ref="experienceRef" class="chart-box"></div>
      </el-card>
    </div>

    <el-row :gutter="20" class="insight-row">
      <el-col :span="12">
        <el-card shadow="never" class="insight-card">
          <template #header><span>就业洞察</span></template>
          <div class="insight-list">
            <div
              v-for="(item, index) in overview.employmentInsights"
              :key="'emp-' + index"
              class="insight-item"
            >
              {{ index + 1 }}. {{ item }}
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="never" class="insight-card">
          <template #header><span>创业洞察</span></template>
          <div class="insight-list">
            <div
              v-for="(item, index) in overview.entrepreneurshipInsights"
              :key="'ent-' + index"
              class="insight-item"
            >
              {{ index + 1 }}. {{ item }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="startup-card">
      <template #header><span>创业机会赛道推荐</span></template>
      <el-table :data="overview.startupOpportunities" border stripe>
        <el-table-column prop="name" label="赛道" min-width="120" />
        <el-table-column prop="postCount" label="岗位量" min-width="100" />
        <el-table-column prop="avgSalaryK" label="平均薪资(K)" min-width="120" />
        <el-table-column prop="startupRatio" label="中小企业占比(%)" min-width="140" />
        <el-table-column prop="companyCount" label="企业数" min-width="100" />
        <el-table-column prop="opportunityScore" label="机会分" min-width="100" />
        <el-table-column prop="suggestion" label="创业建议" min-width="320" show-overflow-tooltip />
      </el-table>
    </el-card>

    <div class="career-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never" class="career-card">
            <template #header><span>个人就业/创业规划输入</span></template>

            <el-form :model="careerForm" label-width="88px">
              <el-form-item label="目标岗位">
                <el-input v-model="careerForm.targetJob" placeholder="如：数据分析师" clearable />
              </el-form-item>

              <el-form-item label="目标城市">
                <el-select
                  v-model="careerForm.city"
                  filterable
                  clearable
                  placeholder="请选择城市"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in options.cities"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="学历">
                <el-select
                  v-model="careerForm.degree"
                  filterable
                  clearable
                  placeholder="请选择学历"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in options.degrees"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="经验">
                <el-select
                  v-model="careerForm.experience"
                  filterable
                  clearable
                  placeholder="请选择经验"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in options.experiences"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="已有技能">
                <el-input
                  v-model="careerForm.skills"
                  type="textarea"
                  :rows="4"
                  placeholder="如：Python, SQL, Excel, Tableau, 数据建模"
                />
              </el-form-item>

              <el-form-item>
                <el-button @click="fillExample">一键示例</el-button>
                <el-button type="primary" :loading="careerLoading" @click="loadCareerPlan">
                  生成建议
                </el-button>
                <el-button @click="resetCareer">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-card shadow="never" class="career-card">
            <template #header><span>职业规划与创业建议结果</span></template>

            <div v-loading="careerLoading" class="career-result">
              <template v-if="careerResult.summary">
                <div class="result-block">
                  <div class="block-title">综合总结</div>
                  <div class="summary-box">{{ careerResult.summary }}</div>
                </div>

                <div class="result-inline-grid">
                  <div class="mini-card">
                    <div class="mini-label">岗位匹配度</div>
                    <div class="mini-value">{{ careerResult.matchScore || 0 }} 分</div>
                  </div>
                  <div class="mini-card">
                    <div class="mini-label">平均薪资</div>
                    <div class="mini-value"
                      >{{ careerResult.salaryStats?.avgSalaryK || '-' }} K</div
                    >
                  </div>
                  <div class="mini-card">
                    <div class="mini-label">最高薪资</div>
                    <div class="mini-value"
                      >{{ careerResult.salaryStats?.maxSalaryK || '-' }} K</div
                    >
                  </div>
                  <div class="mini-card">
                    <div class="mini-label">样本量</div>
                    <div class="mini-value">{{ careerResult.salaryStats?.sampleCount || 0 }}</div>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">高频核心技能</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in careerResult.hotSkills"
                      :key="'skill-' + index"
                      class="tag-item"
                    >
                      {{ item.name }}（{{ item.value }}）
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">推荐企业</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in careerResult.recommendedCompanies"
                      :key="'company-' + index"
                      type="success"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">推荐城市</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in careerResult.recommendedCities"
                      :key="'city-' + index"
                      type="warning"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">简历关键词</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in careerResult.resumeKeywords"
                      :key="'keyword-' + index"
                      type="info"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">学习成长路径</div>
                  <el-timeline>
                    <el-timeline-item
                      v-for="(item, index) in careerResult.learningPath"
                      :key="'path-' + index"
                    >
                      {{ item }}
                    </el-timeline-item>
                  </el-timeline>
                </div>

                <div class="result-block">
                  <div class="block-title">行动建议</div>
                  <ul class="suggestion-list">
                    <li v-for="(item, index) in careerResult.actions" :key="'act-' + index">
                      {{ item }}
                    </li>
                  </ul>
                </div>

                <div class="result-block">
                  <div class="block-title">创业方向建议</div>
                  <ul class="suggestion-list">
                    <li
                      v-for="(item, index) in careerResult.startupDirections"
                      :key="'startup-' + index"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </template>

              <el-empty v-else description="请输入目标信息后生成职业规划建议" />
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
    getCareerPlan,
    getJobMiningOptions,
    getJobMiningOverview,
    type CareerPlanData,
    type MiningOverviewData,
    type MiningOptions
  } from '@/api/job-mining'

  const queryForm = reactive({
    keyword: '',
    city: '',
    categoryMain: '',
    degree: '',
    experience: ''
  })

  const careerForm = reactive({
    targetJob: '',
    city: '',
    degree: '',
    experience: '',
    skills: ''
  })

  const options = reactive<MiningOptions>({
    cities: [],
    categories: [],
    degrees: [],
    experiences: []
  })

  const overview = reactive<MiningOverviewData>({
    metrics: {
      jobCount: 0,
      companyCount: 0,
      cityCount: 0,
      categoryCount: 0
    },
    topJobs: [],
    topCities: [],
    topCategories: [],
    degreeDistribution: [],
    experienceDistribution: [],
    salaryByCity: [],
    salaryByCategory: [],
    skillHotspots: [],
    startupOpportunities: [],
    employmentInsights: [],
    entrepreneurshipInsights: []
  })

  const careerResult = reactive<CareerPlanData>({
    targetJob: '',
    matchScore: 0,
    hotSkills: [],
    recommendedCompanies: [],
    recommendedCities: [],
    resumeKeywords: [],
    learningPath: [],
    actions: [],
    startupDirections: [],
    salaryStats: {},
    summary: ''
  })

  const loading = ref(false)
  const careerLoading = ref(false)

  const topJobsRef = ref<HTMLDivElement | null>(null)
  const topCitiesRef = ref<HTMLDivElement | null>(null)
  const topCategoriesRef = ref<HTMLDivElement | null>(null)
  const skillHotRef = ref<HTMLDivElement | null>(null)
  const salaryCityRef = ref<HTMLDivElement | null>(null)
  const salaryCategoryRef = ref<HTMLDivElement | null>(null)
  const degreeRef = ref<HTMLDivElement | null>(null)
  const experienceRef = ref<HTMLDivElement | null>(null)

  let topJobsChart: echarts.ECharts | null = null
  let topCitiesChart: echarts.ECharts | null = null
  let topCategoriesChart: echarts.ECharts | null = null
  let skillHotChart: echarts.ECharts | null = null
  let salaryCityChart: echarts.ECharts | null = null
  let salaryCategoryChart: echarts.ECharts | null = null
  let degreeChart: echarts.ECharts | null = null
  let experienceChart: echarts.ECharts | null = null

  const initCharts = () => {
    if (topJobsRef.value) topJobsChart = echarts.init(topJobsRef.value)
    if (topCitiesRef.value) topCitiesChart = echarts.init(topCitiesRef.value)
    if (topCategoriesRef.value) topCategoriesChart = echarts.init(topCategoriesRef.value)
    if (skillHotRef.value) skillHotChart = echarts.init(skillHotRef.value)
    if (salaryCityRef.value) salaryCityChart = echarts.init(salaryCityRef.value)
    if (salaryCategoryRef.value) salaryCategoryChart = echarts.init(salaryCategoryRef.value)
    if (degreeRef.value) degreeChart = echarts.init(degreeRef.value)
    if (experienceRef.value) experienceChart = echarts.init(experienceRef.value)
  }

  const renderCharts = () => {
    topJobsChart?.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: overview.topJobs.map((i) => i.name),
        axisLabel: { rotate: 20 }
      },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: overview.topJobs.map((i) => i.value), barMaxWidth: 40 }]
    })

    topCitiesChart?.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: overview.topCities.map((i) => i.name),
        axisLabel: { rotate: 20 }
      },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: overview.topCities.map((i) => i.value), barMaxWidth: 40 }]
    })

    topCategoriesChart?.setOption({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: '68%',
          data: overview.topCategories
        }
      ]
    })

    skillHotChart?.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 20, top: 20, bottom: 20 },
      xAxis: { type: 'value' },
      yAxis: {
        type: 'category',
        data: overview.skillHotspots.map((i) => i.name).reverse()
      },
      series: [
        {
          type: 'bar',
          data: overview.skillHotspots.map((i) => i.value).reverse(),
          barMaxWidth: 24
        }
      ]
    })

    salaryCityChart?.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: overview.salaryByCity.map((i) => i.name),
        axisLabel: { rotate: 20 }
      },
      yAxis: { type: 'value', name: 'K' },
      series: [{ type: 'line', smooth: true, data: overview.salaryByCity.map((i) => i.value) }]
    })

    salaryCategoryChart?.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: overview.salaryByCategory.map((i) => i.name),
        axisLabel: { rotate: 20 }
      },
      yAxis: { type: 'value', name: 'K' },
      series: [
        { type: 'bar', data: overview.salaryByCategory.map((i) => i.value), barMaxWidth: 42 }
      ]
    })

    degreeChart?.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['38%', '68%'],
          data: overview.degreeDistribution
        }
      ]
    })

    experienceChart?.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['38%', '68%'],
          data: overview.experienceDistribution
        }
      ]
    })
  }

  const loadOptions = async () => {
    try {
      const res = await getJobMiningOptions()
      const data = res?.data?.data || {}
      options.cities = data.cities || []
      options.categories = data.categories || []
      options.degrees = data.degrees || []
      options.experiences = data.experiences || []
    } catch (error) {
      console.error('加载筛选项失败：', error)
    }
  }

  const loadOverview = async () => {
    loading.value = true
    try {
      const res = await getJobMiningOverview({ ...queryForm })
      const data = res?.data?.data || {}

      overview.metrics = data.metrics || {
        jobCount: 0,
        companyCount: 0,
        cityCount: 0,
        categoryCount: 0
      }
      overview.topJobs = data.topJobs || []
      overview.topCities = data.topCities || []
      overview.topCategories = data.topCategories || []
      overview.degreeDistribution = data.degreeDistribution || []
      overview.experienceDistribution = data.experienceDistribution || []
      overview.salaryByCity = data.salaryByCity || []
      overview.salaryByCategory = data.salaryByCategory || []
      overview.skillHotspots = data.skillHotspots || []
      overview.startupOpportunities = data.startupOpportunities || []
      overview.employmentInsights = data.employmentInsights || []
      overview.entrepreneurshipInsights = data.entrepreneurshipInsights || []

      await nextTick()
      renderCharts()
      ElMessage.success('数据挖掘分析完成')
    } catch (error) {
      console.error('加载数据挖掘分析失败：', error)
      ElMessage.error('加载数据挖掘分析失败')
    } finally {
      loading.value = false
    }
  }

  const loadCareerPlan = async () => {
    careerLoading.value = true
    try {
      const res = await getCareerPlan({ ...careerForm })
      const data = res?.data?.data || {}

      careerResult.targetJob = data.targetJob || ''
      careerResult.matchScore = data.matchScore || 0
      careerResult.hotSkills = data.hotSkills || []
      careerResult.recommendedCompanies = data.recommendedCompanies || []
      careerResult.recommendedCities = data.recommendedCities || []
      careerResult.resumeKeywords = data.resumeKeywords || []
      careerResult.learningPath = data.learningPath || []
      careerResult.actions = data.actions || []
      careerResult.startupDirections = data.startupDirections || []
      careerResult.salaryStats = data.salaryStats || {}
      careerResult.summary = data.summary || ''
      ElMessage.success('职业规划建议生成成功')
    } catch (error) {
      console.error('生成职业规划失败：', error)
      ElMessage.error('生成职业规划失败')
    } finally {
      careerLoading.value = false
    }
  }

  const resetQuery = () => {
    queryForm.keyword = ''
    queryForm.city = ''
    queryForm.categoryMain = ''
    queryForm.degree = ''
    queryForm.experience = ''
    loadOverview()
  }

  const fillExample = () => {
    careerForm.targetJob = 'java工程师'
    careerForm.city = '北京'
    careerForm.degree = '本科'
    careerForm.experience = '1-3年'
    careerForm.skills = 'Python, SQL, Excel, Tableau, 数据可视化, 统计分析'
    ElMessage.success('已填充示例')
  }

  const resetCareer = () => {
    careerForm.targetJob = ''
    careerForm.city = ''
    careerForm.degree = ''
    careerForm.experience = ''
    careerForm.skills = ''

    careerResult.targetJob = ''
    careerResult.matchScore = 0
    careerResult.hotSkills = []
    careerResult.recommendedCompanies = []
    careerResult.recommendedCities = []
    careerResult.resumeKeywords = []
    careerResult.learningPath = []
    careerResult.actions = []
    careerResult.startupDirections = []
    careerResult.salaryStats = {}
    careerResult.summary = ''
  }

  const resizeCharts = () => {
    topJobsChart?.resize()
    topCitiesChart?.resize()
    topCategoriesChart?.resize()
    skillHotChart?.resize()
    salaryCityChart?.resize()
    salaryCategoryChart?.resize()
    degreeChart?.resize()
    experienceChart?.resize()
  }

  onMounted(async () => {
    await nextTick()
    initCharts()
    await loadOptions()
    await loadOverview()
    window.addEventListener('resize', resizeCharts)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCharts)
    topJobsChart?.dispose()
    topCitiesChart?.dispose()
    topCategoriesChart?.dispose()
    skillHotChart?.dispose()
    salaryCityChart?.dispose()
    salaryCategoryChart?.dispose()
    degreeChart?.dispose()
    experienceChart?.dispose()
  })
</script>

<style scoped lang="scss">
  .quantity-page {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100%;
    box-sizing: border-box;
  }

  .top-card,
  .metric-card,
  .chart-card,
  .insight-card,
  .startup-card,
  .career-card {
    border-radius: 16px;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    margin-bottom: 8px;
  }

  .page-desc {
    font-size: 14px;
    color: #909399;
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
    color: #909399;
    font-size: 14px;
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

  .insight-row {
    margin-top: 20px;
  }

  .insight-card {
    min-height: 220px;
  }

  .insight-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .insight-item {
    padding: 12px 14px;
    background: #f8fbff;
    border: 1px solid #d9ecff;
    border-radius: 12px;
    color: #606266;
    line-height: 1.8;
  }

  .startup-card {
    margin-top: 20px;
  }

  .career-section {
    margin-top: 20px;
  }

  .career-result {
    min-height: 480px;
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

  .result-inline-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .mini-card {
    padding: 14px 12px;
    border-radius: 12px;
    background: #fafafa;
    border: 1px solid #ebeef5;
  }

  .mini-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .mini-value {
    font-size: 22px;
    font-weight: 700;
    color: #303133;
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

    .result-inline-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>

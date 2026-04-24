<template>
  <div class="job-skill-graph-page">
    <el-card shadow="never" class="top-card">
      <div class="top-header">
        <div>
          <h2 class="page-title">岗位技能图谱</h2>
          <p class="page-desc"
            >展示岗位、技能、公司、城市、分类之间的关系，并结合 AI 增强关系说明</p
          >
        </div>
        <div class="top-actions">
          <el-button type="primary" @click="handleQuery">查询图谱</el-button>
          <el-button @click="handleReset">重置</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="岗位 / 技能 / 公司"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="城市">
          <el-select
            v-model="queryForm.city"
            placeholder="请选择城市"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option v-for="item in options.cities" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select
            v-model="queryForm.categoryMain"
            placeholder="请选择分类"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="item in options.categoryMains"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="数量">
          <el-select v-model="queryForm.limit" style="width: 120px">
            <el-option :value="150" label="150" />
            <el-option :value="300" label="300" />
            <el-option :value="500" label="500" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="metric-grid">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">岗位记录数</div>
        <div class="metric-value">{{ graphData.jobCount }}</div>
      </el-card>
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">技能总数</div>
        <div class="metric-value">{{ graphData.skillCount }}</div>
      </el-card>
      <el-card shadow="hover" class="metric-card">
        <div class="metric-label">公司总数</div>
        <div class="metric-value">{{ graphData.companyCount }}</div>
      </el-card>
    </div>

    <div class="content-grid">
      <el-card shadow="never" class="graph-card">
        <template #header>
          <div class="card-header">
            <div class="card-title-wrap">
              <span>岗位技能关系图谱</span>
              <el-tag type="primary" effect="light">技能 / 岗位 / 公司 / 城市 / 分类</el-tag>
            </div>

            <div class="card-tools">
              <el-button type="primary" link @click="handleOpenGraphPage">
                在新页面打开图谱
              </el-button>
            </div>
          </div>
        </template>
        <div v-loading="loading" ref="graphRef" class="graph-box"></div>
      </el-card>

      <div class="right-panels">
        <el-card shadow="never" class="chart-card">
          <template #header><span>技能 Top 榜</span></template>
          <div ref="topSkillsRef" class="chart-box"></div>
        </el-card>

        <el-card shadow="never" class="chart-card">
          <template #header><span>分类分布</span></template>
          <div ref="categoryRef" class="chart-box"></div>
        </el-card>
      </div>
    </div>

    <div class="recommend-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="never" class="recommend-card">
            <template #header><span>智能推荐输入</span></template>

            <el-form :model="recommendForm" label-width="88px">
              <el-form-item label="目标岗位">
                <el-input
                  v-model="recommendForm.targetJob"
                  placeholder="如：Java开发工程师"
                  clearable
                />
              </el-form-item>

              <el-form-item label="已有技能">
                <el-input
                  v-model="recommendForm.skills"
                  type="textarea"
                  :rows="4"
                  placeholder="如：Java, Spring Boot, MySQL, Redis"
                />
              </el-form-item>

              <el-form-item label="城市">
                <el-select v-model="recommendForm.city" clearable filterable style="width: 100%">
                  <el-option
                    v-for="item in options.cities"
                    :key="'r-city-' + item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="分类">
                <el-select
                  v-model="recommendForm.categoryMain"
                  clearable
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in options.categoryMains"
                    :key="'r-cate-' + item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label-width="40px">
                <el-button @click="handleFillExample">一键填充示例</el-button>
                <el-button type="primary" :loading="recommendLoading" @click="handleRecommend">
                  生成推荐
                </el-button>

                <el-button @click="handleRecommendReset">重置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <el-col :span="16">
          <el-card shadow="never" class="recommend-card">
            <template #header><span>智能推荐结果</span></template>

            <div
              v-loading="recommendLoading"
              element-loading-text="加载中..."
              class="recommend-result"
            >
              <template v-if="recommendResult.summary">
                <div class="result-block">
                  <div class="block-title">推荐总结</div>
                  <div class="summary-box">{{ recommendResult.summary }}</div>
                </div>

                <div class="result-block">
                  <div class="block-title">核心技能</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in recommendResult.coreSkills"
                      :key="'core-' + index"
                      class="tag-item"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">建议补齐技能</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in recommendResult.missingSkills"
                      :key="'missing-' + index"
                      type="warning"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">相关岗位</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in recommendResult.relatedJobs"
                      :key="'job-' + index"
                      type="success"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">推荐企业</div>
                  <div class="tag-wrap">
                    <el-tag
                      v-for="(item, index) in recommendResult.relatedCompanies"
                      :key="'company-' + index"
                      type="info"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="result-block">
                  <div class="block-title">行动建议</div>
                  <ul class="suggestion-list">
                    <li
                      v-for="(item, index) in recommendResult.suggestions"
                      :key="'suggestion-' + index"
                    >
                      {{ item }}
                    </li>
                  </ul>
                </div>
              </template>

              <el-empty v-else description="请输入岗位信息后生成智能推荐" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-drawer v-model="relationDrawerVisible" title="节点关系详情" size="40%">
      <div class="drawer-content">
        <div class="drawer-title">当前节点：{{ currentNodeName || '-' }}</div>

        <el-table :data="nodeRelations" border stripe style="width: 100%">
          <el-table-column prop="source" label="源实体" min-width="180" show-overflow-tooltip />
          <el-table-column prop="target" label="目标实体" min-width="180" show-overflow-tooltip />
          <el-table-column prop="relationType" label="关系类型" width="120" />
          <el-table-column
            prop="relationDesc"
            label="关系说明"
            min-width="220"
            show-overflow-tooltip
          />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { echarts } from '@/plugins/echarts'
  import {
    enhanceJobSkillRelations,
    getJobSkillGraphData,
    getJobSkillGraphOptions,
    getJobSkillNodeRelations,
    getJobSkillRecommend,
    type GraphData,
    type GraphLinkItem,
    type RecommendData
  } from '@/api/job-skill-graph'

  const router = useRouter()

  const loading = ref(false)
  const recommendLoading = ref(false)

  const relationDrawerVisible = ref(false)
  const currentNodeName = ref('')
  const nodeRelations = ref<any[]>([])

  const graphRef = ref<HTMLDivElement | null>(null)
  const topSkillsRef = ref<HTMLDivElement | null>(null)
  const categoryRef = ref<HTMLDivElement | null>(null)

  let graphChart: any = null
  let topSkillsChart: any = null
  let categoryChart: any = null

  const queryForm = reactive({
    keyword: '',
    city: '',
    categoryMain: '',
    limit: 300
  })

  const recommendForm = reactive({
    targetJob: '',
    skills: '',
    city: '',
    categoryMain: ''
  })

  const options = reactive({
    cities: [] as string[],
    categoryMains: [] as string[]
  })

  const graphData = reactive<GraphData>({
    nodes: [],
    links: [],
    topSkills: [],
    categoryDistribution: [],
    jobCount: 0,
    skillCount: 0,
    companyCount: 0
  })

  const recommendResult = reactive<RecommendData>({
    coreSkills: [],
    missingSkills: [],
    relatedJobs: [],
    relatedCompanies: [],
    suggestions: [],
    summary: ''
  })

  const initCharts = () => {
    if (graphRef.value) graphChart = echarts.init(graphRef.value)
    if (topSkillsRef.value) topSkillsChart = echarts.init(topSkillsRef.value)
    if (categoryRef.value) categoryChart = echarts.init(categoryRef.value)
  }

  const renderGraphChart = () => {
    if (!graphChart) return

    graphChart.setOption({
      tooltip: {
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const data = params.data || {}
            return `
            <div style="line-height: 1.8">
              <div><strong>关系类型：</strong>${data.relationType || '关联'}</div>
              <div><strong>关系标签：</strong>${data.relationLabel || '-'}</div>
              <div><strong>关系说明：</strong>${data.aiRelationDesc || data.relationDesc || '-'}</div>
              <div><strong>关系强度：</strong>${data.value || 0}</div>
              <div><strong>强度等级：</strong>${data.strengthLevel || '-'}</div>
            </div>
          `
          }
          return `${params.data.rawCategory}<br/>${params.data.name}`
        }
      },
      legend: {
        data: ['技能', '岗位', '公司', '城市', '分类'],
        top: 10
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          label: {
            show: true,
            position: 'right',
            formatter: '{b}'
          },
          edgeLabel: {
            show: true,
            formatter: (params: any) => params?.data?.relationLabel || '',
            fontSize: 11
          },
          force: {
            repulsion: 220,
            edgeLength: [80, 160]
          },
          categories: [
            { name: '技能' },
            { name: '岗位' },
            { name: '公司' },
            { name: '城市' },
            { name: '分类' }
          ],
          data: graphData.nodes.map((item) => ({
            ...item,
            rawCategory: item.category,
            category: ['技能', '岗位', '公司', '城市', '分类'].indexOf(item.category)
          })),
          links: graphData.links,
          lineStyle: {
            opacity: 0.7,
            width: 1.4,
            curveness: 0.12
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 2.2
            }
          }
        }
      ]
    })

    graphChart.off('click')
    graphChart.on('click', async (params: any) => {
      if (params.dataType === 'node') {
        const node = params.data
        currentNodeName.value = node?.name || ''
        relationDrawerVisible.value = true

        try {
          const res = await getJobSkillNodeRelations({
            nodeId: node?.id,
            keyword: queryForm.keyword
          })
          nodeRelations.value = res?.data?.data?.relations || []
        } catch (error) {
          console.error('节点关系加载失败：', error)
          ElMessage.error('节点关系加载失败')
          nodeRelations.value = []
        }
      }
    })
  }

  const renderTopSkillsChart = () => {
    if (!topSkillsChart) return
    topSkillsChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 50, right: 20, top: 30, bottom: 60 },
      xAxis: {
        type: 'category',
        data: graphData.topSkills.map((item) => item.name),
        axisLabel: { rotate: 28 }
      },
      yAxis: { type: 'value' },
      series: [
        {
          type: 'bar',
          data: graphData.topSkills.map((item) => item.value),
          barMaxWidth: 36
        }
      ]
    })
  }

  const renderCategoryChart = () => {
    if (!categoryChart) return
    categoryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['38%', '68%'],
          data: graphData.categoryDistribution
        }
      ]
    })
  }

  const renderCharts = async () => {
    await nextTick()
    renderGraphChart()
    renderTopSkillsChart()
    renderCategoryChart()
  }

  const loadOptions = async () => {
    try {
      const res = await getJobSkillGraphOptions()
      const data = res?.data?.data || {}
      options.cities = data.cities || []
      options.categoryMains = data.categoryMains || []
    } catch (error) {
      console.error('图谱筛选项加载失败：', error)
      ElMessage.error('筛选项加载失败')
    }
  }

  const loadGraphData = async () => {
    loading.value = true
    try {
      const res = await getJobSkillGraphData({ ...queryForm })
      const data = res?.data?.data || {}

      graphData.nodes = data.nodes || []
      graphData.links = data.links || []
      graphData.topSkills = data.topSkills || []
      graphData.categoryDistribution = data.categoryDistribution || []
      graphData.jobCount = data.jobCount || 0
      graphData.skillCount = data.skillCount || 0
      graphData.companyCount = data.companyCount || 0

      if (graphData.links.length) {
        try {
          const enhanceRes = await enhanceJobSkillRelations({
            links: graphData.links as GraphLinkItem[],
            enableAi: true
          })
          graphData.links = enhanceRes?.data?.data || graphData.links
        } catch (e) {
          console.warn('AI关系增强失败，已回退基础关系数据', e)
        }
      }

      await renderCharts()
    } catch (error) {
      console.error('岗位技能图谱加载失败：', error)
      ElMessage.error('岗位技能图谱加载失败')
    } finally {
      loading.value = false
    }
  }

  const handleQuery = () => {
    loadGraphData()
  }

  const handleReset = () => {
    queryForm.keyword = ''
    queryForm.city = ''
    queryForm.categoryMain = ''
    queryForm.limit = 300
    loadGraphData()
  }

  const handleRecommend = () => {
    recommendLoading.value = true
    setTimeout(async () => {
      try {
        const res = await getJobSkillRecommend({ ...recommendForm })
        const data = res?.data?.data || {}

        recommendResult.coreSkills = data.coreSkills || []
        recommendResult.missingSkills = data.missingSkills || []
        recommendResult.relatedJobs = data.relatedJobs || []
        recommendResult.relatedCompanies = data.relatedCompanies || []
        recommendResult.suggestions = data.suggestions || []
        recommendResult.summary = data.summary || ''
      } catch (error) {
        console.error('智能推荐生成失败：', error)
        ElMessage.error('智能推荐生成失败')
      } finally {
        recommendLoading.value = false
      }
    }, 2000)
  }

  const handleFillExample = async () => {
    recommendForm.targetJob = 'Java开发工程师'
    recommendForm.skills = 'Java, Spring Boot, MySQL, Redis, Git'
    recommendForm.city = '北京'
    recommendForm.categoryMain = '后端开发'
    ElMessage.success('已自动填充示例内容')
    // await handleRecommend()
  }

  const handleRecommendReset = () => {
    recommendForm.targetJob = ''
    recommendForm.skills = ''
    recommendForm.city = ''
    recommendForm.categoryMain = ''

    recommendResult.coreSkills = []
    recommendResult.missingSkills = []
    recommendResult.relatedJobs = []
    recommendResult.relatedCompanies = []
    recommendResult.suggestions = []
    recommendResult.summary = ''
  }

  const handleOpenGraphPage = () => {
    const query: Record<string, any> = {}

    if (queryForm.keyword) query.keyword = queryForm.keyword
    if (queryForm.city) query.city = queryForm.city
    if (queryForm.categoryMain) query.categoryMain = queryForm.categoryMain
    if (queryForm.limit) query.limit = queryForm.limit

    const routeData = router.resolve({
      path: '/toolbox/job-skill-graph/view',
      query
    })

    window.open(routeData.href, '_blank')
  }

  const resizeCharts = () => {
    graphChart?.resize()
    topSkillsChart?.resize()
    categoryChart?.resize()
  }

  onMounted(async () => {
    await nextTick()
    initCharts()
    await loadOptions()
    await loadGraphData()
    window.addEventListener('resize', resizeCharts)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCharts)
    graphChart?.dispose()
    topSkillsChart?.dispose()
    categoryChart?.dispose()
  })
</script>

<style scoped lang="scss">
  .job-skill-graph-page {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100%;
    box-sizing: border-box;
  }

  .top-card,
  .metric-card,
  .graph-card,
  .chart-card,
  .recommend-card {
    border-radius: 14px;
  }

  .top-header {
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
    font-size: 14px;
    color: #909399;
  }

  .metric-grid {
    margin-top: 20px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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

  .content-grid {
    margin-top: 20px;
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }

  .graph-box {
    width: 100%;
    height: 620px;
  }

  .right-panels {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 16px;
  }

  .chart-box {
    width: 100%;
    height: 300px;
  }

  .recommend-section {
    margin-top: 20px;
  }

  .recommend-result {
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

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .card-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .card-tools {
    display: flex;
    align-items: center;
  }

  .drawer-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .drawer-title {
    font-size: 16px;
    font-weight: 700;
    color: #303133;
  }

  @media screen and (max-width: 1200px) {
    .metric-grid {
      grid-template-columns: 1fr;
    }

    .content-grid {
      grid-template-columns: 1fr;
    }

    .right-panels {
      grid-template-rows: auto;
      grid-template-columns: 1fr;
    }

    .graph-box {
      height: 500px;
    }
  }

  @media screen and (max-width: 768px) {
    .job-skill-graph-page {
      padding: 12px;
    }

    .graph-box {
      height: 420px;
    }

    .chart-box {
      height: 260px;
    }

    .card-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

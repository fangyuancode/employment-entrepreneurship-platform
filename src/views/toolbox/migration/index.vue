<template>
  <div class="quantity-page">
    <el-card shadow="never" class="page-card hero-card">
      <div class="page-title">技能迁移分析中心</div>
      <div class="page-desc">
        基于岗位数据分析当前岗位到目标岗位的迁移可行性、技能重合度、缺口技能、薪资变化、趋势判断与迁移路径图谱推荐
      </div>
    </el-card>

    <el-card shadow="never" class="page-card section-card">
      <template #header>
        <div class="section-header">
          <span>迁移参数输入</span>
        </div>
      </template>

      <el-form :model="form" label-width="96px" class="form-panel">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="当前岗位">
              <el-input v-model="form.sourceJob" placeholder="如：前端开发工程师" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="目标岗位">
              <el-input v-model="form.targetJob" placeholder="如：数据分析师" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="目标城市">
              <el-input v-model="form.city" placeholder="如：上海" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="学历">
              <el-input v-model="form.degree" placeholder="如：本科" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8">
            <el-form-item label="经验">
              <el-input v-model="form.experience" placeholder="如：1-3年" clearable />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="24">
            <el-form-item label="已有技能">
              <el-input
                v-model="form.ownSkills"
                type="textarea"
                :rows="4"
                placeholder="如：JavaScript, Vue3, TypeScript, ECharts, SQL, 数据可视化"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="action-bar">
          <el-button @click="fillExample">一键示例</el-button>
          <el-button type="primary" :loading="loading" @click="analyzeMigration">
            {{ loading ? '分析中...' : '开始分析' }}
          </el-button>
          <el-button type="success" :loading="graphLoading" @click="loadPathGraph">
            {{ graphLoading ? '生成中...' : '生成迁移路径图谱' }}
          </el-button>
          <el-button :disabled="loading || graphLoading" @click="resetForm">重置</el-button>
        </div>

        <div v-if="loading" class="loading-stage-panel">
          <div class="loading-stage-title">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>模型分析进行中</span>
          </div>
          <div class="loading-stage-text">{{ loadingText }}</div>
          <div class="loading-stage-tips">
            正在结合岗位需求、技能画像、薪资变化与职业趋势生成迁移建议
          </div>
        </div>
      </el-form>
    </el-card>

    <el-card shadow="never" class="page-card section-card">
      <template #header>
        <div class="section-header">
          <span>技能迁移分析结果</span>
        </div>
      </template>

      <div
        v-loading="loading"
        :element-loading-text="loadingText"
        element-loading-background="rgba(255,255,255,0.82)"
        class="result-wrap"
      >
        <template v-if="result.summary">
          <div class="summary-box">
            {{ result.summary }}
          </div>

          <div class="metric-grid">
            <div class="metric-item">
              <div class="metric-label">迁移评分</div>
              <div class="metric-value">{{ result.migrationScore || 0 }} 分</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">迁移难度</div>
              <div class="metric-value">{{ result.difficultyLevel || '-' }}</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">技能重合度</div>
              <div class="metric-value">{{ result.overlapRatio || 0 }}%</div>
            </div>
            <div class="metric-item">
              <div class="metric-label">薪资提升</div>
              <div class="metric-value">{{ result.salaryCompare?.salaryIncreaseK || 0 }} K</div>
            </div>
          </div>

          <div class="block-section">
            <div class="block-title">薪资对比</div>
            <div class="mini-grid">
              <div class="mini-card">
                <div class="mini-label">当前岗位平均薪资</div>
                <div class="mini-value">{{ result.salaryCompare?.sourceAvgSalaryK || '-' }} K</div>
              </div>
              <div class="mini-card">
                <div class="mini-label">目标岗位平均薪资</div>
                <div class="mini-value">{{ result.salaryCompare?.targetAvgSalaryK || '-' }} K</div>
              </div>
              <div class="mini-card">
                <div class="mini-label">薪资涨幅</div>
                <div class="mini-value">{{ result.salaryCompare?.salaryIncreaseRatio || 0 }}%</div>
              </div>
            </div>
          </div>

          <div class="block-section">
            <div class="block-title">可复用技能</div>
            <div class="tag-wrap">
              <el-tag
                v-for="(item, index) in result.overlapSkills"
                :key="'overlap-' + index"
                type="success"
                effect="plain"
                class="tag-item"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>

          <div class="block-section">
            <div class="block-title">缺口技能</div>
            <div class="tag-wrap">
              <el-tag
                v-for="(item, index) in result.gapSkills"
                :key="'gap-' + index"
                type="danger"
                effect="plain"
                class="tag-item"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>

          <div class="block-section">
            <div class="block-title">推荐城市</div>
            <div class="tag-wrap">
              <el-tag
                v-for="(item, index) in result.targetCities"
                :key="'city-' + index"
                type="warning"
                effect="plain"
                class="tag-item"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>

          <div class="block-section">
            <div class="block-title">推荐企业</div>
            <div class="tag-wrap">
              <el-tag
                v-for="(item, index) in result.targetCompanies"
                :key="'company-' + index"
                type="info"
                effect="plain"
                class="tag-item"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>

          <div class="block-section">
            <div class="block-title">学习路径</div>
            <el-timeline>
              <el-timeline-item v-for="(item, index) in result.learningPath" :key="'path-' + index">
                {{ item }}
              </el-timeline-item>
            </el-timeline>
          </div>

          <div class="block-section">
            <div class="block-title">行动建议</div>
            <ul class="text-list">
              <li v-for="(item, index) in result.actionSuggestions" :key="'act-' + index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="block-section">
            <div class="block-title">AI 说明：为什么要迁移</div>
            <div class="text-panel">{{ result.aiExplain?.whyMigrate || '-' }}</div>
          </div>

          <div class="block-section">
            <div class="block-title">AI 说明：迁移的好处</div>
            <ul class="text-list">
              <li
                v-for="(item, index) in result.aiExplain?.migrationBenefits || []"
                :key="'benefit-' + index"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="block-section">
            <div class="block-title">AI 说明：未来趋势</div>
            <ul class="text-list">
              <li
                v-for="(item, index) in result.aiExplain?.futureTrends || []"
                :key="'trend-' + index"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="block-section">
            <div class="block-title">AI 说明：风险提醒</div>
            <ul class="text-list">
              <li
                v-for="(item, index) in result.aiExplain?.riskWarnings || []"
                :key="'risk-' + index"
              >
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="block-section">
            <div class="block-title">AI 最终建议</div>
            <div class="text-panel">{{ result.aiExplain?.finalAdvice || '-' }}</div>
          </div>
        </template>

        <el-empty v-else description="请输入岗位与技能信息后开始分析" />
      </div>
    </el-card>

    <el-card shadow="never" class="page-card section-card">
      <template #header>
        <div class="section-header">
          <span>迁移路径推荐图谱</span>
        </div>
      </template>

      <div class="path-graph-section">
        <div v-if="pathGraphResult.summary" class="summary-box">
          {{ pathGraphResult.summary }}
        </div>

        <div v-if="graphLoading" class="graph-loading-box">
          <el-icon class="is-loading graph-loading-icon"><Loading /></el-icon>
          <div class="graph-loading-text">正在生成迁移路径图谱...</div>
        </div>

        <div v-show="!graphLoading && hasGraphData" ref="pathGraphRef" class="path-graph-box"></div>

        <template v-if="!graphLoading && pathGraphResult.summary">
          <div class="block-section">
            <div class="block-title">推荐相关岗位</div>
            <div class="tag-wrap">
              <el-tag
                v-for="(item, index) in pathGraphResult.relatedJobs"
                :key="'related-' + index"
                type="success"
                effect="plain"
                class="tag-item"
              >
                {{ item }}
              </el-tag>
            </div>
          </div>

          <div class="block-section">
            <div class="block-title">图谱分析结论</div>
            <ul class="text-list">
              <li v-for="(item, index) in pathGraphResult.insights" :key="'insight-' + index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="block-section">
            <div class="block-title">推荐迁移路径</div>
            <el-table :data="pathGraphResult.paths" border stripe>
              <el-table-column prop="targetJob" label="目标岗位" min-width="140" />
              <el-table-column prop="migrationScore" label="迁移评分" min-width="100" />
              <el-table-column prop="difficultyLevel" label="难度" min-width="90" />
              <el-table-column prop="overlapRatio" label="技能重合度(%)" min-width="120" />
              <el-table-column prop="targetDemand" label="岗位需求量" min-width="110" />
              <el-table-column prop="targetAvgSalaryK" label="平均薪资(K)" min-width="110" />
              <el-table-column prop="salaryIncreaseK" label="薪资提升(K)" min-width="110" />
              <el-table-column prop="analysis" label="路径分析" min-width="320" />
            </el-table>
          </div>
        </template>

        <el-empty
          v-if="!graphLoading && !pathGraphResult.summary"
          description="点击“生成迁移路径图谱”查看岗位迁移路线"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import { Loading } from '@element-plus/icons-vue'
  import * as echarts from 'echarts'
  import {
    getSkillMigrationAnalyze,
    getSkillMigrationPathGraph,
    type SkillMigrationData,
    type MigrationPathGraphData
  } from '@/api/skill-migration'

  const loading = ref(false)
  const graphLoading = ref(false)
  const loadingText = ref('准备开始分析...')
  let loadingTimer: number | null = null
  let loadingStepIndex = 0

  const loadingSteps = [
    '正在校验源岗位与目标岗位信息...',
    '正在匹配岗位技能画像...',
    '正在分析技能重合度与缺口技能...',
    '正在计算薪资变化与岗位需求趋势...',
    '正在组织迁移路径与行动建议...',
    '正在生成大模型迁移理由与趋势说明...',
    '即将完成，请稍候...'
  ]

  const startLoadingSteps = () => {
    stopLoadingSteps()
    loadingStepIndex = 0
    loadingText.value = loadingSteps[0]
    loadingTimer = window.setInterval(() => {
      loadingStepIndex++
      if (loadingStepIndex >= loadingSteps.length) {
        loadingStepIndex = loadingSteps.length - 1
      }
      loadingText.value = loadingSteps[loadingStepIndex]
    }, 1600)
  }

  const stopLoadingSteps = () => {
    if (loadingTimer) {
      clearInterval(loadingTimer)
      loadingTimer = null
    }
  }

  const form = reactive({
    sourceJob: '',
    targetJob: '',
    city: '',
    degree: '',
    experience: '',
    ownSkills: ''
  })

  const result = reactive<SkillMigrationData>({
    sourceJob: '',
    targetJob: '',
    migrationScore: 0,
    difficultyLevel: '',
    overlapRatio: 0,
    overlapSkills: [],
    gapSkills: [],
    sourceTopSkills: [],
    targetTopSkills: [],
    learningPath: [],
    actionSuggestions: [],
    targetCities: [],
    targetCompanies: [],
    salaryCompare: {
      sourceAvgSalaryK: 0,
      targetAvgSalaryK: 0,
      salaryIncreaseK: 0,
      salaryIncreaseRatio: 0,
      sourceSampleCount: 0,
      targetSampleCount: 0
    },
    demandCompare: {
      sourceDemand: 0,
      targetDemand: 0,
      demandTrend: ''
    },
    aiExplain: {
      whyMigrate: '',
      migrationBenefits: [],
      futureTrends: [],
      riskWarnings: [],
      finalAdvice: ''
    },
    summary: ''
  })

  const pathGraphResult = reactive<MigrationPathGraphData>({
    sourceJob: '',
    sourceCategory: '',
    graph: {
      nodes: [],
      links: [],
      categories: []
    },
    paths: [],
    relatedJobs: [],
    insights: [],
    summary: ''
  })

  const hasGraphData = computed(() => {
    return !!(pathGraphResult.graph?.nodes?.length && pathGraphResult.graph?.links?.length)
  })

  const pathGraphRef = ref<HTMLDivElement | null>(null)
  let pathGraphChart: echarts.ECharts | null = null

  const disposePathGraph = () => {
    if (pathGraphChart) {
      pathGraphChart.dispose()
      pathGraphChart = null
    }
  }

  const initPathGraphChart = () => {
    if (!pathGraphRef.value) return
    disposePathGraph()
    pathGraphChart = echarts.init(pathGraphRef.value)
  }

  const renderPathGraph = async () => {
    if (!hasGraphData.value) {
      disposePathGraph()
      return
    }

    await nextTick()
    requestAnimationFrame(() => {
      if (!pathGraphRef.value) return
      initPathGraphChart()
      if (!pathGraphChart) return

      pathGraphChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            if (params.dataType === 'edge') {
              return `${params.data.source} → ${params.data.target}<br/>${params.data.label || ''}`
            }
            return `${params.data.name}<br/>迁移评分：${params.data.value || 0}`
          }
        },
        legend: [
          {
            data: (pathGraphResult.graph.categories || []).map((c: any) => c.name),
            bottom: 0
          }
        ],
        series: [
          {
            type: 'graph',
            layout: 'force',
            roam: true,
            draggable: true,
            force: {
              repulsion: 420,
              edgeLength: [140, 220]
            },
            label: {
              show: true,
              position: 'right',
              formatter: '{b}'
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: [4, 10],
            lineStyle: {
              width: 2,
              curveness: 0.12
            },
            emphasis: {
              focus: 'adjacency'
            },
            categories: pathGraphResult.graph.categories || [],
            data: pathGraphResult.graph.nodes || [],
            links: pathGraphResult.graph.links || []
          }
        ]
      })

      pathGraphChart.resize()
    })
  }

  const handleResize = () => {
    pathGraphChart?.resize()
  }

  const analyzeMigration = async () => {
    loading.value = true
    startLoadingSteps()

    try {
      const res = await getSkillMigrationAnalyze({ ...form })
      loadingText.value = '分析结果已返回，正在整理展示内容...'
      const data = res?.data?.data

      if (!data) {
        ElMessage.error('分析结果为空')
        return
      }

      Object.assign(result, data)
      ElMessage.success('技能迁移分析完成')
    } catch (error) {
      console.error('技能迁移分析失败：', error)
      ElMessage.error('技能迁移分析失败')
    } finally {
      stopLoadingSteps()
      loading.value = false
      loadingText.value = '准备开始分析...'
    }
  }

  const loadPathGraph = async () => {
    graphLoading.value = true
    try {
      disposePathGraph()

      const res = await getSkillMigrationPathGraph({ ...form })
      const data = res?.data?.data

      if (!data) {
        ElMessage.error('迁移路径图谱结果为空')
        return
      }

      pathGraphResult.sourceJob = data.sourceJob || ''
      pathGraphResult.sourceCategory = data.sourceCategory || ''
      pathGraphResult.graph = data.graph || { nodes: [], links: [], categories: [] }
      pathGraphResult.paths = data.paths || []
      pathGraphResult.relatedJobs = data.relatedJobs || []
      pathGraphResult.insights = data.insights || []
      pathGraphResult.summary = data.summary || ''

      await renderPathGraph()
      ElMessage.success('迁移路径图谱生成完成')
    } catch (error) {
      console.error('迁移路径图谱生成失败：', error)
      ElMessage.error('迁移路径图谱生成失败')
    } finally {
      graphLoading.value = false
      await nextTick()
      requestAnimationFrame(() => {
        pathGraphChart?.resize()
      })
    }
  }

  const fillExample = () => {
    form.sourceJob = '前端开发工程师'
    form.targetJob = 'java工程师'
    form.city = '北京'
    form.degree = '本科'
    form.experience = '1-3年'
    form.ownSkills = 'JavaScript, Vue3, TypeScript, ECharts, 接口联调, 数据可视化, SQL'
    ElMessage.success('已填充示例')
  }

  const resetForm = () => {
    form.sourceJob = ''
    form.targetJob = ''
    form.city = ''
    form.degree = ''
    form.experience = ''
    form.ownSkills = ''

    Object.assign(result, {
      sourceJob: '',
      targetJob: '',
      migrationScore: 0,
      difficultyLevel: '',
      overlapRatio: 0,
      overlapSkills: [],
      gapSkills: [],
      sourceTopSkills: [],
      targetTopSkills: [],
      learningPath: [],
      actionSuggestions: [],
      targetCities: [],
      targetCompanies: [],
      salaryCompare: {
        sourceAvgSalaryK: 0,
        targetAvgSalaryK: 0,
        salaryIncreaseK: 0,
        salaryIncreaseRatio: 0,
        sourceSampleCount: 0,
        targetSampleCount: 0
      },
      demandCompare: {
        sourceDemand: 0,
        targetDemand: 0,
        demandTrend: ''
      },
      aiExplain: {
        whyMigrate: '',
        migrationBenefits: [],
        futureTrends: [],
        riskWarnings: [],
        finalAdvice: ''
      },
      summary: ''
    })

    Object.assign(pathGraphResult, {
      sourceJob: '',
      sourceCategory: '',
      graph: {
        nodes: [],
        links: [],
        categories: []
      },
      paths: [],
      relatedJobs: [],
      insights: [],
      summary: ''
    })

    disposePathGraph()
  }

  onMounted(async () => {
    await nextTick()
    window.addEventListener('resize', handleResize)
  })

  onBeforeUnmount(() => {
    stopLoadingSteps()
    window.removeEventListener('resize', handleResize)
    disposePathGraph()
  })
</script>

<style scoped lang="scss">
  .quantity-page {
    padding: 20px;
    min-height: 100%;
    background: #f5f7fa;
    box-sizing: border-box;
  }

  .page-card {
    border-radius: 16px;
  }

  .page-card + .page-card {
    margin-top: 20px;
  }

  .hero-card {
    overflow: hidden;
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
    line-height: 1.8;
  }

  .section-card {
    border-radius: 16px;
  }

  .section-header {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 700;
    color: #303133;
  }

  .form-panel {
    padding-top: 6px;
  }

  .action-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 8px;
  }

  .result-wrap {
    min-height: 320px;
  }

  .summary-box {
    padding: 16px;
    border-radius: 14px;
    background: #f8fbff;
    border: 1px solid #d9ecff;
    color: #606266;
    line-height: 1.9;
  }

  .metric-grid {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .metric-item {
    padding: 14px;
    border-radius: 14px;
    background: #fff;
    border: 1px solid #ebeef5;
  }

  .metric-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 24px;
    font-weight: 700;
    color: #409eff;
  }

  .block-section {
    margin-top: 20px;
  }

  .block-title {
    margin-bottom: 12px;
    font-size: 15px;
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

  .mini-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  .mini-card {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #ebeef5;
    background: #fafafa;
  }

  .mini-label {
    color: #909399;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .mini-value {
    color: #303133;
    font-size: 22px;
    font-weight: 700;
  }

  .text-list {
    margin: 0;
    padding-left: 18px;
    color: #606266;
    line-height: 1.9;
  }

  .text-panel {
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #ebeef5;
    background: #fafafa;
    color: #606266;
    line-height: 1.9;
  }

  .loading-stage-panel {
    margin-top: 16px;
    padding: 16px;
    border-radius: 14px;
    background: linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%);
    border: 1px solid #d9ecff;
  }

  .loading-stage-title {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #409eff;
    font-size: 15px;
    font-weight: 700;
  }

  .loading-stage-text {
    margin-top: 12px;
    font-size: 14px;
    color: #303133;
    line-height: 1.8;
  }

  .loading-stage-tips {
    margin-top: 8px;
    font-size: 13px;
    color: #909399;
    line-height: 1.7;
  }

  .path-graph-section {
    min-height: 420px;
  }

  .path-graph-box {
    width: 100%;
    height: 560px;
    margin-top: 18px;
    border-radius: 14px;
    border: 1px solid #ebeef5;
    background: #fff;
    overflow: hidden;
  }

  .graph-loading-box {
    height: 280px;
    margin-top: 18px;
    border-radius: 14px;
    border: 1px dashed #dcdfe6;
    background: #fafafa;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .graph-loading-icon {
    font-size: 24px;
    color: #409eff;
  }

  .graph-loading-text {
    margin-top: 12px;
    color: #606266;
    font-size: 14px;
  }

  @media screen and (max-width: 1200px) {
    .metric-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .mini-grid {
      grid-template-columns: 1fr;
    }

    .path-graph-box {
      height: 500px;
    }
  }

  @media screen and (max-width: 768px) {
    .quantity-page {
      padding: 14px;
    }

    .page-title {
      font-size: 24px;
    }

    .metric-grid {
      grid-template-columns: 1fr;
    }

    .path-graph-box {
      height: 460px;
    }
  }
</style>

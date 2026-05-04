<template>
  <div class="career-page">
    <div class="page-header card">
      <div class="header-left">
        <div class="eyebrow">AI Career Planning Center</div>
        <h2>AI职业规划中心</h2>
        <p>
          基于真实岗位数据、个人技能、简历文本和项目经历，自动生成岗位匹配评分、技能差距、简历诊断、学习路径、推荐岗位与就业发展报告。
        </p>
        <div class="header-tags">
          <el-tag effect="plain">简历诊断</el-tag>
          <el-tag effect="plain" type="success">岗位匹配</el-tag>
          <el-tag effect="plain" type="warning">技能差距</el-tag>
          <el-tag effect="plain" type="info">发展报告</el-tag>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="fillDemo">一键填充示例</el-button>
        <el-button :disabled="!result.reportText" @click="downloadReport">导出报告</el-button>
        <el-button type="primary" :loading="loading" @click="handleAnalyze">
          {{ loading ? '生成中...' : '生成职业规划' }}
        </el-button>
      </div>
    </div>

    <div class="page-layout">
      <div class="left-panel card">
        <div class="section-head">
          <div>
            <div class="section-title">个人信息与目标岗位</div>
            <div class="section-desc">信息越完整，岗位匹配和简历诊断越准确</div>
          </div>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="career-form">
          <el-row :gutter="14">
            <el-col :xs="24" :sm="12">
              <el-form-item label="目标岗位" prop="targetJob">
                <el-select
                  v-model="form.targetJob"
                  filterable
                  allow-create
                  default-first-option
                  clearable
                  placeholder="如：Java开发工程师"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in options.targetJobs"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="期望城市">
                <el-select
                  v-model="form.city"
                  filterable
                  allow-create
                  clearable
                  placeholder="如：杭州 / 北京 / 不限"
                  style="width: 100%"
                >
                  <el-option v-for="item in options.cities" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="学历">
                <el-select
                  v-model="form.degree"
                  filterable
                  allow-create
                  clearable
                  placeholder="如：本科"
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
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="经验">
                <el-select
                  v-model="form.experience"
                  filterable
                  allow-create
                  clearable
                  placeholder="如：应届生 / 1-3年"
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
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="当前状态">
                <el-input v-model="form.currentStatus" placeholder="如：研一学生 / 应届生 / 转行求职" />
              </el-form-item>
            </el-col>

            <el-col :xs="24" :sm="12">
              <el-form-item label="期望薪资">
                <el-input v-model="form.expectedSalary" placeholder="如：8K-12K" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="职业目标">
                <el-input
                  v-model="form.careerGoal"
                  type="textarea"
                  :rows="3"
                  placeholder="说明你希望从事的方向、发展目标和期待进入的行业"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="已有技能">
                <el-input
                  v-model="form.ownSkills"
                  type="textarea"
                  :rows="3"
                  placeholder="如：Java, Spring Boot, MySQL, Redis, Vue3, ECharts"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="项目经历">
                <el-input
                  v-model="form.projectExperience"
                  type="textarea"
                  :rows="5"
                  placeholder="描述代表性项目：项目背景、技术栈、负责模块、难点和成果"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="简历文本">
                <el-input
                  v-model="form.resumeText"
                  type="textarea"
                  :rows="6"
                  placeholder="可直接粘贴简历中的个人简介、技能、项目经历和实习经历"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="输出风格">
                <el-radio-group v-model="form.outputStyle">
                  <el-radio-button label="求职实用型" />
                  <el-radio-button label="比赛展示型" />
                  <el-radio-button label="学习规划型" />
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button @click="fillDemo">一键示例</el-button>
            <el-button type="primary" :loading="loading" @click="handleAnalyze">开始分析</el-button>
          </div>
        </el-form>
      </div>

      <div class="right-panel">
        <div v-if="loading" class="card loading-card">
          <div class="loading-title">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>{{ loadingText }}</span>
          </div>
          <el-progress :percentage="loadingPercent" :stroke-width="8" />
          <p>正在结合岗位数据库、简历文本、技能关键词和大模型生成职业规划建议。</p>
        </div>

        <div v-if="!hasResult && !loading" class="card empty-card">
          <el-empty description="填写左侧信息后，点击“生成职业规划”查看分析结果" />
        </div>

        <template v-if="hasResult">
          <div class="card score-card">
            <div class="score-main">
              <div class="score-circle">
                <el-progress type="dashboard" :percentage="result.overallScore || 0" :width="148" />
              </div>
              <div class="score-info">
                <div class="score-label">综合匹配度</div>
                <div class="score-title">{{ result.scoreLevel }}</div>
                <p>{{ result.summary }}</p>
                <div v-if="result.queryScope" class="query-note">
                  数据匹配策略：{{ result.queryScope }}<span v-if="result.queryKeyword">，查询关键词：{{ result.queryKeyword }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="metric-grid">
            <div class="stat-card card">
              <div class="stat-label">岗位需求量</div>
              <div class="stat-value">{{ result.demandCount || 0 }}</div>
              <div class="stat-desc">数据库匹配岗位样本</div>
            </div>
            <div class="stat-card card">
              <div class="stat-label">平均薪资</div>
              <div class="stat-value">{{ result.salaryStats?.avgSalaryK || 0 }}K</div>
              <div class="stat-desc">月薪估算</div>
            </div>
            <div class="stat-card card">
              <div class="stat-label">已匹配技能</div>
              <div class="stat-value">{{ result.matchedSkills?.length || 0 }}</div>
              <div class="stat-desc">可直接写入简历</div>
            </div>
            <div class="stat-card card">
              <div class="stat-label">缺口技能</div>
              <div class="stat-value">{{ result.gapSkills?.length || 0 }}</div>
              <div class="stat-desc">建议优先补齐</div>
            </div>
          </div>

          <div class="double-grid">
            <div class="card chart-card">
              <div class="section-title">能力雷达评估</div>
              <div ref="radarRef" class="chart-box" />
            </div>
            <div class="card chart-card">
              <div class="section-title">目标岗位高频技能</div>
              <div ref="skillBarRef" class="chart-box" />
            </div>
          </div>

          <div class="card block-card">
            <div class="section-title">技能匹配分析</div>
            <div class="skill-columns">
              <div>
                <div class="mini-title success-title">可复用技能</div>
                <div class="tag-wrap">
                  <el-tag
                    v-for="item in result.matchedSkills"
                    :key="item"
                    type="success"
                    effect="plain"
                    round
                  >
                    {{ item }}
                  </el-tag>
                  <span v-if="!result.matchedSkills?.length" class="empty-text">暂无明显匹配技能</span>
                </div>
              </div>
              <div>
                <div class="mini-title danger-title">待补齐技能</div>
                <div class="tag-wrap">
                  <el-tag
                    v-for="item in result.gapSkills"
                    :key="item"
                    type="danger"
                    effect="plain"
                    round
                  >
                    {{ item }}
                  </el-tag>
                  <span v-if="!result.gapSkills?.length" class="empty-text">暂无明显缺口</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-title">简历诊断建议</div>
            <div class="diagnosis-list">
              <div
                v-for="(item, index) in result.resumeDiagnosis"
                :key="index"
                class="diagnosis-item"
              >
                <el-tag :type="formatTagType(item.level)" effect="plain">{{ item.title }}</el-tag>
                <p>{{ item.suggestion }}</p>
              </div>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-head compact">
              <div class="section-title">推荐岗位</div>
              <el-tag effect="plain">{{ result.targetJob }}</el-tag>
            </div>
            <el-table :data="result.recommendedJobs" stripe border height="310">
              <el-table-column prop="jobName" label="岗位" min-width="180" show-overflow-tooltip />
              <el-table-column prop="companyName" label="公司" min-width="160" show-overflow-tooltip />
              <el-table-column prop="city" label="城市" width="90" />
              <el-table-column prop="salary" label="薪资" width="120" />
              <el-table-column prop="degree" label="学历" width="100" show-overflow-tooltip />
              <el-table-column prop="experience" label="经验" width="110" show-overflow-tooltip />
              <el-table-column prop="skills" label="技能" min-width="220" show-overflow-tooltip />
            </el-table>
          </div>

          <div class="double-grid">
            <div class="card block-card">
              <div class="section-title">推荐城市</div>
              <div class="rank-list">
                <div v-for="(item, index) in result.recommendedCities" :key="item.name" class="rank-item">
                  <span class="rank-index">{{ index + 1 }}</span>
                  <span class="rank-name">{{ item.name }}</span>
                  <span class="rank-value">{{ item.value }} 个岗位</span>
                </div>
              </div>
            </div>
            <div class="card block-card">
              <div class="section-title">推荐企业</div>
              <div class="rank-list">
                <div
                  v-for="(item, index) in result.recommendedCompanies"
                  :key="item.name"
                  class="rank-item"
                >
                  <span class="rank-index">{{ index + 1 }}</span>
                  <span class="rank-name">{{ item.name }}</span>
                  <span class="rank-value">{{ item.value }} 个岗位</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-title">学习路径规划</div>
            <el-timeline>
              <el-timeline-item
                v-for="item in result.learningRoadmap"
                :key="item.stage"
                :timestamp="item.duration"
                placement="top"
              >
                <div class="roadmap-card">
                  <div class="roadmap-title">{{ item.stage }}：{{ item.title }}</div>
                  <ul>
                    <li v-for="task in item.tasks" :key="task">{{ task }}</li>
                  </ul>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>

          <div class="card block-card">
            <div class="section-title">AI职业建议</div>
            <div class="advice-box">
              <div class="advice-subtitle">职业定位</div>
              <p>{{ result.aiAdvice?.careerPositioning }}</p>
              <div class="advice-subtitle">简历优化</div>
              <p>{{ result.aiAdvice?.resumeOptimization }}</p>
              <div class="advice-subtitle">最终建议</div>
              <p>{{ result.aiAdvice?.finalAdvice }}</p>
            </div>

            <div class="triple-grid">
              <div class="mini-list">
                <div class="mini-title">学习建议</div>
                <ul>
                  <li v-for="item in result.aiAdvice?.learningAdvice || []" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="mini-list">
                <div class="mini-title">面试建议</div>
                <ul>
                  <li v-for="item in result.aiAdvice?.interviewAdvice || []" :key="item">{{ item }}</li>
                </ul>
              </div>
              <div class="mini-list">
                <div class="mini-title">风险提醒</div>
                <ul>
                  <li v-for="item in result.aiAdvice?.riskWarnings || []" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-title">行动计划</div>
            <div class="action-list">
              <div v-for="(item, index) in result.actionPlan" :key="index" class="action-item">
                <span>{{ index + 1 }}</span>
                <p>{{ item }}</p>
              </div>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-title">面试问题预测</div>
            <div class="question-list">
              <div v-for="(item, index) in result.interviewQuestions" :key="index" class="question-item">
                Q{{ index + 1 }}：{{ item }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import * as echarts from 'echarts'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import {
    cloneAiCachePayload,
    getAiDemoCache,
    isSameAiPayload,
    setAiDemoCache,
    waitAiCacheDelay
  } from '@/utils/ai-demo-cache'
  import { Loading } from '@element-plus/icons-vue'
  import {
    analyzeCareerCenter,
    getCareerCenterDemo,
    getCareerCenterOptions,
    type CareerCenterAnalyzeResult,
    type CareerCenterOptions,
    type CareerCenterRequest,
    type CareerCenterDiagnosisItem
  } from '@/api/career-center'

  const formRef = ref<FormInstance>()
  const radarRef = ref<HTMLDivElement>()
  const skillBarRef = ref<HTMLDivElement>()

  let radarChart: echarts.ECharts | null = null
  let skillBarChart: echarts.ECharts | null = null
  let loadingTimer: number | undefined

  const form = reactive<CareerCenterRequest>({
    targetJob: '',
    city: '',
    degree: '',
    experience: '',
    currentStatus: '',
    careerGoal: '',
    ownSkills: '',
    projectExperience: '',
    resumeText: '',
    expectedSalary: '',
    outputStyle: '求职实用型'
  })

  const options = reactive<CareerCenterOptions>({
    cities: [],
    degrees: [],
    experiences: [],
    targetJobs: []
  })

  const emptyResult: CareerCenterAnalyzeResult = {
    targetJob: '',
    city: '',
    degree: '',
    experience: '',
    overallScore: 0,
    scoreLevel: '',
    summary: '',
    metrics: {},
    radarData: [],
    targetSkills: [],
    userSkills: [],
    matchedSkills: [],
    gapSkills: [],
    skillHotspots: [],
    salaryStats: {},
    demandCount: 0,
    recommendedJobs: [],
    recommendedCities: [],
    recommendedCompanies: [],
    resumeDiagnosis: [],
    learningRoadmap: [],
    actionPlan: [],
    interviewQuestions: [],
    aiAdvice: {},
    reportText: ''
  }

  const result = ref<CareerCenterAnalyzeResult>({ ...emptyResult })
  const demoFormSnapshot = ref<CareerCenterRequest | null>(null)
  const loading = ref(false)
  const loadingText = ref('正在分析岗位画像')
  const loadingPercent = ref(8)

  const hasResult = computed(() => Boolean(result.value.summary))

  const rules: FormRules = {
    targetJob: [{ required: true, message: '请输入或选择目标岗位', trigger: 'blur' }]
  }

  const loadingStages = [
    '正在分析岗位画像',
    '正在提取目标岗位高频技能',
    '正在计算简历与岗位匹配度',
    '正在生成技能差距和学习路径',
    '正在调用大模型生成职业建议',
    '正在整理就业发展报告'
  ]

  function startLoadingStage () {
    let index = 0
    loadingPercent.value = 8
    loadingText.value = loadingStages[0]
    window.clearInterval(loadingTimer)
    loadingTimer = window.setInterval(() => {
      index = Math.min(index + 1, loadingStages.length - 1)
      loadingText.value = loadingStages[index]
      loadingPercent.value = Math.min(92, loadingPercent.value + 14)
    }, 1300)
  }

  function stopLoadingStage () {
    window.clearInterval(loadingTimer)
    loadingPercent.value = 100
    loadingText.value = '职业规划报告已生成'
  }

  async function loadOptions () {
    try {
      const data = await getCareerCenterOptions()
      options.cities = data.cities || []
      options.degrees = data.degrees || []
      options.experiences = data.experiences || []
      options.targetJobs = data.targetJobs || []
    } catch (error) {
      console.warn('[CareerCenter] 获取筛选项失败', error)
    }
  }

  async function fillDemo () {
    try {
      const demo = await getCareerCenterDemo()
      Object.assign(form, demo)
      demoFormSnapshot.value = cloneAiCachePayload(form)
      ElMessage.success('已填充职业规划示例，首次生成后会自动缓存结果')
    } catch (error) {
      Object.assign(form, {
        targetJob: 'Java开发工程师',
        city: '杭州',
        degree: '本科',
        experience: '应届生',
        currentStatus: '计算机相关专业学生，准备参加校招',
        careerGoal: '希望进入软件服务或AI应用企业，从事Java后端开发，后续成长为全栈工程师',
        ownSkills: 'Java, Spring Boot, MyBatis, MySQL, Redis, Vue3, TypeScript, ECharts, Git, Linux',
        projectExperience: '完成AI创业就业助手项目，包含Vue3前端、Spring Boot后端、MyBatis、MySQL岗位数据分析、ECharts可视化大屏和DeepSeek大模型接口。',
        resumeText: '本人熟悉Java、Spring Boot、MyBatis、MySQL、Vue3和ECharts，具备前后端分离项目开发经验。',
        expectedSalary: '8K-12K',
        outputStyle: '比赛展示型'
      })
      demoFormSnapshot.value = cloneAiCachePayload(form)
      ElMessage.success('已填充职业规划示例，首次生成后会自动缓存结果')
    }
  }

  async function handleAnalyze () {
    await formRef.value?.validate()

    const payload = cloneAiCachePayload(form)
    const isDemoRequest = demoFormSnapshot.value
      ? isSameAiPayload(payload, demoFormSnapshot.value)
      : false
    const cachedData = isDemoRequest
      ? getAiDemoCache<CareerCenterAnalyzeResult>('career-center.analyze', payload)
      : null

    loading.value = true

    if (cachedData) {
      try {
        loadingText.value = '检测到示例数据已有本地缓存，3秒后直接展示职业规划报告'
        loadingPercent.value = 80
        await waitAiCacheDelay()
        result.value = cachedData
        stopLoadingStage()
        await nextTick()
        renderCharts()
        ElMessage.success('已加载示例本地缓存结果')
      } finally {
        loading.value = false
      }
      return
    }

    startLoadingStage()
    try {
      const data = await analyzeCareerCenter(payload)
      result.value = data

      if (isDemoRequest) {
        setAiDemoCache('career-center.analyze', payload, data)
      }

      stopLoadingStage()
      await nextTick()
      renderCharts()
      ElMessage.success(isDemoRequest ? 'AI职业规划报告生成成功，示例结果已缓存' : 'AI职业规划报告生成成功')
    } catch (error) {
      window.clearInterval(loadingTimer)
      loadingText.value = '职业规划生成失败，请稍后重试'
      throw error
    } finally {
      loading.value = false
    }
  }

  function resetForm () {
    Object.assign(form, {
      targetJob: '',
      city: '',
      degree: '',
      experience: '',
      currentStatus: '',
      careerGoal: '',
      ownSkills: '',
      projectExperience: '',
      resumeText: '',
      expectedSalary: '',
      outputStyle: '求职实用型'
    })
    result.value = { ...emptyResult }
    demoFormSnapshot.value = null
    disposeCharts()
  }

  function renderCharts () {
    renderRadarChart()
    renderSkillBarChart()
  }

  function renderRadarChart () {
    if (!radarRef.value || !result.value.radarData?.length) return
    radarChart?.dispose()
    radarChart = echarts.init(radarRef.value)
    radarChart.setOption({
      tooltip: {},
      radar: {
        radius: '62%',
        indicator: result.value.radarData.map((item) => ({ name: item.name, max: 100 })),
        splitNumber: 4
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: result.value.radarData.map((item) => item.score),
              name: '能力评分',
              areaStyle: { opacity: 0.18 }
            }
          ]
        }
      ]
    })
  }

  function renderSkillBarChart () {
    if (!skillBarRef.value || !result.value.skillHotspots?.length) return
    skillBarChart?.dispose()
    skillBarChart = echarts.init(skillBarRef.value)
    const list = result.value.skillHotspots.slice(0, 10).reverse()
    skillBarChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 80, right: 20, top: 20, bottom: 24 },
      xAxis: { type: 'value', axisLabel: { color: '#667085' } },
      yAxis: {
        type: 'category',
        data: list.map((item) => item.name),
        axisLabel: { color: '#667085' }
      },
      series: [
        {
          type: 'bar',
          data: list.map((item) => item.value),
          barWidth: 12,
          itemStyle: { borderRadius: [0, 8, 8, 0] }
        }
      ]
    })
  }

  function resizeCharts () {
    radarChart?.resize()
    skillBarChart?.resize()
  }

  function disposeCharts () {
    radarChart?.dispose()
    skillBarChart?.dispose()
    radarChart = null
    skillBarChart = null
  }

  function formatTagType (level: CareerCenterDiagnosisItem['level']) {
    if (level === 'danger') return 'danger'
    if (level === 'warning') return 'warning'
    return 'success'
  }

  function downloadReport () {
    if (!result.value.reportText) return
    const blob = new Blob([result.value.reportText], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `AI职业规划报告_${result.value.targetJob || '未命名'}.md`
    link.click()
    URL.revokeObjectURL(url)
  }

  onMounted(() => {
    loadOptions()
    window.addEventListener('resize', resizeCharts)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCharts)
    window.clearInterval(loadingTimer)
    disposeCharts()
  })
</script>

<style scoped lang="scss">
  .career-page {
    min-height: 100%;
    padding: 18px;
    background: #f5f7fb;
    color: #1f2937;
  }

  .card {
    border: 1px solid #edf0f5;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 10px 28px rgb(15 23 42 / 5%);
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    padding: 24px 26px;
    margin-bottom: 18px;
  }

  .header-left {
    max-width: 860px;
  }

  .eyebrow {
    margin-bottom: 8px;
    color: #409eff;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .page-header h2 {
    margin: 0 0 10px;
    color: #111827;
    font-size: 26px;
    font-weight: 700;
  }

  .page-header p {
    margin: 0;
    color: #667085;
    font-size: 14px;
    line-height: 1.8;
  }

  .header-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }

  .header-actions {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    gap: 10px;
  }

  .page-layout {
    display: grid;
    grid-template-columns: 420px minmax(0, 1fr);
    gap: 18px;
    align-items: start;
  }

  .left-panel {
    position: sticky;
    top: 16px;
    padding: 20px;
  }

  .right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .section-head.compact {
    margin-bottom: 12px;
  }

  .section-title {
    color: #111827;
    font-size: 16px;
    font-weight: 700;
  }

  .section-desc {
    margin-top: 4px;
    color: #8a94a6;
    font-size: 13px;
  }

  .career-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding-top: 4px;
  }

  .loading-card {
    padding: 18px;
  }

  .loading-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    color: #111827;
    font-weight: 700;
  }

  .loading-card p {
    margin: 12px 0 0;
    color: #667085;
    font-size: 13px;
  }

  .empty-card {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 420px;
  }

  .score-card {
    padding: 22px;
  }

  .score-main {
    display: flex;
    align-items: center;
    gap: 24px;
  }

  .score-circle {
    flex-shrink: 0;
  }

  .score-label {
    color: #667085;
    font-size: 14px;
  }

  .score-title {
    margin: 6px 0 10px;
    color: #111827;
    font-size: 26px;
    font-weight: 800;
  }

  .score-info p {
    margin: 0;
    color: #526071;
    line-height: 1.9;
  }

  .query-note {
    display: inline-flex;
    align-items: center;
    margin-top: 10px;
    padding: 6px 10px;
    border-radius: 999px;
    background: #f2f6ff;
    color: #4b6b9b;
    font-size: 12px;
  }

  .metric-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .stat-card {
    padding: 16px;
    margin-bottom: 0;
  }

  .stat-label {
    color: #667085;
    font-size: 13px;
  }

  .stat-value {
    margin-top: 8px;
    color: #111827;
    font-size: 26px;
    font-weight: 800;
  }

  .stat-desc {
    margin-top: 6px;
    color: #98a2b3;
    font-size: 12px;
  }

  .double-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .triple-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 14px;
  }

  .chart-card,
  .block-card {
    padding: 18px;
  }

  .chart-box {
    width: 100%;
    height: 320px;
    margin-top: 12px;
  }

  .skill-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    margin-top: 12px;
  }

  .mini-title {
    margin-bottom: 10px;
    color: #344054;
    font-size: 14px;
    font-weight: 700;
  }

  .success-title {
    color: #16a34a;
  }

  .danger-title {
    color: #dc2626;
  }

  .tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .empty-text {
    color: #98a2b3;
    font-size: 13px;
  }

  .diagnosis-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 12px;
  }

  .diagnosis-item {
    padding: 14px;
    border: 1px solid #edf0f5;
    border-radius: 12px;
    background: #fafbfc;
  }

  .diagnosis-item p {
    margin: 10px 0 0;
    color: #526071;
    line-height: 1.8;
  }

  .rank-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  .rank-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
    background: #f8fafc;
  }

  .rank-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #eef5ff;
    color: #409eff;
    font-size: 12px;
    font-weight: 700;
  }

  .rank-name {
    flex: 1;
    overflow: hidden;
    color: #344054;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .rank-value {
    color: #8a94a6;
    font-size: 12px;
  }

  .roadmap-card {
    padding: 14px;
    border: 1px solid #edf0f5;
    border-radius: 12px;
    background: #fbfcff;
  }

  .roadmap-title {
    margin-bottom: 8px;
    color: #111827;
    font-weight: 700;
  }

  .roadmap-card ul,
  .mini-list ul {
    padding-left: 18px;
    margin: 0;
    color: #526071;
    line-height: 1.9;
  }

  .advice-box {
    padding: 16px;
    margin-top: 12px;
    border: 1px solid #edf0f5;
    border-radius: 12px;
    background: #f8fafc;
  }

  .advice-subtitle {
    margin-top: 10px;
    color: #111827;
    font-weight: 700;
  }

  .advice-subtitle:first-child {
    margin-top: 0;
  }

  .advice-box p {
    margin: 8px 0 0;
    color: #526071;
    line-height: 1.9;
  }

  .mini-list {
    padding: 14px;
    border: 1px solid #edf0f5;
    border-radius: 12px;
    background: #fff;
  }

  .action-list,
  .question-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  .action-item {
    display: flex;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #f8fafc;
  }

  .action-item span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #409eff;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
  }

  .action-item p {
    margin: 0;
    color: #526071;
    line-height: 1.8;
  }

  .question-item {
    padding: 12px 14px;
    border: 1px solid #edf0f5;
    border-radius: 12px;
    color: #526071;
    line-height: 1.7;
  }

  @media (max-width: 1280px) {
    .page-layout {
      grid-template-columns: 1fr;
    }

    .left-panel {
      position: static;
    }
  }

  @media (max-width: 960px) {
    .page-header,
    .score-main {
      flex-direction: column;
    }

    .header-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .metric-grid,
    .double-grid,
    .triple-grid,
    .skill-columns {
      grid-template-columns: 1fr;
    }
  }
</style>

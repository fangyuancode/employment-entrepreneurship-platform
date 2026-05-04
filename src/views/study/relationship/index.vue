<template>
  <div class="relationship-page">
    <div class="page-header card">
      <div class="header-left">
        <h2>实体关系抽取</h2>
        <p>
          输入一段文本，自动完成实体识别、关系抽取、事件抽取、时间线整理与知识图谱可视化展示，
          适用于项目介绍、企业资料、新闻内容、比赛文案与论文材料分析。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="fillDemo">一键填充示例</el-button>
        <el-button :disabled="!result.summary" @click="handleExportPdf">导出 PDF</el-button>
        <el-button type="primary" :loading="loading" @click="handleExtract">开始抽取</el-button>
      </div>
    </div>

    <div class="input-section card">
      <div class="section-title">分析参数</div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="任务名称" prop="projectName">
              <el-input v-model="form.projectName" placeholder="如：AI创业助手项目关系分析" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="领域类型" prop="domain">
              <el-select v-model="form.domain" placeholder="请选择领域" style="width: 100%">
                <el-option v-for="item in domainOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="待分析文本" prop="text">
              <el-input
                v-model="form.text"
                type="textarea"
                :rows="10"
                resize="vertical"
                placeholder="请输入需要做实体关系抽取的文本内容"
              />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="偏好实体类型">
              <el-select
                v-model="form.preferredEntityTypes"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="可多选"
                style="width: 100%"
              >
                <el-option
                  v-for="item in entityTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="偏好关系类型">
              <el-select
                v-model="form.preferredRelationTypes"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="可多选"
                style="width: 100%"
              >
                <el-option
                  v-for="item in relationTypeOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="12" :md="8" :lg="8">
            <el-form-item label="语言">
              <el-select v-model="form.language" style="width: 100%">
                <el-option label="中文" value="zh-CN" />
                <el-option label="英文" value="en-US" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="12" :sm="6" :md="8" :lg="8">
            <el-form-item label="事件抽取">
              <el-switch v-model="form.enableEventExtraction" />
            </el-form-item>
          </el-col>

          <el-col :xs="12" :sm="6" :md="8" :lg="8">
            <el-form-item label="生成时间线">
              <el-switch v-model="form.enableTimeline" />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="form-footer">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" :loading="loading" @click="handleExtract">开始抽取</el-button>
        </div>
      </el-form>
    </div>

    <div
      ref="exportRef"
      v-loading="loading"
      :element-loading-text="loadingText"
      element-loading-background="rgba(255,255,255,0.72)"
      class="result-section"
    >
      <div class="stats-grid">
        <div class="card stat-card">
          <div class="stat-label">实体数量</div>
          <div class="stat-value">{{ result.entities.length }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">关系数量</div>
          <div class="stat-value">{{ result.relations.length }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">事件数量</div>
          <div class="stat-value">{{ result.events.length }}</div>
        </div>
        <div class="card stat-card">
          <div class="stat-label">关键词数量</div>
          <div class="stat-value">{{ result.keywords.length }}</div>
        </div>
      </div>

      <div class="card block-card">
        <div class="section-head">
          <div class="section-title">摘要与关键词</div>
        </div>

        <div v-if="!result.summary && !loading" class="empty-wrap">
          <el-empty description="请先输入文本并点击“开始抽取”" />
        </div>

        <template v-if="result.summary">
          <div class="summary-box">{{ result.summary }}</div>

          <div class="keyword-wrap">
            <el-tag
              v-for="item in result.keywords"
              :key="item"
              effect="plain"
              round
              class="keyword-tag"
            >
              {{ item }}
            </el-tag>
          </div>
        </template>
      </div>

      <div class="graph-row">
        <div class="card block-card graph-main">
          <div class="section-head">
            <div class="section-title">知识图谱可视化</div>
            <div class="section-desc">支持缩放、拖拽、查看实体之间的关系结构</div>
          </div>
          <div ref="graphRef" class="graph-canvas"></div>
        </div>

        <div class="side-column">
          <div class="card block-card">
            <div class="section-head">
              <div class="section-title">分析洞察</div>
            </div>
            <div class="info-list">
              <div
                v-for="(item, index) in result.insightSuggestions"
                :key="index"
                class="info-item"
              >
                {{ index + 1 }}. {{ item }}
              </div>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-head">
              <div class="section-title">推荐追问</div>
            </div>
            <div class="info-list">
              <div
                v-for="(item, index) in result.qaSuggestions"
                :key="index"
                class="info-item question-item"
              >
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chart-row">
        <div class="card block-card">
          <div class="section-head">
            <div class="section-title">实体类型分布</div>
          </div>
          <div ref="entityChartRef" class="chart-canvas"></div>
        </div>

        <div class="card block-card">
          <div class="section-head">
            <div class="section-title">关系类型分布</div>
          </div>
          <div ref="relationChartRef" class="chart-canvas"></div>
        </div>
      </div>

      <div class="card block-card">
        <div class="section-head">
          <div class="section-title">实体列表</div>
        </div>
        <el-table :data="filteredEntities" stripe border>
          <el-table-column prop="name" label="实体名称" min-width="140" />
          <el-table-column prop="type" label="实体类型" width="120" />
          <el-table-column prop="mentionCount" label="出现次数" width="100" />
          <el-table-column label="置信度" width="120">
            <template #default="{ row }">
              {{ formatPercent(row.confidence) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
        </el-table>
      </div>

      <div class="card block-card">
        <div class="section-head">
          <div class="section-title">关系列表</div>
        </div>
        <el-table :data="result.relations" stripe border>
          <el-table-column prop="sourceName" label="源实体" min-width="120" />
          <el-table-column prop="relationType" label="关系" width="120" />
          <el-table-column prop="targetName" label="目标实体" min-width="120" />
          <el-table-column label="置信度" width="120">
            <template #default="{ row }">
              {{ formatPercent(row.confidence) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="evidence"
            label="证据/依据"
            min-width="220"
            show-overflow-tooltip
          />
        </el-table>
      </div>

      <div class="timeline-event-row" v-if="form.enableEventExtraction || form.enableTimeline">
        <div class="card block-card">
          <div class="section-head">
            <div class="section-title">时间线</div>
          </div>

          <div v-if="!result.timeline.length" class="light-empty">暂无时间线数据</div>

          <div v-else class="timeline-list">
            <div v-for="(item, index) in result.timeline" :key="index" class="timeline-item">
              <div class="timeline-line">
                <span class="timeline-dot"></span>
              </div>
              <div class="timeline-body">
                <div class="timeline-time">{{ item.time || '未明确' }}</div>
                <div class="timeline-title">{{ item.title }}</div>
                <div class="timeline-desc">{{ item.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="card block-card">
          <div class="section-head">
            <div class="section-title">事件抽取</div>
          </div>

          <div v-if="!result.events.length" class="light-empty">暂无事件数据</div>

          <div v-else class="event-list">
            <div v-for="item in result.events" :key="item.id" class="event-item">
              <div class="event-top">
                <span class="event-title">{{ item.title }}</span>
                <span class="event-time">{{ item.time || '未明确时间' }}</span>
              </div>
              <div class="event-desc">{{ item.description }}</div>
              <div class="event-tags">
                <el-tag size="small" effect="plain">{{ item.eventType }}</el-tag>
                <el-tag
                  v-for="person in item.participants || []"
                  :key="person"
                  size="small"
                  effect="plain"
                >
                  {{ person }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card block-card">
        <div class="section-head">
          <div class="section-title">扩展能力建议</div>
        </div>
        <div class="capability-grid">
          <div class="capability-item">将实体关系结果自动生成 Mermaid 图</div>
          <div class="capability-item">支持导出 JSON / Markdown / PDF</div>
          <div class="capability-item">支持企业画像、人物画像自动总结</div>
          <div class="capability-item">支持多文本对比抽取与关系合并</div>
          <div class="capability-item">支持知识图谱问答与追问</div>
          <div class="capability-item">支持项目人物-组织-技术三层图谱</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import * as echarts from 'echarts'
  import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import {
    cloneAiCachePayload,
    getAiDemoCache,
    isSameAiPayload,
    setAiDemoCache,
    waitAiCacheDelay
  } from '@/utils/ai-demo-cache'
  import {
    extractEntityRelation,
    getEntityRelationDemo,
    getEntityRelationTypes,
    type EntityRelationForm,
    type EntityRelationResult
  } from '@/api/entity-relationship'
  import html2canvas from 'html2canvas'
  import jsPDF from 'jspdf'
  // import * as echarts from 'echarts'
  // import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
  // import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  const formRef = ref<FormInstance>()
  const graphRef = ref<HTMLDivElement>()
  const entityChartRef = ref<HTMLDivElement>()
  const relationChartRef = ref<HTMLDivElement>()

  let graphChart: echarts.ECharts | null = null
  let entityChart: echarts.ECharts | null = null
  let relationChart: echarts.ECharts | null = null

  const loading = ref(false)
  const demoFormSnapshot = ref<EntityRelationForm | null>(null)
  const loadingText = ref('正在分析文本、抽取实体与关系...')

  const entityTypeOptions = ref<string[]>([])
  const relationTypeOptions = ref<string[]>([])
  const domainOptions = ref<string[]>(['通用文本', 'AI创业', '企业信息', '学术论文', '新闻资讯'])

  const form = reactive<EntityRelationForm>({
    projectName: 'AI创业助手项目关系分析',
    text: '',
    domain: 'AI创业',
    preferredEntityTypes: ['人物', '组织', '产品', '技术'],
    preferredRelationTypes: ['创立', '合作', '依赖', '负责'],
    enableEventExtraction: true,
    enableTimeline: true,
    language: 'zh-CN'
  })

  const result = reactive<EntityRelationResult>({
    projectName: '',
    summary: '',
    keywords: [],
    entities: [],
    relations: [],
    events: [],
    timeline: [],
    graphNodes: [],
    graphLinks: [],
    entityTypeStats: {},
    relationTypeStats: {},
    insightSuggestions: [],
    qaSuggestions: []
  })
  const exportRef = ref<HTMLDivElement>()
  const rules: FormRules = {
    projectName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
    domain: [{ required: true, message: '请选择领域', trigger: 'change' }],
    text: [{ required: true, message: '请输入待分析文本', trigger: 'blur' }]
  }

  const filteredEntities = computed(() => result.entities)

  function resetResult() {
    result.projectName = ''
    result.summary = ''
    result.keywords = []
    result.entities = []
    result.relations = []
    result.events = []
    result.timeline = []
    result.graphNodes = []
    result.graphLinks = []
    result.entityTypeStats = {}
    result.relationTypeStats = {}
    result.insightSuggestions = []
    result.qaSuggestions = []
  }
  async function handleExportPdf() {
    if (!exportRef.value) {
      ElMessage.warning('暂无可导出的内容')
      return
    }

    if (!result.summary) {
      ElMessage.warning('请先生成实体关系抽取结果')
      return
    }

    try {
      ElMessage.info('正在导出 PDF，请稍候...')
      await nextTick()

      graphChart?.resize()
      entityChart?.resize()
      relationChart?.resize()

      await new Promise((resolve) => setTimeout(resolve, 400))

      const canvas = await html2canvas(exportRef.value, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 10
      const contentWidth = pageWidth - margin * 2

      const canvasWidth = canvas.width
      const canvasHeight = canvas.height

      const imgHeight = (contentWidth * canvasHeight) / canvasWidth
      let heightLeft = imgHeight
      let position = margin

      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2

      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft)
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight)
        heightLeft -= pageHeight - margin * 2
      }

      const fileName = `${form.projectName || '实体关系抽取结果'}.pdf`
      pdf.save(fileName)

      ElMessage.success('PDF 导出成功')
    } catch (error) {
      console.error(error)
      ElMessage.error('PDF 导出失败，请稍后重试')
    }
  }
  function handleReset() {
    form.projectName = 'AI创业助手项目关系分析'
    form.text = ''
    form.domain = 'AI创业'
    form.preferredEntityTypes = ['人物', '组织', '产品', '技术']
    form.preferredRelationTypes = ['创立', '合作', '依赖', '负责']
    form.enableEventExtraction = true
    form.enableTimeline = true
    form.language = 'zh-CN'
    resetResult()
    demoFormSnapshot.value = null
    renderAllCharts()
  }

  async function fillDemo() {
    try {
      const data = await getEntityRelationDemo()
      form.text = data.text
    } catch (error) {
      form.text = `2026年3月，星火智创团队在兰州发布了“AI创业助手”平台。该项目由张晨与李悦联合发起，依托B站大学创新实践团队进行研发，核心技术包括大语言模型、知识图谱与多智能体协作。4月，团队与启航科技有限公司达成合作，共同推进产品上线。`
    }

    demoFormSnapshot.value = cloneAiCachePayload(form)
    ElMessage.success('示例数据已填充，首次抽取后会自动缓存结果')
  }

  async function initOptions() {
    try {
      const data = await getEntityRelationTypes()
      entityTypeOptions.value = data.entityTypes || []
      relationTypeOptions.value = data.relationTypes || []
      domainOptions.value = data.domains || domainOptions.value
    } catch (error) {
      console.error(error)
    }
  }

  async function handleExtract() {
    if (!formRef.value) return
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    const payload = cloneAiCachePayload(form)
    const isDemoRequest = demoFormSnapshot.value
      ? isSameAiPayload(payload, demoFormSnapshot.value)
      : false
    const cachedData = isDemoRequest
      ? getAiDemoCache<EntityRelationResult>('entity-relationship.extract', payload)
      : null

    loading.value = true

    if (cachedData) {
      try {
        loadingText.value = '检测到示例数据已有本地缓存，3秒后直接展示抽取结果...'
        await waitAiCacheDelay()
        result.projectName = cachedData.projectName || ''
        result.summary = cachedData.summary || ''
        result.keywords = cachedData.keywords || []
        result.entities = cachedData.entities || []
        result.relations = cachedData.relations || []
        result.events = cachedData.events || []
        result.timeline = cachedData.timeline || []
        result.graphNodes = cachedData.graphNodes || []
        result.graphLinks = cachedData.graphLinks || []
        result.entityTypeStats = cachedData.entityTypeStats || {}
        result.relationTypeStats = cachedData.relationTypeStats || {}
        result.insightSuggestions = cachedData.insightSuggestions || []
        result.qaSuggestions = cachedData.qaSuggestions || []
        ElMessage.success('已加载示例本地缓存结果')
        await nextTick()
        renderAllCharts()
      } finally {
        loading.value = false
        loadingText.value = '正在分析文本、抽取实体与关系...'
      }
      return
    }

    const texts = [
      '正在分析文本结构...',
      '正在抽取实体...',
      '正在识别关系链路...',
      '正在整理事件与时间线...',
      '正在构建知识图谱...'
    ]
    let index = 0
    const timer = window.setInterval(() => {
      loadingText.value = texts[index % texts.length]
      index++
    }, 900)

    try {
      const data = await extractEntityRelation(payload)

      result.projectName = data.projectName || ''
      result.summary = data.summary || ''
      result.keywords = data.keywords || []
      result.entities = data.entities || []
      result.relations = data.relations || []
      result.events = data.events || []
      result.timeline = data.timeline || []
      result.graphNodes = data.graphNodes || []
      result.graphLinks = data.graphLinks || []
      result.entityTypeStats = data.entityTypeStats || {}
      result.relationTypeStats = data.relationTypeStats || {}
      result.insightSuggestions = data.insightSuggestions || []
      result.qaSuggestions = data.qaSuggestions || []

      if (isDemoRequest) {
        setAiDemoCache('entity-relationship.extract', payload, cloneAiCachePayload(result))
      }

      ElMessage.success(isDemoRequest ? '实体关系抽取完成，示例结果已缓存' : '实体关系抽取完成')
      await nextTick()
      renderAllCharts()
    } catch (error: any) {
      console.error(error)
      ElMessage.error(error?.response?.data?.msg || '抽取失败，请稍后重试')
    } finally {
      loading.value = false
      window.clearInterval(timer)
      loadingText.value = '正在分析文本、抽取实体与关系...'
    }
  }

  function formatPercent(value?: number) {
    if (typeof value !== 'number') return '--'
    return `${Math.round(value * 100)}%`
  }

  function renderAllCharts() {
    nextTick(() => {
      renderGraphChart()
      renderEntityChart()
      renderRelationChart()
    })
  }

  function renderGraphChart() {
    if (!graphRef.value) return
    if (!graphChart) {
      graphChart = echarts.init(graphRef.value)
    }

    const categories = Array.from(
      new Set(result.graphNodes.map((item) => item.category || '未分类'))
    ).map((name) => ({ name }))

    graphChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: 0,
        data: categories.map((item) => item.name)
      },
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          data: result.graphNodes.map((item) => ({
            ...item,
            category: categories.findIndex((c) => c.name === item.category),
            label: {
              show: true
            }
          })),
          links: result.graphLinks.map((item) => ({
            ...item,
            label: {
              show: true,
              formatter: item.value
            },
            lineStyle: {
              width: item.lineWidth || 1.5,
              curveness: 0.12
            }
          })),
          categories,
          force: {
            repulsion: 260,
            edgeLength: [90, 160]
          },
          emphasis: {
            focus: 'adjacency'
          }
        }
      ]
    })
    graphChart.resize()
  }

  function renderEntityChart() {
    if (!entityChartRef.value) return
    if (!entityChart) {
      entityChart = echarts.init(entityChartRef.value)
    }

    const entries = Object.entries(result.entityTypeStats || {})
    entityChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: ['38%', '65%'],
          label: {
            formatter: '{b}\n{c}'
          },
          data: entries.map(([name, value]) => ({ name, value }))
        }
      ]
    })
    entityChart.resize()
  }

  function renderRelationChart() {
    if (!relationChartRef.value) return
    if (!relationChart) {
      relationChart = echarts.init(relationChartRef.value)
    }

    const entries = Object.entries(result.relationTypeStats || {})
    relationChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      grid: {
        left: 40,
        right: 20,
        top: 30,
        bottom: 50
      },
      xAxis: {
        type: 'category',
        data: entries.map((item) => item[0]),
        axisLabel: {
          interval: 0,
          rotate: 20
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: entries.map((item) => item[1]),
          barMaxWidth: 42
        }
      ]
    })
    relationChart.resize()
  }

  function handleResize() {
    graphChart?.resize()
    entityChart?.resize()
    relationChart?.resize()
  }

  onMounted(async () => {
    await initOptions()
    window.addEventListener('resize', handleResize)
    await nextTick()
    renderAllCharts()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize)
    graphChart?.dispose()
    entityChart?.dispose()
    relationChart?.dispose()
    graphChart = null
    entityChart = null
    relationChart = null
  })
</script>

<style scoped lang="scss">
  .relationship-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 6px;
  }

  .card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 14px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
  }

  .page-header,
  .input-section,
  .block-card,
  .stat-card {
    padding: 20px;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .header-left {
    flex: 1;

    h2 {
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 700;
      color: #1f2937;
    }

    p {
      margin: 0;
      max-width: 920px;
      line-height: 1.8;
      font-size: 14px;
      color: #6b7280;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }

  .section-desc {
    font-size: 12px;
    color: #9ca3af;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 8px;
  }

  .result-section {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .stat-card {
    min-height: 108px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .stat-label {
    font-size: 13px;
    color: #6b7280;
  }

  .stat-value {
    margin-top: 10px;
    font-size: 28px;
    font-weight: 700;
    color: #111827;
  }

  .summary-box {
    padding: 14px 16px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
    border-radius: 12px;
    line-height: 1.9;
    color: #374151;
  }

  .keyword-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 14px;
  }

  .keyword-tag {
    margin: 0;
  }

  .graph-row {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(320px, 0.9fr);
    gap: 16px;
    align-items: stretch;
  }

  .graph-main {
    min-width: 0;
  }

  .side-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 0;
  }

  .graph-canvas {
    width: 100%;
    min-height: 520px;
    height: 520px;
  }

  .chart-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .chart-canvas {
    width: 100%;
    min-height: 320px;
    height: 320px;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .info-item {
    padding: 12px 14px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
    line-height: 1.75;
    color: #374151;
    font-size: 14px;
  }

  .question-item {
    color: #4b5563;
  }

  .timeline-event-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .timeline-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .timeline-item {
    display: flex;
    gap: 14px;
  }

  .timeline-line {
    display: flex;
    justify-content: center;
    width: 20px;
    position: relative;
    flex-shrink: 0;
  }

  .timeline-line::after {
    content: '';
    position: absolute;
    top: 12px;
    bottom: -8px;
    width: 1px;
    background: #e5e7eb;
  }

  .timeline-item:last-child .timeline-line::after {
    display: none;
  }

  .timeline-dot {
    width: 10px;
    height: 10px;
    margin-top: 6px;
    border-radius: 50%;
    background: #409eff;
    z-index: 1;
  }

  .timeline-body {
    flex: 1;
    padding-bottom: 8px;
  }

  .timeline-time {
    font-size: 13px;
    color: #409eff;
    margin-bottom: 6px;
  }

  .timeline-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 6px;
  }

  .timeline-desc {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.8;
  }

  .event-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .event-item {
    padding: 14px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
  }

  .event-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .event-title {
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
  }

  .event-time {
    font-size: 13px;
    color: #409eff;
    white-space: nowrap;
  }

  .event-desc {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.8;
    margin-bottom: 10px;
  }

  .event-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .capability-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .capability-item {
    padding: 14px 16px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #eef2f7;
    color: #374151;
    line-height: 1.7;
    font-size: 14px;
  }

  .empty-wrap,
  .light-empty {
    padding: 18px 0;
  }

  :deep(.el-table) {
    border-radius: 10px;
    overflow: hidden;
  }

  :deep(.el-textarea__inner) {
    min-height: 220px !important;
  }

  @media (max-width: 1200px) {
    .graph-row,
    .chart-row,
    .timeline-event-row,
    .capability-grid {
      grid-template-columns: 1fr;
    }

    .graph-canvas {
      height: 460px;
      min-height: 460px;
    }
  }

  @media (max-width: 768px) {
    .relationship-page {
      padding: 0;
    }

    .page-header {
      flex-direction: column;
    }

    .header-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .graph-canvas {
      height: 400px;
      min-height: 400px;
    }

    .chart-canvas {
      height: 280px;
      min-height: 280px;
    }

    .event-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

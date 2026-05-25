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
        <el-button :disabled="!hasResult" @click="handleExportPdf">导出 PDF</el-button>
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
              <el-input v-model="form.text" type="textarea" :rows="10" resize="vertical" placeholder="请输入需要做实体关系抽取的文本内容" />
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="偏好实体类型">
              <el-select v-model="form.preferredEntityTypes" multiple collapse-tags collapse-tags-tooltip placeholder="可多选" style="width: 100%">
                <el-option v-for="item in entityTypeOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="24" :sm="24" :md="12" :lg="12">
            <el-form-item label="偏好关系类型">
              <el-select v-model="form.preferredRelationTypes" multiple collapse-tags collapse-tags-tooltip placeholder="可多选" style="width: 100%">
                <el-option v-for="item in relationTypeOptions" :key="item" :label="item" :value="item" />
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

    <div ref="exportRef" class="result-section">
      <div v-if="!hasResult && !loading" class="ai-state-card ai-state-empty">
        <div class="ai-state-icon">AI</div>
        <div class="ai-state-title">等待抽取实体关系</div>
        <div class="ai-state-desc">输入待分析文本后，点击「开始抽取」，系统会生成摘要、实体列表、关系网络、时间线和知识图谱。</div>
        <div class="ai-state-tips">
          <span>实体识别</span>
          <span>关系抽取</span>
          <span>图谱可视化</span>
        </div>
      </div>

      <div v-else-if="loading" class="ai-state-card ai-loading-state">
        <div class="ai-loading-ring"></div>
        <div class="ai-state-title">正在抽取实体关系</div>
        <div class="ai-state-desc">{{ loadingText }}</div>
        <div class="ai-loading-progress"><span></span></div>
        <div class="ai-loading-steps">
          <span>识别实体</span>
          <span>抽取关系</span>
          <span>整理事件</span>
          <span>生成图谱</span>
        </div>
      </div>

      <template v-else>
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

          <template v-if="result.summary">
            <div class="summary-box">{{ result.summary }}</div>

            <div class="keyword-wrap">
              <el-tag v-for="item in result.keywords" :key="item" effect="plain" round class="keyword-tag">
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
                <div v-for="(item, index) in result.insightSuggestions" :key="index" class="info-item">
                  {{ index + 1 }}. {{ item }}
                </div>
              </div>
            </div>

            <div class="card block-card">
              <div class="section-head">
                <div class="section-title">推荐追问</div>
              </div>
              <div class="info-list">
                <div v-for="(item, index) in result.qaSuggestions" :key="index" class="info-item question-item">
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
            <el-table-column prop="evidence" label="证据/依据" min-width="220" show-overflow-tooltip />
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
                  <el-tag v-for="person in item.participants || []" :key="person" size="small" effect="plain">
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
      </template>
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
  type EntityRelationResult,
  type ExtractedEntity,
  type ExtractedRelation,
  type KnowledgeGraphLink,
  type KnowledgeGraphNode
} from '@/api/entity-relationship'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type PartialEntityRelationResult = Partial<EntityRelationResult> | null | undefined

const formRef = ref<FormInstance>()
const graphRef = ref<HTMLDivElement>()
const entityChartRef = ref<HTMLDivElement>()
const relationChartRef = ref<HTMLDivElement>()
const exportRef = ref<HTMLDivElement>()

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

const rules: FormRules = {
  projectName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  domain: [{ required: true, message: '请选择领域', trigger: 'change' }],
  text: [{ required: true, message: '请输入待分析文本', trigger: 'blur' }]
}

const filteredEntities = computed(() => result.entities)
const hasResult = computed(() =>
  Boolean(
    result.summary || result.entities.length || result.relations.length || result.graphNodes.length
  )
)

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function safeRecord(value: Record<string, number> | null | undefined): Record<string, number> {
  if (!value || typeof value !== 'object') return {}

  const record: Record<string, number> = {}
  Object.entries(value).forEach(([key, count]) => {
    const normalizedKey = String(key || '').trim() || '未分类'
    const normalizedCount = Number(count)
    record[normalizedKey] = Number.isFinite(normalizedCount) ? normalizedCount : 0
  })
  return record
}

function normalizeConfidence(value?: number) {
  const numberValue = Number(value)
  if (!Number.isFinite(numberValue)) return 0.72
  if (numberValue > 1) return Math.min(numberValue / 100, 1)
  return Math.max(numberValue, 0.01)
}

function normalizeEntities(entities: ExtractedEntity[] | null | undefined): ExtractedEntity[] {
  return safeArray(entities)
    .filter((item) => item && item.name)
    .map((item, index) => ({
      ...item,
      id: item.id || `e${index + 1}`,
      name: item.name || `实体${index + 1}`,
      type: item.type || '未分类',
      alias: item.alias || '',
      description: item.description || `${item.name || `实体${index + 1}`} 是文本中识别出的实体`,
      confidence: normalizeConfidence(item.confidence),
      mentionCount: Number(item.mentionCount) > 0 ? Number(item.mentionCount) : 1,
      tags: safeArray(item.tags)
    }))
}

function normalizeRelations(
  relations: ExtractedRelation[] | null | undefined,
  entities: ExtractedEntity[]
): ExtractedRelation[] {
  const idSet = new Set(entities.map((item) => item.id))
  const nameToId = new Map(entities.map((item) => [item.name, item.id]))

  return safeArray(relations)
    .filter(
      (item) => item && (item.sourceId || item.sourceName) && (item.targetId || item.targetName)
    )
    .map((item, index) => {
      const sourceId = idSet.has(item.sourceId)
        ? item.sourceId
        : nameToId.get(item.sourceName) || item.sourceId
      const targetId = idSet.has(item.targetId)
        ? item.targetId
        : nameToId.get(item.targetName) || item.targetId
      return {
        ...item,
        id: item.id || `r${index + 1}`,
        sourceId,
        targetId,
        sourceName:
          item.sourceName || entities.find((entity) => entity.id === sourceId)?.name || sourceId,
        targetName:
          item.targetName || entities.find((entity) => entity.id === targetId)?.name || targetId,
        relationType: item.relationType || '关联',
        description: item.description || '文本中存在语义关联',
        confidence: normalizeConfidence(item.confidence),
        evidence: item.evidence || '根据文本上下文抽取得到'
      }
    })
    .filter((item) => Boolean(item.sourceId && item.targetId))
}

function buildEntityStats(entities: ExtractedEntity[]) {
  const stats: Record<string, number> = {}
  entities.forEach((item) => {
    const type = item.type || '未分类'
    stats[type] = (stats[type] || 0) + 1
  })
  return stats
}

function buildRelationStats(relations: ExtractedRelation[]) {
  const stats: Record<string, number> = {}
  relations.forEach((item) => {
    const type = item.relationType || '关联'
    stats[type] = (stats[type] || 0) + 1
  })
  return stats
}

function buildGraphNodes(
  entities: ExtractedEntity[],
  graphNodes: KnowledgeGraphNode[] | null | undefined
) {
  if (safeArray(graphNodes).length) {
    return safeArray(graphNodes).map((item, index) => ({
      ...item,
      id: item.id || `node-${index + 1}`,
      name: item.name || `节点${index + 1}`,
      category: item.category || '未分类',
      symbolSize: Number(item.symbolSize) > 0 ? Number(item.symbolSize) : 42,
      value: Number.isFinite(Number(item.value)) ? Number(item.value) : 1
    }))
  }

  return entities.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.type || '未分类',
    symbolSize: Math.min(82, Math.max(38, 32 + (item.mentionCount || 1) * 5)),
    value: item.mentionCount || 1
  }))
}

function buildGraphLinks(
  relations: ExtractedRelation[],
  entities: ExtractedEntity[],
  graphLinks: KnowledgeGraphLink[] | null | undefined
) {
  const idSet = new Set(entities.map((item) => item.id))
  const nameToId = new Map(entities.map((item) => [item.name, item.id]))

  if (safeArray(graphLinks).length) {
    return safeArray(graphLinks)
      .map((item) => {
        const source = idSet.has(String(item.source))
          ? String(item.source)
          : nameToId.get(String(item.source)) || String(item.source)
        const target = idSet.has(String(item.target))
          ? String(item.target)
          : nameToId.get(String(item.target)) || String(item.target)
        return {
          ...item,
          source,
          target,
          value: item.value || '关联',
          lineWidth: Number(item.lineWidth) > 0 ? Number(item.lineWidth) : 1.8
        }
      })
      .filter((item) => item.source && item.target)
  }

  return relations.map((item) => ({
    source: item.sourceId,
    target: item.targetId,
    value: item.relationType || '关联',
    lineWidth: 1.5 + normalizeConfidence(item.confidence) * 2
  }))
}

function normalizeResult(data: PartialEntityRelationResult): EntityRelationResult {
  const entities = normalizeEntities(data?.entities)
  const relations = normalizeRelations(data?.relations, entities)
  const entityTypeStats = Object.keys(safeRecord(data?.entityTypeStats)).length
    ? safeRecord(data?.entityTypeStats)
    : buildEntityStats(entities)
  const relationTypeStats = Object.keys(safeRecord(data?.relationTypeStats)).length
    ? safeRecord(data?.relationTypeStats)
    : buildRelationStats(relations)

  return {
    projectName: data?.projectName || form.projectName || '',
    summary: data?.summary || '',
    keywords: safeArray(data?.keywords),
    entities,
    relations,
    events: safeArray(data?.events),
    timeline: safeArray(data?.timeline),
    graphNodes: buildGraphNodes(entities, data?.graphNodes),
    graphLinks: buildGraphLinks(relations, entities, data?.graphLinks),
    entityTypeStats,
    relationTypeStats,
    insightSuggestions: safeArray(data?.insightSuggestions),
    qaSuggestions: safeArray(data?.qaSuggestions)
  }
}

function applyResult(data: PartialEntityRelationResult) {
  const normalized = normalizeResult(data)
  result.projectName = normalized.projectName
  result.summary = normalized.summary
  result.keywords = normalized.keywords
  result.entities = normalized.entities
  result.relations = normalized.relations
  result.events = normalized.events
  result.timeline = normalized.timeline
  result.graphNodes = normalized.graphNodes
  result.graphLinks = normalized.graphLinks
  result.entityTypeStats = normalized.entityTypeStats
  result.relationTypeStats = normalized.relationTypeStats
  result.insightSuggestions = normalized.insightSuggestions
  result.qaSuggestions = normalized.qaSuggestions
}

function resetResult() {
  applyResult({})
}

async function renderResultCharts() {
  loading.value = false
  await nextTick()
  renderAllCharts()
}

async function handleExportPdf() {
  if (!exportRef.value) {
    ElMessage.warning('暂无可导出的内容')
    return
  }

  if (!hasResult.value) {
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
      applyResult(cachedData)
      await renderResultCharts()
      ElMessage.success('已加载示例本地缓存结果')
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
    applyResult(data)

    if (isDemoRequest) {
      setAiDemoCache('entity-relationship.extract', payload, cloneAiCachePayload(result))
    }

    window.clearInterval(timer)
    await renderResultCharts()
    ElMessage.success(isDemoRequest ? '实体关系抽取完成，示例结果已缓存' : '实体关系抽取完成')
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
  return `${Math.round(normalizeConfidence(value) * 100)}%`
}

function renderAllCharts() {
  nextTick(() => {
    renderGraphChart()
    renderEntityChart()
    renderRelationChart()
    window.setTimeout(handleResize, 80)
  })
}

function renderGraphChart() {
  if (!graphRef.value) return
  if (!graphChart) {
    graphChart = echarts.init(graphRef.value)
  }

  if (!result.graphNodes.length) {
    graphChart.clear()
    graphChart.setOption(
      {
        title: {
          text: '暂无图谱数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#909399',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      },
      true
    )
    graphChart.resize()
    return
  }

  const categories = Array.from(
    new Set(result.graphNodes.map((item) => item.category || '未分类'))
  ).map((name) => ({ name }))

  graphChart.clear()
  graphChart.setOption(
    {
      tooltip: {
        trigger: 'item',
        formatter(params: any) {
          if (params.dataType === 'edge') {
            return `${params.data.source} → ${params.data.target}<br/>关系：${
              params.data.value || '关联'
            }`
          }
          return `${params.name}<br/>类型：${params.data.rawCategory || '未分类'}`
        }
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
          edgeSymbol: ['none', 'arrow'],
          edgeSymbolSize: 8,
          data: result.graphNodes.map((item) => {
            const rawCategory = item.category || '未分类'
            return {
              ...item,
              rawCategory,
              category: Math.max(
                categories.findIndex((c) => c.name === rawCategory),
                0
              ),
              label: {
                show: true,
                formatter: '{b}',
                fontSize: 12
              }
            }
          }),
          links: result.graphLinks.map((item) => ({
            ...item,
            label: {
              show: true,
              formatter: item.value || '关联',
              fontSize: 11
            },
            lineStyle: {
              width: item.lineWidth || 1.5,
              curveness: 0.12,
              opacity: 0.82
            }
          })),
          categories,
          force: {
            repulsion: 280,
            edgeLength: [90, 170]
          },
          emphasis: {
            focus: 'adjacency'
          }
        }
      ]
    },
    true
  )
  graphChart.resize()
}

function renderEntityChart() {
  if (!entityChartRef.value) return
  if (!entityChart) {
    entityChart = echarts.init(entityChartRef.value)
  }

  const entries = Object.entries(result.entityTypeStats || {}).filter(([, value]) => value > 0)
  if (!entries.length) {
    entityChart.clear()
    entityChart.setOption(
      {
        title: {
          text: '暂无实体类型数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#909399',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      },
      true
    )
    entityChart.resize()
    return
  }

  entityChart.clear()
  entityChart.setOption(
    {
      tooltip: {
        trigger: 'item',
        formatter: '{b}：{c} 个，占比 {d}%'
      },
      legend: {
        bottom: 0,
        type: 'scroll'
      },
      series: [
        {
          type: 'pie',
          radius: ['38%', '65%'],
          center: ['50%', '46%'],
          label: {
            formatter: '{b}\n{c}'
          },
          data: entries.map(([name, value]) => ({ name, value }))
        }
      ]
    },
    true
  )
  entityChart.resize()
}

function renderRelationChart() {
  if (!relationChartRef.value) return
  if (!relationChart) {
    relationChart = echarts.init(relationChartRef.value)
  }

  const entries = Object.entries(result.relationTypeStats || {}).filter(([, value]) => value > 0)
  if (!entries.length) {
    relationChart.clear()
    relationChart.setOption(
      {
        title: {
          text: '暂无关系类型数据',
          left: 'center',
          top: 'middle',
          textStyle: {
            color: '#909399',
            fontSize: 14,
            fontWeight: 'normal'
          }
        }
      },
      true
    )
    relationChart.resize()
    return
  }

  relationChart.clear()
  relationChart.setOption(
    {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: 40,
        right: 20,
        top: 30,
        bottom: 60
      },
      xAxis: {
        type: 'category',
        data: entries.map((item) => item[0]),
        axisLabel: {
          interval: 0,
          rotate: entries.length > 4 ? 24 : 0
        }
      },
      yAxis: {
        type: 'value',
        minInterval: 1
      },
      series: [
        {
          type: 'bar',
          data: entries.map((item) => item[1]),
          barMaxWidth: 42,
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    },
    true
  )
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

/* 统一 AI 生成页：默认态 + 生成中状态 */
.ai-state-card {
  min-height: 460px;
  padding: 56px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1px dashed #d8e2ef;
  border-radius: 14px;
  box-sizing: border-box;
}

.ai-state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.12);
}

.ai-state-title {
  margin-bottom: 8px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.6;
}

.ai-state-desc {
  max-width: 520px;
  color: #606266;
  font-size: 14px;
  line-height: 1.9;
}

.ai-state-tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.ai-state-tips span {
  padding: 6px 12px;
  color: #606266;
  font-size: 13px;
  line-height: 1;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 999px;
}

.ai-loading-state {
  border-style: solid;
  border-color: #d9ecff;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.ai-loading-ring {
  width: 58px;
  height: 58px;
  margin-bottom: 20px;
  border: 4px solid #e8f3ff;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: aiStateSpin 1s linear infinite;
}

.ai-loading-progress {
  width: min(360px, 80%);
  height: 8px;
  margin-top: 20px;
  overflow: hidden;
  background: #edf2f7;
  border-radius: 999px;
}

.ai-loading-progress span {
  display: block;
  width: 45%;
  height: 100%;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2), #409eff, rgba(64, 158, 255, 0.2));
  border-radius: inherit;
  animation: aiStateProgress 1.35s ease-in-out infinite;
}

.ai-loading-steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
}

.ai-loading-steps span {
  padding: 6px 10px;
  color: #409eff;
  font-size: 12px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 999px;
}

@keyframes aiStateSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes aiStateProgress {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(240%);
  }
}

@media (max-width: 768px) {
  .ai-state-card {
    min-height: 360px;
    padding: 42px 18px;
  }

  .ai-state-tips,
  .ai-loading-steps {
    gap: 8px;
  }
}
</style>

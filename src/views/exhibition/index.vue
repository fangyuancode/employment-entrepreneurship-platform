<template>
  <div ref="screenRef" :class="['exhibition-screen', { 'judge-mode': judgeMode }]">
    <header class="screen-header">
      <div class="brand-zone" @click="goPage('/home')">
        <div class="brand-mark">AI</div>
        <div>
          <h1>AI创业就业助手数字展厅</h1>
          <p>Three.js Digital Exhibition</p>
        </div>
      </div>

      <div class="tech-status">
        <span>THREE.JS</span>
        <span>ORBIT CONTROLS</span>
        <span>GLTF LOADER</span>
        <span>{{ modelState }}</span>
      </div>

      <div class="header-actions">
        <el-button type="primary" class="ghost-btn" @click="goPage('/home')">返回首页</el-button>
        <el-button type="primary" class="ghost-btn" @click="captureScene">展厅截图</el-button>
        <el-button type="primary" class="solid-btn" @click="goPage(activeHall.path)">进入模块</el-button>
      </div>
    </header>

    <main class="screen-main">
      <aside class="screen-panel left-panel">
        <div class="panel-title">
          <span>数据总览</span>
          <em>OVERVIEW</em>
        </div>

        <div class="stat-list">
          <div v-for="item in overviewStats" :key="item.label" class="stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
            <em>{{ item.trend }}</em>
          </div>
        </div>

        <div class="mini-section">
          <div class="mini-title">运行状态</div>
          <div class="status-list">
            <div v-for="item in runtimeStatus" :key="item.name" class="status-row">
              <span>{{ item.name }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <div class="mini-section control-section">
          <div class="mini-title">展厅控制</div>
          <div class="control-grid">
            <button type="button" :class="{ active: isTouring }" @click="toggleTour">
              {{ isTouring ? '停止导览' : '自动导览' }}
            </button>
            <button type="button" @click="resetCamera">视角复位</button>
            <button type="button" @click="toggleFullscreen">
              {{ isFullscreen ? '退出全屏' : '全屏展示' }}
            </button>
            <button type="button" :class="{ active: qualityMode === 'high' }" @click="toggleQualityMode">
              {{ qualityLabel }}
            </button>
            <button type="button" :class="{ active: judgeMode }" @click="toggleJudgeMode">评委视角</button>
            <button type="button" @click="goPage(activeHall.path)">进入当前馆</button>
          </div>
        </div>

        <div class="mini-section tour-section">
          <div class="mini-title">推荐讲解顺序</div>
          <div class="tour-flow">
            <button v-for="(item, index) in halls" :key="item.key" type="button" :class="['tour-node', { active: activeKey === item.key }]" @click="focusHall(item.key)">
              <em>{{ formatNo(index + 1) }}</em>
              <span>{{ item.short }}</span>
            </button>
          </div>
        </div>
      </aside>

      <section :class="['scene-board', { 'touring-mode': isTouring }]">
        <ThreeExhibitionScene ref="sceneRef" :halls="halls" :active-key="activeKey" :is-touring="isTouring" :quality-mode="qualityMode" :judge-mode="judgeMode" @update:active-key="focusHall" @enter-hall="goPage" @model-state="modelState = $event" />
      </section>

      <aside class="screen-panel right-panel">
        <div class="panel-title">
          <span>展馆详情</span>
          <em>MODULE</em>
        </div>

        <div class="active-card">
          <div class="active-code">{{ activeHall.code }}</div>
          <h2>{{ activeHall.title }}</h2>
          <p>{{ activeHall.slogan }}</p>
          <div class="tag-row">
            <span v-for="tag in activeHall.tags" :key="tag">{{ tag }}</span>
          </div>
          <el-button type="primary" class="enter-btn" @click="goPage(activeHall.path)">
            进入{{ activeHall.title }}
          </el-button>
        </div>

        <div class="mini-section ability-section">
          <div class="mini-title">核心能力</div>
          <div v-for="item in activeHall.metrics" :key="item.name" class="ability-row">
            <div>
              <span>{{ item.name }}</span>
              <strong>{{ item.value }}%</strong>
            </div>
            <i><em :style="{ width: item.value + '%' }"></em></i>
          </div>
        </div>

        <!-- <div class="mini-section judge-section">
          <div class="mini-title">评委关注点</div>
          <div class="judge-list">
            <div v-for="item in activeHall.judgePoints" :key="item" class="judge-item">
              {{ item }}
            </div>
          </div>
        </div> -->

        <div class="mini-section output-section">
          <div class="mini-title">可交付成果</div>
          <div class="output-list">
            <span v-for="item in activeHall.outputs" :key="item">{{ item }}</span>
          </div>
        </div>

        <div class="mini-section script-section">
          <div class="mini-title">演示讲解词</div>
          <p>{{ activeHall.demoScript }}</p>
        </div>

        <div class="mini-section">
          <div class="mini-title">快捷入口</div>
          <div class="quick-grid">
            <button type="button" @click="goPage('/jobscreen')">岗位大屏</button>
            <button type="button" @click="goPage('/aichat')">AI问答</button>
            <button type="button" @click="goPage('/toolbox/job-skill-graph/view')">技能图谱</button>
            <button type="button" @click="goPage('/study/pitchppt')">路演PPT</button>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import ThreeExhibitionScene from './components/ThreeExhibitionScene.vue'
import type { HallItem, HallKey, OverviewStat, QualityMode, RuntimeStatus } from './types'

interface ThreeSceneExpose {
  focusHall: (key: HallKey, silent?: boolean) => void
  resetCamera: () => void
  captureScene: () => void
}

const router = useRouter()
const screenRef = ref<HTMLElement | null>(null)
const sceneRef = ref<ThreeSceneExpose | null>(null)
const activeKey = ref<HallKey>('job')
const modelState = ref('模型初始化')
const isTouring = ref(false)
const isFullscreen = ref(false)
const judgeMode = ref(true)
const qualityMode = ref<QualityMode>('high')
let tourTimer: number | null = null

const halls: HallItem[] = [
  {
    key: 'job',
    code: 'HALL 01',
    short: '岗位',
    title: '就业分析馆',
    slogan: '岗位分布、薪资区间、城市热度集中展示。',
    path: '/toolbox/jobanalysis',
    tags: ['岗位画像', '薪资分析', '区域对比'],
    position: [-15, 0, -9],
    height: 9,
    color: 0x4f8cff,
    icon: '岗',
    sceneRole: '就业市场洞察入口',
    hoverTitle: '就业分析馆 · 从数据看机会',
    hoverDesc:
      '把岗位数量、城市分布、薪资区间和技能要求整合到同一视角，帮助学生快速判断“去哪儿、做什么、需要补什么”。',
    scenario: '求职定位 / 城市选择 / 岗位对比',
    userValue: '把零散招聘信息转化为可解释的就业决策依据。',
    dataAssets: '岗位表、城市字段、薪资字段、技能标签',
    actionText: '进入岗位分析',
    features: [
      { name: '岗位热度', desc: '展示岗位数量与城市热度变化' },
      { name: '薪资洞察', desc: '对比岗位薪资区间与高薪方向' },
      { name: '区域筛选', desc: '支持按城市、类别、经验进行定位' },
      { name: '趋势判断', desc: '辅助判断短期需求增长方向' }
    ],
    outputs: ['岗位分布图', '薪资对比表', '热门城市清单', '求职方向建议'],
    judgePoints: ['数据来源明确', '能直接服务学生就业选择', '适合大屏展示和答辩演示'],
    kpis: [
      { label: '岗位覆盖', value: '12.8w+', trend: '多城市样本' },
      { label: '热度维度', value: '6项', trend: '岗位/薪资/城市' },
      { label: '分析效率', value: '秒级', trend: '缓存后加载' }
    ],
    metrics: [
      { name: '岗位洞察', value: 92 },
      { name: '区域分析', value: 86 },
      { name: '薪资对比', value: 81 }
    ],
    demoScript:
      '这一馆解决的是“学生不知道该投什么岗位”的问题，通过岗位数据和城市热度帮助用户完成就业方向定位。'
  },
  {
    key: 'chat',
    code: 'HALL 02',
    short: '问答',
    title: 'AI问答馆',
    slogan: '围绕求职、简历、面试与规划进行智能问答。',
    path: '/aichat',
    tags: ['职业问答', '简历建议', '面试准备'],
    position: [0, 0, -13],
    height: 11,
    color: 0x57d6a3,
    icon: '问',
    sceneRole: 'AI职业咨询与问答入口',
    hoverTitle: 'AI问答馆 · 把咨询变成可执行建议',
    hoverDesc:
      '面向学生常见的就业困惑，提供职业规划、简历优化、面试准备和岗位选择建议，降低使用门槛。',
    scenario: '职业咨询 / 简历优化 / 面试准备',
    userValue: '让用户用自然语言获得个性化求职建议。',
    dataAssets: '岗位知识、求职问题、简历要点、问答模板',
    actionText: '进入AI问答',
    features: [
      { name: '自然问答', desc: '支持用户直接提出宽泛问题' },
      { name: '分段输出', desc: '回答按主题分段，便于阅读' },
      { name: '快捷能力', desc: '不同快捷入口对应不同后端能力' },
      { name: '求职闭环', desc: '从问题到计划再到行动建议' }
    ],
    outputs: ['职业规划建议', '简历优化清单', '面试准备方案', '求职行动计划'],
    judgePoints: ['交互门槛低', '直接体现AI能力', '适合现场演示问答效果'],
    kpis: [
      { label: '问答场景', value: '8类', trend: '求职全流程' },
      { label: '响应形式', value: '分段', trend: '便于阅读' },
      { label: '演示价值', value: '高', trend: '现场可互动' }
    ],
    metrics: [
      { name: '即时问答', value: 94 },
      { name: '简历建议', value: 88 },
      { name: '面试辅导', value: 84 }
    ],
    demoScript:
      '这一馆展示平台的AI交互能力，评委可以现场输入一个求职问题，系统会生成可执行、分段清晰的建议。'
  },
  {
    key: 'skill',
    code: 'HALL 03',
    short: '图谱',
    title: '技能图谱馆',
    slogan: '把岗位能力要求转化为可视化技能关系。',
    path: '/toolbox/job-skill-graph/view',
    tags: ['技能节点', '关系网络', '能力路径'],
    position: [15, 0, -9],
    height: 8,
    color: 0xffc857,
    icon: '技',
    sceneRole: '岗位能力建模与学习路径入口',
    hoverTitle: '技能图谱馆 · 看清岗位背后的能力结构',
    hoverDesc: '把岗位要求抽象成技能节点和关系网络，帮助用户理解岗位能力差距，并形成学习提升路径。',
    scenario: '能力评估 / 学习路径 / 岗位适配',
    userValue: '把“我不会什么”转化为明确的学习任务。',
    dataAssets: '岗位技能词、岗位类别、技能关系、学习资源',
    actionText: '进入技能图谱',
    features: [
      { name: '技能抽取', desc: '从岗位描述中提取核心能力词' },
      { name: '关系建模', desc: '展示技能之间的关联与层级' },
      { name: '能力差距', desc: '对比用户目标岗位所需能力' },
      { name: '学习建议', desc: '形成分阶段提升路线' }
    ],
    outputs: ['技能关系图', '能力差距清单', '学习路径', '岗位适配建议'],
    judgePoints: ['有结构化建模思路', '能体现AI+就业的深度', '比普通问答更有技术含量'],
    kpis: [
      { label: '技能节点', value: '300+', trend: '持续扩展' },
      { label: '关系类型', value: '多维', trend: '岗位/能力/课程' },
      { label: '推荐路径', value: '阶段式', trend: '可执行' }
    ],
    metrics: [
      { name: '技能建模', value: 90 },
      { name: '路径推荐', value: 85 },
      { name: '能力评估', value: 82 }
    ],
    demoScript:
      '这一馆强调技术深度，把岗位需求做成技能图谱，评委能看到平台不是简单聊天，而是在做结构化能力分析。'
  },
  {
    key: 'startup',
    code: 'HALL 04',
    short: '创业',
    title: '创业孵化馆',
    slogan: '支持商业计划、产品定位与创业方案生成。',
    path: '/study/business',
    tags: ['商业计划', '市场定位', '落地方案'],
    position: [-15, 0, 10],
    height: 8.5,
    color: 0xff7a59,
    icon: '创',
    sceneRole: '创业方案生成与项目孵化入口',
    hoverTitle: '创业孵化馆 · 从想法到方案',
    hoverDesc:
      '面向创业实践项目，把项目背景、市场定位、商业模式和实施路径整理成可提交、可展示的方案材料。',
    scenario: '创业申请 / 项目孵化 / 路演准备',
    userValue: '帮助用户把零散创意整理成可落地的创业方案。',
    dataAssets: '行业资料、用户输入、商业计划模板、项目结构',
    actionText: '进入创业孵化',
    features: [
      { name: '计划生成', desc: '形成商业计划书主体内容' },
      { name: '市场定位', desc: '辅助梳理目标用户和应用场景' },
      { name: '风险分析', desc: '提示项目落地风险与优化方向' },
      { name: '路演支持', desc: '对接PPT和项目展示材料' }
    ],
    outputs: ['商业计划书', '项目定位说明', '竞品分析摘要', '实施路径表'],
    judgePoints: ['贴合创新创业比赛', '成果物明确', '可作为项目申报支撑材料'],
    kpis: [
      { label: '输出材料', value: '4类', trend: '申请/路演' },
      { label: '方案结构', value: '完整', trend: '背景到落地' },
      { label: '实用程度', value: '高', trend: '比赛可用' }
    ],
    metrics: [
      { name: '计划生成', value: 91 },
      { name: '市场分析', value: 84 },
      { name: '项目路演', value: 80 }
    ],
    demoScript:
      '这一馆面向创业实践项目，能够把创意快速整理成商业计划，突出平台对创业申报和项目路演的帮助。'
  },
  {
    key: 'brand',
    code: 'HALL 05',
    short: '品牌',
    title: '品牌表达馆',
    slogan: '沉淀品牌文案、项目介绍与传播材料。',
    path: '/study/copywriting',
    tags: ['品牌文案', '作品介绍', '传播表达'],
    position: [0, 0, 14],
    height: 10,
    color: 0xb88cff,
    icon: '品',
    sceneRole: '项目包装与传播表达入口',
    hoverTitle: '品牌表达馆 · 让项目更容易被理解',
    hoverDesc:
      '将项目介绍、宣传语、作品亮点和应用价值进行统一表达，提升项目在评审、宣传和路演中的辨识度。',
    scenario: '项目介绍 / 品牌命名 / 宣传文案',
    userValue: '降低学生做项目包装和文字表达的难度。',
    dataAssets: '项目描述、品牌语料、文案模板、传播场景',
    actionText: '进入品牌表达',
    features: [
      { name: '品牌命名', desc: '辅助生成更易传播的作品名称' },
      { name: '项目介绍', desc: '生成不同长度的作品介绍' },
      { name: '亮点提炼', desc: '提取技术、应用和创新优势' },
      { name: '传播文案', desc: '适配海报、官网、路演场景' }
    ],
    outputs: ['作品介绍', '宣传标语', '项目亮点', '展示文案'],
    judgePoints: ['增强作品完成度', '方便答辩材料准备', '提升项目传播效果'],
    kpis: [
      { label: '文案类型', value: '多场景', trend: '介绍/宣传/路演' },
      { label: '表达风格', value: '可控', trend: '学术/比赛' },
      { label: '复用价值', value: '高', trend: '材料沉淀' }
    ],
    metrics: [
      { name: '品牌文案', value: 89 },
      { name: '作品包装', value: 86 },
      { name: '传播表达', value: 83 }
    ],
    demoScript:
      '这一馆主要展示项目包装能力，可以快速生成作品介绍、亮点总结和宣传表达，提高参赛作品的完整度。'
  },
  {
    key: 'office',
    code: 'HALL 06',
    short: '办公',
    title: '智能办公馆',
    slogan: '面向汇报、会议、路演等场景进行内容生成。',
    path: '/study/pitchppt',
    tags: ['路演PPT', '会议纪要', '材料生成'],
    position: [15, 0, 10],
    height: 7.8,
    color: 0x46c2ff,
    icon: '办',
    sceneRole: '汇报材料与路演内容入口',
    hoverTitle: '智能办公馆 · 把内容变成展示材料',
    hoverDesc: '面向项目路演、工作汇报和会议材料，帮助用户快速生成结构化内容，提升汇报效率。',
    scenario: '路演PPT / 汇报材料 / 会议纪要',
    userValue: '提升材料生成效率，降低非技术环节耗时。',
    dataAssets: '项目文本、PPT大纲、会议内容、汇报模板',
    actionText: '进入智能办公',
    features: [
      { name: 'PPT大纲', desc: '生成路演或答辩结构' },
      { name: '内容扩写', desc: '根据提纲形成说明文字' },
      { name: '纪要整理', desc: '把会议内容转为任务清单' },
      { name: '材料复用', desc: '沉淀为后续汇报模板' }
    ],
    outputs: ['路演PPT大纲', '汇报材料', '会议纪要', '任务清单'],
    judgePoints: ['演示价值明显', '适合项目答辩场景', '能提升团队协作效率'],
    kpis: [
      { label: '材料生成', value: '快速', trend: '减少重复整理' },
      { label: '适用场景', value: '3类', trend: '路演/汇报/会议' },
      { label: '协同价值', value: '明显', trend: '团队可用' }
    ],
    metrics: [
      { name: '材料生成', value: 88 },
      { name: '汇报辅助', value: 85 },
      { name: '协同办公', value: 78 }
    ],
    demoScript: '这一馆体现平台对实际工作流的支持，尤其适合答辩时展示“一键生成路演内容”的实用价值。'
  }
]

const overviewStats: OverviewStat[] = [
  { label: '核心展馆', value: '6', trend: '功能矩阵' },
  { label: '演示模式', value: '2', trend: '自由探索 / 自动导览' },
  { label: '成果输出', value: '24+', trend: '图表 / 文档 / 建议' },
  { label: '展示形态', value: '3D', trend: 'WebGL 数字展厅' }
]

const runtimeStatus: RuntimeStatus[] = [
  { name: '渲染引擎', value: 'Three.js' },
  { name: '镜头控制', value: 'OrbitControls' },
  { name: '模型加载', value: 'GLTFLoader' },
  { name: '页面形态', value: '数字大屏' }
]

const activeHall = computed(() => halls.find((item) => item.key === activeKey.value) ?? halls[0])
const qualityLabel = computed(() => (qualityMode.value === 'high' ? '高画质' : '流畅模式'))

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('keydown', handleShortcutKeys)
})

onBeforeUnmount(() => {
  stopTour(false)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('keydown', handleShortcutKeys)
})

function focusHall(key: HallKey) {
  activeKey.value = key
  sceneRef.value?.focusHall(key)
}

function toggleTour() {
  if (isTouring.value) stopTour()
  else startTour()
}

function startTour() {
  stopTour(false)
  isTouring.value = true
  let index = halls.findIndex((item) => item.key === activeKey.value)
  if (index < 0) index = 0
  focusHall(halls[index].key)
  tourTimer = window.setInterval(() => {
    index = (index + 1) % halls.length
    focusHall(halls[index].key)
  }, 5200)
}

function stopTour(resetState = true) {
  if (tourTimer) {
    window.clearInterval(tourTimer)
    tourTimer = null
  }
  if (resetState) isTouring.value = false
}

function resetCamera() {
  stopTour()
  sceneRef.value?.resetCamera()
}

async function toggleFullscreen() {
  const target = screenRef.value
  if (!target) return
  if (!document.fullscreenElement) await target.requestFullscreen?.()
  else await document.exitFullscreen?.()
}

function handleFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement)
}

function captureScene() {
  sceneRef.value?.captureScene()
  ElMessage.success('已导出当前数字展厅截图')
}

function toggleQualityMode() {
  qualityMode.value = qualityMode.value === 'high' ? 'balanced' : 'high'
}

function toggleJudgeMode() {
  judgeMode.value = !judgeMode.value
}

function handleShortcutKeys(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
  const index = Number(event.key)
  if (index >= 1 && index <= halls.length) focusHall(halls[index - 1].key)
  if (event.key.toLowerCase() === 'r') resetCamera()
  if (event.key.toLowerCase() === 'p') toggleTour()
  if (event.key.toLowerCase() === 'f') toggleFullscreen()
  if (event.key.toLowerCase() === 'j') toggleJudgeMode()
}

function goPage(path: string) {
  if (!path) return
  router.push(path)
}

function formatNo(no: number) {
  return no < 10 ? `0${no}` : `${no}`
}
</script>

<style scoped lang="scss">
.exhibition-screen {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  color: #e6f1ff;
  background: radial-gradient(circle at 52% 34%, rgba(35, 118, 202, 0.26), transparent 42%),
    radial-gradient(circle at 78% 74%, rgba(92, 54, 182, 0.15), transparent 34%), #050d19;
}

.exhibition-screen::before,
.exhibition-screen::after {
  position: absolute;
  inset: auto;
  z-index: 0;
  width: 360px;
  height: 360px;
  pointer-events: none;
  content: '';
  border: 1px solid rgba(79, 140, 255, 0.18);
  border-radius: 50%;
}

.exhibition-screen::before {
  top: -180px;
  left: -120px;
}

.exhibition-screen::after {
  right: -160px;
  bottom: -210px;
}

.screen-header {
  position: relative;
  z-index: 3;
  display: grid;
  grid-template-columns: minmax(260px, 360px) 1fr auto;
  gap: 18px;
  align-items: center;
  height: 76px;
  padding: 0 24px;
  background: rgba(5, 13, 25, 0.9);
  border-bottom: 1px solid rgba(125, 166, 255, 0.18);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.24);
  backdrop-filter: blur(18px);
}

.brand-zone {
  display: flex;
  gap: 14px;
  align-items: center;
  cursor: pointer;
}

.brand-mark {
  display: grid;
  width: 44px;
  height: 44px;
  font-size: 17px;
  font-weight: 800;
  color: #dff6ff;
  place-items: center;
  background: linear-gradient(135deg, rgba(21, 67, 111, 0.96), rgba(24, 96, 154, 0.8));
  border: 1px solid rgba(111, 201, 255, 0.42);
  border-radius: 14px;
  box-shadow: 0 0 24px rgba(79, 184, 255, 0.22);
}

.brand-zone h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.brand-zone p {
  margin: 4px 0 0;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.55);
  text-transform: uppercase;
}

.tech-status {
  display: flex;
  gap: 10px;
  justify-content: center;
  min-width: 0;
}

.tech-status span {
  padding: 7px 12px;
  overflow: hidden;
  font-size: 12px;
  color: rgba(215, 235, 255, 0.78);
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(18, 36, 58, 0.8);
  border: 1px solid rgba(122, 169, 255, 0.16);
  border-radius: 999px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.ghost-btn {
  color: rgba(230, 241, 255, 0.78) !important;
}

.solid-btn,
.enter-btn {
  border: 0;
  box-shadow: 0 10px 28px rgba(47, 140, 255, 0.28);
}

.screen-main {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 286px minmax(0, 1fr) 324px;
  gap: 16px;
  height: calc(100vh - 76px);
  min-height: 720px;
  padding: 16px;
}

.screen-panel,
.scene-board {
  background: rgba(8, 20, 37, 0.72);
  border: 1px solid rgba(125, 166, 255, 0.18);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(18px);
}

.screen-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  overflow: auto;
  border-radius: 18px;
}

.screen-panel::-webkit-scrollbar {
  width: 0;
}

.panel-title {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(125, 166, 255, 0.15);
}

.panel-title span {
  font-size: 16px;
  font-weight: 700;
}

.panel-title em {
  font-size: 11px;
  font-style: normal;
  color: rgba(230, 241, 255, 0.42);
  letter-spacing: 0.12em;
}

.stat-list {
  display: grid;
  gap: 10px;
}

.stat-card {
  padding: 14px;
  margin-bottom: 0;
  background: linear-gradient(135deg, rgba(14, 32, 54, 0.92), rgba(8, 21, 40, 0.86));
  border: 1px solid rgba(122, 169, 255, 0.14);
  border-radius: 16px;
}

.stat-card span,
.status-row span {
  display: block;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.58);
}

.stat-card strong {
  display: block;
  margin-top: 4px;
  font-size: 30px;
  line-height: 1;
  color: #ffffff;
}

.stat-card em {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  font-style: normal;
  color: #73d3ff;
}

.mini-section {
  padding: 14px;
  background: rgba(14, 32, 54, 0.58);
  border: 1px solid rgba(122, 169, 255, 0.12);
  border-radius: 16px;
}

.mini-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
}

.status-list,
.judge-list {
  display: grid;
  gap: 10px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.status-row strong {
  font-size: 12px;
  color: #dff6ff;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.control-grid button,
.tour-node,
.quick-grid button {
  font-family: inherit;
  color: inherit;
  cursor: pointer;
  background: rgba(12, 28, 48, 0.76);
  border: 1px solid rgba(125, 166, 255, 0.14);
  transition: all 0.2s ease;
}

.control-grid button {
  min-height: 38px;
  font-size: 12px;
  border-radius: 12px;
}

.control-grid button.active,
.control-grid button:hover,
.tour-node.active,
.tour-node:hover,
.quick-grid button:hover {
  color: #ffffff;
  background: rgba(34, 84, 142, 0.86);
  border-color: rgba(115, 211, 255, 0.55);
  box-shadow: 0 10px 22px rgba(41, 164, 255, 0.18);
  transform: translateY(-2px);
}

.tour-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.tour-node {
  display: grid;
  gap: 4px;
  padding: 10px 8px;
  text-align: center;
  border-radius: 12px;
}

.tour-node em {
  font-size: 11px;
  font-style: normal;
  color: #73d3ff;
}

.tour-node span {
  font-size: 13px;
}

.scene-board {
  position: relative;
  min-width: 0;
  overflow: hidden;
  border-radius: 22px;
}

.scene-board::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  content: '';
  background: linear-gradient(
      90deg,
      rgba(5, 13, 25, 0.32),
      transparent 18%,
      transparent 82%,
      rgba(5, 13, 25, 0.32)
    ),
    radial-gradient(circle at 50% 42%, transparent 42%, rgba(4, 10, 22, 0.22) 100%);
}

.touring-mode::before {
  position: absolute;
  inset: 14px;
  z-index: 2;
  pointer-events: none;
  content: '';
  border: 1px solid rgba(115, 211, 255, 0.24);
  border-radius: 18px;
  box-shadow: inset 0 0 36px rgba(55, 182, 255, 0.08), 0 0 28px rgba(55, 182, 255, 0.12);
}

.active-card {
  padding: 18px;
  background: linear-gradient(135deg, rgba(14, 32, 54, 0.96), rgba(11, 26, 48, 0.9));
  border: 1px solid rgba(122, 169, 255, 0.16);
  border-radius: 18px;
}

.active-code {
  width: fit-content;
  padding: 6px 9px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #89dcff;
  background: rgba(79, 140, 255, 0.14);
  border-radius: 999px;
}

.active-card h2 {
  margin: 0;
  font-size: 28px;
}

.active-card p,
.script-section p {
  margin: 10px 0 14px;
  font-size: 13px;
  line-height: 1.7;
  color: rgba(230, 241, 255, 0.64);
}

.tag-row,
.output-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tag-row span,
.output-list span {
  padding: 5px 8px;
  font-size: 12px;
  color: rgba(230, 241, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.enter-btn {
  width: 100%;
}

.ability-section {
  display: grid;
  gap: 10px;
}

.ability-row {
  display: grid;
  gap: 7px;
}

.ability-row div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ability-row span {
  font-size: 12px;
  color: rgba(230, 241, 255, 0.62);
}

.ability-row strong {
  font-size: 12px;
  color: #dff6ff;
}

.ability-row i {
  display: block;
  height: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.055);
  border-radius: 999px;
}

.ability-row em {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, rgba(58, 155, 255, 0.88), rgba(100, 228, 255, 0.92));
  border-radius: inherit;
  box-shadow: 0 0 18px rgba(67, 196, 255, 0.36);
}

.judge-item {
  padding: 10px 11px;
  font-size: 12px;
  line-height: 1.55;
  color: rgba(255, 244, 224, 0.84);
  background: rgba(255, 179, 85, 0.075);
  border: 1px solid rgba(255, 205, 125, 0.12);
  border-radius: 12px;
}

.output-list {
  margin-bottom: 0;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.quick-grid button {
  min-height: 40px;
  font-size: 13px;
  border-radius: 12px;
}

@media (max-width: 1280px) {
  .screen-main {
    grid-template-columns: 238px minmax(0, 1fr) 282px;
  }
}

@media (max-width: 980px) {
  .screen-header {
    grid-template-columns: 1fr;
    height: auto;
    padding: 14px;
  }

  .tech-status {
    justify-content: flex-start;
    overflow-x: auto;
  }

  .screen-main {
    grid-template-columns: 1fr;
    height: auto;
    min-height: 0;
  }

  .scene-board {
    height: 720px;
  }
}
</style>

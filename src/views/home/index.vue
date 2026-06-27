<template>
  <div class="official-home" :class="{ 'is-ready': pageReady }">
    <Transition name="home-loader">
      <div v-if="isLoading" class="home-loading">
        <div class="loading-card">
          <span class="loading-orbit"></span>
          <div>
            <div class="loading-title">创业就业数字化平台</div>
            <div class="loading-text">正在整理首页内容...</div>
          </div>
        </div>
      </div>
    </Transition>
    <section class="hero-shell">
      <header class="topbar">
        <div class="brand-area">
          <div class="brand-mark">AI</div>
          <div class="brand-text">
            <div class="brand-name">创业就业数字化平台</div>
            <div class="brand-sub">AI + Web 智能应用平台</div>
          </div>
        </div>

        <nav class="top-nav">
          <span v-for="item in navList" :key="item.key" @click="scrollToSection(item.key)">
            {{ item.label }}
          </span>
        </nav>

        <div class="top-actions">
          <el-button type="primary" text class="ghost-btn" @click="goLogin">登录</el-button>
          <!-- <el-button type="primary" text class="ghost-btn" @click="goPage('/exhibition')">数字展厅</el-button> -->
          <!-- <el-button type="primary" text class="ghost-btn" @click="goPage('/aichat')">AI就业</el-button> -->
          <el-button type="primary" class="solid-btn" @click="goPage('/aichat')">
            立即体验
          </el-button>
        </div>
      </header>

      <div class="hero-main">
        <div class="hero-copy">
          <div class="hero-kicker">智能引擎 · 网启新生</div>
          <h1 class="hero-title">
            构建面向创业、就业与项目实践的
            <span>AI 智能应用平台</span>
          </h1>
          <p class="hero-desc">
            本项目是一个融合大模型技术、数据挖掘、多模态识别与Web工程的综合智能平台，旨在为用户提供从创业辅助到职业规划到的一站式智能服务。
          </p>

          <div class="hero-action-row" data-stagger>
            <!-- <el-button type="primary" size="large" @click="goPage('/toolbox/jobanalysis')">
              查看岗位分析
            </el-button> -->
            <el-button type="primary" size="large" @click="goBiganalysis">大屏数据分析 </el-button>
            <el-button size="large" @click="goPage('/jobmap')"> 3D技能图谱 </el-button>
            <el-button size="large" @click="goPage('/aichat')"> AI就业助手 </el-button>
            <el-button size="large" @click="goPage('/exhibition')"> 数字展馆 </el-button>
            <el-button size="large" @click="goPage('/gesture')"> 手势星空 </el-button>
          </div>

          <div class="hero-tags" data-stagger>
            <span v-for="item in heroTags" :key="item">{{ item }}</span>
          </div>
        </div>

        <div class="hero-panel">
          <div class="hero-panel-card primary-panel">
            <div class="panel-head">
              <span>平台能力总览</span>
              <span class="panel-badge">AI + 数据 + 应用</span>
            </div>

            <div class="hero-metrics">
              <div class="metric-box" v-for="item in heroMetrics" :key="item.label">
                <div class="metric-value">{{ item.value }}</div>
                <div class="metric-label">{{ item.label }}</div>
              </div>
            </div>
          </div>

          <div class="hero-panel-card secondary-panel">
            <div class="panel-head">
              <span>推荐使用路径</span>
              <span class="panel-link">快速上手</span>
            </div>
            <div class="path-list">
              <div class="path-item" v-for="(item, index) in quickPaths" :key="item">
                <span class="path-index">{{ index + 1 }}</span>
                <span>{{ item }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block quick-news" ref="newsRef" data-animate-section>
      <div class="section-heading">
        <div>
          <p class="section-en">LATEST UPDATES</p>
          <h2>平台动态</h2>
        </div>
        <p class="section-desc"></p>
      </div>

      <div class="news-layout">
        <div class="news-focus">
          <div class="focus-top">
            <div class="focus-tag">重点推荐</div>
            <h3>围绕创业与就业场景，形成从岗位数据到应用输出的完整闭环</h3>
            <p>
              平台将岗位采集、数据分析、技能图谱、创业文档与办公处理整合到同一工作流中，
              方便用户从信息获取快速进入方案生成和结果展示。
            </p>
          </div>

          <div class="focus-highlights" data-stagger>
            <div class="focus-highlight" v-for="item in focusHighlights" :key="item.label">
              <span class="focus-highlight-value">{{ item.value }}</span>
              <span class="focus-highlight-label">{{ item.label }}</span>
            </div>
          </div>

          <div class="focus-actions">
            <el-button type="primary" @click="goPage('/toolbox/jobcollection')"
              >进入岗位采集</el-button
            >
            <el-button @click="goPage('/study/meeting')">进入会议纪要</el-button>
          </div>
        </div>

        <div class="news-list" data-stagger>
          <div
            class="news-item"
            v-for="item in newsList"
            :key="item.title"
            @click="goPage(item.path)"
          >
            <div class="news-date">{{ item.date }}</div>
            <div class="news-body">
              <div class="news-title">{{ item.title }}</div>
              <div class="news-text">{{ item.desc }}</div>
            </div>
            <el-icon>
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block capability-section" ref="capabilityRef" data-animate-section>
      <div class="section-heading">
        <div>
          <p class="section-en">PLATFORM CAPABILITIES</p>
          <h2>核心能力</h2>
        </div>
        <p class="section-desc"></p>
      </div>

      <div class="capability-tabs">
        <div
          v-for="item in capabilityTabs"
          :key="item.key"
          class="capability-tab"
          :class="{ active: activeCapability === item.key }"
          @mouseenter="activeCapability = item.key"
        >
          <div class="capability-tab-title">{{ item.title }}</div>
          <div class="capability-tab-desc">{{ item.desc }}</div>
        </div>
      </div>

      <div class="capability-content">
        <div class="capability-main">
          <div class="capability-mark">{{ currentCapability.tag }}</div>
          <h3>{{ currentCapability.title }}</h3>
          <p>{{ currentCapability.longDesc }}</p>
          <div class="capability-actions">
            <el-button type="primary" @click="goPage(currentCapability.path)">进入模块</el-button>
          </div>
        </div>

        <div class="capability-side">
          <div
            class="mini-card"
            v-for="item in currentCapability.children"
            :key="item.title"
            @click="goPage(item.path)"
          >
            <div class="mini-card-top">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.tag }}</span>
            </div>
            <div class="mini-card-title">{{ item.title }}</div>
            <div class="mini-card-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block data-section" ref="dataRef" data-animate-section>
      <div class="section-heading light">
        <div>
          <p class="section-en">DATA OVERVIEW</p>
          <h2>平台数据概览</h2>
        </div>
        <p class="section-desc"></p>
      </div>

      <div class="data-grid" data-stagger>
        <div class="data-card" v-for="item in overviewList" :key="item.title">
          <div class="data-icon">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="data-value">{{ item.value }}</div>
          <div class="data-title">{{ item.title }}</div>
          <div class="data-desc">{{ item.desc }}</div>
        </div>
      </div>
    </section>

    <section class="section-block matrix-section" ref="featureRef" data-animate-section>
      <div class="section-heading">
        <div>
          <p class="section-en">APPLICATION MATRIX</p>
          <h2>应用矩阵</h2>
        </div>
        <p class="section-desc"></p>
      </div>

      <div class="matrix-group" v-for="group in groupedFeatures" :key="group.title">
        <div class="matrix-left">
          <div class="matrix-kicker">{{ group.kicker }}</div>
          <div class="matrix-title">{{ group.title }}</div>
          <div class="matrix-desc">{{ group.desc }}</div>
        </div>

        <div class="matrix-right" data-stagger>
          <div
            class="matrix-card"
            v-for="item in group.items"
            :key="item.title"
            @click="goPage(item.path)"
          >
            <div class="matrix-card-top">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.tag }}</span>
            </div>
            <div class="matrix-card-title">{{ item.title }}</div>
            <div class="matrix-card-desc">{{ item.desc }}</div>
            <div class="matrix-card-link">
              查看模块
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block workflow-section" ref="workflowRef" data-animate-section>
      <div class="section-heading">
        <div>
          <p class="section-en">WORKFLOW</p>
          <h2>推荐使用流程</h2>
        </div>
        <p class="section-desc"></p>
      </div>

      <div class="workflow-grid" data-stagger>
        <div class="workflow-card" v-for="(item, index) in workflowCards" :key="item.title">
          <div class="workflow-index">0{{ index + 1 }}</div>
          <div class="workflow-title">{{ item.title }}</div>
          <div class="workflow-desc">{{ item.desc }}</div>
        </div>
      </div>
    </section>
    <section class="section-block highlight-section" data-animate-section>
      <div class="section-heading">
        <div>
          <p class="section-en">WHY THIS PLATFORM</p>
          <h2>项目亮点</h2>
        </div>
        <p class="section-desc"></p>
      </div>

      <div class="highlight-grid" data-stagger>
        <div class="highlight-card" v-for="item in highlights" :key="item.title">
          <div class="highlight-title">{{ item.title }}</div>
          <div class="highlight-desc">{{ item.desc }}</div>
        </div>
      </div>
    </section>

    <footer class="footer-shell">
      <div class="footer-top">
        <div>
          <div class="footer-brand">创业就业数字化平台</div>
          <div class="footer-text">
            基于 Vue3 + Element Plus + Spring Boot + Python + MySQL 构建, 聚焦 AI
            创业辅助、岗位分析、数据图谱与智能办公场景。
          </div>
        </div>

        <div class="footer-links">
          <span @click="scrollToSection('news')">平台动态</span>
          <span @click="scrollToSection('capability')">核心能力</span>
          <span @click="scrollToSection('feature')">应用矩阵</span>
          <span @click="scrollToSection('workflow')">使用流程</span>
        </div>
      </div>

      <div class="footer-bottom">© 2026 创业就业数字化平台 · 智能引擎 · 网启新生</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import {
    ArrowRight,
    DataAnalysis,
    TrendCharts,
    Connection,
    Briefcase,
    Document,
    Reading,
    Promotion,
    Monitor,
    EditPen,
    Notebook,
    Grid,
    Histogram,
    MagicStick,
    ChatLineRound
  } from '@element-plus/icons-vue'

  const router = useRouter()

  const newsRef = ref<HTMLElement | null>(null)
  const capabilityRef = ref<HTMLElement | null>(null)
  const dataRef = ref<HTMLElement | null>(null)
  const featureRef = ref<HTMLElement | null>(null)
  const workflowRef = ref<HTMLElement | null>(null)

  const pageReady = ref(false)
  const isLoading = ref(true)
  let revealObserver: IntersectionObserver | null = null
  let homeTimer: number | undefined

  const initScrollReveal = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const sectionEls = document.querySelectorAll<HTMLElement>(
      '.official-home [data-animate-section]'
    )
    const staggerParents = document.querySelectorAll<HTMLElement>('.official-home [data-stagger]')
    const staggerEls: HTMLElement[] = []

    staggerParents.forEach((parent) => {
      Array.from(parent.children).forEach((child, index) => {
        const el = child as HTMLElement
        el.style.setProperty('--reveal-delay', `${Math.min(index, 8) * 70}ms`)
        staggerEls.push(el)
      })
    })

    if (reduceMotion) {
      sectionEls.forEach((el) => el.classList.add('reveal-visible'))
      staggerEls.forEach((el) => el.classList.add('reveal-visible'))
      return
    }

    revealObserver?.disconnect()
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('reveal-visible')
          revealObserver?.unobserve(entry.target)
        })
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px'
      }
    )

    sectionEls.forEach((el) => revealObserver?.observe(el))
    staggerEls.forEach((el) => revealObserver?.observe(el))
  }

  onMounted(async () => {
    await nextTick()
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    homeTimer = window.setTimeout(
      async () => {
        isLoading.value = false
        pageReady.value = true
        await nextTick()
        initScrollReveal()
      },
      reduceMotion ? 0 : 480
    )
  })

  onBeforeUnmount(() => {
    if (homeTimer) window.clearTimeout(homeTimer)
    revealObserver?.disconnect()
  })

  const navList = [
    { key: 'news', label: '平台动态' },
    { key: 'capability', label: '核心能力' },
    { key: 'data', label: '数据概览' },
    { key: 'feature', label: '应用矩阵' },
    { key: 'workflow', label: '使用流程' }
  ]

  const heroTags = [
    '岗位分析',
    'AI就业',
    '技能图谱',
    '商业计划书',
    '品牌文案',
    '会议纪要',
    '智能识别'
  ]

  const heroMetrics = [
    { value: '13+', label: '核心功能模块' },
    { value: '30W+', label: '岗位数据规模' },
    { value: 'AI', label: '多场景智能驱动' }
  ]

  const quickPaths = [
    '进入首页核心模块,找到目标业务场景',
    '填写需求或上传内容,触发 AI 生成与分析',
    '查看图谱、统计图表与结构化结果',
    '导出方案、报告或继续深度决策'
  ]

  const newsList = [
    {
      date: '00',
      title: '数字展厅入口新增',
      desc: '以沉浸式展厅方式串联就业分析、AI问答、技能图谱与创业生成模块。',
      path: '/exhibition'
    },
    {
      date: '01',
      title: 'AI就业入口新增',
      desc: '用户可直接询问岗位趋势、薪资水平、技能要求和求职建议。',
      path: '/aichat'
    },
    {
      date: '02',
      title: '岗位分析与可视化能力持续完善',
      desc: '支持岗位分布、技能热度、薪资趋势、分类洞察等数据展示。',
      path: '/toolbox/jobanalysis'
    },
    {
      date: '03',
      title: '技能图谱与迁移推荐增强',
      desc: '围绕岗位、技能、公司和城市建立关联,辅助学习路径规划。',
      path: '/toolbox/jobskillgraph'
    },
    {
      date: '04',
      title: '创业内容生成能力集成',
      desc: '商业计划书、品牌文案、产品设计和路演 PPT 模块形成协同。',
      path: '/study/business'
    },
    {
      date: '05',
      title: '办公智能化场景进一步扩展',
      desc: '会议纪要、实体关系抽取、辅助识别等功能提升实际应用价值。',
      path: '/study/meeting'
    }
  ]

  const focusHighlights = [
    { value: '采集', label: '岗位数据接入' },
    { value: '分析', label: '趋势与技能洞察' },
    { value: '生成', label: '创业内容输出' },
    { value: '展示', label: '大屏与展厅呈现' }
  ]

  const overviewList = [
    {
      title: '核心模块',
      value: '13+',
      desc: '覆盖创业、求职、设计、识别、分析等多个应用场景',
      icon: Grid
    },
    {
      title: '岗位数据',
      value: '15W+',
      desc: '支持岗位采集、清洗、查询、分析与趋势洞察',
      icon: Briefcase
    },
    {
      title: 'AI 能力',
      value: '多场景',
      desc: '文案生成、摘要提取、图谱推荐、关系分析与识别处理',
      icon: MagicStick
    },
    {
      title: '可视化能力',
      value: 'ECharts',
      desc: '支持大屏展示、技能图谱、统计分析与结果看板',
      icon: DataAnalysis
    }
  ]

  const capabilityTabs = [
    {
      key: 'job',
      tag: '就业分析',
      title: '就业数据洞察体系',
      desc: '岗位采集、岗位列表、分析大屏、技能图谱协同联动。',
      longDesc:
        '围绕招聘岗位数据建立从采集、存储、检索、分析到图谱建模的完整链路,帮助用户理解市场趋势、能力需求和岗位迁移方向。',
      path: '/toolbox/jobanalysis',
      children: [
        {
          title: '岗位分析大屏',
          desc: '查看岗位分布、薪资趋势、技能热度与分类统计。',
          path: '/toolbox/jobanalysis',
          icon: Histogram,
          tag: '分析大屏'
        },
        {
          title: '岗位技能图谱',
          desc: '展示岗位与技能、公司、城市之间的关联关系。',
          path: '/toolbox/jobskillgraph',
          icon: Connection,
          tag: '知识图谱'
        },
        {
          title: '工作岗位采集',
          desc: '支持岗位采集、预览、导入与数据管理。',
          path: '/toolbox/jobcollection',
          icon: TrendCharts,
          tag: '数据采集'
        }
      ]
    },
    {
      key: 'business',
      tag: '创业生成',
      title: '创业内容生成体系',
      desc: '从商业方案到品牌包装,再到路演展示的一站式输出。',
      longDesc:
        '通过商业计划书、品牌文案、产品设计与路演 PPT 等模块,帮助用户快速生成创业表达内容,提升项目展示效率与完整度。',
      path: '/study/business',
      children: [
        {
          title: 'AI 商业计划书',
          desc: '生成结构化、长篇幅、可展示的完整商业方案。',
          path: '/study/business',
          icon: Document,
          tag: '创业辅助'
        },
        {
          title: 'AI 品牌与文案',
          desc: '输出品牌名、卖点文案、宣传语与配图思路。',
          path: '/study/copywriting',
          icon: EditPen,
          tag: '内容生成'
        },
        {
          title: '路演 PPT 助手',
          desc: '辅助生成路演结构、演讲文案与展示内容。',
          path: '/study/pitchppt',
          icon: Promotion,
          tag: '路演展示'
        }
      ]
    },
    {
      key: 'office',
      tag: '办公提效',
      title: '智能办公与关系分析体系',
      desc: '提升会议记录、文本理解与信息组织效率。',
      longDesc:
        '在实际办公与项目场景中,平台可以自动提炼会议总结、关键决策、待办事项,也可抽取实体关系并进行结构化展示。',
      path: '/study/meeting',
      children: [
        {
          title: 'AI 会议纪要',
          desc: '自动生成总结、待办、责任人和风险提醒。',
          path: '/study/meeting',
          icon: Notebook,
          tag: '办公提效'
        },
        {
          title: '实体关系抽取',
          desc: '从文本中抽取实体、关系与结构化语义信息。',
          path: '/study/relationship',
          icon: Reading,
          tag: '关系分析'
        },
        {
          title: 'AI 产品设计助手',
          desc: '辅助梳理功能逻辑、页面结构与设计思路。',
          path: '/study/assistance',
          icon: Monitor,
          tag: '产品设计'
        }
      ]
    }
  ]

  const activeCapability = ref('job')

  const currentCapability = computed(() => {
    return capabilityTabs.find((item) => item.key === activeCapability.value) || capabilityTabs[0]
  })
  const goBiganalysis = () => {
    const url = router.resolve({
      path: '/jobscreen'
    })

    // 打开新窗口
    window.open(url.href)
  }
  const groupedFeatures = [
    {
      kicker: '01',
      title: '就业分析与数据挖掘',
      desc: '聚焦岗位数据的采集、分析、检索与能力图谱构建。',
      items: [
        {
          title: 'AI就业',
          desc: '基于岗位数据库和大模型回答就业求职问题。',
          path: '/aichat',
          icon: ChatLineRound,
          tag: '智能问答'
        },
        {
          title: '岗位分析大屏',
          desc: '查看岗位分布、趋势与技能热度。',
          path: '/toolbox/jobanalysis',
          icon: DataAnalysis,
          tag: '数据分析'
        },
        {
          title: '工作岗位列表',
          desc: '支持岗位搜索、筛选和详情查看。',
          path: '/toolbox/joblist',
          icon: Briefcase,
          tag: '岗位查询'
        }
        // {
        //   title: '技能迁移分析',
        //   desc: '辅助理解岗位能力迁移与学习方向。',
        //   path: '/toolbox/migration',
        //   icon: Opportunity,
        //   tag: '迁移推荐'
        // }
      ]
    },
    {
      kicker: '02',
      title: '创业辅助与内容生成',
      desc: '聚焦创业项目表达、品牌包装与方案生成。',
      items: [
        {
          title: 'AI 商业计划书',
          desc: '生成结构完整的商业计划书内容。',
          path: '/study/business',
          icon: Document,
          tag: '创业辅助'
        },
        {
          title: 'AI 品牌与文案',
          desc: '产出品牌文案、卖点与宣传表达。',
          path: '/study/copywriting',
          icon: EditPen,
          tag: '品牌生成'
        },
        {
          title: '路演 PPT 助手',
          desc: '帮助快速搭建路演展示内容。',
          path: '/study/pitchppt',
          icon: Promotion,
          tag: '展示表达'
        }
      ]
    },
    {
      kicker: '03',
      title: '智能办公与项目支持',
      desc: '围绕会议、文本与知识组织提供智能支持。',
      items: [
        {
          title: 'AI 会议纪要',
          desc: '自动提炼重点内容和任务安排。',
          path: '/study/meeting',
          icon: Notebook,
          tag: '会议提效'
        },
        {
          title: '实体关系抽取',
          desc: '从文本中识别结构化关系网络。',
          path: '/study/relationship',
          icon: Reading,
          tag: '语义分析'
        },
        {
          title: 'AI 产品设计助手',
          desc: '支持产品功能梳理与原型思考。',
          path: '/study/assistance',
          icon: Monitor,
          tag: '设计辅助'
        }
      ]
    }
  ]

  const workflowCards = [
    {
      title: '确定目标场景',
      desc: '从创业展示、岗位分析、办公提效等入口中选择目标模块。'
    },
    {
      title: '输入需求与数据',
      desc: '支持文本输入、内容生成、数据分析、岗位采集与信息处理。'
    },
    {
      title: 'AI 分析与可视化',
      desc: '系统输出结构化结果、统计图表、图谱关系与方案内容。'
    },
    {
      title: '结果落地与展示',
      desc: '将分析结果用于项目展示、学习规划、业务表达与决策支持。'
    }
  ]

  const highlights = [
    {
      title: 'AI+创业就业全链路赋能',
      desc: '从商业计划生成到岗位分析,再到技能迁移与职业规划,构建完整的AI辅助决策闭环。'
    },
    {
      title: '大模型深度融合应用',
      desc: '结合多种AI能力,实现文本生成、结构化分析与智能推荐,提升系统智能化水平。'
    },
    {
      title: '真实数据驱动的分析引擎',
      desc: '基于海量岗位数据进行挖掘与建模,支持趋势洞察、能力评估与路径推荐。'
    },
    {
      title: '可扩展的智能平台架构',
      desc: '模块化设计支持快速接入新AI能力与业务场景,具备持续演进与产品化潜力。'
    }
  ]

  const sectionMap: Record<string, RefTarget> = {
    news: newsRef,
    capability: capabilityRef,
    data: dataRef,
    feature: featureRef,
    workflow: workflowRef
  }

  type RefTarget = { value: HTMLElement | null }

  const scrollToSection = (key: string) => {
    const section = sectionMap[key]?.value
    if (!section) return
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goPage = (path: string) => {
    if (!path) return
    console.log('path', path)
    if (path == '/aichat') {
      // 打开新标签
      const url = router.resolve({
        path: '/aichat'
      })
      window.open(url.href)
    } else if (path == '/toolbox/jobanalysis') {
      // 打开新窗口
      const url = router.resolve({
        path: '/toolbox/jobanalysis'
      })
      window.open(url.href)
    } else {
      router.push(path)
    }
  }

  const goLogin = () => {
    router.push('/auth/login')
  }
</script>

<style scoped lang="scss">
  .official-home {
    min-height: 100%;
    color: #1f2937;
    background: #f3f6fb;
    scroll-behavior: smooth;
  }

  :global(html) {
    scroll-behavior: smooth;
  }

  .home-loading {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(243 246 251 / 88%);
    backdrop-filter: blur(10px);
  }

  .loading-card {
    display: flex;
    gap: 16px;
    align-items: center;
    min-width: 280px;
    padding: 22px 24px;
    background: rgb(255 255 255 / 88%);
    border: 1px solid rgb(216 226 239 / 90%);
    border-radius: 22px;
    box-shadow: 0 22px 46px rgb(15 23 42 / 12%);
  }

  .loading-orbit {
    position: relative;
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border: 2px solid rgb(37 99 235 / 14%);
    border-radius: 50%;
  }

  .loading-orbit::before {
    position: absolute;
    inset: -2px;
    content: '';
    border: 2px solid transparent;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: homeSpin 0.9s linear infinite;
  }

  .loading-orbit::after {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    content: '';
    background: #2563eb;
    border-radius: 50%;
    box-shadow: 0 0 18px rgb(37 99 235 / 42%);
    transform: translate(-50%, -50%);
  }

  .loading-title {
    margin-bottom: 4px;
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }

  .loading-text {
    font-size: 13px;
    color: #64748b;
  }

  .home-loader-enter-active,
  .home-loader-leave-active {
    transition:
      opacity 0.32s ease,
      transform 0.32s ease;
  }

  .home-loader-enter-from,
  .home-loader-leave-to {
    opacity: 0;
    transform: translateY(-12px);
  }

  .official-home:not(.is-ready) .topbar,
  .official-home:not(.is-ready) .hero-copy > *,
  .official-home:not(.is-ready) .hero-panel-card {
    opacity: 0;
  }

  .official-home.is-ready .topbar {
    animation: homeDropFade 0.64s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .official-home.is-ready .hero-kicker {
    animation: homeSlideUp 0.64s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
  }

  .official-home.is-ready .hero-title {
    animation: homeSlideUp 0.72s cubic-bezier(0.22, 1, 0.36, 1) 0.16s both;
  }

  .official-home.is-ready .hero-desc {
    animation: homeSlideUp 0.72s cubic-bezier(0.22, 1, 0.36, 1) 0.24s both;
  }

  .official-home.is-ready .hero-action-row {
    animation: homeSlideUp 0.72s cubic-bezier(0.22, 1, 0.36, 1) 0.32s both;
  }

  .official-home.is-ready .hero-tags {
    animation: homeSlideUp 0.72s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both;
  }

  .official-home.is-ready .hero-panel-card {
    animation: homeSlideLeft 0.76s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .official-home.is-ready .hero-panel-card:nth-child(1) {
    animation-delay: 0.2s;
  }

  .official-home.is-ready .hero-panel-card:nth-child(2) {
    animation-delay: 0.32s;
  }

  [data-animate-section],
  [data-stagger] > * {
    opacity: 0;
    transition:
      opacity 0.72s cubic-bezier(0.22, 1, 0.36, 1),
      transform 0.72s cubic-bezier(0.22, 1, 0.36, 1);
    transition-delay: var(--reveal-delay, 0ms);
    transform: translateY(34px);
    will-change: opacity, transform;
  }

  [data-animate-section].reveal-visible,
  [data-stagger] > *.reveal-visible {
    opacity: 1;
    transform: translateY(0);
  }

  @keyframes homeSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes homeDropFade {
    from {
      opacity: 0;
      transform: translateY(-22px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes homeSlideUp {
    from {
      opacity: 0;
      transform: translateY(28px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes homeSlideLeft {
    from {
      opacity: 0;
      transform: translateX(34px) translateY(12px);
    }

    to {
      opacity: 1;
      transform: translateX(0) translateY(0);
    }
  }

  @keyframes capabilityContentIn {
    from {
      opacity: 0.88;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  // /* 隐藏滚动条的同时仍能滚动 */
  // .official-homer {
  //     overflow: auto; /* 启用滚动功能 */
  //     -ms-overflow-style: none; /* 适用于 Internet Explorer 和旧版 Edge */
  //     scrollbar-width: none; /* 适用于 Firefox */
  // }

  /* Webkit 浏览器 */
  .official-home::-webkit-scrollbar {
    display: none; /* 隐藏滚动条 */
  }
  // ::-webkit-scrollbar {
  // display: none; /* 隐藏滚动条 */
  // }
  .hero-shell {
    position: relative;
    padding: 24px 28px 40px;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgb(61 120 255 / 24%), transparent 28%),
      linear-gradient(180deg, #0f1c33 0%, #122746 46%, #18365d 100%);
  }

  .hero-shell::before,
  .hero-shell::after {
    position: absolute;
    pointer-events: none;
    content: '';
    border-radius: 50%;
  }

  .hero-shell::before {
    top: -220px;
    right: -140px;
    width: 520px;
    height: 520px;
    background: rgb(95 150 255 / 12%);
  }

  .hero-shell::after {
    bottom: -160px;
    left: -120px;
    width: 380px;
    height: 380px;
    background: rgb(255 255 255 / 5%);
  }

  .topbar,
  .hero-main,
  .section-block {
    position: relative;
    z-index: 1;
    max-width: 1440px;
    margin: 0 auto;
  }

  .topbar {
    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 48px;
    color: #fff;
  }

  .brand-area {
    display: flex;
    flex-shrink: 0;
    gap: 12px;
    align-items: center;
  }

  .brand-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    background: linear-gradient(135deg, #4b8dff 0%, #8ac1ff 100%);
    border-radius: 12px;
    box-shadow: 0 10px 24px rgb(49 116 255 / 25%);
  }

  .brand-name {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  }

  .brand-sub {
    margin-top: 2px;
    font-size: 12px;
    color: rgb(255 255 255 / 72%);
  }

  .top-nav {
    display: flex;
    gap: 28px;
    align-items: center;
    font-size: 14px;
    color: rgb(255 255 255 / 82%);
  }

  .top-nav span,
  .footer-links span {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .top-nav span:hover,
  .footer-links span:hover {
    color: #fff;
  }

  .top-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  :deep(.ghost-btn.el-button) {
    padding: 10px 18px;
    color: #fff;
    background: rgb(255 255 255 / 6%);
    border: 1px solid rgb(255 255 255 / 22%);
    border-radius: 999px;
  }

  :deep(.ghost-btn.el-button:hover) {
    // color: #fff;
    // border-color: rgba(255, 255, 255, 0.4);
    // background: rgba(255, 255, 255, 0.12);
    color: #0f172a;
  }

  :deep(.solid-btn.el-button) {
    padding: 10px 22px;
    border-radius: 999px;
    box-shadow: 0 10px 24px rgb(64 127 255 / 24%);
  }

  .hero-main {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
    gap: 34px;
    align-items: stretch;
  }

  .hero-copy {
    padding: 30px 0 18px;
    color: #fff;
  }

  .hero-kicker {
    display: inline-flex;
    align-items: center;
    padding: 7px 14px;
    margin-bottom: 18px;
    font-size: 13px;
    color: rgb(255 255 255 / 88%);
    background: rgb(255 255 255 / 8%);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 999px;
  }

  .hero-title {
    margin: 0;
    font-size: 52px;
    font-weight: 800;
    line-height: 1.18;
    letter-spacing: -0.02em;
  }

  .hero-title span {
    color: #8dc6ff;
  }

  .hero-desc {
    max-width: 760px;
    margin: 22px 0 28px;
    font-size: 16px;
    line-height: 1.95;
    color: rgb(255 255 255 / 80%);
  }

  .hero-action-row {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-bottom: 24px;
  }

  .hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .hero-tags span {
    padding: 8px 14px;
    font-size: 13px;
    color: rgb(255 255 255 / 82%);
    background: rgb(255 255 255 / 8%);
    border: 1px solid rgb(255 255 255 / 10%);
    border-radius: 999px;
  }

  .hero-panel {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .hero-panel-card {
    padding: 24px;
    backdrop-filter: blur(14px);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 24px;
    box-shadow: 0 22px 40px rgb(5 14 31 / 25%);
  }

  .primary-panel {
    color: #fff;
    background: linear-gradient(180deg, rgb(255 255 255 / 16%), rgb(255 255 255 / 8%));
  }

  .secondary-panel {
    color: #fff;
    background: rgb(255 255 255 / 8%);
  }

  .panel-head {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    font-size: 15px;
    font-weight: 700;
  }

  .panel-badge,
  .panel-link {
    font-size: 12px;
    font-weight: 500;
    color: rgb(255 255 255 / 74%);
  }

  .hero-metrics {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .metric-box {
    padding: 18px 14px;
    text-align: center;
    background: rgb(255 255 255 / 8%);
    border-radius: 18px;
  }

  .metric-value {
    margin-bottom: 8px;
    font-size: 30px;
    font-weight: 800;
  }

  .metric-label {
    font-size: 13px;
    line-height: 1.5;
    color: rgb(255 255 255 / 78%);
  }

  .path-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .path-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 14px;
    font-size: 14px;
    color: rgb(255 255 255 / 86%);
    background: rgb(255 255 255 / 6%);
    border-radius: 16px;
  }

  .path-index {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-size: 13px;
    font-weight: 700;
    color: #1f4ea1;
    background: #fff;
    border-radius: 50%;
  }

  .section-block {
    padding: 52px 28px 0;
  }

  .section-heading {
    display: flex;
    gap: 20px;
    align-items: end;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .section-heading h2 {
    margin: 6px 0 0;
    font-size: 34px;
    line-height: 1.2;
    color: #111827;
  }

  .section-en {
    margin: 0;
    font-size: 12px;
    color: #8aa3c6;
    letter-spacing: 0.18em;
  }

  .section-desc {
    max-width: 480px;
    margin: 0;
    font-size: 14px;
    line-height: 1.9;
    color: #6b7280;
    text-align: right;
  }

  .news-layout {
    display: grid;
    grid-template-columns: minmax(340px, 0.92fr) minmax(520px, 1.08fr);
    gap: 22px;
    align-items: stretch;
  }

  .news-focus {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 24px;
    justify-content: space-between;
    min-height: auto;
    padding: 30px;
    overflow: hidden;
    color: #fff;
    background: linear-gradient(135deg, #163055 0%, #224879 100%);
    border-radius: 28px;
    box-shadow: 0 18px 36px rgb(22 48 85 / 18%);
  }

  .news-focus::before {
    position: absolute;
    top: -90px;
    right: -80px;
    width: 220px;
    height: 220px;
    content: '';
    background: rgb(255 255 255 / 8%);
    border-radius: 50%;
  }

  .news-focus::after {
    position: absolute;
    right: 30px;
    bottom: 86px;
    left: 30px;
    height: 1px;
    content: '';
    background: rgb(255 255 255 / 12%);
  }

  .focus-top,
  .focus-highlights,
  .focus-actions {
    position: relative;
    z-index: 1;
  }

  .focus-tag {
    display: inline-flex;
    padding: 6px 12px;
    margin-bottom: 16px;
    font-size: 12px;
    background: rgb(255 255 255 / 10%);
    border-radius: 999px;
  }

  .news-focus h3 {
    max-width: 540px;
    margin: 0 0 16px;
    font-size: 28px;
    line-height: 1.42;
    letter-spacing: -0.02em;
  }

  .news-focus p {
    max-width: 560px;
    margin: 0;
    font-size: 15px;
    line-height: 2;
    color: rgb(255 255 255 / 82%);
  }

  .focus-highlights {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 2px;
  }

  .focus-highlight {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 78px;
    padding: 16px;
    background: rgb(255 255 255 / 8%);
    border: 1px solid rgb(255 255 255 / 12%);
    border-radius: 18px;
    transition: all 0.25s ease;
  }

  .focus-highlight:hover {
    background: rgb(255 255 255 / 12%);
    transform: translateY(-3px);
  }

  .focus-highlight-value {
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: 800;
    line-height: 1;
  }

  .focus-highlight-label {
    font-size: 13px;
    color: rgb(255 255 255 / 72%);
  }

  .focus-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-top: 2px;
  }

  .news-list {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100%;
    padding: 12px 22px;
    background: #fff;
    border: 1px solid #edf2f7;
    border-radius: 28px;
    box-shadow: 0 16px 34px rgb(15 23 42 / 6%);
  }

  .news-item {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr) 22px;
    gap: 16px;
    align-items: center;
    min-height: 78px;
    padding: 15px 4px;
    cursor: pointer;
    border-bottom: 1px solid #eef2f7;
    transition: all 0.2s ease;
  }

  .news-item:last-child {
    border-bottom: none;
  }

  .news-item:hover {
    transform: translateX(4px);
  }

  .news-date {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    font-size: 18px;
    font-weight: 800;
    color: #2563eb;
    background: #f0f6ff;
    border-radius: 16px;
  }

  .news-title {
    margin-bottom: 6px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .news-text {
    font-size: 13px;
    line-height: 1.75;
    color: #6b7280;
  }

  .capability-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-bottom: 20px;
  }

  .capability-tab {
    padding: 22px;
    cursor: pointer;
    background: #fff;
    border: 1px solid #eef2f7;
    border-radius: 24px;
    box-shadow: 0 10px 26px rgb(15 23 42 / 4%);
    transition: all 0.25s ease;
  }

  .capability-tab.active,
  .capability-tab:hover {
    border-color: rgb(59 130 246 / 22%);
    box-shadow: 0 16px 30px rgb(37 99 235 / 8%);
    transform: translateY(-3px);
  }

  .capability-tab-title {
    margin-bottom: 10px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .capability-tab-desc {
    font-size: 14px;
    line-height: 1.85;
    color: #6b7280;
  }

  .capability-content {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: 22px;
    animation: capabilityContentIn 0.32s ease both;
  }

  .capability-main,
  .capability-side {
    background: #fff;
    border-radius: 28px;
    box-shadow: 0 18px 36px rgb(15 23 42 / 5%);
  }

  .capability-main {
    padding: 34px;
    background: linear-gradient(180deg, #f7fbff 0%, #fff 100%);
  }

  .capability-mark {
    display: inline-flex;
    padding: 6px 12px;
    margin-bottom: 16px;
    font-size: 12px;
    font-weight: 700;
    color: #2563eb;
    background: #eef5ff;
    border-radius: 999px;
  }

  .capability-main h3 {
    margin: 0 0 14px;
    font-size: 32px;
    line-height: 1.35;
    color: #111827;
  }

  .capability-main p {
    margin: 0;
    font-size: 15px;
    line-height: 2;
    color: #4b5563;
  }

  .capability-actions {
    margin-top: 24px;
  }

  .capability-side {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding: 22px;
  }

  .mini-card {
    padding: 20px;
    cursor: pointer;
    background: #f8fbff;
    border-radius: 22px;
    transition: all 0.25s ease;
  }

  .mini-card:hover,
  .matrix-card:hover {
    box-shadow: 0 14px 28px rgb(37 99 235 / 10%);
    transform: translateY(-4px);
  }

  .mini-card-top,
  .matrix-card-top {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    font-size: 18px;
    color: #2563eb;
  }

  .mini-card-top span,
  .matrix-card-top span {
    font-size: 12px;
    color: #6b7280;
  }

  .mini-card-title,
  .matrix-card-title {
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 700;
    color: #111827;
  }

  .mini-card-desc,
  .matrix-card-desc {
    font-size: 13px;
    line-height: 1.85;
    color: #6b7280;
  }

  .data-section {
    padding-bottom: 8px;
  }

  .data-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .data-card {
    padding: 28px 24px;
    background: linear-gradient(180deg, #fff 0%, #f9fbff 100%);
    border-radius: 26px;
    box-shadow: 0 18px 36px rgb(15 23 42 / 5%);
  }

  .data-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    margin-bottom: 18px;
    font-size: 24px;
    color: #2563eb;
    background: #eef5ff;
    border-radius: 18px;
  }

  .data-value {
    margin-bottom: 8px;
    font-size: 34px;
    font-weight: 800;
    color: #111827;
  }

  .data-title {
    margin-bottom: 8px;
    font-size: 17px;
    font-weight: 700;
    color: #111827;
  }

  .data-desc {
    font-size: 14px;
    line-height: 1.9;
    color: #6b7280;
  }

  .matrix-section {
    padding-bottom: 8px;
  }

  .matrix-group {
    display: grid;
    grid-template-columns: 300px minmax(0, 1fr);
    gap: 24px;
    align-items: start;
    margin-bottom: 24px;
  }

  .matrix-left {
    position: sticky;
    top: 20px;
    padding: 30px;
    background: #fff;
    border-radius: 28px;
    box-shadow: 0 18px 36px rgb(15 23 42 / 5%);
  }

  .matrix-kicker {
    margin-bottom: 14px;
    font-size: 14px;
    font-weight: 800;
    color: #2563eb;
  }

  .matrix-title {
    margin-bottom: 12px;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.35;
    color: #111827;
  }

  .matrix-desc {
    font-size: 14px;
    line-height: 1.9;
    color: #6b7280;
  }

  .matrix-right {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
  }

  .matrix-card {
    padding: 22px;
    cursor: pointer;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 18px 36px rgb(15 23 42 / 5%);
    transition: all 0.25s ease;
  }

  .matrix-card-link {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    margin-top: 16px;
    font-size: 14px;
    font-weight: 700;
    color: #2563eb;
  }

  .workflow-grid,
  .highlight-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }

  .workflow-card,
  .highlight-card {
    padding: 26px 24px;
    background: #fff;
    border-radius: 26px;
    box-shadow: 0 18px 36px rgb(15 23 42 / 5%);
  }

  .workflow-index {
    margin-bottom: 16px;
    font-size: 40px;
    font-weight: 800;
    line-height: 1;
    color: #d6e6ff;
  }

  .workflow-title,
  .highlight-title {
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 700;
    color: #111827;
  }

  .workflow-desc,
  .highlight-desc {
    font-size: 14px;
    line-height: 1.95;
    color: #6b7280;
  }

  .footer-shell {
    box-sizing: border-box;
    width: 100%;
    max-width: none;
    padding: 32px 28px 28px;
    margin: 72px 0 0;
    color: #fff;
    background: #0f172a;
    // border-radius: 32px 32px 0 0;
  }

  .footer-top,
  .footer-bottom {
    max-width: 1440px;
    margin-right: auto;
    margin-left: auto;
  }

  .footer-top {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    justify-content: space-between;
    padding-bottom: 20px;
    border-bottom: 1px solid rgb(255 255 255 / 8%);
  }

  .footer-brand {
    margin-bottom: 12px;
    font-size: 22px;
    font-weight: 800;
  }

  .footer-text {
    max-width: 760px;
    font-size: 14px;
    line-height: 1.9;
    color: rgb(255 255 255 / 70%);
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    justify-content: flex-end;
    font-size: 14px;
    color: rgb(255 255 255 / 74%);
  }

  .footer-bottom {
    padding-top: 18px;
    font-size: 13px;
    color: rgb(255 255 255 / 58%);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(html),
    .official-home {
      scroll-behavior: auto;
    }

    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }

    [data-animate-section],
    [data-stagger] > * {
      opacity: 1;
      transform: none;
    }
  }

  @media screen and (width <= 1366px) {
    .hero-title {
      font-size: 44px;
    }

    .matrix-right,
    .workflow-grid,
    .highlight-grid,
    .data-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .capability-side {
      grid-template-columns: 1fr;
    }
  }

  @media screen and (width <= 1100px) {
    .topbar,
    .section-heading,
    .footer-top,
    .hero-main,
    .news-layout,
    .capability-content,
    .matrix-group {
      flex-direction: column;
      grid-template-columns: 1fr;
      align-items: flex-start;
    }

    .top-nav {
      flex-wrap: wrap;
      gap: 14px 20px;
    }

    .hero-main {
      display: flex;
    }

    .hero-panel,
    .hero-copy {
      width: 100%;
    }

    .capability-tabs {
      grid-template-columns: 1fr;
    }

    .matrix-left {
      position: static;
    }

    .matrix-right {
      grid-template-columns: repeat(2, 1fr);
    }

    .section-desc {
      max-width: none;
      text-align: left;
    }
  }

  @media screen and (width <= 768px) {
    .hero-shell,
    .section-block {
      padding-right: 16px;
      padding-left: 16px;
    }

    .hero-shell {
      padding-top: 18px;
      padding-bottom: 28px;
    }

    .topbar {
      margin-bottom: 26px;
    }

    .top-actions {
      width: 100%;
    }

    :deep(.ghost-btn.el-button),
    :deep(.solid-btn.el-button) {
      flex: 1;
    }

    .hero-copy {
      padding-top: 0;
    }

    .hero-title {
      font-size: 32px;
    }

    .hero-desc {
      font-size: 14px;
    }

    .hero-metrics,
    .matrix-right,
    .workflow-grid,
    .highlight-grid,
    .data-grid {
      grid-template-columns: 1fr;
    }

    .news-focus,
    .news-list,
    .capability-main,
    .capability-side,
    .matrix-left,
    .matrix-card,
    .workflow-card,
    .highlight-card,
    .data-card,
    .footer-shell {
      border-radius: 22px;
    }

    .news-item {
      grid-template-columns: 44px minmax(0, 1fr) 18px;
      gap: 12px;
    }

    .news-date {
      width: 44px;
      height: 44px;
      font-size: 16px;
      border-radius: 14px;
    }

    .news-focus {
      padding: 24px;
    }

    .focus-highlights {
      grid-template-columns: 1fr;
    }

    .news-list {
      padding: 10px 16px;
    }

    .section-heading h2 {
      font-size: 28px;
    }

    .news-focus h3,
    .capability-main h3,
    .matrix-title {
      font-size: 24px;
    }

    .footer-shell {
      margin-top: 48px;
      border-radius: 24px 24px 0 0;
    }
  }
</style>

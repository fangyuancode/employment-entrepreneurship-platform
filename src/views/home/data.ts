import type { Component } from 'vue'
import {
  Briefcase,
  ChatLineRound,
  Connection,
  Cpu,
  DataAnalysis,
  Document,
  EditPen,
  Grid,
  Histogram,
  MagicStick,
  Monitor,
  Notebook,
  Opportunity,
  Promotion,
  Reading,
  TrendCharts
} from '@element-plus/icons-vue'

export interface NavItem {
  key: string
  label: string
}

export interface HomeMetric {
  value: string
  label: string
  desc: string
}

export interface HomeEntry {
  title: string
  desc: string
  path: string
  icon: Component
  accent: string
}

export interface CapabilityChild {
  title: string
  desc: string
  path: string
  icon: Component
  tag: string
}

export interface CapabilityTab {
  key: string
  tag: string
  title: string
  desc: string
  longDesc: string
  path: string
  icon: Component
  children: CapabilityChild[]
}

export interface DataCard {
  title: string
  value: string
  desc: string
  icon: Component
  path: string
}

export interface FeatureItem {
  title: string
  desc: string
  path: string
  icon: Component
  tag: string
}

export interface FeatureGroup {
  kicker: string
  title: string
  desc: string
  items: FeatureItem[]
}

export interface WorkflowCard {
  title: string
  desc: string
  tag: string
}

export interface HighlightCard {
  title: string
  desc: string
}

export const navItems: NavItem[] = [
  { key: 'overview', label: '平台总览' },
  { key: 'capability', label: '核心能力' },
  { key: 'data', label: '数据大屏' },
  { key: 'matrix', label: '应用矩阵' },
  { key: 'workflow', label: '使用流程' }
]

export const heroTags = ['岗位分析', 'AI就业助手', '数字展厅', '大屏可视化', '商业计划书', '智能办公']

export const heroMetrics: HomeMetric[] = [
  { value: '13+', label: '核心应用模块', desc: '覆盖就业、创业、办公与数据分析' },
  { value: '15W+', label: '岗位数据规模', desc: '支撑岗位洞察、技能分析与趋势研判' },
  { value: '4类', label: 'AI 服务场景', desc: '问答、生成、识别、分析一体化集成' }
]

export const heroEntries: HomeEntry[] = [
  {
    title: '数字展厅',
    desc: '沉浸式查看平台能力',
    path: '/exhibition',
    icon: Grid,
    accent: 'cyan'
  },
  {
    title: '岗位大屏',
    desc: '全国岗位数据洞察',
    path: '/jobscreen',
    icon: DataAnalysis,
    accent: 'blue'
  },
  {
    title: 'AI 就业助手',
    desc: '求职规划与岗位问答',
    path: '/aichat',
    icon: ChatLineRound,
    accent: 'violet'
  },
  {
    title: '商业计划书',
    desc: '生成创业项目方案',
    path: '/study/business',
    icon: Document,
    accent: 'amber'
  }
]

export const capabilityTabs: CapabilityTab[] = [
  {
    key: 'job',
    tag: '就业分析',
    title: '就业数据洞察体系',
    desc: '岗位采集、岗位列表、分析大屏、技能图谱协同联动。',
    longDesc:
      '围绕招聘岗位数据建立从采集、清洗、检索、分析到图谱建模的完整链路，帮助用户理解岗位供需、薪资变化、技能热度和能力迁移方向。',
    path: '/toolbox/jobanalysis',
    icon: Briefcase,
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
        desc: '展示岗位与技能、城市、企业之间的关联关系。',
        path: '/toolbox/jobskillgraph',
        icon: Connection,
        tag: '知识图谱'
      },
      {
        title: '工作岗位采集',
        desc: '支持岗位采集、预览、保存与数据清洗。',
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
    desc: '从商业方案到品牌包装，再到路演表达的一站式输出。',
    longDesc:
      '通过商业计划书、品牌文案、产品设计和路演 PPT 等模块，帮助用户快速形成项目表达内容，提升创业项目申报、展示和路演效率。',
    path: '/study/business',
    icon: MagicStick,
    children: [
      {
        title: 'AI 商业计划书',
        desc: '生成结构化、可展示的完整商业方案。',
        path: '/study/business',
        icon: Document,
        tag: '创业辅助'
      },
      {
        title: 'AI 品牌与文案',
        desc: '输出品牌名、卖点文案、宣传语与传播思路。',
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
      '在项目汇报与办公协作场景中，平台能够自动提炼会议纪要、关键决策、待办事项，并支持实体关系抽取与结构化展示。',
    path: '/study/meeting',
    icon: Notebook,
    children: [
      {
        title: 'AI 会议纪要',
        desc: '自动生成总结、待办、责任人和风险提醒。',
        path: '/study/meeting',
        icon: Notebook,
        tag: '会议提效'
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

export const dataCards: DataCard[] = [
  {
    title: '岗位数据驾驶舱',
    value: 'Job Screen',
    desc: '以大屏方式查看岗位数量、城市分布、薪资区间、热门技能与企业画像。',
    icon: DataAnalysis,
    path: '/jobscreen'
  },
  {
    title: '数字展厅导航',
    value: 'Expo Hall',
    desc: '使用 3D 场景串联项目能力，让评审和用户快速理解系统亮点。',
    icon: Grid,
    path: '/exhibition'
  },
  {
    title: '技能迁移洞察',
    value: 'Skill Graph',
    desc: '结合岗位技能关系，辅助判断学习路径、能力缺口与求职方向。',
    icon: Opportunity,
    path: '/toolbox/jobskillgraph'
  },
  {
    title: 'AI 对话式就业咨询',
    value: 'AI Chat',
    desc: '通过自然语言提问获得岗位分析、求职建议和职业路径规划。',
    icon: ChatLineRound,
    path: '/aichat'
  }
]

export const groupedFeatures: FeatureGroup[] = [
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

export const workflowCards: WorkflowCard[] = [
  {
    title: '确定目标场景',
    desc: '从创业展示、岗位分析、办公提效等入口中选择目标模块。',
    tag: 'Scene'
  },
  {
    title: '输入需求与数据',
    desc: '支持文本输入、内容生成、数据分析、岗位采集与信息处理。',
    tag: 'Input'
  },
  {
    title: 'AI 分析与可视化',
    desc: '系统输出结构化结果、统计图表、图谱关系与方案内容。',
    tag: 'Insight'
  },
  {
    title: '结果落地与展示',
    desc: '将分析结果用于项目展示、学习规划、业务表达与决策支持。',
    tag: 'Output'
  }
]

export const highlights: HighlightCard[] = [
  {
    title: 'AI+创业就业全链路赋能',
    desc: '从商业计划生成到岗位分析，再到技能图谱与职业规划，构建完整的 AI 辅助决策闭环。'
  },
  {
    title: '真实数据驱动的分析引擎',
    desc: '基于岗位数据进行挖掘与建模，支持趋势洞察、能力评估与路径推荐。'
  },
  {
    title: '展示性与实用性统一',
    desc: '首页、数字展厅和数据大屏形成清晰展示链路，同时保留真实可用的业务功能。'
  },
  {
    title: '模块化智能平台架构',
    desc: '页面、组件和功能模块可持续扩展，方便后续接入新的数据源与 AI 能力。'
  }
]

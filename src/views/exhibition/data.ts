import type { HallItem, OverviewStat, RuntimeStatus } from './types'

export const LOCAL_HALLS = [
  {
    "key": "job",
    "code": "HALL 01",
    "short": "岗位",
    "title": "就业分析馆",
    "slogan": "岗位分布、薪资区间、城市热度集中展示。",
    "path": "/toolbox/jobanalysis",
    "tags": [
      "岗位画像",
      "薪资分析",
      "区域对比"
    ],
    "position": [
      -15,
      0,
      -9
    ],
    "height": 9,
    "color": 5213439,
    "icon": "岗",
    "sceneRole": "就业市场洞察入口",
    "hoverTitle": "就业分析馆 · 从数据看机会",
    "hoverDesc": "把岗位数量、城市分布、薪资区间和技能要求整合到同一视角，帮助学生快速判断“去哪儿、做什么、需要补什么”。",
    "scenario": "求职定位 / 城市选择 / 岗位对比",
    "userValue": "把零散招聘信息转化为可解释的就业决策依据。",
    "dataAssets": "岗位表、城市字段、薪资字段、技能标签",
    "actionText": "进入岗位分析",
    "features": [
      {
        "name": "岗位热度",
        "desc": "展示岗位数量与城市热度变化"
      },
      {
        "name": "薪资洞察",
        "desc": "对比岗位薪资区间与高薪方向"
      },
      {
        "name": "区域筛选",
        "desc": "支持按城市、类别、经验进行定位"
      },
      {
        "name": "趋势判断",
        "desc": "辅助判断短期需求增长方向"
      }
    ],
    "outputs": [
      "岗位分布图",
      "薪资对比表",
      "热门城市清单",
      "求职方向建议"
    ],
    "judgePoints": [
      "数据来源明确",
      "能直接服务学生就业选择",
      "适合大屏展示和答辩演示"
    ],
    "kpis": [
      {
        "label": "岗位覆盖",
        "value": "12.8w+",
        "trend": "多城市样本"
      },
      {
        "label": "热度维度",
        "value": "6项",
        "trend": "岗位/薪资/城市"
      },
      {
        "label": "分析效率",
        "value": "秒级",
        "trend": "缓存后加载"
      }
    ],
    "metrics": [
      {
        "name": "岗位洞察",
        "value": 92
      },
      {
        "name": "区域分析",
        "value": 86
      },
      {
        "name": "薪资对比",
        "value": 81
      }
    ],
    "demoScript": "这一馆解决的是“学生不知道该投什么岗位”的问题，通过岗位数据和城市热度帮助用户完成就业方向定位。"
  },
  {
    "key": "chat",
    "code": "HALL 02",
    "short": "问答",
    "title": "AI问答馆",
    "slogan": "围绕求职、简历、面试与规划进行智能问答。",
    "path": "/aichat",
    "tags": [
      "职业问答",
      "简历建议",
      "面试准备"
    ],
    "position": [
      0,
      0,
      -13
    ],
    "height": 11,
    "color": 5756579,
    "icon": "问",
    "sceneRole": "AI职业咨询与问答入口",
    "hoverTitle": "AI问答馆 · 把咨询变成可执行建议",
    "hoverDesc": "面向学生常见的就业困惑，提供职业规划、简历优化、面试准备和岗位选择建议，降低使用门槛。",
    "scenario": "职业咨询 / 简历优化 / 面试准备",
    "userValue": "让用户用自然语言获得个性化求职建议。",
    "dataAssets": "岗位知识、求职问题、简历要点、问答模板",
    "actionText": "进入AI问答",
    "features": [
      {
        "name": "自然问答",
        "desc": "支持用户直接提出宽泛问题"
      },
      {
        "name": "分段输出",
        "desc": "回答按主题分段，便于阅读"
      },
      {
        "name": "快捷能力",
        "desc": "不同快捷入口对应不同后端能力"
      },
      {
        "name": "求职闭环",
        "desc": "从问题到计划再到行动建议"
      }
    ],
    "outputs": [
      "职业规划建议",
      "简历优化清单",
      "面试准备方案",
      "求职行动计划"
    ],
    "judgePoints": [
      "交互门槛低",
      "直接体现AI能力",
      "适合现场演示问答效果"
    ],
    "kpis": [
      {
        "label": "问答场景",
        "value": "8类",
        "trend": "求职全流程"
      },
      {
        "label": "响应形式",
        "value": "分段",
        "trend": "便于阅读"
      },
      {
        "label": "演示价值",
        "value": "高",
        "trend": "现场可互动"
      }
    ],
    "metrics": [
      {
        "name": "即时问答",
        "value": 94
      },
      {
        "name": "简历建议",
        "value": 88
      },
      {
        "name": "面试辅导",
        "value": 84
      }
    ],
    "demoScript": "这一馆展示平台的AI交互能力，评委可以现场输入一个求职问题，系统会生成可执行、分段清晰的建议。"
  },
  {
    "key": "skill",
    "code": "HALL 03",
    "short": "图谱",
    "title": "技能图谱馆",
    "slogan": "把岗位能力要求转化为可视化技能关系。",
    "path": "/toolbox/job-skill-graph/view",
    "tags": [
      "技能节点",
      "关系网络",
      "能力路径"
    ],
    "position": [
      15,
      0,
      -9
    ],
    "height": 8,
    "color": 16762967,
    "icon": "技",
    "sceneRole": "岗位能力建模与学习路径入口",
    "hoverTitle": "技能图谱馆 · 看清岗位背后的能力结构",
    "hoverDesc": "把岗位要求抽象成技能节点和关系网络，帮助用户理解岗位能力差距，并形成学习提升路径。",
    "scenario": "能力评估 / 学习路径 / 岗位适配",
    "userValue": "把“我不会什么”转化为明确的学习任务。",
    "dataAssets": "岗位技能词、岗位类别、技能关系、学习资源",
    "actionText": "进入技能图谱",
    "features": [
      {
        "name": "技能抽取",
        "desc": "从岗位描述中提取核心能力词"
      },
      {
        "name": "关系建模",
        "desc": "展示技能之间的关联与层级"
      },
      {
        "name": "能力差距",
        "desc": "对比用户目标岗位所需能力"
      },
      {
        "name": "学习建议",
        "desc": "形成分阶段提升路线"
      }
    ],
    "outputs": [
      "技能关系图",
      "能力差距清单",
      "学习路径",
      "岗位适配建议"
    ],
    "judgePoints": [
      "有结构化建模思路",
      "能体现AI+就业的深度",
      "比普通问答更有技术含量"
    ],
    "kpis": [
      {
        "label": "技能节点",
        "value": "300+",
        "trend": "持续扩展"
      },
      {
        "label": "关系类型",
        "value": "多维",
        "trend": "岗位/能力/课程"
      },
      {
        "label": "推荐路径",
        "value": "阶段式",
        "trend": "可执行"
      }
    ],
    "metrics": [
      {
        "name": "技能建模",
        "value": 90
      },
      {
        "name": "路径推荐",
        "value": 85
      },
      {
        "name": "能力评估",
        "value": 82
      }
    ],
    "demoScript": "这一馆强调技术深度，把岗位需求做成技能图谱，评委能看到平台不是简单聊天，而是在做结构化能力分析。"
  },
  {
    "key": "startup",
    "code": "HALL 04",
    "short": "创业",
    "title": "创业孵化馆",
    "slogan": "支持商业计划、产品定位与创业方案生成。",
    "path": "/study/business",
    "tags": [
      "商业计划",
      "市场定位",
      "落地方案"
    ],
    "position": [
      -15,
      0,
      10
    ],
    "height": 8.5,
    "color": 16743001,
    "icon": "创",
    "sceneRole": "创业方案生成与项目孵化入口",
    "hoverTitle": "创业孵化馆 · 从想法到方案",
    "hoverDesc": "面向创业实践项目，把项目背景、市场定位、商业模式和实施路径整理成可提交、可展示的方案材料。",
    "scenario": "创业申请 / 项目孵化 / 路演准备",
    "userValue": "帮助用户把零散创意整理成可落地的创业方案。",
    "dataAssets": "行业资料、用户输入、商业计划模板、项目结构",
    "actionText": "进入创业孵化",
    "features": [
      {
        "name": "计划生成",
        "desc": "形成商业计划书主体内容"
      },
      {
        "name": "市场定位",
        "desc": "辅助梳理目标用户和应用场景"
      },
      {
        "name": "风险分析",
        "desc": "提示项目落地风险与优化方向"
      },
      {
        "name": "路演支持",
        "desc": "对接PPT和项目展示材料"
      }
    ],
    "outputs": [
      "商业计划书",
      "项目定位说明",
      "竞品分析摘要",
      "实施路径表"
    ],
    "judgePoints": [
      "贴合创新创业比赛",
      "成果物明确",
      "可作为项目申报支撑材料"
    ],
    "kpis": [
      {
        "label": "输出材料",
        "value": "4类",
        "trend": "申请/路演"
      },
      {
        "label": "方案结构",
        "value": "完整",
        "trend": "背景到落地"
      },
      {
        "label": "实用程度",
        "value": "高",
        "trend": "比赛可用"
      }
    ],
    "metrics": [
      {
        "name": "计划生成",
        "value": 91
      },
      {
        "name": "市场分析",
        "value": 84
      },
      {
        "name": "项目路演",
        "value": 80
      }
    ],
    "demoScript": "这一馆面向创业实践项目，能够把创意快速整理成商业计划，突出平台对创业申报和项目路演的帮助。"
  },
  {
    "key": "brand",
    "code": "HALL 05",
    "short": "品牌",
    "title": "品牌表达馆",
    "slogan": "沉淀品牌文案、项目介绍与传播材料。",
    "path": "/study/copywriting",
    "tags": [
      "品牌文案",
      "作品介绍",
      "传播表达"
    ],
    "position": [
      0,
      0,
      14
    ],
    "height": 10,
    "color": 12094719,
    "icon": "品",
    "sceneRole": "项目包装与传播表达入口",
    "hoverTitle": "品牌表达馆 · 让项目更容易被理解",
    "hoverDesc": "将项目介绍、宣传语、作品亮点和应用价值进行统一表达，提升项目在评审、宣传和路演中的辨识度。",
    "scenario": "项目介绍 / 品牌命名 / 宣传文案",
    "userValue": "降低学生做项目包装和文字表达的难度。",
    "dataAssets": "项目描述、品牌语料、文案模板、传播场景",
    "actionText": "进入品牌表达",
    "features": [
      {
        "name": "品牌命名",
        "desc": "辅助生成更易传播的作品名称"
      },
      {
        "name": "项目介绍",
        "desc": "生成不同长度的作品介绍"
      },
      {
        "name": "亮点提炼",
        "desc": "提取技术、应用和创新优势"
      },
      {
        "name": "传播文案",
        "desc": "适配海报、官网、路演场景"
      }
    ],
    "outputs": [
      "作品介绍",
      "宣传标语",
      "项目亮点",
      "展示文案"
    ],
    "judgePoints": [
      "增强作品完成度",
      "方便答辩材料准备",
      "提升项目传播效果"
    ],
    "kpis": [
      {
        "label": "文案类型",
        "value": "多场景",
        "trend": "介绍/宣传/路演"
      },
      {
        "label": "表达风格",
        "value": "可控",
        "trend": "学术/比赛"
      },
      {
        "label": "复用价值",
        "value": "高",
        "trend": "材料沉淀"
      }
    ],
    "metrics": [
      {
        "name": "品牌文案",
        "value": 89
      },
      {
        "name": "作品包装",
        "value": 86
      },
      {
        "name": "传播表达",
        "value": 83
      }
    ],
    "demoScript": "这一馆主要展示项目包装能力，可以快速生成作品介绍、亮点总结和宣传表达，提高参赛作品的完整度。"
  },
  {
    "key": "office",
    "code": "HALL 06",
    "short": "办公",
    "title": "智能办公馆",
    "slogan": "面向汇报、会议、路演等场景进行内容生成。",
    "path": "/study/pitchppt",
    "tags": [
      "路演PPT",
      "会议纪要",
      "材料生成"
    ],
    "position": [
      15,
      0,
      10
    ],
    "height": 7.8,
    "color": 4637439,
    "icon": "办",
    "sceneRole": "汇报材料与路演内容入口",
    "hoverTitle": "智能办公馆 · 把内容变成展示材料",
    "hoverDesc": "面向项目路演、工作汇报和会议材料，帮助用户快速生成结构化内容，提升汇报效率。",
    "scenario": "路演PPT / 汇报材料 / 会议纪要",
    "userValue": "提升材料生成效率，降低非技术环节耗时。",
    "dataAssets": "项目文本、PPT大纲、会议内容、汇报模板",
    "actionText": "进入智能办公",
    "features": [
      {
        "name": "PPT大纲",
        "desc": "生成路演或答辩结构"
      },
      {
        "name": "内容扩写",
        "desc": "根据提纲形成说明文字"
      },
      {
        "name": "纪要整理",
        "desc": "把会议内容转为任务清单"
      },
      {
        "name": "材料复用",
        "desc": "沉淀为后续汇报模板"
      }
    ],
    "outputs": [
      "路演PPT大纲",
      "汇报材料",
      "会议纪要",
      "任务清单"
    ],
    "judgePoints": [
      "演示价值明显",
      "适合项目答辩场景",
      "能提升团队协作效率"
    ],
    "kpis": [
      {
        "label": "材料生成",
        "value": "快速",
        "trend": "减少重复整理"
      },
      {
        "label": "适用场景",
        "value": "3类",
        "trend": "路演/汇报/会议"
      },
      {
        "label": "协同价值",
        "value": "明显",
        "trend": "团队可用"
      }
    ],
    "metrics": [
      {
        "name": "材料生成",
        "value": 88
      },
      {
        "name": "汇报辅助",
        "value": 85
      },
      {
        "name": "协同办公",
        "value": 78
      }
    ],
    "demoScript": "这一馆体现平台对实际工作流的支持，尤其适合答辩时展示“一键生成路演内容”的实用价值。"
  }
] as HallItem[]

export const LOCAL_OVERVIEW_STATS = [
  {
    "label": "核心展馆",
    "value": "6",
    "trend": "功能矩阵"
  },
  {
    "label": "演示模式",
    "value": "2",
    "trend": "自由探索 / 自动导览"
  },
  {
    "label": "成果输出",
    "value": "24+",
    "trend": "图表 / 文档 / 建议"
  },
  {
    "label": "展示形态",
    "value": "3D",
    "trend": "WebGL 数字展厅"
  }
] as OverviewStat[]

export const LOCAL_RUNTIME_STATUS = [
  {
    "name": "渲染引擎",
    "value": "Three.js"
  },
  {
    "name": "镜头控制",
    "value": "OrbitControls"
  },
  {
    "name": "模型加载",
    "value": "GLTFLoader"
  },
  {
    "name": "页面形态",
    "value": "数字大屏"
  }
] as RuntimeStatus[]

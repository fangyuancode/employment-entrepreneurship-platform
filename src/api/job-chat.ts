import request from '@/utils/http'

/**
 * 就业智能聊天请求参数
 */
export interface JobChatRequest {
  /** 用户输入的问题，例如：杭州 Java 后端岗位怎么样？ */
  question: string
  /** 可选：城市筛选 */
  city?: string
  /** 可选：岗位一级分类筛选 */
  categoryMain?: string
  /** 可选：学历筛选 */
  degree?: string
  /** 可选：经验筛选 */
  experience?: string
  /** 返回岗位数量 */
  limit?: number
}

/** 快捷功能/聊天场景 */
export type JobChatAction =
  | 'user-ask'
  | 'resume-optimize'
  | 'interview-prepare'
  | 'job-plan'
  | 'job-recommend'
  | 'trend-analysis'
  | 'history-summary'
  | 'common-questions'
  | 'usage-guide'

/** 指标卡片 */
export interface JobChatMetric {
  label: string
  value: string | number
  desc?: string
}

/** 图表通用项 */
export interface JobChatChartItem {
  name: string
  value: number
}

/** 推荐岗位 */
export interface JobChatRelatedJob {
  id: number
  jobName?: string
  salary?: string
  degree?: string
  experience?: string
  companyName?: string
  city?: string
  district?: string
  skills?: string
  categoryMain?: string
  categorySub?: string
}

/** 就业智能聊天响应 */
export interface JobChatResponse {
  answer: string
  summaryPoints: string[]
  suggestions: string[]
  metrics: JobChatMetric[]
  topSkills: JobChatChartItem[]
  topCities: JobChatChartItem[]
  topJobs: JobChatChartItem[]
  topCompanies: JobChatChartItem[]
  topCategories?: JobChatChartItem[]
  relatedJobs: JobChatRelatedJob[]
  filters: Record<string, string>
  usedAi: boolean
  scene?: string
  generatedAt: string
}

const postJobChat = (url: string, data: JobChatRequest) => {
  return request.post<JobChatResponse>({
    url,
    data,
    timeout: 90000,
    showErrorMessage: true
  })
}

/** 兼容旧接口：不建议新页面继续直接调用，保留给其他历史代码使用 */
export function askJobChat(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/ask', data)
}

/** 用户输入自由问答：只处理输入框提交 */
export function askUserJobChat(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/user-ask', data)
}

/** 快捷功能：优化简历 */
export function askResumeOptimize(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/resume-optimize', data)
}

/** 快捷功能：面试准备 */
export function askInterviewPrepare(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/interview-prepare', data)
}

/** 快捷功能/求职计划：独立接口 */
export function askJobPlan(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/job-plan', data)
}

/** 快捷功能：岗位推荐 */
export function askJobRecommend(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/job-recommend', data)
}

/** 快捷功能：岗位趋势分析 */
export function askTrendAnalysis(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/trend-analysis', data)
}

/** 左侧导航：历史记录总结 */
export function askHistorySummary(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/history-summary', data)
}

/** 左侧导航：常用问题 */
export function askCommonQuestions(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/common-questions', data)
}

/** 左侧导航：使用说明 */
export function askUsageGuide(data: JobChatRequest) {
  return postJobChat('/api/common/job-chat/usage-guide', data)
}

/** 根据场景统一选择对应接口，避免页面所有功能都打到同一个 ask 接口 */
export const jobChatActionApiMap: Record<JobChatAction, (data: JobChatRequest) => Promise<JobChatResponse>> = {
  'user-ask': askUserJobChat,
  'resume-optimize': askResumeOptimize,
  'interview-prepare': askInterviewPrepare,
  'job-plan': askJobPlan,
  'job-recommend': askJobRecommend,
  'trend-analysis': askTrendAnalysis,
  'history-summary': askHistorySummary,
  'common-questions': askCommonQuestions,
  'usage-guide': askUsageGuide
}

export const jobChatActionEndpointMap: Record<JobChatAction, string> = {
  'user-ask': '/api/common/job-chat/user-ask',
  'resume-optimize': '/api/common/job-chat/resume-optimize',
  'interview-prepare': '/api/common/job-chat/interview-prepare',
  'job-plan': '/api/common/job-chat/job-plan',
  'job-recommend': '/api/common/job-chat/job-recommend',
  'trend-analysis': '/api/common/job-chat/trend-analysis',
  'history-summary': '/api/common/job-chat/history-summary',
  'common-questions': '/api/common/job-chat/common-questions',
  'usage-guide': '/api/common/job-chat/usage-guide'
}

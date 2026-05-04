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
  relatedJobs: JobChatRelatedJob[]
  filters: Record<string, string>
  usedAi: boolean
  generatedAt: string
}

/** 就业智能聊天 */
export function askJobChat (data: JobChatRequest) {
  return request.post<JobChatResponse>({
    url: '/api/common/job-chat/ask',
    data,
    timeout: 90000,
    showErrorMessage: true
  })
}

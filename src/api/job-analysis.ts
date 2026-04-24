import axios from 'axios'

export const JOB_ANALYSIS_BASE_URL = 'http://127.0.0.1:9091'

const request = axios.create({
  baseURL: JOB_ANALYSIS_BASE_URL,
  timeout: 60000
})

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

export interface NameValueItem {
  name: string
  value: number
}

export interface DashboardData {
  jobCount: number
  companyCount: number
  cityCount: number
  categoryCount: number
  topJobs: NameValueItem[]
  topCompanies: NameValueItem[]
  degreeDistribution: NameValueItem[]
  experienceDistribution: NameValueItem[]
  categoryDistribution: NameValueItem[]
  cityDistribution: NameValueItem[]
}

export interface DashboardQuery {
  city?: string
  categoryMain?: string
  keyword?: string
}

export interface AiRecommendRequest {
  targetJob?: string
  degree?: string
  experience?: string
  skills?: string
  city?: string
}

export interface AiRecommendData {
  targetJob: string
  recommendedSkills: string[]
  recommendedCompanies: string[]
  recommendedCities: string[]
  deliveryKeywords: string[]
  learningPath: string[]
  summary: string
  suggestions: string[]
}

export function getJobDashboard (params: DashboardQuery) {
  return request.get<ApiResponse<DashboardData>>('/api/common/job-analysis/dashboard', {
    params
  })
}

export function getJobAiRecommend (data: AiRecommendRequest) {
  return request.post<ApiResponse<AiRecommendData>>('/api/common/job-analysis/ai-recommend', data)
}
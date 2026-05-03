import request from '@/utils/http'



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
  return request.get<DashboardData>({
    url: '/api/common/job-analysis/dashboard',
    params,
    timeout: 60000
  })
}

export function getJobAiRecommend (data: AiRecommendRequest) {
  return request.post<AiRecommendData>({
    url: '/api/common/job-analysis/ai-recommend',
    data,
    timeout: 120000
  })
}

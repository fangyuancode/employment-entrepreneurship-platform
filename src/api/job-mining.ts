import axios from 'axios'

export const JOB_MINING_BASE_URL = 'http://127.0.0.1:9091'

const request = axios.create({
  baseURL: JOB_MINING_BASE_URL,
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

export interface StartupOpportunityItem {
  name: string
  postCount: number
  avgSalaryK: number
  startupPostCount: number
  startupRatio: number
  companyCount: number
  opportunityScore: number
  suggestion: string
}

export interface MiningMetrics {
  jobCount: number
  companyCount: number
  cityCount: number
  categoryCount: number
}

export interface MiningOverviewData {
  metrics: MiningMetrics
  topJobs: NameValueItem[]
  topCities: NameValueItem[]
  topCategories: NameValueItem[]
  degreeDistribution: NameValueItem[]
  experienceDistribution: NameValueItem[]
  salaryByCity: NameValueItem[]
  salaryByCategory: NameValueItem[]
  skillHotspots: NameValueItem[]
  startupOpportunities: StartupOpportunityItem[]
  employmentInsights: string[]
  entrepreneurshipInsights: string[]
}

export interface MiningOptions {
  cities: string[]
  categories: string[]
  degrees: string[]
  experiences: string[]
}

export interface MiningQuery {
  keyword?: string
  city?: string
  categoryMain?: string
  degree?: string
  experience?: string
}

export interface CareerPlanRequest {
  targetJob?: string
  city?: string
  degree?: string
  experience?: string
  skills?: string
}

export interface CareerPlanData {
  targetJob: string
  matchScore: number
  hotSkills: NameValueItem[]
  recommendedCompanies: string[]
  recommendedCities: string[]
  resumeKeywords: string[]
  learningPath: string[]
  actions: string[]
  startupDirections: string[]
  salaryStats: {
    avgSalaryK?: number
    maxSalaryK?: number
    minSalaryK?: number
    sampleCount?: number
  }
  summary: string
}

export function getJobMiningOverview (params: MiningQuery) {
  return request.get<ApiResponse<MiningOverviewData>>('/api/common/job-mining/overview', {
    params
  })
}

export function getJobMiningOptions () {
  return request.get<ApiResponse<MiningOptions>>('/api/common/job-mining/options')
}

export function getCareerPlan (data: CareerPlanRequest) {
  return request.post<ApiResponse<CareerPlanData>>('/api/common/job-mining/career-plan', data)
}
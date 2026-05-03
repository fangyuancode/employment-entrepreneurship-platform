import request from '@/utils/http'



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
  return request.get<MiningOverviewData>({
    url: '/api/common/job-mining/overview',
    params,
    timeout: 60000
  })
}

export function getJobMiningOptions () {
  return request.get<MiningOptions>({
    url: '/api/common/job-mining/options',
    timeout: 60000
  })
}

export function getCareerPlan (data: CareerPlanRequest) {
  return request.post<CareerPlanData>({
    url: '/api/common/job-mining/career-plan',
    data,
    timeout: 120000
  })
}

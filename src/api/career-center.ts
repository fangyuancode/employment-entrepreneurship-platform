import request from '@/utils/http'

export interface CareerCenterRequest {
  targetJob?: string
  city?: string
  degree?: string
  experience?: string
  currentStatus?: string
  careerGoal?: string
  ownSkills?: string
  projectExperience?: string
  resumeText?: string
  expectedSalary?: string
  outputStyle?: string
}

export interface CareerCenterOptions {
  cities: string[]
  degrees: string[]
  experiences: string[]
  targetJobs: string[]
}

export interface CareerCenterScoreItem {
  name: string
  score: number
}

export interface CareerCenterSkillItem {
  name: string
  value: number
}

export interface CareerCenterJobItem {
  id: number
  jobName: string
  companyName: string
  city: string
  salary: string
  degree: string
  experience: string
  skills: string
  categoryMain: string
}

export interface CareerCenterDiagnosisItem {
  title: string
  level: 'success' | 'warning' | 'danger' | string
  suggestion: string
}

export interface CareerCenterRoadmapItem {
  stage: string
  title: string
  duration: string
  tasks: string[]
}

export interface CareerCenterAnalyzeResult {
  targetJob: string
  city: string
  degree: string
  experience: string
  queryKeyword?: string
  queryScope?: string
  overallScore: number
  scoreLevel: string
  summary: string
  metrics: Record<string, any>
  radarData: CareerCenterScoreItem[]
  targetSkills: string[]
  userSkills: string[]
  matchedSkills: string[]
  gapSkills: string[]
  skillHotspots: CareerCenterSkillItem[]
  salaryStats: Record<string, any>
  demandCount: number
  recommendedJobs: CareerCenterJobItem[]
  recommendedCities: Array<Record<string, any>>
  recommendedCompanies: Array<Record<string, any>>
  resumeDiagnosis: CareerCenterDiagnosisItem[]
  learningRoadmap: CareerCenterRoadmapItem[]
  actionPlan: string[]
  interviewQuestions: string[]
  aiAdvice: Record<string, any>
  reportText: string
}

export function getCareerCenterOptions () {
  return request.get<CareerCenterOptions>({
    url: '/api/common/career-center/options',
    timeout: 60000
  })
}

export function getCareerCenterDemo () {
  return request.get<CareerCenterRequest>({
    url: '/api/common/career-center/demo',
    timeout: 60000
  })
}

export function analyzeCareerCenter (data: CareerCenterRequest) {
  return request.post<CareerCenterAnalyzeResult>({
    url: '/api/common/career-center/analyze',
    data,
    timeout: 120000
  })
}

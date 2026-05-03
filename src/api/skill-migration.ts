import request from '@/utils/http'



export interface SkillMigrationRequest {
  sourceJob?: string
  targetJob?: string
  city?: string
  degree?: string
  experience?: string
  ownSkills?: string
}

export interface SkillMigrationData {
  sourceJob: string
  targetJob: string
  migrationScore: number
  difficultyLevel: string
  overlapRatio: number
  overlapSkills: string[]
  gapSkills: string[]
  sourceTopSkills: string[]
  targetTopSkills: string[]
  learningPath: string[]
  actionSuggestions: string[]
  targetCities: string[]
  targetCompanies: string[]
  salaryCompare: {
    sourceAvgSalaryK: number
    targetAvgSalaryK: number
    salaryIncreaseK: number
    salaryIncreaseRatio: number
    sourceSampleCount: number
    targetSampleCount: number
  }
  demandCompare: {
    sourceDemand: number
    targetDemand: number
    demandTrend: string
  }
  aiExplain: {
    whyMigrate: string
    migrationBenefits: string[]
    futureTrends: string[]
    riskWarnings: string[]
    finalAdvice: string
  }
  summary: string
}

export interface MigrationPathItem {
  targetJob: string
  migrationScore: number
  difficultyLevel: string
  overlapRatio: number
  overlapSkills: string[]
  gapSkills: string[]
  targetDemand: number
  targetAvgSalaryK: number
  salaryIncreaseK: number
  salaryIncreaseRatio: number
  analysis: string
}

export interface MigrationPathGraphData {
  sourceJob: string
  sourceCategory: string
  graph: {
    nodes: Array<Record<string, any>>
    links: Array<Record<string, any>>
    categories: Array<Record<string, any>>
  }
  paths: MigrationPathItem[]
  relatedJobs: string[]
  insights: string[]
  summary: string
}

export function getSkillMigrationAnalyze (data: SkillMigrationRequest) {
  return request.post<SkillMigrationData>({
    url: '/api/common/skill-migration/analyze',
    data,
    timeout: 120000
  })
}

export function getSkillMigrationPathGraph (data: SkillMigrationRequest) {
  return request.post<MigrationPathGraphData>({
    url: '/api/common/skill-migration/path-graph',
    data,
    timeout: 120000
  })
}

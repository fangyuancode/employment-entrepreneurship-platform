import axios from 'axios'

export interface BusinessPlanForm {
  projectName: string
  industry: string
  stage: string
  targetUsers: string
  coreProblem: string
  solution: string
  businessModel: string
  competitiveAdvantage: string
  teamInfo: string
  budget: string
  region: string
  style: string
}

export interface BusinessPlanResult {
  projectName: string
  summary: string
  marketAnalysis: string
  userPersona: string
  productPlan: string
  businessModel: string
  marketingStrategy: string
  operationPlan: string
  riskAnalysis: string
  milestones: string
  pitchSummary: string
  fullText: string
  mindMapMermaid: string
  imagePrompts: string[]
  imageKeywords: string[]
  imageUrls: string[]
}

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

export interface GenerateImagesRequest {
  projectName: string
  imagePrompts: string[]
}

export interface GenerateImagesResponse {
  imageUrls: string[]
}

const BASE_URL = 'http://localhost:9091/api/common/business-plan'

export function generateBusinessPlan (data: BusinessPlanForm) {
  return axios.post<ApiResponse<BusinessPlanResult>>(`${BASE_URL}/generate`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function generateBusinessPlanImages (data: GenerateImagesRequest) {
  return axios.post<ApiResponse<GenerateImagesResponse>>(`${BASE_URL}/generate-images`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
export interface BusinessPlanPdfRequest {
  projectName: string
  summary: string
  marketAnalysis: string
  userPersona: string
  productPlan: string
  businessModel: string
  marketingStrategy: string
  operationPlan: string
  riskAnalysis: string
  milestones: string
  pitchSummary: string
  fullText: string
  imageUrls: string[]
}

export function exportBusinessPlanPdf (data: BusinessPlanPdfRequest) {
  return axios.post(`${BASE_URL}/export-pdf`, data, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
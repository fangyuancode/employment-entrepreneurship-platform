import request from '@/utils/http'
import { buildJavaApiUrl } from './_base'


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


export interface GenerateImagesRequest {
  projectName: string
  imagePrompts: string[]
}

export interface GenerateImagesResponse {
  imageUrls: string[]
}

const API_PREFIX = '/api/common/business-plan'

export function generateBusinessPlan (data: BusinessPlanForm) {
  return request.post<BusinessPlanResult>({
    url: `${API_PREFIX}/generate`,
    data,
    timeout: 180000
  })
}

export function generateBusinessPlanImages (data: GenerateImagesRequest) {
  return request.post<GenerateImagesResponse>({
    url: `${API_PREFIX}/generate-images`,
    data,
    timeout: 180000
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


export function previewBusinessPlanImage (url: string) {
  return buildJavaApiUrl(`${API_PREFIX}/preview-image?url=${encodeURIComponent(url)}`)
}

export function exportBusinessPlanPdf (data: BusinessPlanPdfRequest) {
  return request.blob({
    url: `${API_PREFIX}/export-pdf`,
    method: 'POST',
    data,
    timeout: 180000
  })
}

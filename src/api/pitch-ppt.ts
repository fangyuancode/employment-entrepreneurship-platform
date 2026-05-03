import request from '@/utils/http'
import { buildJavaApiUrl } from './_base'


export interface PitchPptForm {
  projectName: string
  industry: string
  targetUsers: string
  coreProblem: string
  solution: string
  businessModel: string
  competitiveAdvantage: string
  teamInfo: string
  stage: string
  style: string
}

export interface PitchPptSlide {
  pageNumber: number
  title: string
  corePoints: string
  visualSuggestion: string
  speakingNotes: string
}

export interface PitchPptResult {
  projectName: string
  totalPages: number
  pptSummary: string
  openingScript: string
  closingScript: string
  qaSuggestions: string
  designStyleSuggestion: string
  slideList: PitchPptSlide[]
  imagePrompts: string[]
  imageUrls: string[]
  sceneImageMap: Record<string, string>
}


const API_PREFIX = '/api/common/pitch-ppt'

export function generatePitchPpt (data: PitchPptForm) {
  return request.post<PitchPptResult>({
    url: `${API_PREFIX}/generate`,
    data,
    timeout: 180000
  })
}

export function previewPitchPptImage (url: string) {
  return buildJavaApiUrl(`${API_PREFIX}/preview-image?url=${encodeURIComponent(url)}`)
}

export function buildPitchPptResourceUrl (url: string) {
  return buildJavaApiUrl(url)
}

export interface PitchPptBuildRequest {
  projectName: string
  pptSummary: string
  openingScript: string
  closingScript: string
  qaSuggestions: string
  designStyleSuggestion: string
  slideList: PitchPptSlide[]
}

export interface PitchPptFileResponse {
  fileId: string
  fileName: string
  downloadUrl: string
  previewImages: string[]
}

export function buildPitchPptFile (data: PitchPptBuildRequest) {
  return request.post<PitchPptFileResponse>({
    url: `${API_PREFIX}/build-file`,
    data,
    timeout: 180000
  })
}

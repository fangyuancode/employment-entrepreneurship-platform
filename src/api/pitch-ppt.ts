import axios from 'axios'

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

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

const BASE_URL = 'http://localhost:9091/api/common/pitch-ppt'

export function generatePitchPpt (data: PitchPptForm) {
  return axios.post<ApiResponse<PitchPptResult>>(`${BASE_URL}/generate`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function previewPitchPptImage (url: string) {
  return `${BASE_URL}/preview-image?url=${encodeURIComponent(url)}`
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
  return axios.post<ApiResponse<PitchPptFileResponse>>(`${BASE_URL}/build-file`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
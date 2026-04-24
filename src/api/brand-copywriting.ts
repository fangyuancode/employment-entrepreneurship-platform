import axios from 'axios'

export interface BrandCopywritingForm {
  projectName: string
  industry: string
  targetUsers: string
  coreProduct: string
  brandTone: string
  coreAdvantage: string
  usageScenario: string
  region: string
  style: string
}

export interface BrandCopywritingResult {
  projectName: string
  brandName: string
  brandSlogan: string
  brandPositioning: string
  brandStory: string
  brandVision: string
  brandKeywords: string
  targetAudienceInsight: string
  brandToneDescription: string
  homepageHeroTitle: string
  homepageHeroSubtitle: string
  posterCopy: string
  socialMediaCopy: string
  shortVideoScript: string
  liveStreamScript: string
  productSellingPoints: string
  campaignTheme: string
  adTitleSet: string
  adDescriptionSet: string
  imagePrompts: string[]
  imageUrls: string[]
  sceneImageMap: Record<string, string>
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
  sceneImageMap: Record<string, string>
}

const BASE_URL = 'http://localhost:9091/api/common/brand-copywriting'

export function generateBrandCopywriting (data: BrandCopywritingForm) {
  return axios.post<ApiResponse<BrandCopywritingResult>>(`${BASE_URL}/generate`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function generateBrandImages (data: GenerateImagesRequest) {
  return axios.post<ApiResponse<GenerateImagesResponse>>(`${BASE_URL}/generate-images`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function previewBrandImage (url: string) {
  return `${BASE_URL}/preview-image?url=${encodeURIComponent(url)}`
}
import request from '@/utils/http'
import { buildJavaApiUrl } from './_base'


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


export interface GenerateImagesRequest {
  projectName: string
  imagePrompts: string[]
}

export interface GenerateImagesResponse {
  imageUrls: string[]
  sceneImageMap: Record<string, string>
}

const API_PREFIX = '/api/common/brand-copywriting'

export function generateBrandCopywriting (data: BrandCopywritingForm) {
  return request.post<BrandCopywritingResult>({
    url: `${API_PREFIX}/generate`,
    data,
    timeout: 360000
  })
}

export function generateBrandImages (data: GenerateImagesRequest) {
  return request.post<GenerateImagesResponse>({
    url: `${API_PREFIX}/generate-images`,
    data,
    timeout: 360000
  })
}

export function previewBrandImage (url: string) {
  return buildJavaApiUrl(`${API_PREFIX}/preview-image?url=${encodeURIComponent(url)}`)
}

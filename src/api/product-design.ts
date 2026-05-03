import request from '@/utils/http'
import { buildJavaApiUrl } from './_base'


export interface ProductDesignForm {
  projectName: string
  productType: string
  targetUsers: string
  coreScenario: string
  coreFeatures: string
  stylePreference: string
  platform: string
  competitorReference: string
  brandKeywords: string
  colorPreference: string
}

export interface ProductDesignResult {
  projectName: string
  productPositioning: string
  designGoal: string
  userPersona: string
  designStrategy: string
  featureModules: string
  pageStructure: string
  interactionHighlights: string
  visualStyle: string
  designSystemSuggestion: string
  uxWritingSuggestion: string
  wireframeDescription: string
  prototypeDescription: string
  mermaidUserFlow: string
  mermaidInfoArchitecture: string
  colorPalette: string[]
  typographySuggestion: string
  iconStyleSuggestion: string
  componentSuggestions: string[]
  designKeywords: string[]
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

const API_PREFIX = '/api/common/product-design'

export function generateProductDesign (data: ProductDesignForm) {
  return request.post<ProductDesignResult>({
    url: `${API_PREFIX}/generate`,
    data,
    timeout: 180000
  })
}

export function generateProductDesignImages (data: GenerateImagesRequest) {
  return request.post<GenerateImagesResponse>({
    url: `${API_PREFIX}/generate-images`,
    data,
    timeout: 180000
  })
}

export function previewProductDesignImage (url: string) {
  return buildJavaApiUrl(`${API_PREFIX}/preview-image?url=${encodeURIComponent(url)}`)
}

import axios from 'axios'

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

const BASE_URL = 'http://localhost:9091/api/common/product-design'

export function generateProductDesign (data: ProductDesignForm) {
  return axios.post<ApiResponse<ProductDesignResult>>(`${BASE_URL}/generate`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function generateProductDesignImages (data: GenerateImagesRequest) {
  return axios.post<ApiResponse<GenerateImagesResponse>>(`${BASE_URL}/generate-images`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function previewProductDesignImage (url: string) {
  return `${BASE_URL}/preview-image?url=${encodeURIComponent(url)}`
}
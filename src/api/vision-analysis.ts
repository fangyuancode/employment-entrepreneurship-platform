import request from '@/utils/http'
import { PYTHON_API_BASE_URL } from './_base'



export interface DerivedImageItem {
  fileName: string
  imagePath: string
  imageUrl: string
  title: string
}

export interface VisionMetrics {
  width: number
  height: number
  aspectRatio: number
  brightness: number
  contrast: number
  blurScore: number
  qualityLevel: string
  exposureLevel: string
  dominantColor: {
    rgb: number[]
    hex: string
  }
}

export interface VisionAnalyzeResponse {
  sourceFileName: string
  sourceImagePath: string
  sourceImageUrl: string
  metrics: VisionMetrics
  summary: string
  contourCount: number
  derivedImages: {
    gray: DerivedImageItem
    edge: DerivedImageItem
    binary: DerivedImageItem
    contour: DerivedImageItem
    heatmap: DerivedImageItem
    sharpen: DerivedImageItem
  }
}

export interface VehicleDetectionItem {
  className: string
  confidence: number
  box: number[]
}

export interface CropGalleryItem {
  index: number
  className: string
  confidence: number
  box: number[]
  width: number
  height: number
  cropFileName: string
  cropImagePath: string
  cropImageUrl: string
}

export interface GalleryHeatmapItem {
  heatmapFileName: string
  heatmapImagePath: string
  heatmapImageUrl: string
}

export interface VisionGalleryResponse {
  sourceFileName: string
  sourceImagePath: string
  sourceImageUrl: string
  resultImagePath: string
  resultImageUrl: string
  resultFileName: string
  totalCount: number
  classCountMap: Record<string, number>
  detections: VehicleDetectionItem[]
  heatmap: GalleryHeatmapItem
  crops: CropGalleryItem[]
  summary: string
}

export function analyzeVisionImage (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<VisionAnalyzeResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/vision/analyze/image',
    data: formData,
    timeout: 300000
  })
}

export function createDetectionGallery (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<VisionGalleryResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/vision/detect/gallery',
    data: formData,
    timeout: 300000
  })
}

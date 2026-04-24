import axios from 'axios'
import { VEHICLE_BASE_URL } from './vehicle-recognition'

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

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

const request = axios.create({
  baseURL: VEHICLE_BASE_URL,
  timeout: 300000
})

export function analyzeVisionImage (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<ApiResponse<VisionAnalyzeResponse>>(
    '/vision/analyze/image',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
}

export function createDetectionGallery (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<ApiResponse<VisionGalleryResponse>>(
    '/vision/detect/gallery',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
}

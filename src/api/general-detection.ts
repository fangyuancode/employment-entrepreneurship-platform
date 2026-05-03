import request from '@/utils/http'
import { PYTHON_API_BASE_URL, normalizePythonMediaUrl } from './_base'



export interface GeneralDetectionItem {
  classId: number
  className: string
  confidence: number
  box: number[]
}

export interface GeneralImageDetectResponse {
  sourceFileName: string
  sourceImagePath: string
  resultImagePath: string
  sourceImageUrl: string
  resultImageUrl: string
  totalCount: number
  classCountMap: Record<string, number>
  detections: GeneralDetectionItem[]
  summary: string
  confidence: number
}

export interface GeneralModelCheckResponse {
  modelPath: string
  modelExists: boolean
  classPreview: string[]
  classCount: number
  downloadUrl: string
}

export const PYTHON_BASE_URL = PYTHON_API_BASE_URL

export function checkGeneralModel () {
  return request.get<GeneralModelCheckResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/general-detect/model/check',
    timeout: 30000
  })
}

export function detectGeneralImage (file: File, confidence = 0.25) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('confidence', String(confidence))

  return request.post<GeneralImageDetectResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/general-detect/image',
    data: formData,
    timeout: 180000
  })
}

export function buildMediaUrl (path: string) {
  return normalizePythonMediaUrl(path)
}

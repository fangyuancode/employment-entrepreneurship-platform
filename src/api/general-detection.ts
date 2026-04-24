import axios from 'axios'

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

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

export const PYTHON_BASE_URL = 'http://127.0.0.1:5001'

const request = axios.create({
  baseURL: PYTHON_BASE_URL,
  timeout: 600000
})

export function checkGeneralModel () {
  return request.get<ApiResponse<GeneralModelCheckResponse>>('/general-detect/model/check', {
    timeout: 30000
  })
}

export function detectGeneralImage (file: File, confidence = 0.25) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('confidence', String(confidence))

  return request.post<ApiResponse<GeneralImageDetectResponse>>('/general-detect/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 180000
  })
}

export function buildMediaUrl (path: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path
  }
  return `${PYTHON_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

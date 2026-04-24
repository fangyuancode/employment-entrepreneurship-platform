import axios from 'axios'

/**
 * =========================
 * 基础响应结构
 * =========================
 */
export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

/**
 * =========================
 * 图片识别
 * =========================
 */
export interface VehicleDetectionItem {
  className: string
  confidence: number
  box: number[]
}

export interface VehicleImageDetectResponse {
  sourceFileName: string
  sourceImagePath: string
  resultImagePath: string
  sourceImageUrl: string
  resultImageUrl: string
  totalCount: number
  classCountMap: Record<string, number>
  detections: VehicleDetectionItem[]
  summary: string
}

/**
 * =========================
 * 视频识别
 * =========================
 */
export interface VehicleVideoDetectResponse {
  sourceFileName: string
  sourceVideoPath: string
  resultVideoPath: string
  sourceVideoUrl: string
  resultVideoUrl: string
  totalFrames: number
  totalDetections: number
  classCountMap: Record<string, number>
  summary: string
  codecUsed?: string
}

/**
 * =========================
 * 实时视频识别
 * =========================
 */
export interface RealtimeStartResponse {
  running: boolean
  cameraIndex: number
  streamUrl: string
}

export interface RealtimeStopResponse {
  running: boolean
}

export interface RealtimeStatusResponse {
  running: boolean
  cameraIndex: number
  lastFrameTime: number | null
  lastDetectionCount: number
  lastClassCountMap: Record<string, number>
  startedAt: number | null
  streamUrl: string
}

/**
 * =========================
 * Python 后端服务地址
 * =========================
 */
export const VEHICLE_BASE_URL = 'http://127.0.0.1:5001'

/**
 * =========================
 * axios 实例
 * =========================
 */
const request = axios.create({
  baseURL: VEHICLE_BASE_URL,
  timeout: 600000
})

/**
 * =========================
 * 图片识别
 * =========================
 */
export function detectVehicleImage (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<ApiResponse<VehicleImageDetectResponse>>(
    '/detect/image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 120000
    }
  )
}

/**
 * =========================
 * 视频识别
 * =========================
 */
export function detectVehicleVideo (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<ApiResponse<VehicleVideoDetectResponse>>(
    '/detect/video',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 600000
    }
  )
}

/**
 * =========================
 * 启动实时视频识别
 * =========================
 */
export function startRealtimeDetect (cameraIndex = 0) {
  return request.post<ApiResponse<RealtimeStartResponse>>(
    '/realtime/start',
    { cameraIndex },
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  )
}

/**
 * =========================
 * 停止实时视频识别
 * =========================
 */
export function stopRealtimeDetect () {
  return request.post<ApiResponse<RealtimeStopResponse>>(
    '/realtime/stop',
    {},
    {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    }
  )
}

/**
 * =========================
 * 获取实时识别状态
 * =========================
 */
export function getRealtimeStatus () {
  return request.get<ApiResponse<RealtimeStatusResponse>>(
    '/realtime/status',
    {
      timeout: 15000
    }
  )
}

/**
 * =========================
 * 构建实时视频流地址
 * 用于 <img :src="...">
 * =========================
 */
export function buildRealtimeStreamUrl () {
  return `${VEHICLE_BASE_URL}/realtime/stream?t=${Date.now()}`
}

/**
 * =========================
 * 静态资源辅助方法
 * =========================
 */
export function buildMediaUrl (path: string) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path
  }
  return `${VEHICLE_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
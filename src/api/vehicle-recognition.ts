import request from '@/utils/http'
import { PYTHON_API_BASE_URL, buildPythonApiUrl, normalizePythonMediaUrl } from './_base'


/**
 * =========================
 * 基础响应结构
 * =========================
 */

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
/**
 * =========================
 * 图片识别
 * =========================
 */

export const VEHICLE_BASE_URL = PYTHON_API_BASE_URL

/**
 * =========================
 * 图片识别
 * =========================
 */
export function detectVehicleImage (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<VehicleImageDetectResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/detect/image',
    data: formData,
    timeout: 120000
  })
}

/**
 * =========================
 * 视频识别
 * =========================
 */
export function detectVehicleVideo (file: File) {
  const formData = new FormData()
  formData.append('file', file)

  return request.post<VehicleVideoDetectResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/detect/video',
    data: formData,
    timeout: 600000
  })
}

/**
 * =========================
 * 启动实时视频识别
 * =========================
 */
export function startRealtimeDetect (cameraIndex = 0) {
  return request.post<RealtimeStartResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/realtime/start',
    data: { cameraIndex },
    timeout: 15000
  })
}

/**
 * =========================
 * 停止实时视频识别
 * =========================
 */
export function stopRealtimeDetect () {
  return request.post<RealtimeStopResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/realtime/stop',
    data: {},
    timeout: 15000
  })
}

/**
 * =========================
 * 获取实时识别状态
 * =========================
 */
export function getRealtimeStatus () {
  return request.get<RealtimeStatusResponse>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/realtime/status',
    timeout: 15000
  })
}

/**
 * =========================
 * 构建实时视频流地址
 * 用于 <img :src="...">
 * =========================
 */
export function buildRealtimeStreamUrl () {
  return buildPythonApiUrl(`/realtime/stream?t=${Date.now()}`)
}

/**
 * =========================
 * 静态资源辅助方法
 * =========================
 */
export function buildMediaUrl (path: string) {
  return normalizePythonMediaUrl(path)
}

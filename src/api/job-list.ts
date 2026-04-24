import axios from 'axios'

/**
 * Java 后端地址（岗位查询）
 */
export const JOB_BASE_URL = 'http://127.0.0.1:9091'

/**
 * axios 实例
 */
const request = axios.create({
  baseURL: JOB_BASE_URL,
  timeout: 60000
})

/**
 * 通用返回结构
 */
export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

/**
 * 岗位实体
 */
export interface JobItem {
  id: number
  jobName?: string
  salary?: string
  degree?: string
  experience?: string
  companyName?: string
  industry?: string
  companySize?: string
  financingStage?: string
  city?: string
  district?: string
  businessArea?: string
  latitude?: number
  longitude?: number
  skills?: string
  welfare?: string
  categoryMain?: string
  categorySub?: string
  sourceFile?: string
}

/**
 * 分页返回结构
 */
export interface JobPageData {
  list: JobItem[]
  total: number
  pageNum: number
  pageSize: number
}

/**
 * 查询参数
 */
export interface JobPageParams {
  pageNum?: number
  pageSize?: number
  keyword?: string
  city?: string
  degree?: string
  experience?: string
  categoryMain?: string
  companyName?: string
}

/**
 * 下拉选项
 */
export interface JobOptions {
  cities: string[]
  degrees: string[]
  experiences: string[]
  categoryMains: string[]
}

/**
 * ========================
 * 接口方法
 * ========================
 */

/**
 * 分页查询岗位
 */
export function getJobPage (params: JobPageParams) {
  return request.get<ApiResponse<JobPageData>>('/api/common/job/page', {
    params
  })
}

/**
 * 获取岗位详情
 */
export function getJobDetail (id: number | string) {
  return request.get<ApiResponse<JobItem>>('/api/common/job/detail', {
    params: { id }
  })
}

/**
 * 获取筛选项
 */
export function getJobOptions () {
  return request.get<ApiResponse<JobOptions>>('/api/common/job/options')
}
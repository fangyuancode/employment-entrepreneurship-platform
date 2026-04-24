import axios from 'axios'

export const JOB_COLLECT_BASE_URL = 'http://127.0.0.1:5001'

const request = axios.create({
  baseURL: JOB_COLLECT_BASE_URL,
  timeout: 600000
})

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

export interface JobCategoryItem {
  'menu-article': string
  joblist: Array<{
    typeName: string
    joblist: Array<{
      name: string
      search: string
    }>
  }>
}

export interface FlatJobItem {
  mainCategory: string
  subCategory: string
  jobName: string
  searchCode: string
}

export function getJobCategories () {
  return request.get<ApiResponse<JobCategoryItem[]>>('/job-collect/categories')
}

export function getFlatJobList (keyword = '') {
  return request.get<ApiResponse<{ total: number; list: FlatJobItem[] }>>('/job-collect/flat-list', {
    params: { keyword }
  })
}

export function crawlOneJob (data: {
  cityCode: string
  searchCode: string
  jobName: string
  mainCategory: string
  subCategory: string
  maxPages?: number
}) {
  return request.post('/job-collect/crawl', data)
}

export function getJobCollectResults () {
  return request.get('/job-collect/results')
}

export function previewCollectedCsv (fileName: string) {
  return request.get('/job-collect/preview', {
    params: { fileName }
  })
}

export function buildDownloadUrl (fileName: string) {
  return `${JOB_COLLECT_BASE_URL}/job-collect/download/${encodeURIComponent(fileName)}`
}
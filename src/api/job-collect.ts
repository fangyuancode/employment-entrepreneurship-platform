import request from '@/utils/http'
import { PYTHON_API_BASE_URL, buildPythonApiUrl } from './_base'



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

export const JOB_COLLECT_BASE_URL = PYTHON_API_BASE_URL

export function getJobCategories () {
  return request.get<JobCategoryItem[]>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/job-collect/categories',
    timeout: 600000
  })
}

export function getFlatJobList (keyword = '') {
  return request.get<{ total: number; list: FlatJobItem[] }>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/job-collect/flat-list',
    params: { keyword },
    timeout: 600000
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
  return request.post<any>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/job-collect/crawl',
    data,
    timeout: 600000
  })
}

export function getJobCollectResults () {
  return request.get<{ list: any[] }>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/job-collect/results',
    timeout: 600000
  })
}

export function previewCollectedCsv (fileName: string) {
  return request.get<{ list: any[] }>({
    baseURL: PYTHON_API_BASE_URL,
    url: '/job-collect/preview',
    params: { fileName },
    timeout: 600000
  })
}

export function buildDownloadUrl (fileName: string) {
  return buildPythonApiUrl(`/job-collect/download/${encodeURIComponent(fileName)}`)
}

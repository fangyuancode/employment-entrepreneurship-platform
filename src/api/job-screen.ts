import axios from 'axios'

export const JOB_SCREEN_BASE_URL = 'http://127.0.0.1:9091'

const request = axios.create({
  baseURL: JOB_SCREEN_BASE_URL,
  timeout: 600000
})

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

export interface ScreenQuery {
  keyword?: string
  categoryMain?: string
  degree?: string
  experience?: string
  province?: string
}

export interface NameValueItem {
  name: string
  value: number
}

export interface RegionMapItem {
  name: string
  value: number
  avgSalary?: number
  hotCategory?: string
  hotSkill?: string
  longitude?: number
  latitude?: number
}

export interface NationalScreenSummary {
  jobCount: number
  cityCount: number
  avgSalaryK: number
  skillWordCount: number
}

export interface ProvinceScreenSummary {
  province: string
  jobCount: number
  cityCount: number
  avgSalaryK: number
  skillWordCount: number
}

export interface EnterpriseProfile {
  industryTop10: NameValueItem[]
  companySizeTop10: NameValueItem[]
  financingTop10: NameValueItem[]
}

export interface NationalScreenData {
  summary: NationalScreenSummary
  mapData: RegionMapItem[]
  provinceTop10: NameValueItem[]
  categoryMainTop: NameValueItem[]
  categorySubTop: NameValueItem[]
  degreeDistribution: NameValueItem[]
  experienceDistribution: NameValueItem[]
  avgSalaryProvinceTop10: NameValueItem[]
  skillTop20: NameValueItem[]
  enterpriseProfile: EnterpriseProfile
  mode: 'national'
}

export interface ProvinceScreenData {
  summary: ProvinceScreenSummary
  province: string
  mapData: RegionMapItem[]
  cityJobTop10: NameValueItem[]
  citySalaryTop10: NameValueItem[]
  categoryTop10: NameValueItem[]
  skillTop15: NameValueItem[]
  degreeDistribution: NameValueItem[]
  experienceDistribution: NameValueItem[]
  industryTop10: NameValueItem[]
  companySizeTop10: NameValueItem[]
  welfareTop20: NameValueItem[]
  mode: 'province'
}

export interface ScreenOptionsData {
  provinces: string[]
}

export interface InsightData {
  insights: string[]
}

export interface HighSalarySummary {
  highSalaryThreshold: number
  totalCount: number
  highSalaryCount: number
  highSalaryRate: number
}

export interface HighSalaryRateItem {
  name: string
  value: number
  highCount: number
  totalCount: number
}

export interface HighSalaryData {
  summary: HighSalarySummary
  regionRateTop10: HighSalaryRateItem[]
  categoryRateTop10: HighSalaryRateItem[]
}

export function getJobScreenNational (params?: ScreenQuery) {
  return request.get<ApiResponse<NationalScreenData>>('/api/common/job-screen/national', {
    params
  })
}

export function getJobScreenProvince (params?: ScreenQuery) {
  return request.get<ApiResponse<ProvinceScreenData>>('/api/common/job-screen/province', {
    params
  })
}

export function getJobScreenOptions (params?: ScreenQuery) {
  return request.get<ApiResponse<ScreenOptionsData>>('/api/common/job-screen/options', {
    params
  })
}

export function getJobScreenInsight (params?: ScreenQuery) {
  return request.get<ApiResponse<InsightData>>('/api/common/job-screen/insight', {
    params
  })
}

export function getJobScreenHighSalary (params?: ScreenQuery) {
  return request.get<ApiResponse<HighSalaryData>>('/api/common/job-screen/high-salary', {
    params
  })
}

export default request
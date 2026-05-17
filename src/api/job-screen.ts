import request from '@/utils/http'



export interface ScreenQuery {
  keyword?: string
  categoryMain?: string
  degree?: string
  experience?: string
  province?: string
  city?: string
  /** true：强制从 job_post 重新统计并覆盖数据库缓存；false/不传：优先读取数据库缓存 */
  refresh?: boolean
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

export interface CityScreenSummary {
  province: string
  city: string
  jobCount: number
  districtCount: number
  cityCount: number
  avgSalaryK: number
  skillWordCount: number
}

export interface CityScreenData {
  summary: CityScreenSummary
  province: string
  city: string
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
  mode: 'city'
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
  return request.get<NationalScreenData>({
    url: '/api/common/job-screen/national',
    params,
    timeout: 4800000
  })
}

export function getJobScreenProvince (params?: ScreenQuery) {
  return request.get<ProvinceScreenData>({
    url: '/api/common/job-screen/province',
    params,
    timeout: 4800000
  })
}

export function getJobScreenCity (params?: ScreenQuery) {
  return request.get<CityScreenData>({
    url: '/api/common/job-screen/city',
    params,
    timeout: 4800000
  })
}

export function getJobScreenOptions (params?: ScreenQuery) {
  return request.get<ScreenOptionsData>({
    url: '/api/common/job-screen/options',
    params,
    timeout: 4800000
  })
}

export function getJobScreenInsight (params?: ScreenQuery) {
  return request.get<InsightData>({
    url: '/api/common/job-screen/insight',
    params,
    timeout: 4800000
  })
}

export function getJobScreenHighSalary (params?: ScreenQuery) {
  return request.get<HighSalaryData>({
    url: '/api/common/job-screen/high-salary',
    params,
    timeout: 4800000
  })
}

export default request

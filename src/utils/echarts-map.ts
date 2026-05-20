import * as echarts from 'echarts'

type GeoJsonFeature = Record<string, any>

interface GeoJsonType {
  type: 'FeatureCollection'
  features: GeoJsonFeature[]
  [key: string]: any
}

type MapLevel = 'china' | 'province' | 'city'

const geoModules = import.meta.glob('/src/echarts/geo/**/*.json')
const registeredMap = new Set<string>()
const geoJsonCache = new Map<string, GeoJsonType>()
const publicMapBaseUrl = `${import.meta.env.BASE_URL || '/'}job-map`.replace(/\/$/, '')

const provinceFileNameMap: Record<string, string> = {
  北京: 'beijing', 天津: 'tianjin', 上海: 'shanghai', 重庆: 'chongqing', 河北: 'hebei', 山西: 'shanxi', 辽宁: 'liaoning', 吉林: 'jilin', 黑龙江: 'heilongjiang', 江苏: 'jiangsu', 浙江: 'zhejiang', 安徽: 'anhui', 福建: 'fujian', 江西: 'jiangxi', 山东: 'shandong', 河南: 'henan', 湖北: 'hubei', 湖南: 'hunan', 广东: 'guangdong', 海南: 'hainan', 四川: 'sichuan', 贵州: 'guizhou', 云南: 'yunnan', 陕西: 'shanxi1', 甘肃: 'gansu', 青海: 'qinghai', 台湾: 'taiwan', 内蒙古: 'neimenggu', 广西: 'guangxi', 西藏: 'xizang', 宁夏: 'ningxia', 新疆: 'xinjiang', 香港: 'xianggang', 澳门: 'aomen'
}

const provinceAdcodeMap: Record<string, string> = {
  北京: '110000', 天津: '120000', 河北: '130000', 山西: '140000', 内蒙古: '150000', 辽宁: '210000', 吉林: '220000', 黑龙江: '230000', 上海: '310000', 江苏: '320000', 浙江: '330000', 安徽: '340000', 福建: '350000', 江西: '360000', 山东: '370000', 河南: '410000', 湖北: '420000', 湖南: '430000', 广东: '440000', 广西: '450000', 海南: '460000', 重庆: '500000', 四川: '510000', 贵州: '520000', 云南: '530000', 西藏: '540000', 陕西: '610000', 甘肃: '620000', 青海: '630000', 宁夏: '640000', 新疆: '650000', 台湾: '710000', 香港: '810000', 澳门: '820000'
}

function normalizeRegionName (name: string) {
  if (!name) return ''
  return String(name).trim().replace('北京市', '北京').replace('天津市', '天津').replace('上海市', '上海').replace('重庆市', '重庆')
}

function stripRegionSuffix (name: string) {
  return normalizeRegionName(name)
    .replace(/特别行政区$/, '')
    .replace(/壮族自治区$/, '')
    .replace(/回族自治区$/, '')
    .replace(/维吾尔自治区$/, '')
    .replace(/自治区$/, '')
    .replace(/省$/, '')
    .replace(/市$/, '')
    .replace(/自治州$/, '')
    .replace(/地区$/, '')
    .replace(/盟$/, '')
    .replace(/州$/, '')
    .trim()
}

function normalizeGeoJson (geoJson: Partial<GeoJsonType> | null | undefined): GeoJsonType {
  const features = Array.isArray(geoJson?.features) ? geoJson.features : []
  return {
    ...(geoJson || {}),
    type: 'FeatureCollection',
    features: features
      .filter((feature: any) => {
        const properties = feature?.properties || {}
        const name = String(properties.name || '').trim()
        const adcode = String(properties.adcode || '').trim()
        return Boolean(name) && adcode !== '100000'
      })
      .map((feature: any) => ({
        ...feature,
        properties: {
          ...(feature?.properties || {}),
          adcode: String(feature?.properties?.adcode || ''),
          name: String(feature?.properties?.name || '').trim()
        }
      }))
  }
}

function getPublicMapUrl (level: MapLevel, adcode?: string) {
  if (level === 'china') return `${publicMapBaseUrl}/china.json`
  if (level === 'province') return `${publicMapBaseUrl}/province/${adcode}.json`
  return `${publicMapBaseUrl}/citys/${adcode}.json`
}

async function fetchPublicGeoJson (level: MapLevel, adcode?: string): Promise<GeoJsonType | null> {
  const cacheKey = `${level}:${adcode || 'china'}`
  if (geoJsonCache.has(cacheKey)) return geoJsonCache.get(cacheKey) as GeoJsonType
  const url = getPublicMapUrl(level, adcode)
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const geoJson = normalizeGeoJson(await response.json())
    geoJsonCache.set(cacheKey, geoJson)
    return geoJson
  } catch (error) {
    console.warn(`[echarts-map] 地图文件加载失败：${url}`, error)
    return null
  }
}

async function loadGeoJson (modulePath: string): Promise<GeoJsonType> {
  const loader = geoModules[modulePath]
  if (!loader) throw new Error(`未找到地图文件：${modulePath}`)
  const jsonModule: any = await loader()
  return normalizeGeoJson((jsonModule.default || jsonModule) as GeoJsonType)
}

function getProvinceShortName (provinceName: string) {
  const targetKey = stripRegionSuffix(provinceName)
  return Object.keys(provinceAdcodeMap).find((province) => stripRegionSuffix(province) === targetKey) || normalizeRegionName(provinceName)
}

function registerMapOnce (mapName: string, geoJson: GeoJsonType) {
  if (registeredMap.has(mapName)) return
  // ECharts 的 GeoJSON 类型定义较严格，运行时只需要标准 FeatureCollection。
  // 这里在统一 normalize 后做一次局部类型适配，避免打包阶段 TS2345。
  echarts.registerMap(mapName, geoJson as any)
  registeredMap.add(mapName)
}

export async function registerChinaMap (): Promise<void> {
  if (registeredMap.has('china')) return
  const publicGeoJson = await fetchPublicGeoJson('china')
  if (publicGeoJson) {
    registerMapOnce('china', publicGeoJson)
    return
  }
  const geoJson = await loadGeoJson('/src/echarts/geo/china.json')
  registerMapOnce('china', geoJson)
}

export async function registerProvinceMap (provinceName: string): Promise<void> {
  if (!provinceName) throw new Error('省份名称不能为空')
  const shortName = getProvinceShortName(provinceName)
  if (registeredMap.has(shortName)) return
  const adcode = provinceAdcodeMap[shortName]
  if (adcode) {
    const publicGeoJson = await fetchPublicGeoJson('province', adcode)
    if (publicGeoJson) {
      registerMapOnce(shortName, publicGeoJson)
      return
    }
  }
  const fileName = provinceFileNameMap[shortName]
  if (!fileName) throw new Error(`未找到省份映射：${provinceName}`)
  const geoJson = await loadGeoJson(`/src/echarts/geo/province/${fileName}.json`)
  registerMapOnce(shortName, geoJson)
}

export async function registerCityMap (cityName: string, cityAdcode: string): Promise<string> {
  const adcode = String(cityAdcode || '').trim()
  if (!cityName || !adcode) throw new Error('城市名称或城市 adcode 不能为空')
  const mapName = `city-${adcode}`
  if (registeredMap.has(mapName)) return mapName
  const publicGeoJson = await fetchPublicGeoJson('city', adcode)
  if (!publicGeoJson) throw new Error(`未找到城市地图文件：${adcode}`)
  registerMapOnce(mapName, publicGeoJson)
  return mapName
}

export function getProvinceAdcode (provinceName: string): string {
  return provinceAdcodeMap[getProvinceShortName(provinceName)] || ''
}

export function getMapFeatureByName (mapName: string, name: string): any | null {
  const mapInfo = (echarts as any).getMap?.(mapName)
  const geoJson = mapInfo?.geoJson || mapInfo?.geoJSON
  const features = geoJson?.features || []
  const targetKey = stripRegionSuffix(name)
  return features.find((feature: any) => String(feature?.properties?.name || '').trim() === name) || features.find((feature: any) => stripRegionSuffix(String(feature?.properties?.name || '')) === targetKey) || null
}

export function getMapFeatures (mapName: string): any[] {
  const mapInfo = (echarts as any).getMap?.(mapName)
  const geoJson = mapInfo?.geoJson || mapInfo?.geoJSON
  return Array.isArray(geoJson?.features) ? geoJson.features : []
}

export function hasRegisteredMap (mapName: string): boolean {
  return registeredMap.has(mapName)
}

export function getProvinceFileNameMap (): Record<string, string> {
  return { ...provinceFileNameMap }
}

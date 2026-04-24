import * as echarts from 'echarts'

type GeoJsonType = Record<string, any>

const geoModules = import.meta.glob('/src/echarts/geo/**/*.json')

const registeredMap = new Set<string>()

const provinceFileNameMap: Record<string, string> = {
  北京: 'beijing',
  天津: 'tianjin',
  上海: 'shanghai',
  重庆: 'chongqing',
  河北: 'hebei',
  山西: 'shanxi',
  辽宁: 'liaoning',
  吉林: 'jilin',
  黑龙江: 'heilongjiang',
  江苏: 'jiangsu',
  浙江: 'zhejiang',
  安徽: 'anhui',
  福建: 'fujian',
  江西: 'jiangxi',
  山东: 'shandong',
  河南: 'henan',
  湖北: 'hubei',
  湖南: 'hunan',
  广东: 'guangdong',
  海南: 'hainan',
  四川: 'sichuan',
  贵州: 'guizhou',
  云南: 'yunnan',
  陕西: 'shanxi1',
  甘肃: 'gansu',
  青海: 'qinghai',
  台湾: 'taiwan',
  内蒙古: 'neimenggu',
  广西: 'guangxi',
  西藏: 'xizang',
  宁夏: 'ningxia',
  新疆: 'xinjiang',
  香港: 'xianggang',
  澳门: 'aomen'
}

async function loadGeoJson (modulePath: string): Promise<GeoJsonType> {
  const loader = geoModules[modulePath]
  if (!loader) {
    throw new Error(`未找到地图文件：${modulePath}`)
  }

  const jsonModule: any = await loader()
  return (jsonModule.default || jsonModule) as GeoJsonType
}

export async function registerChinaMap (): Promise<void> {
  if (registeredMap.has('china')) {
    return
  }

  const geoJson = await loadGeoJson('/src/echarts/geo/china.json')
  echarts.registerMap('china', geoJson)
  registeredMap.add('china')
}

export async function registerProvinceMap (provinceName: string): Promise<void> {
  if (!provinceName) {
    throw new Error('省份名称不能为空')
  }

  if (registeredMap.has(provinceName)) {
    return
  }

  const fileName = provinceFileNameMap[provinceName]
  if (!fileName) {
    throw new Error(`未找到省份映射：${provinceName}`)
  }

  const modulePath = `/src/echarts/geo/province/${fileName}.json`
  const geoJson = await loadGeoJson(modulePath)

  echarts.registerMap(provinceName, geoJson)
  registeredMap.add(provinceName)
}

export function hasRegisteredMap (mapName: string): boolean {
  return registeredMap.has(mapName)
}

export function getProvinceFileNameMap (): Record<string, string> {
  return { ...provinceFileNameMap }
}
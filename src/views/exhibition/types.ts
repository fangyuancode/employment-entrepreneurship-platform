export type HallKey = 'job' | 'chat' | 'skill' | 'startup' | 'brand' | 'office'

export type QualityMode = 'balanced' | 'high'

export interface HallMetric {
  name: string
  value: number
}

export interface HallKpi {
  label: string
  value: string
  trend: string
}

export interface HallFeature {
  name: string
  desc: string
}

export interface HallItem {
  key: HallKey
  code: string
  short: string
  title: string
  slogan: string
  path: string
  tags: string[]
  position: [number, number, number]
  height: number
  color: number
  icon: string
  sceneRole: string
  hoverTitle: string
  hoverDesc: string
  scenario: string
  userValue: string
  dataAssets: string
  actionText: string
  features: HallFeature[]
  outputs: string[]
  judgePoints: string[]
  kpis: HallKpi[]
  metrics: HallMetric[]
  demoScript: string
}

export interface OverviewStat {
  label: string
  value: string
  trend: string
}

export interface RuntimeStatus {
  name: string
  value: string
}

import request from '@/utils/http'

export interface NameValueItem {
  name: string
  value: number
}

export interface GraphNodeItem {
  id: string
  name: string
  category: string
  symbolSize: number
  count?: number
  weight?: number
  type?: string
}

export interface GraphLinkItem {
  source: string
  target: string
  value: number
  relationType?: string
  relationLabel?: string
  relationDesc?: string
  aiRelationDesc?: string
  aiSuggestion?: string
  strengthLevel?: string
  evidence?: string
}

export interface GraphData {
  nodes: GraphNodeItem[]
  links: GraphLinkItem[]
  topSkills: NameValueItem[]
  topJobs?: NameValueItem[]
  topCompanies?: NameValueItem[]
  topCities?: NameValueItem[]
  categoryDistribution: NameValueItem[]
  jobCount: number
  skillCount: number
  companyCount: number
  cityCount?: number
  relationCount?: number
}

export interface GraphQueryParams {
  keyword?: string
  city?: string
  categoryMain?: string
  limit?: number
}

export interface GraphOptionsData {
  cities: string[]
  categoryMains: string[]
}

export interface RecommendRequest {
  targetJob?: string
  skills?: string
  city?: string
  categoryMain?: string
}

export interface RecommendData {
  coreSkills: string[]
  missingSkills: string[]
  relatedJobs: string[]
  relatedCompanies: string[]
  suggestions: string[]
  summary: string
}

export interface RelationEnhanceRequest {
  links: GraphLinkItem[]
  enableAi?: boolean
}

export interface NodeRelationItem {
  source: string
  target: string
  relationType: string
  relationDesc: string
}

export interface NodeRelationData {
  nodeId: string
  relations: NodeRelationItem[]
  total: number
}

export interface NodeRelationQuery {
  nodeId?: string
  keyword?: string
}

export function getJobSkillGraphOptions () {
  return request.get<GraphOptionsData>({
    url: '/api/common/job-skill-graph/options',
    timeout: 60000
  })
}

export function getJobSkillGraphData (params: GraphQueryParams) {
  return request.get<GraphData>({
    url: '/api/common/job-skill-graph/graph',
    params,
    timeout: 60000
  })
}

export function getJobSkillRecommend (data: RecommendRequest) {
  return request.post<RecommendData>({
    url: '/api/common/job-skill-graph/recommend',
    data,
    timeout: 120000
  })
}

export function enhanceJobSkillRelations (data: RelationEnhanceRequest) {
  return request.post<GraphLinkItem[]>({
    url: '/api/common/job-skill-graph/relation-enhance',
    data,
    timeout: 120000
  })
}

export function getJobSkillNodeRelations (params: NodeRelationQuery) {
  return request.get<NodeRelationData>({
    url: '/api/common/job-skill-graph/node-relations',
    params,
    timeout: 60000
  })
}

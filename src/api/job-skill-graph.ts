import axios from 'axios'

export const JOB_SKILL_GRAPH_BASE_URL = 'http://127.0.0.1:9091'

const request = axios.create({
  baseURL: JOB_SKILL_GRAPH_BASE_URL,
  timeout: 60000
})

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

export interface NameValueItem {
  name: string
  value: number
}

export interface GraphNodeItem {
  id: string
  name: string
  category: string
  symbolSize: number
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
  categoryDistribution: NameValueItem[]
  jobCount: number
  skillCount: number
  companyCount: number
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
  return request.get<ApiResponse<GraphOptionsData>>('/api/common/job-skill-graph/options')
}

export function getJobSkillGraphData (params: GraphQueryParams) {
  return request.get<ApiResponse<GraphData>>('/api/common/job-skill-graph/graph', {
    params
  })
}

export function getJobSkillRecommend (data: RecommendRequest) {
  return request.post<ApiResponse<RecommendData>>('/api/common/job-skill-graph/recommend', data)
}

export function enhanceJobSkillRelations (data: RelationEnhanceRequest) {
  return request.post<ApiResponse<GraphLinkItem[]>>('/api/common/job-skill-graph/relation-enhance', data)
}

export function getJobSkillNodeRelations (params: NodeRelationQuery) {
  return request.get<ApiResponse<NodeRelationData>>('/api/common/job-skill-graph/node-relations', {
    params
  })
}
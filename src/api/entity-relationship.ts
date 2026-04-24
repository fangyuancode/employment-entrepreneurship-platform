import axios from 'axios'

export interface EntityRelationForm {
  projectName: string
  text: string
  domain: string
  preferredEntityTypes: string[]
  preferredRelationTypes: string[]
  enableEventExtraction: boolean
  enableTimeline: boolean
  language: string
}

export interface ExtractedEntity {
  id: string
  name: string
  type: string
  alias: string
  description: string
  confidence: number
  mentionCount: number
  tags: string[]
}

export interface ExtractedRelation {
  id: string
  sourceId: string
  sourceName: string
  targetId: string
  targetName: string
  relationType: string
  description: string
  confidence: number
  evidence: string
}

export interface ExtractedEvent {
  id: string
  title: string
  eventType: string
  time: string
  location: string
  description: string
  participants: string[]
}

export interface TimelineItem {
  time: string
  title: string
  category: string
  description: string
}

export interface KnowledgeGraphNode {
  id: string
  name: string
  category: string
  symbolSize: number
  value: number
}

export interface KnowledgeGraphLink {
  source: string
  target: string
  value: string
  lineWidth: number
}

export interface EntityRelationResult {
  projectName: string
  summary: string
  keywords: string[]
  entities: ExtractedEntity[]
  relations: ExtractedRelation[]
  events: ExtractedEvent[]
  timeline: TimelineItem[]
  graphNodes: KnowledgeGraphNode[]
  graphLinks: KnowledgeGraphLink[]
  entityTypeStats: Record<string, number>
  relationTypeStats: Record<string, number>
  insightSuggestions: string[]
  qaSuggestions: string[]
}

export interface ApiResponse<T> {
  code: string | number
  msg: string
  data: T
}

const BASE_URL = 'http://localhost:9091/api/common/entity-relation'

export function extractEntityRelation (data: EntityRelationForm) {
  return axios.post<ApiResponse<EntityRelationResult>>(`${BASE_URL}/extract`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}

export function getEntityRelationTypes () {
  return axios.get<ApiResponse<{
    entityTypes: string[]
    relationTypes: string[]
    domains: string[]
  }>>(`${BASE_URL}/types`)
}

export function getEntityRelationDemo () {
  return axios.get<ApiResponse<{ text: string }>>(`${BASE_URL}/demo`)
}
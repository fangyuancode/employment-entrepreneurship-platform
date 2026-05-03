import request from '@/utils/http'


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


const API_PREFIX = '/api/common/entity-relationship'

export function extractEntityRelation (data: EntityRelationForm) {
  return request.post<EntityRelationResult>({
    url: `${API_PREFIX}/extract`,
    data,
    timeout: 120000
  })
}

export function getEntityRelationTypes () {
  return request.get<{
    entityTypes: string[]
    relationTypes: string[]
    domains: string[]
  }>({
    url: `${API_PREFIX}/types`
  })
}

export function getEntityRelationDemo () {
  return request.get<{ text: string }>({
    url: `${API_PREFIX}/demo`
  })
}

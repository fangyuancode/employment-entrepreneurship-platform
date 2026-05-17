<template>
  <aside class="clean-analysis-card">
    <div class="clean-card-header">
      <div class="node-mark" :style="{ background: nodeColor }">
        {{ node?.category?.slice(0, 1) || '图' }}
      </div>
      <div class="header-text">
        <strong>{{ node?.name || '未选择节点' }}</strong>
        <span>{{ node?.category || '节点' }} · {{ relations.length }} 条直接关系</span>
      </div>
      <button class="close-btn" type="button" @click="$emit('close')">×</button>
    </div>

    <div class="analysis-section">
      <div class="section-title">
        <span>大模型关系说明</span>
        <button type="button" :disabled="loading || !node" @click="$emit('analyze')">
          {{ loading ? '分析中...' : '重新分析' }}
        </button>
      </div>
      <p class="summary-text" :class="{ 'is-loading': loading }">
        {{ summary || '点击节点后，系统会结合当前节点和直接关系边生成说明。' }}
      </p>
    </div>

    <div class="analysis-section">
      <div class="section-title">
        <span>实用功能说明</span>
        <button type="button" :disabled="!node" @click="$emit('recommend')">带入建议</button>
      </div>
      <ul class="value-list">
        <li v-for="item in bullets" :key="item">{{ item }}</li>
      </ul>
    </div>

    <div class="analysis-section relations-wrap">
      <div class="section-title">
        <span>高亮关系边</span>
        <em>{{ relations.length }} 条</em>
      </div>
      <div class="mini-relation" v-for="item in relations.slice(0, 8)" :key="relationKey(item)">
        <div class="mini-relation-top">
          <span>{{ cleanNodeName(item.source) }}</span>
          <i>{{ item.relationType || '关联' }}</i>
          <span>{{ cleanNodeName(item.target) }}</span>
        </div>
        <p>{{ getRelationDesc(item) }}</p>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { GraphLinkItem, NodeRelationItem } from '@/api/job-skill-graph'

const props = defineProps<{
  node: any
  nodeColor: string
  relations: NodeRelationItem[]
  enhancedRelations: GraphLinkItem[]
  loading: boolean
  summary: string
  bullets: string[]
}>()

defineEmits<{
  close: []
  analyze: []
  recommend: []
}>()

const cleanNodeName = (id: string) => {
  if (!id) return '-'
  const index = id.indexOf(':')
  return index > -1 ? id.slice(index + 1) : id
}

const relationKey = (item: { source: string; target: string; relationType?: string }) =>
  `${item.source}-${item.target}-${item.relationType || 'relation'}`

const getRelationDesc = (item: NodeRelationItem) => {
  const enhanced = props.enhancedRelations.find(
    (edge) => edge.source === item.source && edge.target === item.target
  ) as any
  return (
    enhanced?.aiRelationDesc ||
    enhanced?.relationDesc ||
    item.relationDesc ||
    '该关系来自岗位数据中的实体共现，可用于解释能力、岗位、企业和城市之间的联系。'
  )
}
</script>

<style scoped lang="scss">
.clean-analysis-card {
  position: absolute;
  top: 86px;
  right: 24px;
  z-index: 9;
  display: flex;
  width: min(420px, calc(100% - 48px));
  max-height: calc(100% - 112px);
  min-height: 0;
  flex-direction: column;
  padding: 16px;
  overflow-x: hidden;
  overflow-y: auto;
  color: #eaf8ff;
  border: 1px solid rgba(95, 231, 255, 0.26);
  border-radius: 18px;
  background: rgba(4, 17, 36, 0.88);
  box-shadow: 0 24px 55px rgba(0, 0, 0, 0.34), inset 0 0 34px rgba(95, 231, 255, 0.06);
  backdrop-filter: blur(16px);
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.clean-analysis-card::-webkit-scrollbar,
.relations-wrap::-webkit-scrollbar {
  width: 6px;
}

.clean-analysis-card::-webkit-scrollbar-thumb,
.relations-wrap::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(95, 231, 255, 0.3);
}

.clean-analysis-card::-webkit-scrollbar-track,
.relations-wrap::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.035);
}

.clean-card-header {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: 44px 1fr 30px;
  gap: 12px;
  align-items: center;
  padding-bottom: 12px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(118, 204, 255, 0.14);
}

.node-mark {
  width: 44px;
  height: 44px;
  font-weight: 800;
  line-height: 44px;
  color: #041222;
  text-align: center;
  border-radius: 14px;
  box-shadow: 0 0 22px rgba(95, 231, 255, 0.22);
}

.header-text {
  min-width: 0;
}

.header-text strong,
.header-text span {
  display: block;
}

.header-text strong {
  overflow: hidden;
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-text span {
  margin-top: 5px;
  font-size: 12px;
  color: rgba(234, 248, 255, 0.58);
}

.close-btn {
  width: 28px;
  height: 28px;
  cursor: pointer;
  color: rgba(234, 248, 255, 0.78);
  border: 1px solid rgba(118, 204, 255, 0.18);
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.04);
}

.analysis-section {
  flex: 0 0 auto;
  padding: 12px;
  margin-bottom: 12px;
  border: 1px solid rgba(118, 204, 255, 0.12);
  border-radius: 14px;
  background: rgba(9, 35, 64, 0.48);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 9px;
}

.section-title span {
  font-size: 13px;
  font-weight: 700;
}

.section-title button {
  padding: 4px 8px;
  cursor: pointer;
  color: #8feaff;
  border: 1px solid rgba(95, 231, 255, 0.22);
  border-radius: 999px;
  background: rgba(95, 231, 255, 0.08);
}

.section-title button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.section-title em {
  font-size: 12px;
  font-style: normal;
  color: rgba(234, 248, 255, 0.56);
}

.summary-text {
  max-height: 190px;
  margin: 0;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.8;
  color: rgba(234, 248, 255, 0.78);
}

.summary-text::-webkit-scrollbar {
  width: 4px;
}

.summary-text::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(95, 231, 255, 0.24);
}

.summary-text.is-loading {
  opacity: 0.72;
}

.value-list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.value-list li {
  position: relative;
  padding-left: 15px;
  margin-bottom: 8px;
  font-size: 12px;
  line-height: 1.65;
  color: rgba(234, 248, 255, 0.7);
}

.value-list li::before {
  position: absolute;
  top: 9px;
  left: 0;
  width: 6px;
  height: 6px;
  content: '';
  border-radius: 50%;
  background: #5fe7ff;
  box-shadow: 0 0 10px rgba(95, 231, 255, 0.9);
}

.relations-wrap {
  min-height: 120px;
  max-height: none;
  margin-bottom: 0;
  overflow: visible;
}

.mini-relation {
  padding: 9px;
  margin-bottom: 8px;
  border: 1px solid rgba(118, 204, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.035);
}

.mini-relation-top {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 6px;
  align-items: center;
  font-size: 12px;
}

.mini-relation-top span {
  overflow: hidden;
  color: rgba(234, 248, 255, 0.86);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-relation-top i {
  padding: 3px 7px;
  font-style: normal;
  color: #5fe7ff;
  border-radius: 999px;
  background: rgba(95, 231, 255, 0.08);
}

.mini-relation p {
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(234, 248, 255, 0.58);
}

@media (max-width: 768px) {
  .clean-analysis-card {
    top: auto;
    right: 12px;
    bottom: 12px;
    left: 12px;
    width: auto;
    max-height: 52%;
    padding: 14px;
  }
}
</style>

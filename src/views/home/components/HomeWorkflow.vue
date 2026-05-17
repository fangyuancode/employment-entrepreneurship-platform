<template>
  <div class="workflow-wrap">
    <div class="workflow-line"></div>
    <article v-for="(item, index) in cards" :key="item.title" class="workflow-card">
      <div class="workflow-index">0{{ index + 1 }}</div>
      <span>{{ item.tag }}</span>
      <h3>{{ item.title }}</h3>
      <p>{{ item.desc }}</p>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { WorkflowCard } from '../data'

defineProps<{
  cards: WorkflowCard[]
}>()
</script>

<style scoped lang="scss">
.workflow-wrap {
  position: relative;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.workflow-line {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 42px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.28), transparent);
}

.workflow-card {
  position: relative;
  z-index: 1;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 26px;
  background: #fff;
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.06);
}

.workflow-index {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 38px;
  border-radius: 16px;
  color: #2563eb;
  background: #eff6ff;
  font-weight: 900;
}

.workflow-card span {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.workflow-card h3 {
  margin: 10px 0 10px;
  color: #0f172a;
  font-size: 18px;
}

.workflow-card p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.85;
}

@media screen and (max-width: 1100px) {
  .workflow-wrap {
    grid-template-columns: repeat(2, 1fr);
  }

  .workflow-line {
    display: none;
  }

  .workflow-index {
    margin-bottom: 20px;
  }
}

@media screen and (max-width: 680px) {
  .workflow-wrap {
    grid-template-columns: 1fr;
  }
}
</style>

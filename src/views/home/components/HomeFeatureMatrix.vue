<template>
  <div class="feature-matrix">
    <article v-for="group in groups" :key="group.title" class="matrix-group">
      <div class="matrix-intro">
        <span>{{ group.kicker }}</span>
        <h3>{{ group.title }}</h3>
        <p>{{ group.desc }}</p>
      </div>

      <div class="matrix-list">
        <button
          v-for="item in group.items"
          :key="item.title"
          type="button"
          class="matrix-card"
          @click="emit('navigate', item.path)"
        >
          <div class="matrix-card-top">
            <span class="matrix-icon"><component :is="item.icon" /></span>
            <em>{{ item.tag }}</em>
          </div>
          <strong>{{ item.title }}</strong>
          <small>{{ item.desc }}</small>
          <div class="matrix-link">
            查看模块
            <el-icon><ArrowRight /></el-icon>
          </div>
        </button>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import type { FeatureGroup } from '../data'

defineProps<{
  groups: FeatureGroup[]
}>()

const emit = defineEmits<{
  navigate: [path: string]
}>()
</script>

<style scoped lang="scss">
.feature-matrix {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.matrix-group {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 18px;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.06);
}

.matrix-intro {
  padding: 22px;
  border-radius: 24px;
  background: linear-gradient(135deg, #f7fbff, #edf5ff);
}

.matrix-intro span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  margin-bottom: 42px;
  border-radius: 16px;
  color: #2563eb;
  background: #fff;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 14px 34px rgba(37, 99, 235, 0.1);
}

.matrix-intro h3 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.28;
}

.matrix-intro p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.9;
}

.matrix-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.matrix-card {
  min-height: 216px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  color: #334155;
  text-align: left;
  background: #fff;
  cursor: pointer;
  transition: all 0.24s ease;
}

.matrix-card:hover {
  transform: translateY(-6px);
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow: 0 24px 42px rgba(37, 99, 235, 0.11);
}

.matrix-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.matrix-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.09);
}

.matrix-icon svg {
  width: 22px;
  height: 22px;
}

.matrix-card em {
  font-style: normal;
  color: #64748b;
  font-size: 12px;
}

.matrix-card strong,
.matrix-card small {
  display: block;
}

.matrix-card strong {
  margin-bottom: 9px;
  color: #0f172a;
  font-size: 17px;
}

.matrix-card small {
  min-height: 46px;
  color: #64748b;
  line-height: 1.75;
}

.matrix-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
}

@media screen and (max-width: 1180px) {
  .matrix-group {
    grid-template-columns: 1fr;
  }

  .matrix-intro span {
    margin-bottom: 18px;
  }
}

@media screen and (max-width: 860px) {
  .matrix-list {
    grid-template-columns: 1fr;
  }

  .matrix-group {
    padding: 12px;
    border-radius: 24px;
  }
}
</style>

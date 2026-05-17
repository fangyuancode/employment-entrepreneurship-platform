<template>
  <div class="data-showcase">
    <button
      v-for="(item, index) in cards"
      :key="item.title"
      type="button"
      class="data-card"
      :class="`card-${index}`"
      @click="emit('navigate', item.path)"
    >
      <div class="card-top">
        <span class="data-icon"><component :is="item.icon" /></span>
        <span class="data-value">{{ item.value }}</span>
      </div>
      <h3>{{ item.title }}</h3>
      <p>{{ item.desc }}</p>
      <div class="mock-chart" aria-hidden="true">
        <i v-for="bar in 8" :key="bar" :style="{ height: `${28 + ((bar * 17 + index * 13) % 54)}%` }"></i>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { DataCard } from '../data'

defineProps<{
  cards: DataCard[]
}>()

const emit = defineEmits<{
  navigate: [path: string]
}>()
</script>

<style scoped lang="scss">
.data-showcase {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.data-card {
  position: relative;
  overflow: hidden;
  min-height: 268px;
  padding: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 26px;
  color: #e2e8f0;
  text-align: left;
  background: rgba(15, 23, 42, 0.58);
  box-shadow: 0 24px 54px rgba(2, 8, 23, 0.18);
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
}

.data-card::before {
  content: '';
  position: absolute;
  inset: -40% -20% auto auto;
  width: 190px;
  height: 190px;
  border-radius: 50%;
  background: rgba(56, 189, 248, 0.18);
  filter: blur(4px);
}

.data-card:hover {
  transform: translateY(-8px);
  border-color: rgba(125, 211, 252, 0.45);
  background: rgba(15, 23, 42, 0.74);
}

.card-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 22px;
}

.data-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  color: #7dd3fc;
  background: rgba(14, 165, 233, 0.13);
}

.data-icon svg {
  width: 24px;
  height: 24px;
}

.data-value {
  font-size: 13px;
  color: rgba(226, 232, 240, 0.68);
}

h3,
p,
.mock-chart {
  position: relative;
  z-index: 1;
}

h3 {
  margin: 0 0 10px;
  color: #f8fafc;
  font-size: 19px;
}

p {
  margin: 0;
  min-height: 76px;
  color: rgba(226, 232, 240, 0.68);
  font-size: 14px;
  line-height: 1.85;
}

.mock-chart {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 58px;
  margin-top: 22px;
}

.mock-chart i {
  flex: 1;
  min-width: 8px;
  border-radius: 999px 999px 4px 4px;
  background: linear-gradient(180deg, rgba(125, 211, 252, 0.9), rgba(37, 99, 235, 0.28));
}

@media screen and (max-width: 1180px) {
  .data-showcase {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 680px) {
  .data-showcase {
    grid-template-columns: 1fr;
  }
}
</style>

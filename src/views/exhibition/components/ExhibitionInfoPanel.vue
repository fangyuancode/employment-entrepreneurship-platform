<template>
  <aside class="hud-panel info-side-panel">
    <div class="side-panel-head">
      <div>
        <span>展馆信息</span>
        <em>{{ activeHall.code }}</em>
      </div>
      <button type="button" :class="['favorite-btn', { active: favorite }]" @click="$emit('toggle-favorite', activeHall.key)">
        {{ favorite ? '已收藏' : '收藏' }}
      </button>
    </div>

    <div class="info-scroll">
      <div class="hall-preview" :style="{ '--hall-color': activeColor }">
        <div class="preview-inner">
          <i>{{ activeHall.icon }}</i>
          <strong>{{ activeHall.title }}</strong>
          <span>{{ activeHall.slogan }}</span>
        </div>
      </div>

      <div class="hall-text">
        <h2>{{ activeHall.hoverTitle }}</h2>
        <p>{{ activeHall.hoverDesc }}</p>
        <div class="tag-row">
          <span v-for="tag in activeHall.tags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="metric-list">
        <div v-for="item in activeHall.metrics" :key="item.name" class="metric-item">
          <div>
            <span>{{ item.name }}</span>
            <strong>{{ item.value }}%</strong>
          </div>
          <i><em :style="{ width: item.value + '%' }"></em></i>
        </div>
      </div>

      <div class="section-card">
        <h3>展馆价值</h3>
        <p>{{ activeHall.userValue }}</p>
      </div>

      <div class="section-card">
        <h3>可交付成果</h3>
        <div class="output-list">
          <span v-for="item in activeHall.outputs" :key="item">{{ item }}</span>
        </div>
      </div>
    </div>

    <button type="button" class="enter-hall-btn" @click="$emit('enter-hall', activeHall.path)">
      {{ activeHall.actionText }}
      <span>→</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import type { HallItem, HallKey } from '../types'

defineProps<{
  activeHall: HallItem
  activeColor: string
  favorite: boolean
}>()

defineEmits<{
  (event: 'toggle-favorite', key: HallKey): void
  (event: 'enter-hall', path: string): void
}>()
</script>

<style scoped lang="scss">
.hud-panel {
  box-sizing: border-box;
  color: #e8f4ff;
  background: rgba(7, 21, 39, 0.78);
  border: 1px solid rgba(100, 198, 255, 0.22);
  border-radius: 18px;
  box-shadow: 0 22px 56px rgba(0, 0, 0, 0.34), inset 0 0 0 1px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(18px);
}

.info-side-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 16px;
  overflow: hidden;
}

.side-panel-head {
  display: flex;
  flex: 0 0 auto;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(113, 207, 255, 0.12);
}

.side-panel-head span {
  display: block;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: #72ddff;
}

.side-panel-head em {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  font-style: normal;
  color: rgba(224, 243, 255, 0.52);
}

.favorite-btn,
.enter-hall-btn {
  box-sizing: border-box;
  font-family: inherit;
  cursor: pointer;
  border: 0;
}

.favorite-btn {
  flex: 0 0 auto;
  padding: 7px 11px;
  font-size: 12px;
  color: rgba(230, 244, 255, 0.72);
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.favorite-btn.active {
  color: #ffe5a8;
  border-color: rgba(255, 218, 132, 0.42);
}

.info-scroll {
  flex: 1 1 auto;
  min-height: 0;
  padding-right: 3px;
  overflow-y: auto;
}

.info-scroll::-webkit-scrollbar {
  display: none;
}

.info-scroll::-webkit-scrollbar-thumb {
  background: rgba(108, 213, 255, 0.26);
  border-radius: 999px;
}

.hall-preview {
  position: relative;
  height: 132px;
  margin-bottom: 16px;
  overflow: hidden;
  background: radial-gradient(
      circle at 50% 15%,
      color-mix(in srgb, var(--hall-color), #ffffff 24%),
      transparent 27%
    ),
    rgba(8, 31, 55, 0.96);
  border: 1px solid rgba(117, 206, 255, 0.14);
  border-radius: 16px;
}

.hall-preview::before {
  position: absolute;
  inset: 26px 36px 0;
  content: '';
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 18px 18px 0 0;
  transform: perspective(160px) rotateX(18deg);
}

.preview-inner {
  position: relative;
  z-index: 1;
  display: grid;
  height: 100%;
  place-items: center;
  text-align: center;
}

.preview-inner i {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 2px;
  font-style: normal;
  color: #071522;
  place-items: center;
  background: #e9fbff;
  border-radius: 12px;
}

.preview-inner strong {
  font-size: 18px;
}

.preview-inner span {
  max-width: 230px;
  font-size: 12px;
  color: rgba(231, 245, 255, 0.6);
}

.hall-text h2 {
  margin: 0;
  font-size: 21px;
  line-height: 1.25;
}

.hall-text p,
.section-card p {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.72;
  color: rgba(230, 244, 255, 0.66);
}

.tag-row,
.output-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.tag-row span,
.output-list span {
  padding: 5px 8px;
  font-size: 12px;
  color: rgba(232, 247, 255, 0.76);
  background: rgba(255, 255, 255, 0.058);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.metric-list {
  display: grid;
  gap: 10px;
  margin: 16px 0;
}

.metric-item {
  display: grid;
  gap: 7px;
}

.metric-item div {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.metric-item strong {
  color: #eafaff;
}
.metric-item i {
  height: 6px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 999px;
}

.metric-item em {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #3c9cff, #73eeff);
  border-radius: inherit;
  box-shadow: 0 0 18px rgba(86, 210, 255, 0.38);
}

.section-card {
  padding: 13px;
  margin-top: 12px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 14px;
}

.section-card h3 {
  margin: 0;
  font-size: 14px;
}

.enter-hall-btn {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 44px;
  padding: 0 16px;
  margin-top: 14px;
  font-weight: 700;
  color: #051322;
  background: linear-gradient(135deg, #7ce9ff, #4e9dff);
  border-radius: 14px;
  box-shadow: 0 14px 28px rgba(62, 166, 255, 0.28);
}

@media (max-height: 760px) {
  .info-side-panel {
    padding: 14px;
  }
  .hall-preview {
    height: 112px;
  }
  .hall-text h2 {
    font-size: 18px;
  }
}
</style>

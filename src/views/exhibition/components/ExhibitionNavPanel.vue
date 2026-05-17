<template>
  <aside class="hud-panel nav-side-panel">
    <div class="side-panel-head">
      <div>
        <span>展馆导航</span>
        <em>本地数据 · 点击切换展馆</em>
      </div>
      <strong>{{ modelState }}</strong>
    </div>

    <div class="radar-card">
      <div class="radar-core"></div>
      <div class="radar-sweep"></div>
      <i v-for="(item, index) in halls" :key="item.key" :class="['radar-dot', `dot-${index + 1}`, { active: activeKey === item.key }]"></i>
    </div>

    <div class="status-pills">
      <span v-for="item in runtimeStatus" :key="item.name">
        <b>{{ item.name }}</b>
        <em>{{ item.value }}</em>
      </span>
    </div>

    <div class="hall-list-wrap">
      <button v-for="(item, index) in halls" :key="item.key" type="button" :class="['hall-row', { active: activeKey === item.key }]" @click="$emit('focus-hall', item.key)" @dblclick="$emit('enter-hall', item.path)">
        <i>{{ formatNo(index + 1) }}</i>
        <span>
          <strong>{{ item.title }}</strong>
          <em>{{ item.sceneRole }}</em>
        </span>
        <b>{{ item.short }}</b>
      </button>
    </div>

    <div class="side-actions">
      <button type="button" :class="{ active: isTouring }" @click="$emit('toggle-tour')">
        {{ isTouring ? '停止导览' : '自动导览' }}
      </button>
      <button type="button" @click="$emit('reset-camera')">视角复位</button>
      <button type="button" :class="{ active: qualityMode === 'high' }" @click="$emit('toggle-quality')">
        {{ qualityLabel }}
      </button>
      <button type="button" :class="{ active: judgeMode }" @click="$emit('toggle-judge')">评委视角</button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { HallItem, HallKey, QualityMode, RuntimeStatus } from '../types'

defineProps<{
  halls: HallItem[]
  activeKey: HallKey
  modelState: string
  runtimeStatus: RuntimeStatus[]
  isTouring: boolean
  qualityMode: QualityMode
  qualityLabel: string
  judgeMode: boolean
}>()

defineEmits<{
  (event: 'focus-hall', key: HallKey): void
  (event: 'enter-hall', path: string): void
  (event: 'toggle-tour'): void
  (event: 'reset-camera'): void
  (event: 'toggle-quality'): void
  (event: 'toggle-judge'): void
}>()

function formatNo(no: number) {
  return no < 10 ? `0${no}` : `${no}`
}
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

.nav-side-panel {
  display: flex;
  flex-direction: column;
  gap: 13px;
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

.side-panel-head strong {
  max-width: 104px;
  padding: 4px 8px;
  overflow: hidden;
  font-size: 11px;
  font-weight: 500;
  color: rgba(228, 245, 255, 0.68);
  text-overflow: ellipsis;
  white-space: nowrap;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 999px;
}

.radar-card {
  position: relative;
  flex: 0 0 138px;
  overflow: hidden;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(77, 203, 255, 0.15),
    rgba(77, 203, 255, 0.03) 34%,
    transparent 70%
  );
  border: 1px solid rgba(105, 207, 255, 0.14);
  border-radius: 16px;
}

.radar-card::before,
.radar-card::after {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 82%;
  height: 1px;
  content: '';
  background: rgba(124, 220, 255, 0.14);
  transform: translate(-50%, -50%);
}

.radar-card::after {
  width: 1px;
  height: 82%;
}

.radar-core {
  position: absolute;
  inset: 50% auto auto 50%;
  width: 90px;
  height: 90px;
  border: 1px solid rgba(112, 215, 255, 0.18);
  border-radius: 50%;
  box-shadow: 0 0 0 24px rgba(95, 202, 255, 0.035), 0 0 0 48px rgba(95, 202, 255, 0.025),
    inset 0 0 18px rgba(90, 210, 255, 0.12);
  transform: translate(-50%, -50%);
}

.radar-sweep {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 74px;
  height: 74px;
  background: conic-gradient(
    from 0deg,
    rgba(85, 222, 255, 0),
    rgba(85, 222, 255, 0.28),
    rgba(85, 222, 255, 0)
  );
  border-radius: 50%;
  transform-origin: 0 0;
  animation: radarSweep 3.6s linear infinite;
}

.radar-dot {
  position: absolute;
  width: 7px;
  height: 7px;
  background: rgba(128, 224, 255, 0.72);
  border-radius: 50%;
  box-shadow: 0 0 14px rgba(98, 210, 255, 0.72);
  transition: all 0.2s ease;
}

.radar-dot.active {
  width: 11px;
  height: 11px;
  background: #ffffff;
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.9), 0 0 30px rgba(93, 219, 255, 0.82);
}

.dot-1 {
  left: 24%;
  top: 57%;
}
.dot-2 {
  left: 47%;
  top: 32%;
}
.dot-3 {
  left: 72%;
  top: 54%;
}
.dot-4 {
  left: 28%;
  top: 77%;
}
.dot-5 {
  left: 50%;
  top: 82%;
}
.dot-6 {
  left: 73%;
  top: 76%;
}

.status-pills {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.status-pills span {
  min-width: 0;
  padding: 8px 9px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 12px;
}

.status-pills b,
.status-pills em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pills b {
  font-size: 11px;
  font-weight: 500;
  color: rgba(223, 242, 255, 0.48);
}

.status-pills em {
  margin-top: 2px;
  font-size: 12px;
  font-style: normal;
  color: rgba(239, 250, 255, 0.78);
}

.hall-list-wrap {
  display: grid;
  flex: 1 1 auto;
  gap: 9px;
  min-height: 0;
  padding-right: 3px;
  overflow-y: auto;
}

.hall-list-wrap::-webkit-scrollbar {
  // width: 4px;
  display: none;
}

.hall-list-wrap::-webkit-scrollbar-thumb {
  background: rgba(108, 213, 255, 0.26);
  border-radius: 999px;
}

.hall-row,
.side-actions button {
  box-sizing: border-box;
  font-family: inherit;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
}

.hall-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 32px;
  gap: 10px;
  align-items: center;
  min-height: 66px;
  padding: 11px 10px;
  text-align: left;
  background: rgba(9, 29, 52, 0.66);
  border: 1px solid rgba(116, 205, 255, 0.12);
  border-radius: 14px;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hall-row i {
  display: grid;
  width: 34px;
  height: 34px;
  font-size: 12px;
  font-style: normal;
  color: #7fe5ff;
  place-items: center;
  background: rgba(93, 196, 255, 0.08);
  border: 1px solid rgba(119, 221, 255, 0.16);
  border-radius: 11px;
}

.hall-row span {
  min-width: 0;
}

.hall-row strong,
.hall-row em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hall-row strong {
  font-size: 14px;
  line-height: 1.3;
}

.hall-row em {
  margin-top: 4px;
  font-size: 11px;
  font-style: normal;
  color: rgba(226, 242, 255, 0.5);
}

.hall-row b {
  display: grid;
  width: 30px;
  height: 30px;
  font-size: 12px;
  color: rgba(233, 250, 255, 0.8);
  place-items: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.hall-row.active,
.hall-row:hover {
  background: rgba(22, 72, 116, 0.8);
  border-color: rgba(104, 220, 255, 0.48);
  box-shadow: 0 14px 28px rgba(26, 137, 218, 0.18);
  transform: translateX(3px);
}

.side-actions {
  display: grid;
  flex: 0 0 auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(113, 207, 255, 0.12);
}

.side-actions button {
  min-height: 38px;
  padding: 0 8px;
  font-size: 12px;
  background: rgba(11, 31, 55, 0.76);
  border: 1px solid rgba(116, 205, 255, 0.14);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.side-actions button.active,
.side-actions button:hover {
  color: #ffffff;
  background: rgba(34, 116, 184, 0.76);
  border-color: rgba(118, 224, 255, 0.52);
}

@keyframes radarSweep {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-height: 760px) {
  .nav-side-panel {
    gap: 10px;
    padding: 14px;
  }
  .radar-card {
    flex-basis: 112px;
  }
  .hall-row {
    min-height: 58px;
    padding: 9px;
  }
  .status-pills {
    display: none;
  }
}
</style>

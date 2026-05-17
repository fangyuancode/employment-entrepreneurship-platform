<template>
  <div class="capability-showcase">
    <aside class="capability-tabs">
      <button
        v-for="item in tabs"
        :key="item.key"
        type="button"
        class="capability-tab"
        :class="{ active: activeKey === item.key }"
        @mouseenter="activeKey = item.key"
        @click="activeKey = item.key"
      >
        <span class="tab-icon">
          <component :is="item.icon" />
        </span>
        <span>
          <strong>{{ item.title }}</strong>
          <small>{{ item.desc }}</small>
        </span>
      </button>
    </aside>

    <div class="capability-detail">
      <div class="detail-main">
        <span class="detail-tag">{{ current.tag }}</span>
        <h3>{{ current.title }}</h3>
        <p>{{ current.longDesc }}</p>
        <el-button type="primary" @click="emit('navigate', current.path)">进入核心模块</el-button>
      </div>

      <div class="detail-cards">
        <button
          v-for="child in current.children"
          :key="child.title"
          type="button"
          class="detail-card"
          @click="emit('navigate', child.path)"
        >
          <div class="detail-card-top">
            <span class="child-icon"><component :is="child.icon" /></span>
            <em>{{ child.tag }}</em>
          </div>
          <strong>{{ child.title }}</strong>
          <small>{{ child.desc }}</small>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CapabilityTab } from '../data'

const props = defineProps<{
  tabs: CapabilityTab[]
}>()

const emit = defineEmits<{
  navigate: [path: string]
}>()

const activeKey = ref(props.tabs[0]?.key || '')

watch(
  () => props.tabs,
  (tabs) => {
    if (!tabs.some((item) => item.key === activeKey.value)) {
      activeKey.value = tabs[0]?.key || ''
    }
  }
)

const current = computed<CapabilityTab>(() => props.tabs.find((item) => item.key === activeKey.value) || (props.tabs[0] as CapabilityTab))
</script>

<style scoped lang="scss">
.capability-showcase {
  display: grid;
  grid-template-columns: 390px minmax(0, 1fr);
  gap: 22px;
}

.capability-tabs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.capability-tab {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 14px;
  align-items: center;
  width: 100%;
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 22px;
  text-align: left;
  color: #334155;
  background: #fff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: all 0.24s ease;
}

.capability-tab:hover,
.capability-tab.active {
  transform: translateY(-4px);
  border-color: rgba(59, 130, 246, 0.35);
  box-shadow: 0 26px 54px rgba(37, 99, 235, 0.12);
}

.capability-tab.active {
  background: linear-gradient(135deg, #f8fbff, #eef6ff);
}

.tab-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 17px;
  color: #2563eb;
  background: rgba(37, 99, 235, 0.09);
}

.tab-icon svg {
  width: 23px;
  height: 23px;
}

.capability-tab strong,
.capability-tab small {
  display: block;
}

.capability-tab strong {
  font-size: 16px;
  color: #0f172a;
  margin-bottom: 6px;
}

.capability-tab small {
  font-size: 13px;
  line-height: 1.7;
  color: #64748b;
}

.capability-detail {
  position: relative;
  overflow: hidden;
  min-height: 420px;
  padding: 28px;
  border-radius: 30px;
  background:
    radial-gradient(circle at 82% 12%, rgba(14, 165, 233, 0.2), transparent 30%),
    linear-gradient(135deg, #0b1220, #102a4c 72%, #0f3b5f);
  box-shadow: 0 30px 70px rgba(15, 23, 42, 0.14);
}

.capability-detail::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(125, 211, 252, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(125, 211, 252, 0.08) 1px, transparent 1px);
  background-size: 44px 44px;
  opacity: 0.42;
  mask-image: linear-gradient(180deg, #000, transparent);
}

.detail-main,
.detail-cards {
  position: relative;
  z-index: 1;
}

.detail-main {
  max-width: 650px;
  color: #fff;
}

.detail-tag {
  display: inline-flex;
  padding: 7px 13px;
  border-radius: 999px;
  color: #bae6fd;
  background: rgba(14, 165, 233, 0.14);
  border: 1px solid rgba(125, 211, 252, 0.22);
  font-size: 13px;
}

.detail-main h3 {
  margin: 18px 0 14px;
  font-size: 34px;
  line-height: 1.2;
}

.detail-main p {
  margin: 0 0 22px;
  max-width: 680px;
  color: rgba(226, 232, 240, 0.76);
  font-size: 15px;
  line-height: 1.95;
}

.detail-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 34px;
}

.detail-card {
  padding: 18px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  text-align: left;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(16px);
  cursor: pointer;
  transition: all 0.22s ease;
}

.detail-card:hover {
  transform: translateY(-6px);
  border-color: rgba(125, 211, 252, 0.42);
  background: rgba(15, 23, 42, 0.62);
}

.detail-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.child-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  color: #7dd3fc;
  background: rgba(14, 165, 233, 0.14);
}

.child-icon svg {
  width: 22px;
  height: 22px;
}

.detail-card em {
  font-style: normal;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.58);
}

.detail-card strong,
.detail-card small {
  display: block;
}

.detail-card strong {
  margin-bottom: 9px;
  color: #f8fafc;
  font-size: 16px;
}

.detail-card small {
  color: rgba(226, 232, 240, 0.68);
  line-height: 1.75;
}

@media screen and (max-width: 1180px) {
  .capability-showcase {
    grid-template-columns: 1fr;
  }

  .capability-tabs {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
}

@media screen and (max-width: 860px) {
  .capability-tabs,
  .detail-cards {
    grid-template-columns: 1fr;
  }

  .capability-detail {
    padding: 22px;
    border-radius: 24px;
  }

  .detail-main h3 {
    font-size: 28px;
  }
}
</style>

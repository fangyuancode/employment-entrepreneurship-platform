<template>
  <section class="home-hero">
    <div class="hero-bg-grid"></div>
    <div class="hero-orb hero-orb-a"></div>
    <div class="hero-orb hero-orb-b"></div>

    <header class="hero-topbar">
      <div class="brand-area" @click="emit('scroll', 'top')">
        <div class="brand-mark">AI</div>
        <div>
          <div class="brand-name">AI 创业就业助手</div>
          <div class="brand-sub">AI + Web 智能应用平台</div>
        </div>
      </div>

      <nav class="hero-nav">
        <button v-for="item in navItems" :key="item.key" type="button" @click="emit('scroll', item.key)">
          {{ item.label }}
        </button>
      </nav>

      <div class="hero-actions">
        <el-button text class="ghost-btn" @click="emit('navigate', '/auth/login')">登录</el-button>
        <el-button text class="ghost-btn" @click="emit('navigate', '/exhibition')">数字展厅</el-button>
        <el-button type="primary" class="solid-btn" @click="emit('navigate', '/toolbox/jobanalysis')">
          立即体验
        </el-button>
      </div>
    </header>

    <div class="hero-main">
      <div class="hero-copy">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          智能引擎 · 网启新生
        </div>
        <h1>
          <!-- 与项目实践 -->
          面向创业、就业与项目实践的<span>AI 智能应用平台</span>
        </h1>
        <p class="hero-desc">
          平台融合岗位数据分析、技能图谱、商业计划生成、品牌文案创作、会议纪要与数字展厅展示能力，形成从数据洞察到方案落地的一站式 AI+Web 实践平台。
        </p>

        <div class="hero-cta-row">
          <el-button type="primary" size="large" @click="emit('navigate', '/jobscreen')">
            打开数据大屏
            <el-icon class="btn-icon">
              <ArrowRight />
            </el-icon>
          </el-button>
          <el-button size="large" @click="emit('navigate', '/exhibition')">进入数字展厅</el-button>
          <el-button size="large" @click="emit('navigate', '/aichat')">AI 就业助手</el-button>
        </div>

        <div class="hero-tags">
          <span v-for="tag in tags" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="hero-visual" aria-label="平台能力可视化展示">
        <div class="visual-ring ring-one"></div>
        <div class="visual-ring ring-two"></div>
        <div class="visual-core">
          <div class="core-light"></div>
          <Cpu />
          <span>AI OS</span>
        </div>

        <button v-for="(entry, index) in entries" :key="entry.title" type="button" class="orbit-card" :class="[`card-${index}`, entry.accent]" @click="emit('navigate', entry.path)">
          <span class="entry-icon">
            <component :is="entry.icon" />
          </span>
          <strong>{{ entry.title }}</strong>
          <small>{{ entry.desc }}</small>
        </button>

        <div class="hero-console">
          <div class="console-head">
            <span>平台运行概览</span>
            <i></i>
          </div>
          <div class="metric-row" v-for="item in metrics" :key="item.label">
            <strong>{{ item.value }}</strong>
            <div>
              <span>{{ item.label }}</span>
              <small>{{ item.desc }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, Cpu } from '@element-plus/icons-vue'
import type { HomeEntry, HomeMetric, NavItem } from '../data'

defineProps<{
  navItems: NavItem[]
  metrics: HomeMetric[]
  entries: HomeEntry[]
  tags: string[]
}>()

const emit = defineEmits<{
  navigate: [path: string]
  scroll: [key: string]
}>()
</script>

<style scoped lang="scss">
.home-hero {
  position: relative;
  min-height: 660px;
  overflow: hidden;
  padding: 22px 28px 14px;
  color: #fff;
  background: radial-gradient(circle at 76% 14%, rgba(71, 151, 255, 0.28), transparent 28%),
    radial-gradient(circle at 12% 88%, rgba(26, 201, 255, 0.16), transparent 32%),
    linear-gradient(135deg, #08111f 0%, #0d1c33 48%, #102d4e 100%);
}

.hero-bg-grid {
  position: absolute;
  inset: 0;
  opacity: 0.28;
  background-image: linear-gradient(rgba(125, 211, 252, 0.11) 1px, transparent 1px),
    linear-gradient(90deg, rgba(125, 211, 252, 0.11) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: linear-gradient(180deg, #000 0%, transparent 72%);
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(2px);
  pointer-events: none;
}

.hero-orb-a {
  width: 420px;
  height: 420px;
  top: -190px;
  right: 8%;
  background: rgba(55, 147, 255, 0.14);
}

.hero-orb-b {
  width: 360px;
  height: 360px;
  left: -150px;
  bottom: -160px;
  background: rgba(34, 211, 238, 0.1);
}

.hero-topbar,
.hero-main {
  position: relative;
  z-index: 2;
  max-width: 1440px;
  margin: 0 auto;
}

.hero-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22px;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  cursor: pointer;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 900;
  letter-spacing: -0.04em;
  background: linear-gradient(135deg, #2f7dff, #35d5ff);
  box-shadow: 0 18px 36px rgba(38, 133, 255, 0.28);
}

.brand-name {
  font-size: 18px;
  font-weight: 800;
}

.brand-sub {
  margin-top: 2px;
  color: rgba(226, 232, 240, 0.72);
  font-size: 12px;
}

.hero-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.26);
  backdrop-filter: blur(14px);
}

.hero-nav button {
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 999px;
  color: rgba(226, 232, 240, 0.78);
  background: transparent;
  cursor: pointer;
  transition: all 0.22s ease;
}

.hero-nav button:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

:deep(.ghost-btn.el-button) {
  color: #e2e8f0;
  border: 1px solid rgba(226, 232, 240, 0.18);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 999px;
  padding: 9px 16px;
}

:deep(.ghost-btn.el-button:hover) {
  color: #0f172a;
  background: #e0f2fe;
}

:deep(.solid-btn.el-button) {
  border-radius: 999px;
  padding: 10px 20px;
  box-shadow: 0 16px 34px rgba(37, 99, 235, 0.28);
}

.hero-main {
  display: grid;
  grid-template-columns: minmax(0, 1.02fr) minmax(480px, 0.98fr);
  gap: 40px;
  // align-items: center;
  padding-top: 12px;
}

.hero-copy {
  animation: heroTextIn 0.78s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  margin-top: 30px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 8px 14px;
  border: 1px solid rgba(125, 211, 252, 0.28);
  border-radius: 999px;
  color: #bae6fd;
  background: rgba(8, 47, 73, 0.45);
  box-shadow: inset 0 0 20px rgba(14, 165, 233, 0.12);
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 18px #22d3ee;
}

h1 {
  max-width: 820px;
  margin: 18px 0 0;
  font-size: clamp(42px, 5vw, 68px);
  line-height: 1.08;
  letter-spacing: -0.045em;
}

h1 span {
  // display: block;
  color: #90cdfd;
}

.hero-desc {
  max-width: 760px;
  margin: 24px 0 30px;
  color: rgba(226, 232, 240, 0.78);
  font-size: 16px;
  line-height: 2;
}

.hero-cta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 22px;
}

.btn-icon {
  margin-left: 4px;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-tags span {
  padding: 8px 13px;
  border-radius: 999px;
  color: rgba(226, 232, 240, 0.82);
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.28);
  font-size: 13px;
}

.hero-visual {
  position: relative;
  min-height: 610px;
  overflow: hidden;
  // border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 34px;
  background: radial-gradient(circle at 50% 38%, rgba(14, 165, 233, 0.2), transparent 34%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.42), rgba(2, 8, 23, 0.28));
  box-shadow: 0 36px 80px rgba(2, 8, 23, 0.28);
  backdrop-filter: blur(18px);
  animation: heroVisualIn 0.9s 0.12s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.hero-visual::before,
.hero-visual::after {
  content: '';
  position: absolute;
  pointer-events: none;
  border-radius: 999px;
}

.hero-visual::before {
  left: 50%;
  top: 262px;
  width: 420px;
  height: 130px;
  transform: translate(-50%, -50%) rotateX(64deg);
  background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.18), transparent 68%);
  filter: blur(1px);
  z-index: 0;
}

.hero-visual::after {
  inset: 18px;
  border: 1px solid rgba(125, 211, 252, 0.08);
  box-shadow: inset 0 0 34px rgba(14, 165, 233, 0.08);
  z-index: 0;
}

.visual-ring {
  position: absolute;
  left: 50%;
  top: 262px;
  transform: translate(-50%, -50%) rotateX(62deg);
  border-radius: 50%;
  border: 1px solid rgba(125, 211, 252, 0.28);
  box-shadow: 0 0 40px rgba(56, 189, 248, 0.08);
  pointer-events: none;
  z-index: 1;
}

.ring-one {
  width: clamp(230px, 44vw, 330px);
  height: clamp(230px, 44vw, 330px);
  animation: rotateRing 18s linear infinite;
}

.ring-two {
  width: clamp(300px, 58vw, 430px);
  height: clamp(300px, 58vw, 430px);
  border-style: dashed;
  opacity: 0.66;
  animation: rotateRing 28s linear infinite reverse;
}

.visual-core {
  position: absolute;
  left: 50%;
  top: 262px;
  width: 132px;
  height: 132px;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(186, 230, 253, 0.32);
  border-radius: 32px;
  display: grid;
  place-items: center;
  color: #e0f2fe;
  background: linear-gradient(145deg, rgba(30, 64, 175, 0.72), rgba(8, 145, 178, 0.42));
  box-shadow: 0 24px 70px rgba(14, 165, 233, 0.18);
  z-index: 3;
}

.visual-core svg {
  width: 42px;
  height: 42px;
  z-index: 1;
}

.visual-core span {
  z-index: 1;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.core-light {
  position: absolute;
  inset: 16px;
  border-radius: 26px;
  background: radial-gradient(circle, rgba(125, 211, 252, 0.35), transparent 68%);
  animation: pulseCore 2.8s ease-in-out infinite;
}

.orbit-card {
  position: absolute;
  width: 164px;
  min-height: 118px;
  padding: 15px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 22px;
  color: #e2e8f0;
  text-align: left;
  background: rgba(15, 23, 42, 0.72);
  box-shadow: 0 20px 42px rgba(2, 8, 23, 0.28);
  backdrop-filter: blur(14px);
  cursor: pointer;
  transition: transform 0.24s ease, border-color 0.24s ease, background 0.24s ease;
  z-index: 4;
}

.orbit-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(125, 211, 252, 0.45);
  background: rgba(15, 23, 42, 0.88);
}

.entry-icon {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 10px;
}

.entry-icon svg {
  width: 20px;
  height: 20px;
}

.orbit-card strong,
.orbit-card small {
  display: block;
}

.orbit-card strong {
  font-size: 15px;
  margin-bottom: 5px;
}

.orbit-card small {
  color: rgba(226, 232, 240, 0.66);
  line-height: 1.55;
}

.card-0 {
  left: 34px;
  top: 56px;
}

.card-1 {
  right: 34px;
  top: 56px;
}

.card-2 {
  right: 34px;
  top: 270px;
}

.card-3 {
  left: 34px;
  top: 270px;
}

.cyan .entry-icon {
  color: #67e8f9;
  background: rgba(8, 145, 178, 0.2);
}

.blue .entry-icon {
  color: #93c5fd;
  background: rgba(37, 99, 235, 0.2);
}

.violet .entry-icon {
  color: #c4b5fd;
  background: rgba(124, 58, 237, 0.2);
}

.amber .entry-icon {
  color: #fcd34d;
  background: rgba(217, 119, 6, 0.18);
}

.hero-console {
  position: absolute;
  left: 50%;
  bottom: 24px;
  width: min(520px, calc(100% - 48px));
  transform: translateX(-50%);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 24px;
  background: rgba(2, 8, 23, 0.56);
  backdrop-filter: blur(16px);
  z-index: 5;
}

.console-head {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #e2e8f0;
  font-weight: 700;
}

.console-head i {
  width: 42px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #22d3ee, #2563eb);
}

.metric-row {
  display: grid;
  gap: 4px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.38);
}

.metric-row strong {
  color: #7dd3fc;
  font-size: 22px;
  line-height: 1;
}

.metric-row span,
.metric-row small {
  display: block;
}

.metric-row span {
  color: #f8fafc;
  font-weight: 700;
}

.metric-row small {
  color: rgba(226, 232, 240, 0.62);
  margin-top: 3px;
  line-height: 1.5;
}

@keyframes heroTextIn {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes heroVisualIn {
  from {
    opacity: 0;
    transform: translateY(36px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes rotateRing {
  from {
    transform: translate(-50%, -50%) rotateX(62deg) rotateZ(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotateX(62deg) rotateZ(360deg);
  }
}

@keyframes pulseCore {
  0%,
  100% {
    opacity: 0.7;
    transform: scale(0.96);
  }
  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@media screen and (max-width: 1180px) {
  .hero-topbar,
  .hero-main {
    max-width: 100%;
  }

  .hero-topbar {
    flex-wrap: wrap;
  }

  .hero-nav {
    order: 3;
    width: 100%;
    justify-content: center;
    overflow-x: auto;
  }

  .hero-main {
    grid-template-columns: 1fr;
    gap: 34px;
  }

  .hero-visual {
    min-height: 600px;
  }

  .ring-one {
    width: 320px;
    height: 320px;
  }

  .ring-two {
    width: 420px;
    height: 420px;
  }
}

@media screen and (max-width: 720px) {
  .home-hero {
    padding: 18px 16px 46px;
  }

  .hero-actions,
  .hero-nav {
    display: none;
  }

  .hero-main {
    padding-top: 46px;
  }

  .hero-desc {
    font-size: 14px;
  }

  .hero-visual {
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 22px 14px 14px;
    border-radius: 24px;
  }

  .hero-visual::before,
  .hero-visual::after,
  .visual-ring {
    display: none;
  }

  .visual-core {
    position: relative;
    left: auto;
    top: auto;
    width: 118px;
    height: 118px;
    margin: 0 auto 8px;
    transform: none;
  }

  .orbit-card,
  .hero-console {
    position: relative;
    left: auto;
    right: auto;
    top: auto;
    bottom: auto;
    width: 100%;
    min-height: 0;
    transform: none;
  }

  .orbit-card:hover {
    transform: translateY(-4px);
  }

  .hero-console {
    grid-template-columns: 1fr;
    padding: 14px;
  }

  .metric-row {
    padding: 10px 12px;
  }

  .metric-row strong {
    font-size: 20px;
  }
}
</style>

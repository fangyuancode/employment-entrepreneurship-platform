<template>
  <div class="home-page" :class="{ 'is-ready': pageReady }">
    <HomeHero :nav-items="navItems" :metrics="heroMetrics" :entries="heroEntries" :tags="heroTags" @navigate="goPage" @scroll="scrollToSection" />

    <main class="home-content">
      <section ref="overviewRef" class="home-section overview-section" data-home-reveal>
        <HomeSectionTitle kicker="Platform Overview" title="把项目能力组织成清晰的展示入口" desc="首页不再只是功能堆叠，而是承担项目介绍、能力引导、快速跳转和比赛展示的统一入口。" />

        <div class="overview-grid">
          <article class="overview-card overview-main">
            <span class="card-label">重点推荐</span>
            <h3>从首页进入数字展厅，再进入大屏分析与 AI 应用模块</h3>
            <p>
              当前首页按照“项目理解—能力展示—数据洞察—功能落地”的顺序重新组织，适合比赛展示、答辩讲解和普通用户快速上手。
            </p>
            <div class="overview-actions">
              <el-button type="primary" @click="goPage('/exhibition')">进入数字展厅</el-button>
              <el-button @click="goPage('/jobscreen')">查看数据大屏</el-button>
            </div>
          </article>

          <article v-for="item in quickCards" :key="item.title" class="overview-card mini-overview" @click="goPage(item.path)">
            <span class="mini-icon">
              <component :is="item.icon" />
            </span>
            <h4>{{ item.title }}</h4>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>

      <section ref="capabilityRef" class="home-section" data-home-reveal>
        <HomeSectionTitle kicker="Core Capabilities" title="核心能力" desc="围绕就业分析、创业生成和智能办公三个方向，形成更清晰的能力分层。" />
        <HomeCapabilityShowcase :tabs="capabilityTabs" @navigate="goPage" />
      </section>

      <section ref="dataRef" class="home-section data-section" data-home-reveal>
        <HomeSectionTitle kicker="Data Intelligence" title="数据分析与展示入口" desc="将岗位大屏、数字展厅、技能图谱和 AI 问答作为首页的视觉重点，增强项目展示吸引力。" light />
        <HomeDataShowcase :cards="dataCards" @navigate="goPage" />
      </section>

      <section ref="matrixRef" class="home-section" data-home-reveal>
        <HomeSectionTitle kicker="Application Matrix" title="应用矩阵" desc="把分散的业务入口按使用场景聚合，用户能更快找到需要的功能。" />
        <HomeFeatureMatrix :groups="groupedFeatures" @navigate="goPage" />
      </section>

      <section ref="workflowRef" class="home-section" data-home-reveal>
        <HomeSectionTitle kicker="Workflow" title="推荐使用流程" desc="从确定场景、输入需求，到 AI 分析、结果展示，形成完整闭环。" />
        <HomeWorkflow :cards="workflowCards" />
      </section>

      <section class="home-section highlight-section" data-home-reveal>
        <HomeSectionTitle kicker="Project Value" title="项目亮点" desc="突出平台的真实数据、智能生成、可视化展示和模块化扩展价值。" />
        <div class="highlight-grid">
          <article v-for="item in highlights" :key="item.title" class="highlight-card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="home-footer">
      <div class="footer-inner">
        <div>
          <h2>AI 创业就业助手平台</h2>
          <p>
            基于 Vue3、Element Plus、ECharts、Spring Boot、Python 与 MySQL 构建，聚焦 AI 创业辅助、岗位分析、数据图谱和智能办公场景。
          </p>
        </div>
        <div class="footer-links">
          <button v-for="item in navItems" :key="item.key" type="button" @click="scrollToSection(item.key)">
            {{ item.label }}
          </button>
        </div>
      </div>
      <div class="footer-bottom">© 2026 AI 创业就业助手平台 · 智能引擎 · 网启新生</div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { markRaw, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Briefcase, ChatLineRound, DataAnalysis, Document, Grid } from '@element-plus/icons-vue'
import HomeCapabilityShowcase from './components/HomeCapabilityShowcase.vue'
import HomeDataShowcase from './components/HomeDataShowcase.vue'
import HomeFeatureMatrix from './components/HomeFeatureMatrix.vue'
import HomeHero from './components/HomeHero.vue'
import HomeSectionTitle from './components/HomeSectionTitle.vue'
import HomeWorkflow from './components/HomeWorkflow.vue'
import {
  capabilityTabs,
  dataCards,
  groupedFeatures,
  heroEntries,
  heroMetrics,
  heroTags,
  highlights,
  navItems,
  workflowCards
} from './data'

const router = useRouter()
const pageReady = ref(false)

const overviewRef = ref<HTMLElement | null>(null)
const capabilityRef = ref<HTMLElement | null>(null)
const dataRef = ref<HTMLElement | null>(null)
const matrixRef = ref<HTMLElement | null>(null)
const workflowRef = ref<HTMLElement | null>(null)

const sectionMap: Record<string, { value: HTMLElement | null }> = {
  overview: overviewRef,
  capability: capabilityRef,
  data: dataRef,
  matrix: matrixRef,
  workflow: workflowRef
}

const quickCards = [
  {
    title: '数字展厅',
    desc: '以沉浸式页面展示项目结构和核心模块。',
    path: '/exhibition',
    icon: markRaw(Grid)
  },
  {
    title: '大屏数据分析',
    desc: '展示岗位分布、薪资、技能和区域趋势。',
    path: '/jobscreen',
    icon: markRaw(DataAnalysis)
  },
  {
    title: 'AI就业助手',
    desc: '通过对话方式获得岗位解读与求职建议。',
    path: '/aichat',
    icon: markRaw(ChatLineRound)
  },

  {
    title: '岗位分析',
    desc: '进入岗位分析模块查看更细的数据结果。',
    path: '/toolbox/jobanalysis',
    icon: markRaw(Briefcase)
  }
]

let revealObserver: IntersectionObserver | null = null

const scrollToSection = (key: string) => {
  if (key === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const section = sectionMap[key]?.value
  if (!section) return
  section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const openResolved = (path: string) => {
  const url = router.resolve({ path })
  window.open(url.href)
}

const goPage = (path: string) => {
  if (!path) return

  if (path === '/jobscreen' || path === '/aichat' || path === '/toolbox/jobanalysis') {
    openResolved(path)
    return
  }

  router.push(path)
}

onMounted(async () => {
  await nextTick()
  requestAnimationFrame(() => {
    pageReady.value = true
  })

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.13, rootMargin: '0px 0px -60px 0px' }
  )

  document.querySelectorAll<HTMLElement>('[data-home-reveal]').forEach((section) => {
    revealObserver?.observe(section)
  })
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  revealObserver = null
})
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100%;
  overflow-x: hidden;
  color: #1f2937;
  background: radial-gradient(circle at 18% 18%, rgba(96, 165, 250, 0.14), transparent 28%),
    linear-gradient(180deg, #f4f8ff 0%, #eef4fb 42%, #f7f9fc 100%);
}

.home-content {
  position: relative;
  max-width: 1440px;
  margin: 0 auto;
  padding: 76px 28px 0;
}

.home-section {
  scroll-margin-top: 86px;
  margin-bottom: 76px;
}

[data-home-reveal] {
  opacity: 0;
  transform: translateY(34px);
  transition: opacity 0.66s ease, transform 0.66s cubic-bezier(0.2, 0.8, 0.2, 1);
}

[data-home-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) repeat(5, minmax(150px, 0.75fr));
  gap: 16px;
}

.overview-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 24px 54px rgba(15, 23, 42, 0.06);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}

.overview-card:hover {
  transform: translateY(-6px);
  border-color: rgba(59, 130, 246, 0.28);
  box-shadow: 0 28px 60px rgba(37, 99, 235, 0.1);
}

.overview-main {
  grid-column: span 2;
  padding: 28px;
  color: #fff;
  background: radial-gradient(circle at 88% 18%, rgba(125, 211, 252, 0.22), transparent 28%),
    linear-gradient(135deg, #0e1b30, #143a62);
}

.card-label {
  display: inline-flex;
  padding: 7px 13px;
  border-radius: 999px;
  color: #bae6fd;
  background: rgba(14, 165, 233, 0.14);
  border: 1px solid rgba(125, 211, 252, 0.2);
  font-size: 13px;
}

.overview-main h3 {
  max-width: 640px;
  margin: 20px 0 14px;
  font-size: 28px;
  line-height: 1.35;
}

.overview-main p {
  max-width: 660px;
  margin: 0;
  color: rgba(226, 232, 240, 0.76);
  font-size: 15px;
  line-height: 1.95;
}

.overview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.mini-overview {
  min-height: 226px;
  padding: 20px;
  cursor: pointer;
}

.mini-icon {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 17px;
  color: #2563eb;
  background: #eff6ff;
}

.mini-icon svg {
  width: 23px;
  height: 23px;
}

.mini-overview h4 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 17px;
}

.mini-overview p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.75;
}

.data-section {
  max-width: none;
  padding: 34px;
  border-radius: 34px;
  background: radial-gradient(circle at 82% 12%, rgba(56, 189, 248, 0.18), transparent 28%),
    radial-gradient(circle at 12% 85%, rgba(37, 99, 235, 0.16), transparent 30%),
    linear-gradient(135deg, #07111f, #0e223d 60%, #102f50);
  box-shadow: 0 32px 74px rgba(15, 23, 42, 0.15);
}

.highlight-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}

.highlight-card {
  min-height: 210px;
  padding: 24px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 26px;
  background: #fff;
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.06);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.highlight-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 54px rgba(37, 99, 235, 0.1);
}

.highlight-card h3 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 18px;
  line-height: 1.4;
}

.highlight-card p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.9;
}

.home-footer {
  margin-top: 80px;
  padding: 36px 28px 28px;
  color: #fff;
  background: radial-gradient(circle at 18% 0%, rgba(37, 99, 235, 0.26), transparent 34%), #0b1220;
}

.footer-inner,
.footer-bottom {
  max-width: 1440px;
  margin: 0 auto;
}

.footer-inner {
  display: flex;
  justify-content: space-between;
  gap: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.footer-inner h2 {
  margin: 0 0 12px;
  font-size: 22px;
}

.footer-inner p {
  max-width: 780px;
  margin: 0;
  color: rgba(226, 232, 240, 0.68);
  font-size: 14px;
  line-height: 1.9;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 12px;
  min-width: 360px;
}

.footer-links button {
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 999px;
  color: rgba(226, 232, 240, 0.75);
  background: rgba(15, 23, 42, 0.55);
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-links button:hover {
  color: #fff;
  border-color: rgba(125, 211, 252, 0.38);
}

.footer-bottom {
  padding-top: 18px;
  color: rgba(226, 232, 240, 0.52);
  font-size: 13px;
}

@media screen and (max-width: 1366px) {
  .overview-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .overview-main {
    grid-column: span 3;
  }

  .highlight-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 900px) {
  .home-content {
    padding: 56px 16px 0;
  }

  .home-section {
    margin-bottom: 58px;
  }

  .overview-grid,
  .highlight-grid {
    grid-template-columns: 1fr;
  }

  .overview-main {
    grid-column: auto;
  }

  .data-section {
    padding: 22px;
    border-radius: 26px;
  }

  .footer-inner {
    flex-direction: column;
  }

  .footer-links {
    justify-content: flex-start;
    min-width: 0;
  }
}
</style>

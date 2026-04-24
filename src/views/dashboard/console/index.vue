<template>
  <div class="console-page">
    <div class="console-banner art-card">
      <div class="banner-content">
        <div class="banner-text">
          <div class="banner-badge">{{ t('console.banner.badge') }}</div>
          <h2>{{ t('console.banner.title') }}</h2>
          <p>
            {{ t('console.banner.desc') }}
          </p>

          <div class="banner-tags">
            <span v-for="tag in bannerTags" :key="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="banner-side">
          <div class="highlight-card">
            <div class="highlight-label">{{ t('console.banner.highlightLabel') }}</div>
            <div class="highlight-value">{{ t('console.banner.highlightValue') }}</div>
            <div class="highlight-desc">{{ t('console.banner.highlightDesc') }}</div>
          </div>
        </div>
      </div>
    </div>

    <ElRow :gutter="20" class="mb-5">
      <ElCol v-for="item in overviewCards" :key="item.title" :xs="24" :sm="12" :lg="6">
        <div class="art-card overview-card">
          <div class="overview-main">
            <div>
              <div class="overview-title">{{ item.title }}</div>
              <div class="overview-value">{{ item.value }}</div>
              <div class="overview-footer">
                <span class="overview-label">{{ item.label }}</span>
                <span class="overview-trend" :class="item.trend.startsWith('+') ? 'up' : 'down'">
                  {{ item.trend }}
                </span>
              </div>
            </div>

            <div class="overview-icon">
              <ArtSvgIcon :icon="item.icon" />
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-5">
      <ElCol :xs="24" :lg="16">
        <div class="art-card chart-card">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ t('console.chart.trendTitle') }}</h4>
              <p>
                {{ t('console.chart.compareLastWeek') }}
                <span class="text-success">+18%</span>
              </p>
            </div>
          </div>

          <ArtLineChart
            height="340px"
            :data="trendData"
            :xAxisData="trendXAxis"
            :showAreaColor="true"
            :showAxisLine="false"
          />
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="8">
        <div class="art-card chart-card">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ t('console.chart.usageTitle') }}</h4>
              <p>{{ t('console.chart.usageDesc') }}</p>
            </div>
          </div>

          <ArtRingChart
            height="340px"
            :data="toolUsageData"
            :centerText="t('console.chart.centerText')"
            :showLegend="true"
            legendPosition="bottom"
          />
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20" class="mb-5">
      <ElCol :xs="24" :lg="10">
        <div class="art-card module-card">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ t('console.feature.title') }}</h4>
              <p>{{ t('console.feature.desc') }}</p>
            </div>
          </div>

          <div class="feature-list">
            <div class="feature-item" v-for="item in featureList" :key="item.title">
              <div class="feature-left">
                <div class="feature-icon">
                  <ArtSvgIcon :icon="item.icon" />
                </div>
                <div>
                  <div class="feature-title">{{ item.title }}</div>
                  <div class="feature-desc">{{ item.desc }}</div>
                </div>
              </div>
              <div class="feature-tag">{{ item.tag }}</div>
            </div>
          </div>
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="14">
        <div class="art-card module-card">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ t('console.progress.title') }}</h4>
              <p>{{ t('console.progress.desc') }}</p>
            </div>
          </div>

          <div class="progress-list">
            <div class="progress-item" v-for="item in progressList" :key="item.name">
              <div class="progress-head">
                <span>{{ item.name }}</span>
                <span>{{ item.percent }}%</span>
              </div>
              <ElProgress
                :percentage="item.percent"
                :stroke-width="8"
                :show-text="false"
                :color="item.color"
              />
              <div class="progress-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="20">
      <ElCol :xs="24" :lg="14">
        <div class="art-card module-card">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ t('console.task.title') }}</h4>
              <p>
                {{ t('console.task.pending') }}
                <span class="text-danger">{{ pendingTaskCount }}</span>
                {{ t('console.task.unit') }}
              </p>
            </div>
          </div>

          <div class="task-list">
            <div
              class="task-item"
              v-for="item in taskListView"
              :key="item.title"
              :class="{ done: item.done }"
            >
              <div class="task-main">
                <ElCheckbox v-model="item.done" />
                <div class="task-content">
                  <div class="task-title">{{ item.title }}</div>
                  <div class="task-meta">
                    <span>{{ item.time }}</span>
                    <span class="dot"></span>
                    <span>{{ item.owner }}</span>
                    <span class="dot"></span>
                    <span>{{ item.level }}</span>
                  </div>
                </div>
              </div>
              <ElTag :type="item.done ? 'success' : item.tagType" effect="light" round>
                {{ item.done ? t('console.task.doneText') : item.status }}
              </ElTag>
            </div>
          </div>
        </div>
      </ElCol>

      <ElCol :xs="24" :lg="10">
        <div class="art-card module-card">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ t('console.noticePanel.title') }}</h4>
              <p>{{ t('console.noticePanel.desc') }}</p>
            </div>
          </div>

          <div class="notice-list">
            <div class="notice-item" v-for="item in noticeList" :key="item.title">
              <div class="notice-top">
                <span class="notice-title">{{ item.title }}</span>
                <ElTag size="small" effect="light" :type="item.type">{{ item.tag }}</ElTag>
              </div>
              <div class="notice-desc">{{ item.desc }}</div>
            </div>
          </div>
        </div>
        <div class="art-card module-card quick-card">
          <div class="art-card-header">
            <div class="title">
              <h4>{{ t('console.summary.title') }}</h4>
              <p>{{ t('console.summary.desc') }}</p>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-item" v-for="item in summaryList" :key="item.label">
              <div class="summary-value">{{ item.value }}</div>
              <div class="summary-label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue'
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'Console' })

  const { t } = useI18n()

  const bannerTags = computed(() => [
    t('console.tags.businessPlan'),
    t('console.tags.productDesign'),
    t('console.tags.brandCopy'),
    t('console.tags.meeting'),
    t('console.tags.jobAnalysis'),
    t('console.tags.vehicle')
  ])

  const overviewCards = computed(() => [
    {
      title: t('console.overview.totalContent.title'),
      value: '1,286',
      label: t('console.overview.totalContent.label'),
      trend: '+12%',
      icon: 'ri:file-text-line'
    },
    {
      title: t('console.overview.activeTools.title'),
      value: '9',
      label: t('console.overview.activeTools.label'),
      trend: '+2',
      icon: 'ri:apps-2-line'
    },
    {
      title: t('console.overview.pendingPages.title'),
      value: '6',
      label: t('console.overview.pendingPages.label'),
      trend: '-1',
      icon: 'ri:layout-4-line'
    },
    {
      title: t('console.overview.projectProgress.title'),
      value: '78%',
      label: t('console.overview.projectProgress.label'),
      trend: '+8%',
      icon: 'ri:rocket-line'
    }
  ])

  const trendXAxis = computed(() => [
    t('console.week.mon'),
    t('console.week.tue'),
    t('console.week.wed'),
    t('console.week.thu'),
    t('console.week.fri'),
    t('console.week.sat'),
    t('console.week.sun')
  ])

  const trendData = [62, 88, 79, 118, 136, 101, 142]

  const toolUsageData = computed(() => [
    { name: t('console.tags.businessPlan'), value: 32 },
    { name: t('console.feature.items.productDesign.title'), value: 22 },
    { name: t('console.feature.items.brand.title'), value: 18 },
    { name: t('console.feature.items.meeting.title'), value: 15 },
    { name: t('console.feature.items.job.title'), value: 8 },
    { name: t('console.tags.vehicle'), value: 5 }
  ])

  const featureList = computed(() => [
    {
      title: t('console.feature.items.businessPlan.title'),
      desc: t('console.feature.items.businessPlan.desc'),
      tag: t('console.feature.tags.highFreq'),
      icon: 'ri:article-line'
    },
    {
      title: t('console.feature.items.productDesign.title'),
      desc: t('console.feature.items.productDesign.desc'),
      tag: t('console.feature.tags.recommend'),
      icon: 'ri:palette-line'
    },
    {
      title: t('console.feature.items.brand.title'),
      desc: t('console.feature.items.brand.desc'),
      tag: t('console.feature.tags.content'),
      icon: 'ri:quill-pen-line'
    },
    {
      title: t('console.feature.items.meeting.title'),
      desc: t('console.feature.items.meeting.desc'),
      tag: t('console.feature.tags.efficiency'),
      icon: 'ri:task-line'
    },
    {
      title: t('console.feature.items.job.title'),
      desc: t('console.feature.items.job.desc'),
      tag: t('console.feature.tags.data'),
      icon: 'ri:bar-chart-box-line'
    }
  ])

  const progressList = computed(() => [
    {
      name: t('console.progress.items.businessPlan.name'),
      percent: 92,
      color: 'var(--art-primary)',
      desc: t('console.progress.items.businessPlan.desc')
    },
    {
      name: t('console.progress.items.productDesign.name'),
      percent: 81,
      color: 'var(--art-success)',
      desc: t('console.progress.items.productDesign.desc')
    },
    {
      name: t('console.progress.items.job.name'),
      percent: 74,
      color: 'var(--art-warning)',
      desc: t('console.progress.items.job.desc')
    },
    {
      name: t('console.progress.items.console.name'),
      percent: 68,
      color: 'var(--art-info)',
      desc: t('console.progress.items.console.desc')
    }
  ])

  const taskList = reactive([
    {
      titleKey: 'console.task.items.item1.title',
      timeKey: 'console.task.items.item1.time',
      ownerKey: 'console.task.owner.frontend',
      levelKey: 'console.task.level.high',
      statusKey: 'console.task.status.doing',
      tagType: 'warning',
      done: false
    },
    {
      titleKey: 'console.task.items.item2.title',
      timeKey: 'console.task.items.item2.time',
      ownerKey: 'console.task.owner.frontend',
      levelKey: 'console.task.level.medium',
      statusKey: 'console.task.status.pending',
      tagType: 'info',
      done: false
    },
    {
      titleKey: 'console.task.items.item3.title',
      timeKey: 'console.task.items.item3.time',
      ownerKey: 'console.task.owner.designFrontend',
      levelKey: 'console.task.level.medium',
      statusKey: 'console.task.status.pending',
      tagType: 'info',
      done: false
    },
    {
      titleKey: 'console.task.items.item4.title',
      timeKey: 'console.task.items.item4.time',
      ownerKey: 'console.task.owner.fullstack',
      levelKey: 'console.task.level.high',
      statusKey: 'console.task.status.done',
      tagType: 'success',
      done: true
    },
    {
      titleKey: 'console.task.items.item5.title',
      timeKey: 'console.task.items.item5.time',
      ownerKey: 'console.task.owner.backend',
      levelKey: 'console.task.level.low',
      statusKey: 'console.task.status.done',
      tagType: 'success',
      done: true
    }
  ])

  const taskListView = computed(() =>
    taskList.map((item) => ({
      ...item,
      title: t(item.titleKey),
      time: t(item.timeKey),
      owner: t(item.ownerKey),
      level: t(item.levelKey),
      status: t(item.statusKey)
    }))
  )

  const noticeList = computed(() => [
    {
      title: t('console.noticePanel.items.item1.title'),
      desc: t('console.noticePanel.items.item1.desc'),
      tag: t('console.noticePanel.tags.suggestion'),
      type: 'primary'
    },
    {
      title: t('console.noticePanel.items.item2.title'),
      desc: t('console.noticePanel.items.item2.desc'),
      tag: t('console.noticePanel.tags.extendable'),
      type: 'success'
    },
    {
      title: t('console.noticePanel.items.item3.title'),
      desc: t('console.noticePanel.items.item3.desc'),
      tag: t('console.noticePanel.tags.structure'),
      type: 'warning'
    }
  ])
  const summaryList = computed(() => [
    { label: t('console.summary.items.generateCount'), value: '43' },
    { label: t('console.summary.items.pendingPages'), value: '6' },
    { label: t('console.summary.items.doneTasks'), value: '12' },
    { label: t('console.summary.items.activeModules'), value: '9' }
  ])

  const pendingTaskCount = computed(() => taskList.filter((item) => !item.done).length)
</script>

<style scoped lang="scss">
  .console-page {
    .mb-5 {
      margin-bottom: 20px;
    }
  }

  .console-banner {
    padding: 26px 28px;
    margin-bottom: 20px;
    overflow: hidden;
  }

  .banner-content {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 20px;
  }

  .banner-text {
    flex: 1;
    min-width: 0;

    h2 {
      margin: 14px 0 12px;
      font-size: 28px;
      font-weight: 600;
      line-height: 1.35;
      color: var(--art-text-gray-900);
    }

    p {
      max-width: 820px;
      margin: 0;
      font-size: 14px;
      line-height: 1.9;
      color: var(--art-text-gray-700);
    }
  }

  .banner-badge {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 999px;
  }

  .banner-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;

    span {
      padding: 8px 12px;
      font-size: 13px;
      color: var(--art-text-gray-700);
      background: var(--art-gray-100);
      border: 1px solid var(--art-border-color);
      border-radius: 999px;
    }
  }

  .banner-side {
    width: 280px;
    flex-shrink: 0;
  }

  .highlight-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    min-height: 150px;
    padding: 22px;
    background: var(--art-gray-100);
    border: 1px solid var(--art-border-color);
    border-radius: 18px;
  }

  .highlight-label {
    font-size: 13px;
    color: var(--art-text-gray-600);
  }

  .highlight-value {
    margin-top: 10px;
    font-size: 22px;
    font-weight: 600;
    color: var(--art-text-gray-900);
  }

  .highlight-desc {
    margin-top: 8px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--art-text-gray-600);
  }

  .overview-card {
    height: 138px;
    padding: 20px;
    margin-bottom: 0;
  }

  .overview-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    gap: 12px;
  }

  .overview-title {
    font-size: 14px;
    color: var(--art-text-gray-600);
  }

  .overview-value {
    margin-top: 10px;
    font-size: 32px;
    font-weight: 600;
    line-height: 1;
    color: var(--art-text-gray-900);
  }

  .overview-footer {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    font-size: 13px;
  }

  .overview-label {
    color: var(--art-text-gray-500);
  }

  .overview-trend {
    font-weight: 600;

    &.up {
      color: var(--art-success);
    }

    &.down {
      color: var(--art-danger);
    }
  }

  .overview-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 54px;
    height: 54px;
    font-size: 24px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 16px;
    flex-shrink: 0;
  }

  .chart-card,
  .module-card {
    padding: 20px;
  }

  .feature-list,
  .progress-list,
  .task-list,
  .notice-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 8px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    background: var(--art-gray-100);
    border: 1px solid var(--art-border-color);
    border-radius: 14px;
  }

  .feature-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
  }

  .feature-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    font-size: 20px;
    color: var(--el-color-primary);
    background: #fff;
    border-radius: 12px;
    flex-shrink: 0;
  }

  .feature-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--art-text-gray-900);
  }

  .feature-desc {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.7;
    color: var(--art-text-gray-600);
  }

  .feature-tag {
    padding: 6px 10px;
    font-size: 12px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-radius: 999px;
    white-space: nowrap;
  }

  .progress-item {
    padding: 14px 16px;
    background: var(--art-gray-100);
    border: 1px solid var(--art-border-color);
    border-radius: 14px;
  }

  .progress-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 14px;
    font-weight: 600;
    color: var(--art-text-gray-900);
  }

  .progress-desc {
    margin-top: 10px;
    font-size: 13px;
    color: var(--art-text-gray-600);
    line-height: 1.7;
  }

  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    background: var(--art-gray-100);
    border: 1px solid var(--art-border-color);
    border-radius: 14px;

    &.done {
      opacity: 0.86;
    }
  }

  .task-main {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
    flex: 1;
  }

  .task-content {
    min-width: 0;
  }

  .task-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--art-text-gray-900);
    line-height: 1.7;
  }

  .task-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
    font-size: 12px;
    color: var(--art-text-gray-500);
  }

  .dot {
    width: 4px;
    height: 4px;
    background: var(--art-text-gray-400);
    border-radius: 50%;
  }

  .notice-item {
    padding: 16px;
    background: var(--art-gray-100);
    border: 1px solid var(--art-border-color);
    border-radius: 14px;
  }

  .notice-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .notice-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--art-text-gray-900);
  }

  .notice-desc {
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.8;
    color: var(--art-text-gray-600);
  }

  .quick-card {
    margin-top: 20px;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 8px;
  }

  .summary-item {
    padding: 18px 16px;
    text-align: center;
    background: var(--art-gray-100);
    border: 1px solid var(--art-border-color);
    border-radius: 14px;
  }

  .summary-value {
    font-size: 26px;
    font-weight: 600;
    color: var(--art-text-gray-900);
    line-height: 1;
  }

  .summary-label {
    margin-top: 10px;
    font-size: 13px;
    color: var(--art-text-gray-600);
  }

  @media (max-width: 1200px) {
    .banner-content {
      flex-direction: column;
    }

    .banner-side {
      width: 100%;
    }

    .highlight-card {
      min-height: auto;
    }
  }

  @media (max-width: 768px) {
    .console-banner {
      padding: 20px;
    }

    .banner-text {
      h2 {
        font-size: 22px;
      }
    }

    .overview-card {
      margin-bottom: 20px;
    }

    .summary-grid {
      grid-template-columns: 1fr;
    }

    .task-item,
    .feature-item,
    .notice-top {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

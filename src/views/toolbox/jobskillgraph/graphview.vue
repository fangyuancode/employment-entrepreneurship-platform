<template>
  <div class="graph-view-page">
    <el-card shadow="never" class="toolbar-card">
      <div class="toolbar-header">
        <div>
          <h2 class="page-title">岗位技能图谱大屏</h2>
          <p class="page-desc">支持拖拽、缩放、节点高亮与关系语义展示，适合单独查看复杂关系图</p>
        </div>

        <div class="toolbar-actions">
          <el-button type="primary" @click="handleQuery">刷新图谱</el-button>
          <el-button @click="handleReset">重置条件</el-button>
        </div>
      </div>

      <el-form :inline="true" :model="queryForm" class="filter-form">
        <el-form-item label="关键词">
          <el-input
            v-model="queryForm.keyword"
            placeholder="岗位 / 技能 / 公司"
            clearable
            style="width: 220px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="城市">
          <el-select
            v-model="queryForm.city"
            placeholder="请选择城市"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option v-for="item in options.cities" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select
            v-model="queryForm.categoryMain"
            placeholder="请选择分类"
            clearable
            filterable
            style="width: 180px"
          >
            <el-option
              v-for="item in options.categoryMains"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="数量">
          <el-select v-model="queryForm.limit" style="width: 120px">
            <el-option :value="150" label="150" />
            <el-option :value="300" label="300" />
            <el-option :value="500" label="500" />
            <el-option :value="800" label="800" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="graph-card">
      <template #header>
        <div class="graph-header">
          <div class="graph-stat">
            <el-tag type="primary">岗位记录：{{ graphData.jobCount }}</el-tag>
            <el-tag type="success">技能数：{{ graphData.skillCount }}</el-tag>
            <el-tag type="warning">公司数：{{ graphData.companyCount }}</el-tag>
          </div>

          <div class="graph-tip">
            鼠标滚轮缩放，拖动画布移动，点击节点查看关系详情，悬浮边查看关系类型
          </div>
        </div>
      </template>

      <div v-loading="loading" ref="graphRef" class="graph-box"></div>
    </el-card>

    <el-drawer v-model="relationDrawerVisible" title="节点关系详情" size="50%">
      <div class="drawer-content">
        <div class="drawer-title">当前节点：{{ currentNodeName || '-' }}</div>

        <el-table :data="nodeRelations" border stripe style="width: 100%">
          <el-table-column prop="source" label="源实体" min-width="180" show-overflow-tooltip />
          <el-table-column prop="target" label="目标实体" min-width="180" show-overflow-tooltip />
          <el-table-column prop="relationType" label="关系类型" width="120" />
          <el-table-column prop="relationDesc" label="关系说明" min-width="220" />
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { echarts } from '@/plugins/echarts'
  import {
    enhanceJobSkillRelations,
    getJobSkillGraphData,
    getJobSkillGraphOptions,
    getJobSkillNodeRelations,
    type GraphData,
    type GraphLinkItem
  } from '@/api/job-skill-graph'

  const route = useRoute()

  const loading = ref(false)
  const relationDrawerVisible = ref(false)
  const currentNodeName = ref('')
  const nodeRelations = ref<any[]>([])

  const graphRef = ref<HTMLDivElement | null>(null)
  let graphChart: any = null

  const queryForm = reactive({
    keyword: '',
    city: '',
    categoryMain: '',
    limit: 500
  })

  const options = reactive({
    cities: [] as string[],
    categoryMains: [] as string[]
  })

  const graphData = reactive<GraphData>({
    nodes: [],
    links: [],
    topSkills: [],
    categoryDistribution: [],
    jobCount: 0,
    skillCount: 0,
    companyCount: 0
  })

  const initFromRoute = () => {
    queryForm.keyword = String(route.query.keyword || '')
    queryForm.city = String(route.query.city || '')
    queryForm.categoryMain = String(route.query.categoryMain || '')
    queryForm.limit = Number(route.query.limit || 500)
  }

  const initChart = () => {
    if (graphRef.value) {
      graphChart = echarts.init(graphRef.value)
    }
  }

  const renderGraphChart = () => {
    if (!graphChart) return

    graphChart.setOption({
      backgroundColor: '#ffffff',
      tooltip: {
        formatter: (params: any) => {
          if (params.dataType === 'edge') {
            const data = params.data || {}
            return `
            <div style="line-height: 1.8">
              <div><strong>关系类型：</strong>${data.relationType || '关联'}</div>
              <div><strong>关系标签：</strong>${data.relationLabel || '-'}</div>
              <div><strong>关系说明：</strong>${data.aiRelationDesc || data.relationDesc || '-'}</div>
              <div><strong>关系强度：</strong>${data.value || 0}</div>
              <div><strong>强度等级：</strong>${data.strengthLevel || '-'}</div>
            </div>
          `
          }
          return `${params.data.rawCategory}<br/>${params.data.name}`
        }
      },
      legend: {
        top: 10,
        data: ['技能', '岗位', '公司', '城市', '分类']
      },
      animationDuration: 800,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          focusNodeAdjacency: true,
          selectedMode: 'single',
          label: {
            show: true,
            position: 'right',
            color: '#333',
            fontSize: 13
          },
          edgeLabel: {
            show: true,
            formatter: (params: any) => params?.data?.relationLabel || '',
            fontSize: 11
          },
          force: {
            repulsion: 320,
            gravity: 0.06,
            edgeLength: [120, 220]
          },
          lineStyle: {
            color: 'source',
            curveness: 0.16,
            opacity: 0.55,
            width: 1.4
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 2.8,
              opacity: 0.95
            },
            label: {
              fontSize: 14
            }
          },
          categories: [
            { name: '技能' },
            { name: '岗位' },
            { name: '公司' },
            { name: '城市' },
            { name: '分类' }
          ],
          data: graphData.nodes.map((item) => ({
            ...item,
            rawCategory: item.category,
            category: ['技能', '岗位', '公司', '城市', '分类'].indexOf(item.category),
            value: item.symbolSize
          })),
          links: graphData.links
        }
      ]
    })

    graphChart.off('click')
    graphChart.on('click', async (params: any) => {
      if (params.dataType === 'node') {
        const node = params.data
        currentNodeName.value = node?.name || ''
        relationDrawerVisible.value = true

        try {
          const res = await getJobSkillNodeRelations({
            nodeId: node?.id,
            keyword: queryForm.keyword
          })
          nodeRelations.value = res?.data?.data?.relations || []
        } catch (error) {
          console.error('节点关系加载失败：', error)
          ElMessage.error('节点关系加载失败')
          nodeRelations.value = []
        }
      }
    })
  }

  const loadOptions = async () => {
    try {
      const res = await getJobSkillGraphOptions()
      const data = res?.data?.data || {}
      options.cities = data.cities || []
      options.categoryMains = data.categoryMains || []
    } catch (error) {
      console.error('图谱筛选项加载失败：', error)
      ElMessage.error('筛选项加载失败')
    }
  }

  const loadGraphData = async () => {
    loading.value = true
    try {
      const res = await getJobSkillGraphData({ ...queryForm })
      const data = res?.data?.data || {}

      graphData.nodes = data.nodes || []
      graphData.links = data.links || []
      graphData.topSkills = data.topSkills || []
      graphData.categoryDistribution = data.categoryDistribution || []
      graphData.jobCount = data.jobCount || 0
      graphData.skillCount = data.skillCount || 0
      graphData.companyCount = data.companyCount || 0

      if (graphData.links.length) {
        try {
          const enhanceRes = await enhanceJobSkillRelations({
            links: graphData.links as GraphLinkItem[],
            enableAi: true
          })
          graphData.links = enhanceRes?.data?.data || graphData.links
        } catch (e) {
          console.warn('AI关系增强失败，已回退基础关系数据', e)
        }
      }

      await nextTick()
      renderGraphChart()
    } catch (error) {
      console.error('图谱加载失败：', error)
      ElMessage.error('图谱加载失败')
    } finally {
      loading.value = false
    }
  }

  const handleQuery = () => {
    loadGraphData()
  }

  const handleReset = () => {
    queryForm.keyword = ''
    queryForm.city = ''
    queryForm.categoryMain = ''
    queryForm.limit = 500
    loadGraphData()
  }

  const resizeChart = () => {
    graphChart?.resize()
  }

  onMounted(async () => {
    initFromRoute()
    await nextTick()
    initChart()
    await loadOptions()
    await loadGraphData()
    window.addEventListener('resize', resizeChart)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeChart)
    graphChart?.dispose()
  })
</script>

<style scoped lang="scss">
  .graph-view-page {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100vh;
    box-sizing: border-box;
  }

  .toolbar-card,
  .graph-card {
    border-radius: 14px;
  }

  .toolbar-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
    flex-wrap: wrap;
  }

  .page-title {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
    color: #303133;
  }

  .page-desc {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }

  .graph-card {
    margin-top: 18px;
  }

  .graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
  }

  .graph-stat {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .graph-tip {
    font-size: 13px;
    color: #909399;
  }

  .graph-box {
    width: 100%;
    height: calc(100vh - 250px);
    min-height: 700px;
  }

  .drawer-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .drawer-title {
    font-size: 16px;
    font-weight: 700;
    color: #303133;
  }

  @media screen and (max-width: 768px) {
    .graph-view-page {
      padding: 12px;
    }

    .graph-box {
      height: calc(100vh - 220px);
      min-height: 520px;
    }
  }
</style>

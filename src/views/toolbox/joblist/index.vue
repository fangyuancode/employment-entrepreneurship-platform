<template>
  <div class="joblist-page">
    <el-card shadow="never" class="page-card">
      <template #header>
        <div class="page-header">
          <div class="title-wrap">
            <h2 class="page-title">工作岗位列表</h2>
            <p class="page-desc"> 支持关键词搜索、条件筛选、分页查看与岗位详情展示 </p>
          </div>
          <div class="header-stat">
            <span class="stat-label">岗位总数</span>
            <span class="stat-value">{{ total }}</span>
          </div>
        </div>
      </template>

      <div class="filter-panel">
        <el-form :inline="true" :model="queryForm" class="filter-form">
          <el-form-item label="关键词">
            <el-input
              v-model="queryForm.keyword"
              placeholder="职位 / 公司 / 领域 / 技能 / 福利"
              clearable
              style="width: 240px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item label="公司名">
            <el-input
              v-model="queryForm.companyName"
              placeholder="请输入公司名"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>

          <el-form-item label="城市">
            <el-select
              v-model="queryForm.city"
              placeholder="请选择城市"
              clearable
              filterable
              style="width: 160px"
            >
              <el-option v-for="item in options.cities" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <el-form-item label="学历">
            <el-select
              v-model="queryForm.degree"
              placeholder="请选择学历"
              clearable
              filterable
              style="width: 160px"
            >
              <el-option v-for="item in options.degrees" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>

          <el-form-item label="经验">
            <el-select
              v-model="queryForm.experience"
              placeholder="请选择经验"
              clearable
              filterable
              style="width: 160px"
            >
              <el-option
                v-for="item in options.experiences"
                :key="item"
                :label="item"
                :value="item"
              />
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

          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-panel">
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          stripe
          style="width: 100%"
          empty-text="暂无岗位数据"
        >
          <el-table-column type="index" label="#" width="60" align="center" />

          <el-table-column prop="jobName" label="职位" min-width="180" show-overflow-tooltip />

          <el-table-column
            prop="salary"
            label="薪资"
            width="120"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column prop="degree" label="学历" width="100" align="center" />

          <el-table-column
            prop="experience"
            label="经验"
            width="120"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column prop="companyName" label="公司" min-width="180" show-overflow-tooltip />

          <el-table-column prop="industry" label="领域" min-width="140" show-overflow-tooltip />

          <el-table-column prop="city" label="城市" width="100" align="center" />

          <el-table-column
            prop="district"
            label="区域"
            width="120"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column
            prop="categoryMain"
            label="分类"
            width="140"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column label="操作" width="120" align="center" fixed="right">
            <template #default="scope">
              <el-button type="primary" link @click="handleViewDetail(scope.row)"> 查看 </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrap">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            :current-page="queryForm.pageNum"
            :page-size="queryForm.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="岗位详情" width="820px" destroy-on-close>
      <div v-loading="detailLoading" class="detail-wrap" v-if="detailData">
        <div class="detail-header">
          <div>
            <h3 class="detail-title">{{ detailData.jobName || '-' }}</h3>
            <div class="detail-subtitle">
              <span>{{ detailData.companyName || '-' }}</span>
              <span class="split-dot">·</span>
              <span>{{ detailData.salary || '-' }}</span>
            </div>
          </div>
          <el-tag type="primary" effect="light">
            {{ detailData.categoryMain || '未分类' }}
          </el-tag>
        </div>

        <el-descriptions :column="2" border class="detail-desc">
          <el-descriptions-item label="职位">
            {{ detailData.jobName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="公司">
            {{ detailData.companyName || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="薪资">
            {{ detailData.salary || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="学历">
            {{ detailData.degree || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="经验">
            {{ detailData.experience || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="领域">
            {{ detailData.industry || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="公司规模">
            {{ detailData.companySize || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="融资性质">
            {{ detailData.financingStage || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="城市">
            {{ detailData.city || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="区域">
            {{ detailData.district || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="商圈">
            {{ detailData.businessArea || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="二级分类">
            {{ detailData.categorySub || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="纬度">
            {{ detailData.latitude ?? '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="经度">
            {{ detailData.longitude ?? '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="来源文件" :span="2">
            {{ detailData.sourceFile || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="detail-section">
          <div class="section-title">技能列表</div>
          <div class="section-content">
            <template v-if="parseArrayLike(detailData.skills).length">
              <el-tag
                v-for="(item, index) in parseArrayLike(detailData.skills)"
                :key="'skill-' + index"
                class="tag-item"
                effect="plain"
              >
                {{ item }}
              </el-tag>
            </template>
            <span v-else>{{ detailData.skills || '暂无技能信息' }}</span>
          </div>
        </div>

        <div class="detail-section">
          <div class="section-title">福利列表</div>
          <div class="section-content">
            <template v-if="parseArrayLike(detailData.welfare).length">
              <el-tag
                v-for="(item, index) in parseArrayLike(detailData.welfare)"
                :key="'welfare-' + index"
                class="tag-item"
                type="success"
                effect="plain"
              >
                {{ item }}
              </el-tag>
            </template>
            <span v-else>{{ detailData.welfare || '暂无福利信息' }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, watch } from 'vue'
  import { ElMessage } from 'element-plus'
  import { useRoute } from 'vue-router'
  import { getJobDetail, getJobOptions, getJobPage, type JobItem } from '@/api/job-list'

  const route = useRoute()

  const loading = ref(false)
  const detailLoading = ref(false)
  const detailVisible = ref(false)

  const total = ref(0)
  const tableData = ref<JobItem[]>([])
  const detailData = ref<JobItem | null>(null)
  const routeJobId = ref<number | null>(null)

  const queryForm = reactive({
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    city: '',
    degree: '',
    experience: '',
    categoryMain: '',
    companyName: ''
  })

  const options = reactive({
    cities: [] as string[],
    degrees: [] as string[],
    experiences: [] as string[],
    categoryMains: [] as string[]
  })

  const getQueryString = (value: unknown) => {
    if (Array.isArray(value)) return String(value[0] || '')
    return typeof value === 'string' ? value : ''
  }

  const applyRouteQuery = () => {
    const query = route.query

    queryForm.keyword = getQueryString(query.keyword)
    queryForm.companyName = getQueryString(query.companyName)
    queryForm.city = getQueryString(query.city)
    queryForm.degree = getQueryString(query.degree)
    queryForm.experience = getQueryString(query.experience)
    queryForm.categoryMain = getQueryString(query.categoryMain)
    queryForm.pageNum = Number(getQueryString(query.pageNum)) || 1

    const jobId = Number(getQueryString(query.jobId))
    routeJobId.value = Number.isFinite(jobId) && jobId > 0 ? jobId : null
  }

  const getPageData = async () => {
    loading.value = true
    try {
      const data = await getJobPage({ ...queryForm }) || {}

      tableData.value = data.list || []
      total.value = data.total || 0
      queryForm.pageNum = data.pageNum || queryForm.pageNum
      queryForm.pageSize = data.pageSize || queryForm.pageSize
    } catch (error) {
      console.error('岗位分页查询失败：', error)
      ElMessage.error('岗位列表加载失败')
    } finally {
      loading.value = false
    }
  }

  const getOptionData = async () => {
    try {
      const data = await getJobOptions() || {}

      options.cities = data.cities || []
      options.degrees = data.degrees || []
      options.experiences = data.experiences || []
      options.categoryMains = data.categoryMains || []
    } catch (error) {
      console.error('岗位筛选项加载失败：', error)
      ElMessage.error('筛选项加载失败')
    }
  }

  const handleSearch = () => {
    queryForm.pageNum = 1
    getPageData()
  }

  const handleReset = () => {
    queryForm.pageNum = 1
    queryForm.pageSize = 10
    queryForm.keyword = ''
    queryForm.city = ''
    queryForm.degree = ''
    queryForm.experience = ''
    queryForm.categoryMain = ''
    queryForm.companyName = ''
    getPageData()
  }

  const handleCurrentChange = (page: number) => {
    queryForm.pageNum = page
    getPageData()
  }

  const handleSizeChange = (size: number) => {
    queryForm.pageSize = size
    queryForm.pageNum = 1
    getPageData()
  }

  const handleViewDetail = async (row: JobItem) => {
    if (!row?.id) {
      ElMessage.warning('岗位ID不存在')
      return
    }

    detailVisible.value = true
    detailLoading.value = true
    detailData.value = null

    try {
      detailData.value = await getJobDetail(row.id)
    } catch (error) {
      console.error('岗位详情查询失败：', error)
      ElMessage.error('岗位详情加载失败')
    } finally {
      detailLoading.value = false
    }
  }

  const openRouteJobDetail = async () => {
    if (!routeJobId.value) return

    const jobId = routeJobId.value
    const matchedRow = tableData.value.find((item) => Number(item.id) === jobId)

    if (matchedRow) {
      await handleViewDetail(matchedRow)
      return
    }

    detailVisible.value = true
    detailLoading.value = true
    detailData.value = null

    try {
      detailData.value = await getJobDetail(jobId)
    } catch (error) {
      console.error('路由岗位详情查询失败：', error)
      ElMessage.error('岗位详情加载失败')
    } finally {
      detailLoading.value = false
    }
  }

  const parseArrayLike = (value?: string) => {
    if (!value) return []

    const text = String(value).trim()
    if (!text) return []

    try {
      const json = JSON.parse(text)
      if (Array.isArray(json)) {
        return json.map((item) => String(item)).filter(Boolean)
      }
    } catch (e) {
      // 忽略 JSON 解析异常，继续按普通字符串切分
    }

    return text
      .replace(/[\[\]"]/g, '')
      .split(/[、,，;；|]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  const reloadByRouteQuery = async () => {
    applyRouteQuery()
    await getPageData()
    await openRouteJobDetail()
  }

  onMounted(async () => {
    await getOptionData()
    await reloadByRouteQuery()
  })

  watch(
    () => route.query,
    async () => {
      await reloadByRouteQuery()
    }
  )
</script>

<style scoped>
  .joblist-page {
    padding: 20px;
    background: #f5f7fa;
    min-height: 100%;
    box-sizing: border-box;
  }

  .page-card {
    border-radius: 14px;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .title-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .page-title {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #303133;
  }

  .page-desc {
    margin: 0;
    font-size: 14px;
    color: #909399;
  }

  .header-stat {
    min-width: 120px;
    padding: 12px 18px;
    border-radius: 12px;
    background: linear-gradient(135deg, #ecf5ff, #f4f9ff);
    border: 1px solid #d9ecff;
    text-align: center;
  }

  .stat-label {
    display: block;
    font-size: 13px;
    color: #909399;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #409eff;
  }

  .filter-panel {
    margin-bottom: 18px;
    padding: 18px 18px 0;
    border-radius: 12px;
    background: #fafafa;
    border: 1px solid #ebeef5;
  }

  .filter-form {
    display: flex;
    flex-wrap: wrap;
  }

  .table-panel {
    margin-top: 8px;
  }

  .pagination-wrap {
    margin-top: 18px;
    display: flex;
    justify-content: flex-end;
  }

  .detail-wrap {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    padding: 0 4px;
  }

  .detail-title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    color: #303133;
  }

  .detail-subtitle {
    color: #606266;
    font-size: 14px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  .split-dot {
    color: #c0c4cc;
  }

  .detail-desc {
    margin-top: 6px;
  }

  .detail-section {
    padding: 16px;
    border-radius: 12px;
    background: #fafafa;
    border: 1px solid #ebeef5;
  }

  .section-title {
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 700;
    color: #303133;
  }

  .section-content {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    line-height: 1.8;
    color: #606266;
  }

  .tag-item {
    margin-right: 0;
  }

  :deep(.el-card__header) {
    padding-bottom: 18px;
  }

  :deep(.el-dialog__body) {
    padding-top: 18px;
  }

  @media screen and (max-width: 768px) {
    .joblist-page {
      padding: 12px;
    }

    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-stat {
      width: 100%;
    }

    .pagination-wrap {
      justify-content: center;
    }

    .detail-header {
      flex-direction: column;
    }
  }
</style>

<template>
  <div class="job-collect-page">
    <div class="card page-header">
      <h2>工作岗位采集</h2>
      <p>选择城市与岗位，调用 Python 采集服务抓取职位信息，并支持预览和下载 CSV。</p>
    </div>

    <div class="layout">
      <div class="card form-card">
        <div class="section-title">采集参数</div>

        <div class="tips-box"> 可使用“一键填充示例”快速填入“软件开发”岗位采集参数。 </div>

        <el-form label-width="90px">
          <el-form-item label="城市选择">
            <el-select v-model="form.cityCode" filterable clearable placeholder="请选择城市" style="width: 100%">
              <el-option v-for="item in cityOptions" :key="item.code" :label="`${item.name}（${item.code}）`" :value="item.code" />
            </el-select>
          </el-form-item>

          <el-form-item label="搜索岗位">
            <el-input v-model="jobKeyword" placeholder="输入岗位名 / 分类 / 编码" clearable @input="handleJobSearch" />
          </el-form-item>

          <el-form-item label="岗位选择">
            <el-select v-model="selectedSearchCode" filterable clearable placeholder="请选择岗位" style="width: 100%" @change="handleJobChange">
              <el-option v-for="item in filteredJobOptions" :key="`${item.searchCode}_${item.jobName}`" :label="`${item.mainCategory} / ${item.subCategory} / ${item.jobName}（${item.searchCode}）`" :value="item.searchCode" />
            </el-select>
          </el-form-item>

          <el-form-item label="岗位名称">
            <el-input v-model="form.jobName" disabled />
          </el-form-item>

          <el-form-item label="主分类">
            <el-input v-model="form.mainCategory" disabled />
          </el-form-item>

          <el-form-item label="子分类">
            <el-input v-model="form.subCategory" disabled />
          </el-form-item>

          <el-form-item label="搜索编码">
            <el-input v-model="form.searchCode" disabled />
          </el-form-item>

          <el-form-item label="采集页数">
            <el-input-number v-model="form.maxPages" :min="1" :max="20" />
          </el-form-item>
        </el-form>

        <div class="form-footer">
          <el-button @click="fillSoftwareExample">一键填充示例</el-button>
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" :loading="crawlLoading" @click="handleCrawl">
            开始采集
          </el-button>
        </div>
      </div>

      <div class="right-panel">
        <div class="card result-card">
          <div class="section-head">
            <div class="section-title">采集结果预览</div>
            <div class="actions">
              <el-button size="small" @click="loadResults">刷新结果列表</el-button>
            </div>
          </div>

          <div class="summary-box">
            <div>当前城市：{{ currentCityName }}</div>
            <div>当前岗位：{{ form.jobName || '-' }}</div>
            <div>采集数量：{{ previewRows.length }}</div>
            <div>结果文件：{{ latestFileName || '-' }}</div>
          </div>

          <el-table :data="previewRows" border stripe max-height="420">
            <el-table-column prop="职位" label="职位" min-width="160" />
            <el-table-column prop="薪资" label="薪资" width="120" />
            <el-table-column prop="学历" label="学历" width="100" />
            <el-table-column prop="经验" label="经验" width="100" />
            <el-table-column prop="公司" label="公司" min-width="180" />
            <el-table-column prop="城市" label="城市" width="100" />
            <el-table-column prop="区域" label="区域" width="100" />
          </el-table>
        </div>

        <div class="card result-card">
          <div class="section-head">
            <div class="section-title">结果文件列表</div>
          </div>

          <el-table :data="resultFiles" border stripe max-height="320">
            <el-table-column prop="fileName" label="文件名" min-width="220" />
            <el-table-column label="大小(KB)" width="100">
              <template #default="{ row }">
                {{ (Number(row.size || 0) / 1024).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template #default="{ row }">
                <el-button size="small" @click="handlePreview(row.fileName)">预览</el-button>
                <el-button size="small" type="primary" @click="handleDownload(row.fileName)">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  buildDownloadUrl,
  crawlOneJob,
  getFlatJobList,
  getJobCollectResults,
  previewCollectedCsv
} from '@/api/job-collect'

const crawlLoading = ref(false)
const selectedSearchCode = ref('')
const latestFileName = ref('')
const jobKeyword = ref('')

const jobOptions = ref<any[]>([])
const resultFiles = ref<any[]>([])
const previewRows = ref<any[]>([])

const cityOptions = ref([
  { name: '北京', code: '101010100' },
  { name: '上海', code: '101020100' },
  { name: '广州', code: '101280100' },
  { name: '深圳', code: '101280600' },
  { name: '杭州', code: '101210100' },
  { name: '南京', code: '101190100' },
  { name: '苏州', code: '101190401' },
  { name: '成都', code: '101270100' },
  { name: '重庆', code: '101040100' },
  { name: '武汉', code: '101200100' },
  { name: '西安', code: '101110100' },
  { name: '长沙', code: '101250100' },
  { name: '郑州', code: '101180100' },
  { name: '天津', code: '101030100' },
  { name: '青岛', code: '101120200' },
  { name: '厦门', code: '101230200' },
  { name: '宁波', code: '101210400' },
  { name: '合肥', code: '101220100' },
  { name: '福州', code: '101230100' },
  { name: '东莞', code: '101281600' }
])

const form = reactive({
  cityCode: '101010100',
  searchCode: '',
  jobName: '',
  mainCategory: '',
  subCategory: '',
  maxPages: 3
})

const filteredJobOptions = computed(() => {
  const keyword = jobKeyword.value.trim()
  if (!keyword) return jobOptions.value

  return jobOptions.value.filter((item: any) => {
    return (
      item.jobName?.includes(keyword) ||
      item.mainCategory?.includes(keyword) ||
      item.subCategory?.includes(keyword) ||
      item.searchCode?.includes(keyword)
    )
  })
})

const currentCityName = computed(() => {
  const city = cityOptions.value.find((item) => item.code === form.cityCode)
  return city ? `${city.name}（${city.code}）` : form.cityCode || '-'
})

async function loadJobList() {
  const data = await getFlatJobList('')
  jobOptions.value = data.list || []
}

async function loadResults() {
  const data = await getJobCollectResults()
  resultFiles.value = data.list || []
}

function handleJobSearch() {
  // 当前已本地过滤，不需要额外请求
}

function handleJobChange(val: string) {
  const item = jobOptions.value.find((x: any) => x.searchCode === val)
  if (!item) return

  form.searchCode = item.searchCode
  form.jobName = item.jobName
  form.mainCategory = item.mainCategory
  form.subCategory = item.subCategory
}

function fillSoftwareExample() {
  jobKeyword.value = '软件开发'

  const matched = jobOptions.value.find((item: any) => {
    return (
      item.jobName?.includes('软件开发') ||
      item.subCategory?.includes('软件开发') ||
      item.mainCategory?.includes('技术')
    )
  })

  if (matched) {
    selectedSearchCode.value = matched.searchCode
    form.searchCode = matched.searchCode
    form.jobName = matched.jobName
    form.mainCategory = matched.mainCategory
    form.subCategory = matched.subCategory
  } else {
    selectedSearchCode.value = '100101'
    form.searchCode = '100101'
    form.jobName = '软件开发'
    form.mainCategory = '技术'
    form.subCategory = '软件开发'
  }

  form.cityCode = '101010100'
  form.maxPages = 3

  ElMessage.success('已填充“软件开发”岗位采集示例')
}

function resetForm() {
  selectedSearchCode.value = ''
  jobKeyword.value = ''
  form.searchCode = ''
  form.jobName = ''
  form.mainCategory = ''
  form.subCategory = ''
  form.cityCode = '101010100'
  form.maxPages = 3
  previewRows.value = []
  latestFileName.value = ''
}

async function handleCrawl() {
  // ElMessage('为了保证服务安全，采集功能已经关闭')
  // return
  if (!form.searchCode || !form.jobName) {
    ElMessage.warning('请先选择岗位')
    return
  }

  try {
    crawlLoading.value = true
    const data: any = await crawlOneJob({
      cityCode: form.cityCode,
      searchCode: form.searchCode,
      jobName: form.jobName,
      mainCategory: form.mainCategory,
      subCategory: form.subCategory,
      maxPages: form.maxPages
    })

    previewRows.value = data.preview || []
    latestFileName.value = data.csvFileName || ''
    ElMessage.success(`采集完成，共 ${data.total || 0} 条`)
    loadResults()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.msg || e?.message || '岗位采集失败')
  } finally {
    crawlLoading.value = false
  }
}

async function handlePreview(fileName: string) {
  const data: any = await previewCollectedCsv(fileName)
  previewRows.value = data.list || []
  latestFileName.value = fileName
}

function handleDownload(fileName: string) {
  window.open(buildDownloadUrl(fileName), '_blank')
}

onMounted(() => {
  loadJobList()
  loadResults()
})
</script>

<style scoped lang="scss">
.job-collect-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.page-header {
  padding: 24px 28px;

  h2 {
    margin: 0 0 10px;
    font-size: 24px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #64748b;
    line-height: 1.8;
  }
}

.layout {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 16px;
}

.form-card,
.result-card {
  padding: 20px;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-box {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
  line-height: 1.9;
}

.tips-box {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  color: #64748b;
  line-height: 1.8;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>

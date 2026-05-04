<template>
  <div class="design-page">
    <div class="page-header art-card">
      <div>
        <div class="page-title">用户登录信息管理</div>
        <div class="page-desc">
          记录用户每一次登录成功和失败的详细信息，包括账号、登录状态、IP归属地、浏览器、操作系统、设备、来源页面和客户端环境，方便了解用户登录状态与安全审计。
        </div>
      </div>
      <div class="page-actions">
        <ElButton :loading="loading" @click="loadData">刷新</ElButton>
      </div>
    </div>

    <ElRow :gutter="18" class="stat-row">
      <ElCol v-for="item in statCards" :key="item.label" :xs="24" :sm="12" :lg="6">
        <div class="stat-card art-card">
          <div class="stat-card__top">
            <span>{{ item.label }}</span>
            <ElTag size="small" effect="light" :type="item.type">{{ item.tag }}</ElTag>
          </div>
          <div class="stat-card__value">{{ item.value }}</div>
          <div class="stat-card__desc">{{ item.desc }}</div>
        </div>
      </ElCol>
    </ElRow>

    <div class="search-card art-card">
      <ElForm :model="searchForm" label-width="76px" class="search-form">
        <ElRow :gutter="16">
          <ElCol :xs="24" :sm="12" :lg="6">
            <ElFormItem label="登录账号">
              <ElInput v-model.trim="searchForm.username" placeholder="用户名 / 账号" clearable />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :lg="5">
            <ElFormItem label="登录结果">
              <ElSelect v-model="searchForm.loginStatus" placeholder="全部" clearable>
                <ElOption label="成功" value="SUCCESS" />
                <ElOption label="失败" value="FAIL" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :lg="5">
            <ElFormItem label="登录状态">
              <ElSelect v-model="searchForm.onlineStatus" placeholder="全部" clearable>
                <ElOption label="最近登录" value="1" />
                <ElOption label="历史记录" value="0" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :lg="4">
            <ElFormItem label="设备类型">
              <ElSelect v-model="searchForm.deviceType" placeholder="全部" clearable>
                <ElOption label="电脑端" value="PC" />
                <ElOption label="手机端" value="Mobile" />
                <ElOption label="平板" value="Tablet" />
                <ElOption label="未知" value="Unknown" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :lg="4">
            <ElFormItem label="IP地址">
              <ElInput v-model.trim="searchForm.ip" placeholder="IP" clearable />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :sm="12" :lg="8">
            <ElFormItem label="归属地">
              <ElInput v-model.trim="searchForm.address" placeholder="国家 / 省份 / 城市 / 运营商" clearable />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :lg="10">
            <ElFormItem label="登录时间">
              <ElDatePicker v-model="dateRange" type="datetimerange" value-format="YYYY-MM-DD HH:mm:ss" start-placeholder="开始时间" end-placeholder="结束时间" range-separator="至" style="width: 100%" />
            </ElFormItem>
          </ElCol>

          <ElCol :xs="24" :lg="6">
            <ElFormItem label-width="0">
              <ElSpace wrap>
                <ElButton type="primary" @click="handleSearch">查询</ElButton>
                <ElButton @click="handleReset">重置</ElButton>
                <ElButton type="danger" plain @click="handleClear">清空筛选记录</ElButton>
              </ElSpace>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <div class="table-card art-card">
      <div class="table-toolbar">
        <div>
          <div class="table-title">登录记录明细</div>
          <div class="table-subtitle">当前筛选共 {{ pagination.total }} 条记录</div>
        </div>
        <ElSpace wrap>
          <ElButton :disabled="!selectedRows.length" type="danger" plain @click="handleBatchDelete">
            批量删除
          </ElButton>
          <ElButton :loading="loading" @click="loadData">刷新</ElButton>
        </ElSpace>
      </div>

      <ElTable v-loading="loading" :data="tableData" row-key="id" border stripe class="login-table" @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="46" fixed="left" />
        <ElTableColumn prop="loginTime" label="登录时间" width="170" fixed="left" sortable />
        <ElTableColumn label="用户信息" min-width="170">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-avatar">{{ getAvatarText(row) }}</div>
              <div>
                <div class="user-name">{{ row.username || '未知账号' }}</div>
                <div class="user-sub">{{ row.nickName || row.roleName || '未识别用户' }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="登录结果" width="105">
          <template #default="{ row }">
            <ElTag :type="row.loginStatus === 'SUCCESS' ? 'success' : 'danger'" effect="light">
              {{ row.loginStatus === 'SUCCESS' ? '成功' : '失败' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="登录状态" width="110">
          <template #default="{ row }">
            <ElTag v-if="row.loginStatus === 'SUCCESS'" :type="row.onlineStatus === '1' ? 'primary' : 'info'" effect="plain">
              {{ row.onlineStatus === '1' ? '最近登录' : '历史记录' }}
            </ElTag>
            <ElTag v-else type="warning" effect="plain">未登录</ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="ip" label="IP地址" min-width="130" show-overflow-tooltip />
        <ElTableColumn prop="address" label="归属地" min-width="190" show-overflow-tooltip />

        <ElTableColumn label="设备环境" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="device-cell">
              <div>{{ row.deviceType || 'Unknown' }} · {{ row.browser || 'Unknown' }}</div>
              <div>{{ row.os || 'Unknown' }} · {{ row.engine || 'Unknown' }}</div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="客户端信息" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="device-cell">
              <div>{{ row.clientTimezone || '-' }}</div>
              <div>{{ formatScreen(row) }}</div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="failureReason" label="失败原因" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="row.loginStatus === 'FAIL' ? 'text-danger' : 'text-muted'">
              {{ row.failureReason || '-' }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="耗时" width="90">
          <template #default="{ row }">{{ row.durationMs || 0 }}ms</template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <ElSpace>
              <ElButton type="primary" link @click="openDetail(row)">详情</ElButton>
              <ElButton type="danger" link @click="handleDelete(row)">删除</ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="pagination-wrap">
        <ElPagination v-model:current-page="pagination.current" v-model:page-size="pagination.size" :page-sizes="[10, 20, 50, 100]" :total="pagination.total" background layout="total, sizes, prev, pager, next, jumper" @size-change="loadData" @current-change="loadData" />
      </div>
    </div>

    <ElDrawer v-model="detailVisible" title="登录记录详情" size="560px">
      <template v-if="currentDetail">
        <div class="detail-section">
          <div class="detail-title">基础信息</div>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="记录ID">{{ currentDetail.id }}</ElDescriptionsItem>
            <ElDescriptionsItem label="用户账号">{{ currentDetail.username || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="用户昵称">{{ currentDetail.nickName || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="角色">{{ currentDetail.roleName || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="登录结果">
              <ElTag :type="currentDetail.loginStatus === 'SUCCESS' ? 'success' : 'danger'">
                {{ currentDetail.loginStatus === 'SUCCESS' ? '成功' : '失败' }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="登录状态">
              {{ currentDetail.onlineStatus === '1' ? '最近登录' : '历史记录' }}
            </ElDescriptionsItem>
            <ElDescriptionsItem label="登录时间">{{ currentDetail.loginTime || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="失败原因">{{ currentDetail.failureReason || '-' }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="detail-section">
          <div class="detail-title">网络与请求</div>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="IP地址">{{ currentDetail.ip || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="完整归属地">{{ currentDetail.address || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="国家/地区">{{ currentDetail.country || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="省份">{{ currentDetail.province || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="城市">{{ currentDetail.city || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="运营商">{{ currentDetail.isp || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="请求方法">{{ currentDetail.requestMethod || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="请求URI">{{ currentDetail.requestUri || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="来源页面">{{ currentDetail.referer || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="Origin">{{ currentDetail.origin || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="Host">{{ currentDetail.host || '-' }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="detail-section">
          <div class="detail-title">浏览器与设备</div>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="浏览器">{{ currentDetail.browser || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="浏览器版本">{{ currentDetail.browserVersion || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="操作系统">{{ currentDetail.os || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="系统版本">{{ currentDetail.osVersion || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="设备">{{ currentDetail.device || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="设备类型">{{ currentDetail.deviceType || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="浏览器内核">{{ currentDetail.engine || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="是否移动端">{{ currentDetail.mobile ? '是' : '否' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="User-Agent">
              <div class="ua-text">{{ currentDetail.userAgent || '-' }}</div>
            </ElDescriptionsItem>
          </ElDescriptions>
        </div>

        <div class="detail-section">
          <div class="detail-title">前端客户端采集信息</div>
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="登录来源">{{ currentDetail.loginSource || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="客户端时间">{{ currentDetail.clientTime || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="客户端时区">{{ currentDetail.clientTimezone || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="客户端语言">{{ currentDetail.clientLanguage || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="客户端平台">{{ currentDetail.clientPlatform || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="屏幕尺寸">{{ formatScreen(currentDetail) }}</ElDescriptionsItem>
            <ElDescriptionsItem label="会话ID">{{ currentDetail.sessionId || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="Token哈希">{{ currentDetail.tokenHash || '-' }}</ElDescriptionsItem>
          </ElDescriptions>
        </div>
      </template>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchBatchDeleteUserLoginLogs,
  fetchClearUserLoginLogs,
  fetchDeleteUserLoginLog,
  fetchGetUserLoginLogList,
  fetchGetUserLoginLogStatistics
} from '@/api/system-manage'

defineOptions({ name: 'UserLoginManager' })

type LoginLogItem = Api.SystemManage.UserLoginLogItem
type LoginLogSearchParams = Api.SystemManage.UserLoginLogSearchParams

const loading = ref(false)
const tableData = ref<LoginLogItem[]>([])
const selectedRows = ref<LoginLogItem[]>([])
const detailVisible = ref(false)
const currentDetail = ref<LoginLogItem | null>(null)
const dateRange = ref<string[]>([])

const searchForm = reactive<
  Omit<LoginLogSearchParams, 'current' | 'size' | 'startTime' | 'endTime'>
>({
  username: '',
  loginStatus: '',
  onlineStatus: '',
  ip: '',
  address: '',
  deviceType: ''
})

const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

const statistics = reactive<Api.SystemManage.UserLoginLogStatistics>({
  total: 0,
  success: 0,
  failed: 0,
  today: 0,
  todaySuccess: 0,
  todayFailed: 0,
  online: 0,
  mobile: 0,
  pc: 0,
  uniqueUserToday: 0
})

const statCards = computed(() => [
  {
    label: '登录总次数',
    value: statistics.total,
    desc: `成功 ${statistics.success} 次，失败 ${statistics.failed} 次`,
    tag: '总览',
    type: 'primary' as const
  },
  {
    label: '今日登录',
    value: statistics.today,
    desc: `今日成功 ${statistics.todaySuccess} 次，失败 ${statistics.todayFailed} 次`,
    tag: '今日',
    type: 'success' as const
  },
  {
    label: '最近登录用户',
    value: statistics.online,
    desc: `今日独立登录用户 ${statistics.uniqueUserToday} 人`,
    tag: '状态',
    type: 'warning' as const
  },
  {
    label: '设备分布',
    value: `${statistics.pc}/${statistics.mobile}`,
    desc: '电脑端 / 移动端登录次数',
    tag: '设备',
    type: 'info' as const
  }
])

const getSearchParams = (): LoginLogSearchParams => {
  const [startTime, endTime] = dateRange.value || []
  return {
    current: pagination.current,
    size: pagination.size,
    username: searchForm.username || undefined,
    loginStatus: searchForm.loginStatus || undefined,
    onlineStatus: searchForm.onlineStatus || undefined,
    ip: searchForm.ip || undefined,
    address: searchForm.address || undefined,
    deviceType: searchForm.deviceType || undefined,
    startTime: startTime || undefined,
    endTime: endTime || undefined
  }
}

const loadStatistics = async () => {
  const data = await fetchGetUserLoginLogStatistics()
  Object.assign(statistics, data)
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await fetchGetUserLoginLogList(getSearchParams())
    tableData.value = res.records || []
    pagination.total = Number(res.total || 0)
    pagination.current = Number(res.current || pagination.current)
    pagination.size = Number(res.size || pagination.size)
    await loadStatistics()
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  loadData()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.loginStatus = ''
  searchForm.onlineStatus = ''
  searchForm.ip = ''
  searchForm.address = ''
  searchForm.deviceType = ''
  dateRange.value = []
  pagination.current = 1
  loadData()
}

const handleSelectionChange = (rows: LoginLogItem[]) => {
  selectedRows.value = rows
}

const handleDelete = async (row: LoginLogItem) => {
  await ElMessageBox.confirm(
    `确认删除用户「${row.username || '未知账号'}」的这条登录记录吗？`,
    '删除确认',
    {
      type: 'warning'
    }
  )
  await fetchDeleteUserLoginLog(row.id)
  await loadData()
}

const handleBatchDelete = async () => {
  if (!selectedRows.value.length) {
    ElMessage.warning('请选择需要删除的登录记录')
    return
  }
  await ElMessageBox.confirm(
    `确认删除选中的 ${selectedRows.value.length} 条登录记录吗？`,
    '批量删除确认',
    {
      type: 'warning'
    }
  )
  await fetchBatchDeleteUserLoginLogs(selectedRows.value.map((item) => item.id))
  selectedRows.value = []
  await loadData()
}

const handleClear = async () => {
  await ElMessageBox.confirm(
    '确认按当前筛选条件清空登录记录吗？如果没有筛选条件，将清空全部登录记录。',
    '清空确认',
    {
      type: 'warning'
    }
  )
  await fetchClearUserLoginLogs(getSearchParams())
  pagination.current = 1
  await loadData()
}

const openDetail = (row: LoginLogItem) => {
  currentDetail.value = row
  detailVisible.value = true
}

const getAvatarText = (row: LoginLogItem) => {
  const name = row.nickName || row.username || '?'
  return name.slice(0, 1).toUpperCase()
}

const formatScreen = (row: LoginLogItem) => {
  if (!row.screenWidth && !row.screenHeight) return '-'
  return `${row.screenWidth || '-'} × ${row.screenHeight || '-'} / DPR ${
    row.devicePixelRatio || '1'
  }`
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.design-page {
  // padding: 16px;
  // background: #f5f7fa;
  min-height: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  margin-bottom: 18px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--art-text-gray-900);
}

.page-desc {
  max-width: 980px;
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.8;
  color: var(--art-text-gray-600);
}

.page-actions {
  flex-shrink: 0;
}

.stat-row {
  margin-bottom: 18px;
}

.stat-card {
  min-height: 126px;
  padding: 18px;
  margin-bottom: 0;
}

.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--art-text-gray-600);
}

.stat-card__value {
  margin-top: 14px;
  font-size: 28px;
  font-weight: 800;
  color: var(--art-text-gray-900);
}

.stat-card__desc {
  margin-top: 8px;
  font-size: 13px;
  color: var(--art-text-gray-500);
}

.search-card {
  padding: 18px 18px 2px;
  margin-bottom: 18px;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  :deep(.el-select) {
    width: 100%;
  }
}

.table-card {
  padding: 18px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.table-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--art-text-gray-900);
}

.table-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: var(--art-text-gray-500);
}

.login-table {
  width: 100%;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 14px;
  font-weight: 700;
  color: var(--el-color-primary);
  background: rgb(64 158 255 / 10%);
  border-radius: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--art-text-gray-900);
}

.user-sub,
.device-cell div:nth-child(2),
.text-muted {
  margin-top: 2px;
  font-size: 12px;
  color: var(--art-text-gray-500);
}

.device-cell {
  line-height: 1.5;
}

.text-danger {
  color: var(--el-color-danger);
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-section {
  margin-bottom: 22px;
}

.detail-title {
  margin-bottom: 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--art-text-gray-900);
}

.ua-text {
  word-break: break-all;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .design-page {
    padding: 12px;
  }

  .page-header,
  .table-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .pagination-wrap {
    justify-content: flex-start;
    overflow-x: auto;
  }
}
</style>

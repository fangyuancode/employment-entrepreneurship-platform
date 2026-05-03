<template>
  <div class="user-page">
    <div class="page-header art-card">
      <div class="page-header__left">
        <div class="page-title">用户管理</div>
        <div class="page-desc">连接后端用户表，支持用户查询、新增、编辑、删除、启停、角色分配与密码重置。</div>
      </div>
      <div class="page-header__right">
        <ElButton v-auth="'user:add'" type="primary" @click="openDialog('add')">新增用户</ElButton>
      </div>
    </div>

    <ElRow :gutter="20" class="mb-20">
      <ElCol v-for="item in statisticsCards" :key="item.label" :xs="24" :sm="12" :lg="6">
        <div class="art-card stat-card">
          <div class="stat-card__label">{{ item.label }}</div>
          <div class="stat-card__value">{{ item.value }}</div>
          <div class="stat-card__extra">{{ item.extra }}</div>
        </div>
      </ElCol>
    </ElRow>

    <div class="art-card search-card mb-20">
      <ElForm :model="searchForm" inline label-width="68px" class="search-form">
        <ElFormItem label="用户名">
          <ElInput v-model="searchForm.userName" placeholder="请输入用户名" clearable />
        </ElFormItem>

        <ElFormItem label="手机号">
          <ElInput v-model="searchForm.userPhone" placeholder="请输入手机号" clearable />
        </ElFormItem>

        <ElFormItem label="邮箱">
          <ElInput v-model="searchForm.userEmail" placeholder="请输入邮箱" clearable />
        </ElFormItem>

        <ElFormItem label="性别">
          <ElSelect
            v-model="searchForm.userGender"
            placeholder="请选择性别"
            clearable
            style="width: 140px"
          >
            <ElOption label="男" value="男" />
            <ElOption label="女" value="女" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="角色">
          <ElSelect
            v-model="searchForm.roleId"
            placeholder="请选择角色"
            clearable
            style="width: 150px"
          >
            <ElOption
              v-for="role in roleOptions"
              :key="role.roleId"
              :label="role.roleName"
              :value="role.roleId"
            />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSelect
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 140px"
          >
            <ElOption label="启用" value="1" />
            <ElOption label="禁用" value="0" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem>
          <ElSpace wrap>
            <ElButton type="primary" :loading="loading" @click="handleSearch">查询</ElButton>
            <ElButton @click="handleReset">重置</ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>
    </div>

    <div class="art-card table-card">
      <div class="table-toolbar">
        <div class="table-toolbar__left">
          <ElSpace wrap>
            <ElButton v-auth="'user:add'" type="primary" plain @click="openDialog('add')">新增</ElButton>
            <ElButton v-auth="'user:edit'" :disabled="selectedRows.length !== 1" @click="handleBatchEdit">编辑</ElButton>
            <ElButton
              v-auth="'user:delete'"
              type="danger"
              plain
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </ElButton>
          </ElSpace>
        </div>

        <div class="table-toolbar__right">
          <ElButton plain :loading="loading" @click="loadData">刷新</ElButton>
          <div class="toolbar-tip">当前共 {{ pagination.total }} 条数据</div>
        </div>
      </div>

      <ElTable
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
        row-key="id"
        @selection-change="handleSelectionChange"
      >
        <ElTableColumn type="selection" width="55" />

        <ElTableColumn label="用户信息" min-width="240">
          <template #default="{ row }">
            <div class="user-info">
              <ElAvatar :size="42" :src="row.avatar">
                {{ row.userName?.slice(0, 1)?.toUpperCase() || 'U' }}
              </ElAvatar>
              <div class="user-info__content">
                <div class="user-info__name">{{ row.userName }}</div>
                <div class="user-info__sub">{{ row.userEmail || '未填写邮箱' }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="nickName" label="昵称" min-width="120" show-overflow-tooltip />
        <ElTableColumn prop="userGender" label="性别" width="90">
          <template #default="{ row }">{{ row.userGender || '-' }}</template>
        </ElTableColumn>
        <ElTableColumn prop="userPhone" label="手机号" min-width="140">
          <template #default="{ row }">{{ row.userPhone || '-' }}</template>
        </ElTableColumn>

        <ElTableColumn label="角色" min-width="150">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElTag v-for="role in row.userRoles" :key="role" effect="light" round type="info">
                {{ role }}
              </ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>

        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="row.status === '1' ? 'success' : 'danger'" effect="light" round>
              {{ row.status === '1' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="ip" label="最近登录IP" min-width="140">
          <template #default="{ row }">{{ row.ip || '-' }}</template>
        </ElTableColumn>
        <ElTableColumn prop="createTime" label="创建时间" min-width="170" />

        <ElTableColumn label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElButton v-auth="'user:edit'" link type="primary" @click="openDialog('edit', row)">编辑</ElButton>
              <ElButton v-auth="'user:status'" link type="warning" @click="toggleUserStatus(row)">
                {{ row.status === '1' ? '禁用' : '启用' }}
              </ElButton>
              <ElButton v-auth="'user:resetPassword'" link type="info" @click="handleResetPassword(row)">
                重置密码
              </ElButton>
              <ElButton v-auth="'user:delete'" link type="danger" @click="handleDelete(row)">删除</ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="table-pagination">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handlePageSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="660px"
      destroy-on-close
      class="user-dialog"
    >
      <ElForm ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="92px">
        <ElRow :gutter="16">
          <ElCol :span="12">
            <ElFormItem label="用户名" prop="userName">
              <ElInput v-model="dialogForm.userName" placeholder="请输入用户名" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="昵称" prop="nickName">
              <ElInput v-model="dialogForm.nickName" placeholder="请输入昵称" />
            </ElFormItem>
          </ElCol>

          <ElCol v-if="dialogType === 'add'" :span="12">
            <ElFormItem label="初始密码" prop="password">
              <ElInput
                v-model="dialogForm.password"
                type="password"
                show-password
                placeholder="默认 123456"
              />
            </ElFormItem>
          </ElCol>

          <ElCol :span="dialogType === 'add' ? 12 : 12">
            <ElFormItem label="手机号" prop="userPhone">
              <ElInput v-model="dialogForm.userPhone" placeholder="请输入手机号" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="邮箱" prop="userEmail">
              <ElInput v-model="dialogForm.userEmail" placeholder="请输入邮箱" />
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="性别" prop="userGender">
              <ElSelect
                v-model="dialogForm.userGender"
                placeholder="请选择性别"
                clearable
                style="width: 100%"
              >
                <ElOption label="男" value="男" />
                <ElOption label="女" value="女" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="角色" prop="roleId">
              <ElSelect v-model="dialogForm.roleId" placeholder="请选择角色" style="width: 100%">
                <ElOption
                  v-for="role in roleOptions"
                  :key="role.roleId"
                  :label="role.roleName"
                  :value="role.roleId"
                />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="状态" prop="status">
              <ElSelect v-model="dialogForm.status" placeholder="请选择状态" style="width: 100%">
                <ElOption label="启用" value="1" />
                <ElOption label="禁用" value="0" />
              </ElSelect>
            </ElFormItem>
          </ElCol>

          <ElCol :span="24">
            <ElFormItem label="头像地址">
              <ElInput v-model="dialogForm.avatar" placeholder="请输入头像地址，可为空" />
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>

      <template #footer>
        <ElSpace>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" :loading="submitLoading" @click="handleDialogSubmit">确定</ElButton>
        </ElSpace>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    fetchAddUser,
    fetchBatchDeleteUsers,
    fetchDeleteUser,
    fetchGetRoleOptions,
    fetchGetUserList,
    fetchGetUserStatistics,
    fetchResetUserPassword,
    fetchUpdateUser,
    fetchUpdateUserStatus
  } from '@/api/system-manage'

  defineOptions({ name: 'User' })

  type UserItem = Api.SystemManage.UserListItem
  type DialogType = 'add' | 'edit'

  const tableData = ref<UserItem[]>([])
  const roleOptions = ref<Api.SystemManage.RoleListItem[]>([])
  const selectedRows = ref<UserItem[]>([])
  const loading = ref(false)
  const submitLoading = ref(false)

  const searchForm = reactive<Api.SystemManage.UserSearchParams>({
    userName: '',
    userPhone: '',
    userEmail: '',
    userGender: '',
    roleId: undefined,
    status: ''
  })

  const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
  })

  const statistics = ref<Api.SystemManage.UserStatistics>({
    total: 0,
    enabled: 0,
    disabled: 0,
    admin: 0
  })

  const statisticsCards = computed(() => [
    { label: '用户总数', value: statistics.value.total, extra: '系统当前已录入用户' },
    { label: '启用用户', value: statistics.value.enabled, extra: '当前可正常登录使用' },
    { label: '禁用用户', value: statistics.value.disabled, extra: '已被手动停用' },
    { label: '管理员用户', value: statistics.value.admin, extra: '超级管理员 / 系统管理员' }
  ])

  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const dialogFormRef = ref<FormInstance>()

  const getDefaultDialogForm = (): Api.SystemManage.UserSaveParams => ({
    id: undefined,
    avatar: '',
    status: '1',
    userName: '',
    userGender: '',
    nickName: '',
    userPhone: '',
    userEmail: '',
    roleId: 3,
    password: ''
  })

  const dialogForm = reactive<Api.SystemManage.UserSaveParams>(getDefaultDialogForm())

  const validateOptionalPhone = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (!value || /^1[3-9]\d{9}$/.test(value)) {
      callback()
      return
    }
    callback(new Error('手机号格式不正确'))
  }

  const dialogRules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 30, message: '用户名长度为 2-30 位', trigger: 'blur' }
    ],
    nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
    userPhone: [{ validator: validateOptionalPhone, trigger: 'blur' }],
    userEmail: [{ type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }],
    roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  const resetDialogForm = () => {
    Object.assign(dialogForm, getDefaultDialogForm())
  }

  const loadRoleOptions = async () => {
    roleOptions.value = await fetchGetRoleOptions()
  }

  const loadStatistics = async () => {
    statistics.value = await fetchGetUserStatistics()
  }

  const loadData = async () => {
    loading.value = true
    try {
      const res = await fetchGetUserList({
        ...searchForm,
        current: pagination.current,
        size: pagination.size
      })
      tableData.value = res.records || []
      pagination.total = Number(res.total || 0)
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
    searchForm.userName = ''
    searchForm.userPhone = ''
    searchForm.userEmail = ''
    searchForm.userGender = ''
    searchForm.roleId = undefined
    searchForm.status = ''
    pagination.current = 1
    loadData()
  }

  const handlePageSizeChange = (size: number) => {
    pagination.size = size
    pagination.current = 1
    loadData()
  }

  const handleCurrentChange = (current: number) => {
    pagination.current = current
    loadData()
  }

  const handleSelectionChange = (rows: UserItem[]) => {
    selectedRows.value = rows
  }

  const openDialog = (type: DialogType, row?: UserItem) => {
    dialogType.value = type
    resetDialogForm()

    if (type === 'edit' && row) {
      Object.assign(dialogForm, {
        id: row.id,
        avatar: row.avatar || '',
        status: row.status || '1',
        userName: row.userName || '',
        userGender: row.userGender || '',
        nickName: row.nickName || '',
        userPhone: row.userPhone || '',
        userEmail: row.userEmail || '',
        roleId: row.roleId || 3,
        password: ''
      })
    }

    dialogVisible.value = true
  }

  const handleDialogSubmit = async () => {
    if (!dialogFormRef.value) return

    const valid = await dialogFormRef.value.validate().catch(() => false)
    if (!valid) return

    submitLoading.value = true
    try {
      if (dialogType.value === 'add') {
        await fetchAddUser({ ...dialogForm })
      } else {
        await fetchUpdateUser({ ...dialogForm })
      }
      dialogVisible.value = false
      await loadData()
    } finally {
      submitLoading.value = false
    }
  }

  const toggleUserStatus = async (row: UserItem) => {
    const nextStatus = row.status === '1' ? '0' : '1'
    const actionText = nextStatus === '1' ? '启用' : '禁用'
    await ElMessageBox.confirm(`确定${actionText}用户 “${row.userName}” 吗？`, `${actionText}确认`, {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await fetchUpdateUserStatus(row.id, nextStatus)
    await loadData()
  }

  const handleResetPassword = async (row: UserItem) => {
    await ElMessageBox.confirm(
      `确定将用户 “${row.userName}” 的密码重置为 123456 吗？`,
      '重置密码确认',
      {
        type: 'warning',
        confirmButtonText: '确定重置',
        cancelButtonText: '取消'
      }
    )
    await fetchResetUserPassword(row.id)
    ElMessage.success('已重置为默认密码：123456')
  }

  const handleDelete = async (row: UserItem) => {
    await ElMessageBox.confirm(`确定删除用户 “${row.userName}” 吗？此操作不可恢复。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })
    await fetchDeleteUser(row.id)
    selectedRows.value = []
    await loadData()
  }

  const handleBatchDelete = async () => {
    if (!selectedRows.value.length) return

    await ElMessageBox.confirm(
      `确定删除已选中的 ${selectedRows.value.length} 个用户吗？此操作不可恢复。`,
      '批量删除',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    await fetchBatchDeleteUsers(selectedRows.value.map((item) => item.id))
    selectedRows.value = []
    await loadData()
  }

  const handleBatchEdit = () => {
    if (selectedRows.value.length === 1) {
      openDialog('edit', selectedRows.value[0])
    }
  }

  onMounted(async () => {
    await loadRoleOptions()
    await loadData()
  })
</script>

<style scoped lang="scss">
  .user-page {
    .mb-20 {
      margin-bottom: 20px;
    }
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 22px 24px;
    margin-bottom: 20px;
    gap: 16px;
  }

  .page-title {
    font-size: 22px;
    font-weight: 600;
    color: var(--art-text-gray-900);
    line-height: 1.2;
  }

  .page-desc {
    margin-top: 8px;
    font-size: 14px;
    color: var(--art-text-gray-600);
    line-height: 1.8;
  }

  .stat-card {
    padding: 20px;
    height: 132px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-bottom: 0;
  }

  .stat-card__label {
    font-size: 14px;
    color: var(--art-text-gray-600);
  }

  .stat-card__value {
    margin-top: 12px;
    font-size: 30px;
    font-weight: 700;
    color: var(--art-text-gray-900);
    line-height: 1;
  }

  .stat-card__extra {
    margin-top: 12px;
    font-size: 13px;
    color: var(--art-text-gray-500);
  }

  .search-card {
    padding: 18px 20px 2px;
  }

  .search-form {
    display: flex;
    flex-wrap: wrap;
  }

  .table-card {
    padding: 18px 20px 20px;
  }

  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }

  .table-toolbar__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toolbar-tip {
    font-size: 13px;
    color: var(--art-text-gray-500);
    white-space: nowrap;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .user-info__content {
    min-width: 0;
  }

  .user-info__name {
    font-size: 14px;
    font-weight: 600;
    color: var(--art-text-gray-900);
    line-height: 1.4;
  }

  .user-info__sub {
    margin-top: 4px;
    font-size: 13px;
    color: var(--art-text-gray-500);
    line-height: 1.4;
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
  }

  @media (max-width: 768px) {
    .page-header,
    .table-toolbar,
    .table-toolbar__right {
      align-items: flex-start;
      flex-direction: column;
    }
  }
</style>

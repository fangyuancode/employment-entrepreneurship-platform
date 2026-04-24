<template>
  <div class="user-page">
    <div class="page-header art-card">
      <div class="page-header__left">
        <div class="page-title">用户管理</div>
        <div class="page-desc">用于查看系统用户信息、状态、角色分配与基础维护操作</div>
      </div>
      <div class="page-header__right">
        <ElButton type="primary" @click="openDialog('add')">新增用户</ElButton>
      </div>
    </div>

    <ElRow :gutter="20" class="mb-20">
      <ElCol :xs="24" :sm="12" :lg="6" v-for="item in statisticsCards" :key="item.label">
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
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
            <ElButton @click="handleReset">重置</ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>
    </div>

    <div class="art-card table-card">
      <div class="table-toolbar">
        <div class="table-toolbar__left">
          <ElSpace wrap>
            <ElButton type="primary" plain @click="openDialog('add')">新增</ElButton>
            <ElButton :disabled="selectedRows.length !== 1" @click="handleBatchEdit">编辑</ElButton>
            <ElButton
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
          <div class="toolbar-tip">当前共 {{ filteredData.length }} 条数据</div>
        </div>
      </div>

      <ElTable :data="pagedTableData" style="width: 100%" @selection-change="handleSelectionChange">
        <ElTableColumn type="selection" width="55" />

        <ElTableColumn label="用户信息" min-width="240">
          <template #default="{ row }">
            <div class="user-info">
              <ElAvatar :size="42" :src="row.avatar">
                {{ row.userName?.slice(0, 1) || 'U' }}
              </ElAvatar>
              <div class="user-info__content">
                <div class="user-info__name">{{ row.userName }}</div>
                <div class="user-info__sub">{{ row.userEmail }}</div>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="nickName" label="昵称" min-width="120" />
        <ElTableColumn prop="userGender" label="性别" width="90" />
        <ElTableColumn prop="userPhone" label="手机号" min-width="140" />

        <ElTableColumn label="角色" min-width="180">
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

        <ElTableColumn prop="createTime" label="创建时间" min-width="170" />

        <ElTableColumn label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElButton link type="primary" @click="openDialog('edit', row)">编辑</ElButton>
              <ElButton link type="warning" @click="toggleUserStatus(row)">
                {{ row.status === '1' ? '禁用' : '启用' }}
              </ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="table-pagination">
        <ElPagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[5, 10, 20, 50]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
        />
      </div>
    </div>

    <ElDialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
      width="620px"
      destroy-on-close
    >
      <ElForm ref="dialogFormRef" :model="dialogForm" :rules="dialogRules" label-width="90px">
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

          <ElCol :span="12">
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
                style="width: 100%"
              >
                <ElOption label="男" value="男" />
                <ElOption label="女" value="女" />
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
            <ElFormItem label="角色" prop="userRoles">
              <ElSelect
                v-model="dialogForm.userRoles"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择角色"
                style="width: 100%"
              >
                <ElOption label="超级管理员" value="超级管理员" />
                <ElOption label="系统管理员" value="系统管理员" />
                <ElOption label="产品运营" value="产品运营" />
                <ElOption label="普通用户" value="普通用户" />
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
          <ElButton type="primary" @click="handleDialogSubmit">确定</ElButton>
        </ElSpace>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'User' })

  type UserItem = Api.SystemManage.UserListItem
  type DialogType = 'add' | 'edit'

  const createMockUsers = (): UserItem[] => [
    {
      id: 1,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ZhangSan',
      status: '1',
      userName: 'zhangsan',
      userGender: '男',
      nickName: '张三',
      userPhone: '13812340001',
      userEmail: 'zhangsan@example.com',
      userRoles: ['超级管理员', '系统管理员'],
      createBy: 'system',
      createTime: '2026-04-10 09:20:12',
      updateBy: 'system',
      updateTime: '2026-04-14 10:00:00'
    },
    {
      id: 2,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=LiSi',
      status: '1',
      userName: 'lisi',
      userGender: '女',
      nickName: '李四',
      userPhone: '13812340002',
      userEmail: 'lisi@example.com',
      userRoles: ['产品运营'],
      createBy: 'admin',
      createTime: '2026-04-09 14:10:33',
      updateBy: 'admin',
      updateTime: '2026-04-13 15:20:00'
    },
    {
      id: 3,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=WangWu',
      status: '0',
      userName: 'wangwu',
      userGender: '男',
      nickName: '王五',
      userPhone: '13812340003',
      userEmail: 'wangwu@example.com',
      userRoles: ['普通用户'],
      createBy: 'admin',
      createTime: '2026-04-08 11:05:22',
      updateBy: 'admin',
      updateTime: '2026-04-12 12:30:00'
    },
    {
      id: 4,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=ZhaoLiu',
      status: '1',
      userName: 'zhaoliu',
      userGender: '女',
      nickName: '赵六',
      userPhone: '13812340004',
      userEmail: 'zhaoliu@example.com',
      userRoles: ['系统管理员', '产品运营'],
      createBy: 'system',
      createTime: '2026-04-07 16:15:48',
      updateBy: 'system',
      updateTime: '2026-04-11 09:16:00'
    },
    {
      id: 5,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SunQi',
      status: '1',
      userName: 'sunqi',
      userGender: '男',
      nickName: '孙七',
      userPhone: '13812340005',
      userEmail: 'sunqi@example.com',
      userRoles: ['普通用户'],
      createBy: 'admin',
      createTime: '2026-04-06 08:42:19',
      updateBy: 'admin',
      updateTime: '2026-04-10 18:22:00'
    },
    {
      id: 6,
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=QianBa',
      status: '0',
      userName: 'qianba',
      userGender: '女',
      nickName: '钱八',
      userPhone: '13812340006',
      userEmail: 'qianba@example.com',
      userRoles: ['产品运营', '普通用户'],
      createBy: 'system',
      createTime: '2026-04-05 13:08:06',
      updateBy: 'system',
      updateTime: '2026-04-09 11:18:00'
    }
  ]

  const tableData = ref<UserItem[]>(createMockUsers())
  const selectedRows = ref<UserItem[]>([])

  const searchForm = reactive({
    userName: '',
    userPhone: '',
    userEmail: '',
    userGender: '',
    status: ''
  })

  const pagination = reactive({
    current: 1,
    size: 10
  })

  const filteredData = computed(() => {
    return tableData.value.filter((item) => {
      const matchUserName = !searchForm.userName || item.userName.includes(searchForm.userName)
      const matchPhone = !searchForm.userPhone || item.userPhone.includes(searchForm.userPhone)
      const matchEmail = !searchForm.userEmail || item.userEmail.includes(searchForm.userEmail)
      const matchGender = !searchForm.userGender || item.userGender === searchForm.userGender
      const matchStatus = !searchForm.status || item.status === searchForm.status

      return matchUserName && matchPhone && matchEmail && matchGender && matchStatus
    })
  })

  const pagedTableData = computed(() => {
    const start = (pagination.current - 1) * pagination.size
    const end = start + pagination.size
    return filteredData.value.slice(start, end)
  })

  const statisticsCards = computed(() => {
    const total = tableData.value.length
    const enabled = tableData.value.filter((item) => item.status === '1').length
    const disabled = tableData.value.filter((item) => item.status === '0').length
    const admins = tableData.value.filter((item) => item.userRoles.includes('系统管理员')).length

    return [
      { label: '用户总数', value: total, extra: '系统当前已录入用户' },
      { label: '启用用户', value: enabled, extra: '当前可正常登录使用' },
      { label: '禁用用户', value: disabled, extra: '已被手动停用' },
      { label: '管理员用户', value: admins, extra: '包含系统管理权限角色' }
    ]
  })

  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const dialogFormRef = ref<FormInstance>()

  const getDefaultDialogForm = () => ({
    id: 0,
    avatar: '',
    status: '1',
    userName: '',
    userGender: '男',
    nickName: '',
    userPhone: '',
    userEmail: '',
    userRoles: [] as string[],
    createBy: 'admin',
    createTime: '',
    updateBy: 'admin',
    updateTime: ''
  })

  const dialogForm = reactive<UserItem>(getDefaultDialogForm())

  const dialogRules: FormRules = {
    userName: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名长度为 2-20 位', trigger: 'blur' }
    ],
    nickName: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
    userPhone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
    ],
    userEmail: [
      { required: true, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
    ],
    userGender: [{ required: true, message: '请选择性别', trigger: 'change' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }],
    userRoles: [{ required: true, message: '请选择角色', trigger: 'change' }]
  }

  const resetDialogForm = () => {
    Object.assign(dialogForm, getDefaultDialogForm())
  }

  const handleSearch = () => {
    pagination.current = 1
  }

  const handleReset = () => {
    searchForm.userName = ''
    searchForm.userPhone = ''
    searchForm.userEmail = ''
    searchForm.userGender = ''
    searchForm.status = ''
    pagination.current = 1
  }

  const handleSelectionChange = (rows: UserItem[]) => {
    selectedRows.value = rows
  }

  const openDialog = (type: DialogType, row?: UserItem) => {
    dialogType.value = type
    resetDialogForm()

    if (type === 'edit' && row) {
      Object.assign(dialogForm, JSON.parse(JSON.stringify(row)))
    }

    dialogVisible.value = true
  }

  const handleDialogSubmit = async () => {
    if (!dialogFormRef.value) return

    await dialogFormRef.value.validate((valid) => {
      if (!valid) return

      const now = '2026-04-15 15:30:00'

      if (dialogType.value === 'add') {
        const newItem: UserItem = {
          ...JSON.parse(JSON.stringify(dialogForm)),
          id: Date.now(),
          avatar:
            dialogForm.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${dialogForm.userName || 'User'}`,
          createBy: 'admin',
          createTime: now,
          updateBy: 'admin',
          updateTime: now
        }
        tableData.value.unshift(newItem)
        ElMessage.success('新增用户成功')
      } else {
        const index = tableData.value.findIndex((item) => item.id === dialogForm.id)
        if (index > -1) {
          tableData.value[index] = {
            ...tableData.value[index],
            ...JSON.parse(JSON.stringify(dialogForm)),
            avatar:
              dialogForm.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${dialogForm.userName || 'User'}`,
            updateBy: 'admin',
            updateTime: now
          }
        }
        ElMessage.success('编辑用户成功')
      }

      dialogVisible.value = false
    })
  }

  const toggleUserStatus = (row: UserItem) => {
    row.status = row.status === '1' ? '0' : '1'
    row.updateTime = '2026-04-15 15:30:00'
    ElMessage.success(row.status === '1' ? '用户已启用' : '用户已禁用')
  }

  const handleDelete = async (row: UserItem) => {
    await ElMessageBox.confirm(`确定删除用户 “${row.userName}” 吗？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    tableData.value = tableData.value.filter((item) => item.id !== row.id)
    selectedRows.value = selectedRows.value.filter((item) => item.id !== row.id)
    ElMessage.success('删除成功')
  }

  const handleBatchDelete = async () => {
    if (!selectedRows.value.length) return

    await ElMessageBox.confirm(
      `确定删除已选中的 ${selectedRows.value.length} 个用户吗？`,
      '批量删除',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )

    const ids = new Set(selectedRows.value.map((item) => item.id))
    tableData.value = tableData.value.filter((item) => !ids.has(item.id))
    selectedRows.value = []
    ElMessage.success('批量删除成功')
  }

  const handleBatchEdit = () => {
    if (selectedRows.value.length === 1) {
      openDialog('edit', selectedRows.value[0])
    }
  }
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
    margin-bottom: 20px;
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
    :deep(.el-form-item) {
      margin-bottom: 16px;
    }
  }

  .table-card {
    padding: 0;
    overflow: hidden;
  }

  .table-toolbar {
    padding: 18px 20px;
    border-bottom: 1px solid var(--art-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .toolbar-tip {
    font-size: 13px;
    color: var(--art-text-gray-500);
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
    line-height: 1.5;
  }

  .user-info__sub {
    font-size: 12px;
    color: var(--art-text-gray-500);
    line-height: 1.5;
    word-break: break-all;
  }

  .table-pagination {
    display: flex;
    justify-content: flex-end;
    padding: 18px 20px 20px;
    border-top: 1px solid var(--art-border-color);
    background: #fff;
  }

  :deep(.el-table) {
    --el-table-header-bg-color: #fafafa;
  }

  :deep(.el-table th.el-table__cell) {
    font-weight: 600;
    color: var(--art-text-gray-700);
  }

  :deep(.el-dialog__body) {
    padding-top: 20px;
    padding-bottom: 10px;
  }

  @media (max-width: 992px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .table-pagination {
      overflow-x: auto;
      justify-content: flex-start;
    }
  }
</style>

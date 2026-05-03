<template>
  <div class="menu-page">
    <div class="page-header art-card">
      <div class="page-header__left">
        <div class="page-title">菜单管理</div>
        <div class="page-desc">维护系统菜单、页面路由、权限按钮与显示状态</div>
      </div>
      <div class="page-header__right">
        <ElButton v-auth="'menu:add'" type="primary" @click="handleAddMenu">新增菜单</ElButton>
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
      <ElForm :model="searchForm" inline label-width="76px" class="search-form">
        <ElFormItem label="菜单名称">
          <ElInput v-model="searchForm.title" placeholder="请输入菜单名称" clearable />
        </ElFormItem>

        <ElFormItem label="路由地址">
          <ElInput v-model="searchForm.path" placeholder="请输入路由地址" clearable />
        </ElFormItem>

        <ElFormItem label="菜单类型">
          <ElSelect
            v-model="searchForm.menuType"
            placeholder="请选择菜单类型"
            clearable
            style="width: 150px"
          >
            <ElOption label="目录" value="directory" />
            <ElOption label="菜单" value="menu" />
            <ElOption label="按钮" value="button" />
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
            <ElButton v-auth="'menu:add'" type="primary" plain @click="handleAddMenu">新增菜单</ElButton>
            <ElButton @click="toggleExpandAll">
              {{ isExpandAll ? '收起全部' : '展开全部' }}
            </ElButton>
            <ElButton @click="handleRefresh">刷新</ElButton>
          </ElSpace>
        </div>
        <div class="table-toolbar__right">
          <div class="toolbar-tip">当前共 {{ flattenedCount }} 个节点</div>
        </div>
      </div>

      <ElTable
        ref="tableRef"
        :data="tableViewData"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <ElTableColumn label="菜单名称" min-width="260">
          <template #default="{ row }">
            <div class="menu-name-cell">
              <div class="menu-icon" :class="row.menuType">
                <span>{{ getTypeShortText(row.menuType) }}</span>
              </div>
              <div class="menu-name-cell__content">
                <div class="menu-name-cell__title">{{ row.title }}</div>
                <div class="menu-name-cell__sub">
                  <template v-if="row.menuType === 'button'">
                    权限标识：{{ row.permission || '-' }}
                  </template>
                  <template v-else> 组件路径：{{ row.component || '—' }} </template>
                </div>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="类型" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getTypeTagType(row.menuType)" effect="light" round>
              {{ getTypeText(row.menuType) }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="path" label="路由地址" min-width="180" show-overflow-tooltip />

        <ElTableColumn label="权限标识" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.permission || '-' }}
          </template>
        </ElTableColumn>

        <ElTableColumn label="图标" width="120" align="center">
          <template #default="{ row }">
            <span class="icon-text">{{ row.icon || '-' }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="排序" width="90" align="center">
          <template #default="{ row }">
            {{ row.sort }}
          </template>
        </ElTableColumn>

        <ElTableColumn label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === '1' ? 'success' : 'danger'" effect="light" round>
              {{ row.status === '1' ? '启用' : '禁用' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="updateTime" label="更新时间" min-width="170" />

        <ElTableColumn label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElButton
                v-if="row.menuType !== 'button'"
                v-auth="'menu:add'"
                link
                type="primary"
                @click="handleAddChild(row)"
              >
                新增子项
              </ElButton>
              <ElButton v-auth="'menu:edit'" link type="primary" @click="handleEdit(row)">编辑</ElButton>
              <ElButton v-auth="'menu:status'" link type="warning" @click="toggleStatus(row)">
                {{ row.status === '1' ? '禁用' : '启用' }}
              </ElButton>
              <ElButton v-auth="'menu:delete'" link type="danger" @click="handleDelete(row)">删除</ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <MenuDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :parent-title="currentParentTitle"
      :edit-data="currentEditData"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, reactive, ref } from 'vue'
  import { ElMessage, ElMessageBox, type TableInstance } from 'element-plus'
  import MenuDialog from './modules/menu-dialog.vue'

  defineOptions({ name: 'Menus' })

  type MenuType = 'directory' | 'menu' | 'button'

  interface MenuItem {
    id: number
    parentId: number | null
    title: string
    menuType: MenuType
    path: string
    component: string
    permission: string
    icon: string
    sort: number
    status: '1' | '0'
    visible: boolean
    keepAlive: boolean
    updateTime: string
    children?: MenuItem[]
  }

  interface MenuDialogForm {
    id?: number
    parentId: number | null
    title: string
    menuType: MenuType
    path: string
    component: string
    permission: string
    icon: string
    sort: number
    status: '1' | '0'
    visible: boolean
    keepAlive: boolean
  }

  const createMockMenus = (): MenuItem[] => [
    {
      id: 1,
      parentId: null,
      title: '仪表盘',
      menuType: 'directory',
      path: '/dashboard',
      component: '',
      permission: '',
      icon: 'ri:dashboard-line',
      sort: 1,
      status: '1',
      visible: true,
      keepAlive: true,
      updateTime: '2026-04-15 10:20:00',
      children: [
        {
          id: 11,
          parentId: 1,
          title: '工作台',
          menuType: 'menu',
          path: 'console',
          component: '/dashboard/console',
          permission: 'DashboardConsole',
          icon: 'ri:home-5-line',
          sort: 1,
          status: '1',
          visible: true,
          keepAlive: true,
          updateTime: '2026-04-15 10:20:00'
        }
      ]
    },
    {
      id: 2,
      parentId: null,
      title: '系统管理',
      menuType: 'directory',
      path: '/system',
      component: '',
      permission: '',
      icon: 'ri:settings-3-line',
      sort: 2,
      status: '1',
      visible: true,
      keepAlive: true,
      updateTime: '2026-04-15 10:30:00',
      children: [
        {
          id: 21,
          parentId: 2,
          title: '用户管理',
          menuType: 'menu',
          path: 'user',
          component: '/system/user',
          permission: 'SystemUser',
          icon: 'ri:user-line',
          sort: 1,
          status: '1',
          visible: true,
          keepAlive: true,
          updateTime: '2026-04-15 10:30:00',
          children: [
            {
              id: 211,
              parentId: 21,
              title: '新增用户',
              menuType: 'button',
              path: '',
              component: '',
              permission: 'user:add',
              icon: '',
              sort: 1,
              status: '1',
              visible: true,
              keepAlive: false,
              updateTime: '2026-04-15 10:30:00'
            },
            {
              id: 212,
              parentId: 21,
              title: '编辑用户',
              menuType: 'button',
              path: '',
              component: '',
              permission: 'user:edit',
              icon: '',
              sort: 2,
              status: '1',
              visible: true,
              keepAlive: false,
              updateTime: '2026-04-15 10:30:00'
            },
            {
              id: 213,
              parentId: 21,
              title: '删除用户',
              menuType: 'button',
              path: '',
              component: '',
              permission: 'user:delete',
              icon: '',
              sort: 3,
              status: '1',
              visible: true,
              keepAlive: false,
              updateTime: '2026-04-15 10:30:00'
            }
          ]
        },
        {
          id: 22,
          parentId: 2,
          title: '角色管理',
          menuType: 'menu',
          path: 'role',
          component: '/system/role',
          permission: 'SystemRole',
          icon: 'ri:shield-user-line',
          sort: 2,
          status: '1',
          visible: true,
          keepAlive: true,
          updateTime: '2026-04-15 10:30:00'
        },
        {
          id: 23,
          parentId: 2,
          title: '菜单管理',
          menuType: 'menu',
          path: 'menu',
          component: '/system/menu',
          permission: 'SystemMenu',
          icon: 'ri:menu-line',
          sort: 3,
          status: '1',
          visible: true,
          keepAlive: true,
          updateTime: '2026-04-15 10:30:00'
        }
      ]
    },
    {
      id: 3,
      parentId: null,
      title: '工具箱',
      menuType: 'directory',
      path: '/toolbox',
      component: '',
      permission: '',
      icon: 'ri:apps-2-line',
      sort: 3,
      status: '1',
      visible: true,
      keepAlive: true,
      updateTime: '2026-04-15 10:50:00',
      children: [
        {
          id: 31,
          parentId: 3,
          title: '商业计划书',
          menuType: 'menu',
          path: 'business-plan',
          component: '/toolbox/business-plan',
          permission: 'BusinessPlan',
          icon: 'ri:file-text-line',
          sort: 1,
          status: '1',
          visible: true,
          keepAlive: true,
          updateTime: '2026-04-15 10:50:00'
        },
        {
          id: 32,
          parentId: 3,
          title: '岗位分析',
          menuType: 'menu',
          path: 'job-analysis',
          component: '/toolbox/job-analysis',
          permission: 'JobAnalysis',
          icon: 'ri:bar-chart-box-line',
          sort: 2,
          status: '0',
          visible: true,
          keepAlive: true,
          updateTime: '2026-04-15 10:50:00'
        }
      ]
    }
  ]

  const tableRef = ref<TableInstance>()
  const isExpandAll = ref(true)
  const dialogVisible = ref(false)
  const dialogMode = ref<'add' | 'edit'>('add')
  const currentEditData = ref<MenuItem | null>(null)
  const currentParentId = ref<number | null>(null)
  const currentParentTitle = ref('')

  const rawTableData = ref<MenuItem[]>(createMockMenus())

  const searchForm = reactive({
    title: '',
    path: '',
    menuType: '',
    status: ''
  })

  const getTypeText = (type: MenuType) => {
    if (type === 'directory') return '目录'
    if (type === 'menu') return '菜单'
    return '按钮'
  }

  const getTypeShortText = (type: MenuType) => {
    if (type === 'directory') return '目'
    if (type === 'menu') return '菜'
    return '钮'
  }

  const getTypeTagType = (
    type: MenuType
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (type === 'directory') return 'info'
    if (type === 'menu') return 'primary'
    return 'warning'
  }

  const flattenMenus = (list: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = []
    const loop = (arr: MenuItem[]) => {
      arr.forEach((item) => {
        result.push(item)
        if (item.children?.length) loop(item.children)
      })
    }
    loop(list)
    return result
  }

  const flattenedCount = computed(() => flattenMenus(rawTableData.value).length)

  const statisticsCards = computed(() => {
    const all = flattenMenus(rawTableData.value)
    return [
      {
        label: '菜单节点',
        value: all.length,
        extra: '包含目录、菜单和按钮'
      },
      {
        label: '目录数量',
        value: all.filter((item) => item.menuType === 'directory').length,
        extra: '一级或分组菜单结构'
      },
      {
        label: '页面菜单',
        value: all.filter((item) => item.menuType === 'menu').length,
        extra: '实际可访问的页面菜单'
      },
      {
        label: '权限按钮',
        value: all.filter((item) => item.menuType === 'button').length,
        extra: '用于页面操作权限控制'
      }
    ]
  })

  const deepClone = <T,>(obj: T): T => JSON.parse(JSON.stringify(obj))

  const filterTree = (list: MenuItem[]): MenuItem[] => {
    const keywordTitle = searchForm.title.trim().toLowerCase()
    const keywordPath = searchForm.path.trim().toLowerCase()
    const type = searchForm.menuType
    const status = searchForm.status

    const loop = (items: MenuItem[]): MenuItem[] => {
      const result: MenuItem[] = []

      items.forEach((item) => {
        const children = item.children?.length ? loop(item.children) : []

        const titleMatch = !keywordTitle || item.title.toLowerCase().includes(keywordTitle)
        const pathMatch = !keywordPath || (item.path || '').toLowerCase().includes(keywordPath)
        const typeMatch = !type || item.menuType === type
        const statusMatch = !status || item.status === status

        if (children.length > 0) {
          const cloned = deepClone(item)
          cloned.children = children
          result.push(cloned)
          return
        }

        if (titleMatch && pathMatch && typeMatch && statusMatch) {
          result.push(deepClone(item))
        }
      })

      return result
    }

    return loop(list)
  }

  const tableViewData = computed(() => filterTree(rawTableData.value))

  const handleSearch = () => {}

  const handleReset = () => {
    searchForm.title = ''
    searchForm.path = ''
    searchForm.menuType = ''
    searchForm.status = ''
  }

  const handleRefresh = () => {
    rawTableData.value = createMockMenus()
    ElMessage.success('菜单数据已刷新')
  }

  const setExpandForAllRows = (rows: MenuItem[], expanded: boolean) => {
    rows.forEach((row) => {
      if (row.children?.length) {
        tableRef.value?.toggleRowExpansion(row, expanded)
        setExpandForAllRows(row.children, expanded)
      }
    })
  }

  const toggleExpandAll = async () => {
    isExpandAll.value = !isExpandAll.value
    await nextTick()
    setExpandForAllRows(tableViewData.value, isExpandAll.value)
  }

  const handleAddMenu = () => {
    dialogMode.value = 'add'
    currentEditData.value = null
    currentParentId.value = null
    currentParentTitle.value = ''
    dialogVisible.value = true
  }

  const handleAddChild = (row: MenuItem) => {
    dialogMode.value = 'add'
    currentEditData.value = {
      menuType: row.menuType === 'menu' ? 'button' : 'menu'
    } as MenuItem
    currentParentId.value = row.id
    currentParentTitle.value = row.title
    dialogVisible.value = true
  }

  const handleEdit = (row: MenuItem) => {
    dialogMode.value = 'edit'
    currentEditData.value = deepClone(row)
    currentParentId.value = row.parentId
    currentParentTitle.value = findTitleById(rawTableData.value, row.parentId)
    dialogVisible.value = true
  }

  const findTitleById = (list: MenuItem[], id: number | null): string => {
    if (id === null) return ''
    for (const item of list) {
      if (item.id === id) return item.title
      if (item.children?.length) {
        const result = findTitleById(item.children, id)
        if (result) return result
      }
    }
    return ''
  }

  const updateNode = (list: MenuItem[], target: MenuItem): boolean => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].id === target.id) {
        list[i] = { ...list[i], ...target }
        return true
      }
      if (list[i].children?.length && updateNode(list[i].children!, target)) {
        return true
      }
    }
    return false
  }

  const insertNode = (list: MenuItem[], parentId: number | null, node: MenuItem) => {
    if (parentId === null) {
      list.push(node)
      return true
    }

    for (const item of list) {
      if (item.id === parentId) {
        if (!item.children) item.children = []
        item.children.push(node)
        item.children.sort((a, b) => a.sort - b.sort)
        return true
      }
      if (item.children?.length && insertNode(item.children, parentId, node)) {
        return true
      }
    }

    return false
  }

  const removeNode = (list: MenuItem[], id: number): boolean => {
    const index = list.findIndex((item) => item.id === id)
    if (index > -1) {
      list.splice(index, 1)
      return true
    }

    for (const item of list) {
      if (item.children?.length && removeNode(item.children, id)) {
        return true
      }
    }

    return false
  }

  const handleDialogSubmit = (form: MenuDialogForm) => {
    const now = '2026-04-15 16:10:00'

    if (dialogMode.value === 'edit' && form.id) {
      updateNode(rawTableData.value, {
        ...(currentEditData.value as MenuItem),
        ...form,
        updateTime: now
      })
      ElMessage.success('菜单修改成功')
    } else {
      const newNode: MenuItem = {
        id: Date.now(),
        parentId: currentParentId.value,
        title: form.title,
        menuType: form.menuType,
        path: form.path,
        component: form.component,
        permission: form.permission,
        icon: form.icon,
        sort: form.sort,
        status: form.status,
        visible: form.visible,
        keepAlive: form.keepAlive,
        updateTime: now
      }

      insertNode(rawTableData.value, currentParentId.value, newNode)
      ElMessage.success('菜单新增成功')
    }

    dialogVisible.value = false
    nextTick(() => {
      if (isExpandAll.value) {
        setExpandForAllRows(tableViewData.value, true)
      }
    })
  }

  const toggleStatus = (row: MenuItem) => {
    row.status = row.status === '1' ? '0' : '1'
    row.updateTime = '2026-04-15 16:10:00'
    ElMessage.success(row.status === '1' ? '菜单已启用' : '菜单已禁用')
  }

  const handleDelete = async (row: MenuItem) => {
    await ElMessageBox.confirm(`确定删除“${row.title}”吗？删除后无法恢复。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消'
    })

    removeNode(rawTableData.value, row.id)
    ElMessage.success('删除成功')
  }
</script>

<style scoped lang="scss">
  .menu-page {
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

  .menu-name-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .menu-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;
    border: 1px solid var(--art-border-color);
    background: #f7f8fa;
    color: var(--art-text-gray-700);

    &.directory {
      background: #f4f6f8;
      color: #606266;
    }

    &.menu {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }

    &.button {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }
  }

  .menu-name-cell__content {
    min-width: 0;
  }

  .menu-name-cell__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--art-text-gray-900);
    line-height: 1.6;
  }

  .menu-name-cell__sub {
    font-size: 12px;
    color: var(--art-text-gray-500);
    line-height: 1.5;
    word-break: break-all;
  }

  .icon-text {
    font-size: 13px;
    color: var(--art-text-gray-600);
  }

  :deep(.el-table) {
    --el-table-header-bg-color: #fafafa;
  }

  :deep(.el-table th.el-table__cell) {
    color: var(--art-text-gray-700);
    font-weight: 600;
  }

  @media (max-width: 992px) {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>

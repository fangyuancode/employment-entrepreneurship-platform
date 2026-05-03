<template>
  <div class="menu-page">
    <div class="page-header art-card">
      <div class="page-header__left">
        <div class="page-title">菜单管理</div>
        <div class="page-desc">维护系统目录、页面菜单、按钮权限与角色可访问范围，菜单保存后会参与动态路由注册。</div>
      </div>
      <div class="page-header__right">
        <ElButton v-auth="'menu:add'" type="primary" @click="handleAddMenu">新增菜单</ElButton>
      </div>
    </div>

    <ElRow :gutter="20" class="mb-20">
      <ElCol :xs="24" :sm="12" :lg="4" v-for="item in statisticsCards" :key="item.label">
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
          <ElSelect v-model="searchForm.menuType" placeholder="请选择菜单类型" clearable style="width: 150px">
            <ElOption label="目录" value="directory" />
            <ElOption label="菜单" value="menu" />
            <ElOption label="按钮" value="button" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSelect v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 140px">
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
            <ElButton :loading="loading" @click="handleRefresh">刷新</ElButton>
          </ElSpace>
        </div>
        <div class="table-toolbar__right">
          <div class="toolbar-tip">当前共 {{ flattenedCount }} 个节点</div>
        </div>
      </div>

      <ElTable :key="tableKey" ref="tableRef" v-loading="loading" :data="tableData" row-key="id" border :default-expand-all="isExpandAll" :tree-props="{ children: 'children' }" style="width: 100%">
        <ElTableColumn label="菜单名称" min-width="280">
          <template #default="{ row }">
            <div class="menu-name-cell">
              <div class="menu-icon" :class="row.menuType">
                <span>{{ getTypeShortText(row.menuType) }}</span>
              </div>
              <div class="menu-name-cell__content">
                <div class="menu-name-cell__title">{{ getMenuTitle(row) }}</div>
                <div class="menu-name-cell__sub">
                  <template v-if="row.menuType === 'button'">
                    权限标识：{{ row.permission || '-' }}
                  </template>
                  <template v-else>
                    路由名称：{{ row.name || '-' }}，组件路径：{{ row.component || '—' }}
                  </template>
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

        <ElTableColumn prop="path" label="路由地址" min-width="160" show-overflow-tooltip />

        <ElTableColumn label="权限标识" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.permission || '-' }}
          </template>
        </ElTableColumn>

        <ElTableColumn label="图标" width="140" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="icon-text">{{ row.icon || '-' }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="排序" width="90" align="center">
          <template #default="{ row }">
            {{ row.sort }}
          </template>
        </ElTableColumn>

        <ElTableColumn label="显示" width="90" align="center">
          <template #default="{ row }">
            <ElTag :type="row.visible ? 'success' : 'info'" effect="light" round>
              {{ row.visible ? '显示' : '隐藏' }}
            </ElTag>
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
              <ElButton v-if="row.menuType !== 'button'" v-auth="'menu:add'" link type="primary" @click="handleAddChild(row)">
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

    <MenuDialog v-model:visible="dialogVisible" :mode="dialogMode" :parent-title="currentParentTitle" :edit-data="currentEditData" @submit="handleDialogSubmit" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { ElMessageBox, type TableInstance } from 'element-plus'
import {
  fetchAddMenu,
  fetchDeleteMenu,
  fetchGetMenuManageList,
  fetchGetMenuStatistics,
  fetchUpdateMenu,
  fetchUpdateMenuStatus
} from '@/api/system-manage'
import MenuDialog from './modules/menu-dialog.vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

/**
 * 菜单名称显示处理
 * 数据库中如果保存的是 menus.xxx 这种国际化 key，则转换成当前语言
 * 如果数据库中保存的是普通中文，例如“新增用户”，则直接显示
 */
const getMenuTitle = (row: any) => {
  const title = row.title || row.menuName || row.name || ''

  if (!title) return '-'

  return te(title) ? t(title) : title
}
defineOptions({ name: 'Menus' })

type MenuType = Api.SystemManage.MenuType
type MenuItem = Api.SystemManage.MenuListItem
type MenuDialogForm = Api.SystemManage.MenuSaveParams
type MenuSearchParams = Api.SystemManage.MenuSearchParams

const tableRef = ref<TableInstance>()
const tableKey = ref(0)
const loading = ref(false)
const isExpandAll = ref(true)
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentEditData = ref<Partial<MenuDialogForm> | null>(null)
const currentParentId = ref<number | null>(null)
const currentParentTitle = ref('')

const tableData = ref<MenuItem[]>([])
const statistics = ref<Api.SystemManage.MenuStatistics>({
  total: 0,
  directory: 0,
  menu: 0,
  button: 0,
  enabled: 0,
  disabled: 0
})

const searchForm = reactive<MenuSearchParams>({
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

const getTypeTagType = (type: MenuType): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
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

const flattenedCount = computed(() => flattenMenus(tableData.value).length)

const statisticsCards = computed(() => [
  {
    label: '菜单节点',
    value: statistics.value.total,
    extra: '包含目录、页面和按钮'
  },
  {
    label: '目录数量',
    value: statistics.value.directory,
    extra: '一级或分组菜单结构'
  },
  {
    label: '页面菜单',
    value: statistics.value.menu,
    extra: '实际可访问页面'
  },
  {
    label: '权限按钮',
    value: statistics.value.button,
    extra: '页面操作权限控制'
  },
  {
    label: '启用节点',
    value: statistics.value.enabled,
    extra: '参与菜单与权限控制'
  },
  {
    label: '禁用节点',
    value: statistics.value.disabled,
    extra: '不会进入动态菜单'
  }
])

const loadMenuList = async () => {
  loading.value = true
  try {
    tableData.value = await fetchGetMenuManageList({ ...searchForm })
    tableKey.value += 1
    await nextTick()
  } finally {
    loading.value = false
  }
}

const loadStatistics = async () => {
  statistics.value = await fetchGetMenuStatistics()
}

const handleSearch = () => {
  loadMenuList()
}

const handleReset = () => {
  searchForm.title = ''
  searchForm.path = ''
  searchForm.menuType = ''
  searchForm.status = ''
  loadMenuList()
}

const handleRefresh = async () => {
  await Promise.all([loadMenuList(), loadStatistics()])
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
  tableKey.value += 1
  await nextTick()
  setExpandForAllRows(tableData.value, isExpandAll.value)
}

const handleAddMenu = () => {
  dialogMode.value = 'add'
  currentParentId.value = null
  currentParentTitle.value = ''
  currentEditData.value = {
    parentId: null,
    menuType: 'directory',
    component: '/index/index',
    sort: flattenMenus(tableData.value).length + 1,
    status: '1',
    visible: true,
    keepAlive: true
  }
  dialogVisible.value = true
}

const handleAddChild = (row: MenuItem) => {
  dialogMode.value = 'add'
  currentParentId.value = row.id
  currentParentTitle.value = row.title
  currentEditData.value = {
    parentId: row.id,
    menuType: row.menuType === 'menu' ? 'button' : 'menu',
    sort: (row.children?.length || 0) + 1,
    status: '1',
    visible: true,
    keepAlive: true
  }
  dialogVisible.value = true
}

const handleEdit = (row: MenuItem) => {
  dialogMode.value = 'edit'
  currentParentId.value = row.parentId
  currentParentTitle.value = findTitleById(tableData.value, row.parentId)
  currentEditData.value = { ...row }
  dialogVisible.value = true
}

const findTitleById = (list: MenuItem[], id: number | null): string => {
  if (id === null || id === undefined) return ''
  for (const item of list) {
    if (item.id === id) return item.title
    if (item.children?.length) {
      const result = findTitleById(item.children, id)
      if (result) return result
    }
  }
  return ''
}

const handleDialogSubmit = async (form: MenuDialogForm) => {
  const payload: MenuDialogForm = {
    ...form,
    parentId:
      dialogMode.value === 'edit' ? form.parentId ?? currentParentId.value : currentParentId.value
  }

  if (dialogMode.value === 'edit' && form.id) {
    await fetchUpdateMenu(payload)
  } else {
    await fetchAddMenu(payload)
  }

  dialogVisible.value = false
  await handleRefresh()
}

const toggleStatus = async (row: MenuItem) => {
  const nextStatus = row.status === '1' ? '0' : '1'
  await fetchUpdateMenuStatus(row.id, nextStatus)
  await handleRefresh()
}

const handleDelete = async (row: MenuItem) => {
  const childTip = row.children?.length
    ? '该节点存在子菜单，删除后子菜单和角色授权关系也会一并删除。'
    : ''
  await ElMessageBox.confirm(`确定删除“${row.title}”吗？${childTip}删除后无法恢复。`, '删除确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  })

  await fetchDeleteMenu(row.id)
  await handleRefresh()
}

onMounted(() => {
  handleRefresh()
})
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
  height: 122px;
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
  font-size: 28px;
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

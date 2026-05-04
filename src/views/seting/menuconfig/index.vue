<template>
  <div class="menu-config-page">
    <div class="page-header art-card">
      <div class="page-header__left">
        <div class="page-title">菜单配置</div>
        <div class="page-desc">
          在这里维护系统一级菜单、二级页面菜单和按钮权限。保存后数据会写入后端菜单表，重新登录后即可进入动态菜单。
        </div>
      </div>
      <div class="page-header__right">
        <ElSpace wrap>
          <ElButton type="primary" @click="handleAddRoot">新增一级菜单</ElButton>
          <ElButton plain type="primary" @click="handleAddPage">新增二级菜单</ElButton>
        </ElSpace>
      </div>
    </div>

    <ElRow :gutter="20" class="mb-20">
      <ElCol v-for="item in statisticsCards" :key="item.label" :xs="24" :sm="12" :lg="4">
        <div class="art-card stat-card">
          <div class="stat-card__label">{{ item.label }}</div>
          <div class="stat-card__value">{{ item.value }}</div>
          <div class="stat-card__extra">{{ item.extra }}</div>
        </div>
      </ElCol>
    </ElRow>

    <div class="art-card guide-card mb-20">
      <div class="guide-card__title">配置说明</div>
      <div class="guide-list">
        <div class="guide-item">
          <span class="guide-index">1</span>
          <span>一级菜单一般选择“目录”，例如：系统设置，path 写 <b>/seting</b>，component 写 <b>/index/index</b>。</span>
        </div>
        <div class="guide-item">
          <span class="guide-index">2</span>
          <span>二级页面菜单选择“菜单”，例如：菜单配置，path 写 <b>menuconfig</b>，component 写 <b>/seting/menuconfig</b>。</span>
        </div>
        <div class="guide-item">
          <span class="guide-index">3</span>
          <span>按钮权限选择“按钮”，挂在页面菜单下面，permission 写 <b>menu:add</b>、<b>menu:edit</b> 等权限标识。</span>
        </div>
      </div>
    </div>

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
            <ElButton type="primary" plain @click="handleAddRoot">新增一级菜单</ElButton>
            <ElButton plain type="primary" @click="handleAddPage">新增二级菜单</ElButton>
            <ElButton @click="toggleExpandAll">{{ isExpandAll ? '收起全部' : '展开全部' }}</ElButton>
            <ElButton :loading="loading" @click="handleRefresh">刷新</ElButton>
          </ElSpace>
        </div>
        <div class="table-toolbar__right">
          <span class="toolbar-tip">当前共 {{ flattenedCount }} 个节点</span>
        </div>
      </div>

      <ElTable
        :key="tableKey"
        ref="tableRef"
        v-loading="loading"
        :data="tableData"
        row-key="id"
        border
        :default-expand-all="isExpandAll"
        :tree-props="{ children: 'children' }"
        style="width: 100%"
      >
        <ElTableColumn label="菜单名称" min-width="280">
          <template #default="{ row }">
            <div class="menu-name-cell">
              <div class="menu-icon" :class="row.menuType">
                <span>{{ getTypeShortText(row.menuType) }}</span>
              </div>
              <div class="menu-name-cell__content">
                <div class="menu-name-cell__title">{{ getMenuTitle(row) }}</div>
                <div class="menu-name-cell__sub">
                  <template v-if="row.menuType === 'button'">权限标识：{{ row.permission || '-' }}</template>
                  <template v-else>路由名称：{{ row.name || '-' }}，组件路径：{{ row.component || '—' }}</template>
                </div>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="类型" width="100" align="center">
          <template #default="{ row }">
            <ElTag :type="getTypeTagType(row.menuType)" effect="light" round>{{ getTypeText(row.menuType) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="path" label="路由地址" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="component" label="组件路径" min-width="190" show-overflow-tooltip />
        <ElTableColumn label="权限标识" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.permission || '-' }}</template>
        </ElTableColumn>
        <ElTableColumn label="图标" width="140" align="center" show-overflow-tooltip>
          <template #default="{ row }">{{ row.icon || '-' }}</template>
        </ElTableColumn>
        <ElTableColumn label="排序" width="80" align="center">
          <template #default="{ row }">{{ row.sort }}</template>
        </ElTableColumn>
        <ElTableColumn label="显示" width="86" align="center">
          <template #default="{ row }">
            <ElTag :type="row.visible ? 'success' : 'info'" effect="light" round>{{ row.visible ? '显示' : '隐藏' }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="96" align="center">
          <template #default="{ row }">
            <ElTag :type="row.status === '1' ? 'success' : 'danger'" effect="light" round>{{ row.status === '1' ? '启用' : '禁用' }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="updateTime" label="更新时间" min-width="170" />
        <ElTableColumn label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <ElSpace wrap>
              <ElButton v-if="row.menuType !== 'button'" link type="primary" @click="handleAddChild(row)">新增子项</ElButton>
              <ElButton link type="primary" @click="handleEdit(row)">编辑</ElButton>
              <ElButton link type="warning" @click="toggleStatus(row)">{{ row.status === '1' ? '禁用' : '启用' }}</ElButton>
              <ElButton link type="danger" @click="handleDelete(row)">删除</ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <MenuConfigDialog
      v-model:visible="dialogVisible"
      :mode="dialogMode"
      :edit-data="currentEditData"
      :parent-options="parentOptions"
      @submit="handleDialogSubmit"
    />
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
import MenuConfigDialog from './modules/menu-config-dialog.vue'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

defineOptions({ name: 'MenuConfig' })

type MenuType = Api.SystemManage.MenuType
type MenuItem = Api.SystemManage.MenuListItem
type MenuDialogForm = Api.SystemManage.MenuSaveParams
type MenuSearchParams = Api.SystemManage.MenuSearchParams

type ParentOption = MenuItem & { disabled?: boolean; children?: ParentOption[] }

const tableRef = ref<TableInstance>()
const tableKey = ref(0)
const loading = ref(false)
const isExpandAll = ref(true)
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const currentEditData = ref<Partial<MenuDialogForm> | null>(null)

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

const getMenuTitle = (row: Partial<MenuItem>) => {
  const title = row.title || row.name || ''
  if (!title) return '-'
  return te(title) ? t(title) : title
}

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

const collectDescendantIds = (list: MenuItem[], id?: number): number[] => {
  if (!id) return []
  const result: number[] = []
  const findAndCollect = (arr: MenuItem[]): boolean => {
    for (const item of arr) {
      if (item.id === id) {
        const collect = (node: MenuItem) => {
          result.push(node.id)
          node.children?.forEach(collect)
        }
        item.children?.forEach(collect)
        return true
      }
      if (item.children?.length && findAndCollect(item.children)) return true
    }
    return false
  }
  findAndCollect(list)
  return result
}

const parentOptions = computed<ParentOption[]>(() => {
  const editingId = currentEditData.value?.id
  const disabledIds = new Set<number>([...(editingId ? [editingId] : []), ...collectDescendantIds(tableData.value, editingId)])

  const convert = (items: MenuItem[]): ParentOption[] =>
    items
      .filter((item) => item.menuType !== 'button')
      .map((item) => ({
        ...item,
        title: getMenuTitle(item),
        disabled: disabledIds.has(item.id),
        children: item.children?.length ? convert(item.children) : []
      }))

  return [
    {
      id: 0,
      parentId: null,
      title: '作为一级菜单',
      name: 'RootMenu',
      menuType: 'directory',
      path: '',
      component: '/index/index',
      permission: '',
      icon: '',
      sort: 0,
      status: '1',
      visible: true,
      keepAlive: true,
      isHide: false,
      isHideTab: false,
      fixedTab: false,
      isIframe: false,
      externalLink: '',
      children: convert(tableData.value)
    }
  ]
})

const flattenedCount = computed(() => flattenMenus(tableData.value).length)

const statisticsCards = computed(() => [
  { label: '菜单节点', value: statistics.value.total, extra: '目录、页面和按钮总数' },
  { label: '一级目录', value: statistics.value.directory, extra: '负责侧边栏分组' },
  { label: '页面菜单', value: statistics.value.menu, extra: '对应前端 Vue 页面' },
  { label: '按钮权限', value: statistics.value.button, extra: '控制新增、编辑等操作' },
  { label: '启用节点', value: statistics.value.enabled, extra: '参与动态路由生成' },
  { label: '禁用节点', value: statistics.value.disabled, extra: '不会显示到菜单中' }
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

const handleRefresh = async () => {
  await Promise.all([loadMenuList(), loadStatistics()])
}

const handleSearch = () => loadMenuList()

const handleReset = () => {
  searchForm.title = ''
  searchForm.path = ''
  searchForm.menuType = ''
  searchForm.status = ''
  loadMenuList()
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

const handleAddRoot = () => {
  dialogMode.value = 'add'
  currentEditData.value = {
    parentId: 0,
    menuType: 'directory',
    title: '',
    name: '',
    path: '',
    component: '/index/index',
    permission: '',
    icon: 'ri-folder-settings-line',
    sort: flattenMenus(tableData.value).length + 1,
    status: '1',
    visible: true,
    keepAlive: true,
    isHide: false
  }
  dialogVisible.value = true
}

const handleAddPage = () => {
  dialogMode.value = 'add'
  const firstDirectory = flattenMenus(tableData.value).find((item) => item.menuType === 'directory')
  currentEditData.value = {
    parentId: firstDirectory?.id || 0,
    menuType: 'menu',
    title: '',
    name: '',
    path: '',
    component: '',
    permission: '',
    icon: 'ri-file-list-line',
    sort: 1,
    status: '1',
    visible: true,
    keepAlive: true,
    isHide: false
  }
  dialogVisible.value = true
}

const handleAddChild = (row: MenuItem) => {
  dialogMode.value = 'add'
  currentEditData.value = {
    parentId: row.id,
    menuType: row.menuType === 'menu' ? 'button' : 'menu',
    title: '',
    name: '',
    path: '',
    component: '',
    permission: '',
    icon: row.menuType === 'menu' ? '' : 'ri-file-list-line',
    sort: (row.children?.length || 0) + 1,
    status: '1',
    visible: true,
    keepAlive: true,
    isHide: false
  }
  dialogVisible.value = true
}

const handleEdit = (row: MenuItem) => {
  dialogMode.value = 'edit'
  currentEditData.value = { ...row, parentId: row.parentId || 0 }
  dialogVisible.value = true
}

const handleDialogSubmit = async (form: MenuDialogForm) => {
  const payload: MenuDialogForm = {
    ...form,
    parentId: form.parentId || 0
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
  const childTip = row.children?.length ? '该节点存在子菜单，删除后子菜单和角色授权关系也会一并删除。' : ''
  await ElMessageBox.confirm(`确定删除“${getMenuTitle(row)}”吗？${childTip}删除后无法恢复。`, '删除确认', {
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
.menu-config-page {
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
  margin-bottom: 0;
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

.guide-card {
  padding: 18px 20px;
}

.guide-card__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--art-text-gray-900);
  margin-bottom: 14px;
}

.guide-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid var(--art-border-color);
  border-radius: 12px;
  background: #fafafa;
  font-size: 13px;
  color: var(--art-text-gray-600);
  line-height: 1.7;
}

.guide-index {
  width: 22px;
  height: 22px;
  flex: 0 0 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  font-weight: 700;
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

:deep(.el-table) {
  --el-table-header-bg-color: #fafafa;
}

:deep(.el-table th.el-table__cell) {
  color: var(--art-text-gray-700);
  font-weight: 600;
}

@media (max-width: 1200px) {
  .guide-list {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<template>
  <ElDialog
    v-model="visible"
    title="菜单权限"
    width="620px"
    align-center
    class="el-dialog-border"
    @open="loadPermissionData"
    @close="handleClose"
  >
    <div class="permission-header" v-if="roleData">
      <div>
        <div class="permission-header__title">{{ roleData.roleName }}</div>
        <div class="permission-header__desc">角色编码：{{ roleData.roleCode }}</div>
      </div>
      <ElTag :type="roleData.enabled ? 'success' : 'warning'">
        {{ roleData.enabled ? '启用' : '禁用' }}
      </ElTag>
    </div>

    <ElAlert
      title="勾选菜单后，该角色重新登录即可获得对应菜单和按钮权限。父级半选状态也会保存，保证动态路由结构完整。"
      type="info"
      :closable="false"
      class="mb-12"
    />

    <ElScrollbar height="62vh" v-loading="loading">
      <ElTree
        ref="treeRef"
        :data="menuTree"
        show-checkbox
        node-key="id"
        :default-expand-all="isExpandAll"
        :props="defaultProps"
        @check="handleTreeCheck"
      >
        <template #default="{ data }">
          <div class="tree-node">
            <ElTag size="small" :type="getTypeTagType(data.menuType)" effect="light">
              {{ getTypeText(data.menuType) }}
            </ElTag>
            <span class="tree-node__title">{{ data.title }}</span>
            <span v-if="data.permission" class="tree-node__permission">{{ data.permission }}</span>
          </div>
        </template>
      </ElTree>
    </ElScrollbar>

    <template #footer>
      <ElSpace wrap>
        <ElButton @click="toggleExpandAll">{{ isExpandAll ? '全部收起' : '全部展开' }}</ElButton>
        <ElButton @click="toggleSelectAll">{{ isSelectAll ? '取消全选' : '全部选择' }}</ElButton>
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" :loading="saving" @click="savePermission">保存</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { computed, nextTick, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    fetchGetMenuPermissionTree,
    fetchGetRoleMenuIds,
    fetchSaveRoleMenus
  } from '@/api/system-manage'

  type RoleListItem = Api.SystemManage.RoleListItem
  type MenuNode = Api.SystemManage.MenuListItem
  type MenuType = Api.SystemManage.MenuType

  interface Props {
    modelValue: boolean
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const treeRef = ref()
  const loading = ref(false)
  const saving = ref(false)
  const isExpandAll = ref(true)
  const isSelectAll = ref(false)
  const menuTree = ref<MenuNode[]>([])

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const defaultProps = {
    children: 'children',
    label: 'title'
  }

  const getTypeText = (type: MenuType) => {
    if (type === 'directory') return '目录'
    if (type === 'menu') return '菜单'
    return '按钮'
  }

  const getTypeTagType = (
    type: MenuType
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (type === 'directory') return 'info'
    if (type === 'menu') return 'primary'
    return 'warning'
  }

  const loadPermissionData = async () => {
    if (!props.roleData?.roleId) return

    loading.value = true
    try {
      const [tree, checkedIds] = await Promise.all([
        fetchGetMenuPermissionTree(),
        fetchGetRoleMenuIds(props.roleData.roleId)
      ])

      menuTree.value = tree
      await nextTick()
      treeRef.value?.setCheckedKeys(checkedIds || [])
      handleTreeCheck()
    } finally {
      loading.value = false
    }
  }

  const handleClose = () => {
    visible.value = false
    treeRef.value?.setCheckedKeys([])
    isSelectAll.value = false
  }

  const getNumberKeys = (keys: Array<string | number>) => {
    return keys.map((key) => Number(key)).filter((key) => Number.isFinite(key))
  }

  const savePermission = async () => {
    if (!props.roleData?.roleId || !treeRef.value) {
      ElMessage.warning('请选择角色')
      return
    }

    const checkedKeys = getNumberKeys(treeRef.value.getCheckedKeys(false))
    const halfCheckedKeys = getNumberKeys(treeRef.value.getHalfCheckedKeys())
    const menuIds = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))

    saving.value = true
    try {
      await fetchSaveRoleMenus({
        roleId: props.roleData.roleId,
        menuIds
      })
      emit('success')
      handleClose()
    } finally {
      saving.value = false
    }
  }

  const toggleExpandAll = () => {
    const tree = treeRef.value
    if (!tree) return

    Object.values(tree.store.nodesMap).forEach((node: any) => {
      node.expanded = !isExpandAll.value
    })

    isExpandAll.value = !isExpandAll.value
  }

  const getAllNodeKeys = (nodes: MenuNode[]): number[] => {
    const keys: number[] = []
    const traverse = (nodeList: MenuNode[]) => {
      nodeList.forEach((node) => {
        keys.push(node.id)
        if (node.children?.length) traverse(node.children)
      })
    }
    traverse(nodes)
    return keys
  }

  const toggleSelectAll = () => {
    const tree = treeRef.value
    if (!tree) return

    if (!isSelectAll.value) {
      tree.setCheckedKeys(getAllNodeKeys(menuTree.value))
    } else {
      tree.setCheckedKeys([])
    }

    isSelectAll.value = !isSelectAll.value
  }

  const handleTreeCheck = () => {
    const tree = treeRef.value
    if (!tree) return

    const checkedKeys = tree.getCheckedKeys(false)
    const allKeys = getAllNodeKeys(menuTree.value)
    isSelectAll.value = checkedKeys.length === allKeys.length && allKeys.length > 0
  }
</script>

<style scoped lang="scss">
  .permission-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
    border: 1px solid var(--art-border-color);
    border-radius: 12px;
    background: #fafafa;
  }

  .permission-header__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--art-text-gray-900);
  }

  .permission-header__desc {
    margin-top: 4px;
    font-size: 13px;
    color: var(--art-text-gray-500);
  }

  .mb-12 {
    margin-bottom: 12px;
  }

  .tree-node {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .tree-node__title {
    color: var(--art-text-gray-800);
  }

  .tree-node__permission {
    font-size: 12px;
    color: var(--art-text-gray-500);
  }
</style>

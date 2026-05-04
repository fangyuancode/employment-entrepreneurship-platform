<template>
  <ElDialog :model-value="visible" :title="dialogTitle" width="820px" destroy-on-close @update:model-value="handleClose">
    <ElAlert
      title="页面保存后会立即写入 sys_menu 表；如果要让侧边栏立刻刷新，请退出登录后重新登录。"
      type="info"
      :closable="false"
      class="mb-16"
    />

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="108px">
      <ElRow :gutter="16">
        <ElCol :span="24">
          <ElFormItem label="菜单类型" prop="menuType">
            <ElRadioGroup v-model="form.menuType" :disabled="mode === 'edit'">
              <ElRadioButton label="directory" value="directory">一级目录</ElRadioButton>
              <ElRadioButton label="menu" value="menu">页面菜单</ElRadioButton>
              <ElRadioButton label="button" value="button">按钮权限</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="父级菜单" prop="parentId">
            <ElTreeSelect
              v-model="form.parentId"
              :data="parentOptions"
              :props="treeProps"
              node-key="id"
              check-strictly
              default-expand-all
              clearable
              placeholder="请选择父级菜单，选择“作为一级菜单”则创建一级菜单"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="菜单名称" prop="title">
            <ElInput v-model="form.title" placeholder="如：系统设置 / 菜单配置" @blur="autoFillByTitle" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="路由名称" prop="name">
            <ElInput v-model="form.name" :placeholder="form.menuType === 'button' ? '按钮可留空' : '如：Setting / MenuConfig'" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="路由地址" prop="path">
            <ElInput v-model="form.path" :disabled="form.menuType === 'button'" :placeholder="pathPlaceholder" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="组件路径" prop="component">
            <ElInput v-model="form.component" :disabled="form.menuType === 'button'" :placeholder="componentPlaceholder" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="权限标识" prop="permission">
            <ElInput v-model="form.permission" :placeholder="permissionPlaceholder" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="菜单图标">
            <ElInput v-model="form.icon" :disabled="form.menuType === 'button'" placeholder="如：ri-settings-3-line" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="排序" prop="sort">
            <ElInputNumber v-model="form.sort" :min="1" :max="9999" controls-position="right" style="width: 100%" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="form.status" placeholder="请选择状态" style="width: 100%">
              <ElOption label="启用" value="1" />
              <ElOption label="禁用" value="0" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="外链地址">
            <ElInput v-model="form.externalLink" :disabled="form.menuType === 'button'" placeholder="外链菜单可填写 https://...，普通菜单留空" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <div class="switch-grid">
            <ElFormItem label="菜单显示">
              <ElSwitch v-model="form.visible" :disabled="form.menuType === 'button'" />
            </ElFormItem>
            <ElFormItem v-if="form.menuType !== 'button'" label="页面缓存">
              <ElSwitch v-model="form.keepAlive" />
            </ElFormItem>
            <ElFormItem v-if="form.menuType !== 'button'" label="隐藏标签">
              <ElSwitch v-model="form.isHideTab" />
            </ElFormItem>
            <ElFormItem v-if="form.menuType !== 'button'" label="固定标签">
              <ElSwitch v-model="form.fixedTab" />
            </ElFormItem>
            <ElFormItem v-if="form.menuType !== 'button'" label="Iframe">
              <ElSwitch v-model="form.isIframe" />
            </ElFormItem>
          </div>
        </ElCol>
      </ElRow>
    </ElForm>

    <div class="example-box">
      <div class="example-title">常用填写示例</div>
      <div class="example-content">
        <template v-if="form.menuType === 'directory'">
          一级目录：菜单名称“系统设置”，路由名称“Setting”，路由地址“/seting”，组件路径“/index/index”。
        </template>
        <template v-else-if="form.menuType === 'menu'">
          二级页面：菜单名称“菜单配置”，路由名称“MenuConfig”，路由地址“menuconfig”，组件路径“/seting/menuconfig”。
        </template>
        <template v-else>
          按钮权限：菜单名称“新增菜单”，权限标识“menu:add”，父级选择具体页面菜单。
        </template>
      </div>
    </div>

    <template #footer>
      <ElSpace>
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定保存</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

type MenuDialogForm = Api.SystemManage.MenuSaveParams
type MenuType = Api.SystemManage.MenuType

type ParentOption = Api.SystemManage.MenuListItem & {
  disabled?: boolean
  children?: ParentOption[]
}

interface Props {
  visible: boolean
  mode?: 'add' | 'edit'
  editData?: Partial<MenuDialogForm> | null
  parentOptions?: ParentOption[]
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', value: MenuDialogForm): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'add',
  editData: null,
  parentOptions: () => []
})

const emit = defineEmits<Emits>()
const formRef = ref<FormInstance>()

const treeProps = {
  label: 'title',
  children: 'children',
  disabled: 'disabled'
}

const getDefaultForm = (): MenuDialogForm => ({
  id: undefined,
  parentId: 0,
  title: '',
  name: '',
  menuType: 'menu',
  path: '',
  component: '',
  permission: '',
  icon: '',
  sort: 1,
  status: '1',
  visible: true,
  keepAlive: true,
  isHide: false,
  isHideTab: false,
  fixedTab: false,
  isIframe: false,
  externalLink: ''
})

const form = reactive<MenuDialogForm>(getDefaultForm())

const dialogTitle = computed(() => (props.mode === 'edit' ? '编辑菜单' : '新增菜单'))

const pathPlaceholder = computed(() => {
  if (form.menuType === 'directory') return '一级目录如：/seting、/system'
  if (form.menuType === 'menu') return '二级页面如：menuconfig、user、role'
  return '按钮不需要填写路由地址'
})

const componentPlaceholder = computed(() => {
  if (form.menuType === 'directory') return '目录默认 /index/index'
  if (form.menuType === 'menu') return '如：/seting/menuconfig、/system/user'
  return '按钮不需要填写组件路径'
})

const permissionPlaceholder = computed(() => {
  if (form.menuType === 'button') return '如：menu:add、menu:edit、user:delete'
  return '页面权限可选，通常可以留空'
})

const rules = computed<FormRules>(() => {
  const currentRules: FormRules = {
    parentId: [{ required: true, message: '请选择父级菜单', trigger: 'change' }],
    title: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    sort: [{ required: true, message: '请输入排序', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]
  }

  if (form.menuType !== 'button') {
    currentRules.name = [{ required: true, message: '请输入路由名称', trigger: 'blur' }]
    currentRules.path = [{ required: true, message: '请输入路由地址', trigger: 'blur' }]
  }

  if (form.menuType === 'menu') {
    currentRules.component = [{ required: true, message: '请输入组件路径', trigger: 'blur' }]
  }

  if (form.menuType === 'button') {
    currentRules.permission = [{ required: true, message: '请输入按钮权限标识', trigger: 'blur' }]
  }

  return currentRules
})

const resetForm = () => {
  Object.assign(form, getDefaultForm())
}

watch(
  () => props.visible,
  (val) => {
    if (!val) return
    resetForm()
    if (props.editData) Object.assign(form, props.editData)
    form.parentId = form.parentId || 0
  },
  { immediate: true }
)

watch(
  () => form.menuType,
  (type: MenuType) => {
    if (type === 'directory') {
      form.component = form.component || '/index/index'
      form.permission = form.permission || ''
    }

    if (type === 'menu') {
      form.component = form.component || ''
    }

    if (type === 'button') {
      form.path = ''
      form.component = ''
      form.icon = ''
      form.keepAlive = false
      form.isHide = false
      form.visible = true
      form.isHideTab = false
      form.fixedTab = false
      form.isIframe = false
      form.externalLink = ''
    }
  }
)

const simplePinyinMap: Record<string, string> = {
  系统设置: 'Setting',
  菜单配置: 'MenuConfig',
  用户登录管理: 'UserLoginManager',
  用户管理: 'User',
  角色管理: 'Role',
  数据管理: 'DataManage',
  工作台: 'Dashboard',
  控制台: 'Console'
}

const lowerFirst = (value: string) => (value ? value.charAt(0).toLowerCase() + value.slice(1) : value)

const autoFillByTitle = () => {
  const title = (form.title || '').trim()
  if (!title) return

  const routeName = simplePinyinMap[title]
  if (routeName && !form.name && form.menuType !== 'button') form.name = routeName

  if (form.menuType === 'directory') {
    if (!form.path && routeName) form.path = `/${lowerFirst(routeName)}`
    if (!form.component) form.component = '/index/index'
  }

  if (form.menuType === 'menu') {
    if (!form.path && routeName) form.path = lowerFirst(routeName)
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const normalizeForm = (): MenuDialogForm => {
  const result: MenuDialogForm = { ...form }

  result.parentId = result.parentId || 0
  result.title = result.title.trim()
  result.name = (result.name || '').trim()
  result.path = (result.path || '').trim()
  result.component = (result.component || '').trim()
  result.permission = (result.permission || '').trim()
  result.icon = (result.icon || '').trim()
  result.externalLink = (result.externalLink || '').trim()
  result.isHide = result.visible === false

  if (result.menuType === 'directory') {
    result.component = result.component || '/index/index'
    result.permission = result.permission || ''
  }

  if (result.menuType === 'button') {
    result.name = result.name || result.permission || result.title
    result.path = ''
    result.component = ''
    result.icon = ''
    result.keepAlive = false
    result.isHide = false
    result.visible = true
    result.isHideTab = false
    result.fixedTab = false
    result.isIframe = false
    result.externalLink = ''
  }

  return result
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    const result = normalizeForm()

    if (result.menuType === 'button' && !result.parentId) {
      ElMessage.error('按钮权限必须挂在具体页面菜单下面')
      return
    }

    emit('submit', result)
  } catch {
    ElMessage.error('请完善表单信息')
  }
}
</script>

<style scoped lang="scss">
.mb-16 {
  margin-bottom: 16px;
}

.switch-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0 12px;
}

.example-box {
  margin-top: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #fafafa;
  border: 1px solid var(--art-border-color);
}

.example-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--art-text-gray-900);
  margin-bottom: 6px;
}

.example-content {
  font-size: 13px;
  line-height: 1.7;
  color: var(--art-text-gray-600);
}

:deep(.el-dialog__body) {
  padding-top: 18px;
  padding-bottom: 10px;
}

@media (max-width: 768px) {
  .switch-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>

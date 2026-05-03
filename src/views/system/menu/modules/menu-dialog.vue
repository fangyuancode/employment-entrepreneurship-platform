<template>
  <ElDialog :model-value="visible" :title="dialogTitle" width="760px" destroy-on-close @update:model-value="handleClose">
    <ElAlert v-if="parentTitle" :title="`当前父级：${parentTitle}`" type="info" :closable="false" class="mb-16" />

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="104px">
      <ElRow :gutter="16">
        <ElCol :span="24">
          <ElFormItem label="菜单类型" prop="menuType">
            <ElRadioGroup v-model="form.menuType" :disabled="mode === 'edit'">
              <ElRadioButton label="directory" value="directory">目录</ElRadioButton>
              <ElRadioButton label="menu" value="menu">菜单</ElRadioButton>
              <ElRadioButton label="button" value="button">按钮</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="名称" prop="title">
            <ElInput v-model="form.title" placeholder="如：用户管理" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="路由名称" prop="name">
            <ElInput v-model="form.name" :placeholder="form.menuType === 'button' ? '按钮可留空' : '如：User / SystemUser'" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="排序" prop="sort">
            <ElInputNumber v-model="form.sort" :min="1" :max="9999" controls-position="right" style="width: 100%" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="图标">
            <ElInput v-model="form.icon" :disabled="form.menuType === 'button'" placeholder="如：ri:user-line" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="路由地址" prop="path">
            <ElInput v-model="form.path" :disabled="form.menuType === 'button'" :placeholder="form.parentId ? '如：user' : '如：/system'" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="组件路径" prop="component">
            <ElInput v-model="form.component" :disabled="form.menuType === 'button'" :placeholder="form.menuType === 'directory' ? '目录默认 /index/index' : '如：/system/user'" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="权限标识" prop="permission">
            <ElInput v-model="form.permission" :placeholder="form.menuType === 'button' ? '如：user:add' : '页面菜单可选，如：SystemUser'" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="外链地址">
            <ElInput v-model="form.externalLink" :disabled="form.menuType === 'button'" placeholder="外链菜单可填写 https://..." />
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
          <div class="switch-grid">
            <ElFormItem label="菜单显示">
              <ElSwitch v-model="form.visible" />
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

    <template #footer>
      <ElSpace>
        <ElButton @click="handleClose">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">确定</ElButton>
      </ElSpace>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t, te } = useI18n()

const getMenuTitle = (item: any) => {
  const title = item.title || item.menuName || item.name || ''
  return te(title) ? t(title) : title
}
type MenuType = Api.SystemManage.MenuType
type MenuDialogForm = Api.SystemManage.MenuSaveParams

interface Props {
  visible: boolean
  mode?: 'add' | 'edit'
  parentTitle?: string
  editData?: Partial<MenuDialogForm> | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'submit', value: MenuDialogForm): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  mode: 'add',
  parentTitle: '',
  editData: null
})

const emit = defineEmits<Emits>()
const formRef = ref<FormInstance>()

const getDefaultForm = (): MenuDialogForm => ({
  id: undefined,
  parentId: null,
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

const rules = computed<FormRules>(() => {
  const currentRules: FormRules = {
    title: [{ required: true, message: '请输入名称', trigger: 'blur' }],
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
  },
  { immediate: true }
)

watch(
  () => form.menuType,
  (type: MenuType) => {
    if (type === 'directory' && !form.component) form.component = '/index/index'
    if (type === 'button') {
      form.path = ''
      form.component = ''
      form.icon = ''
      form.keepAlive = false
      form.isHideTab = false
      form.fixedTab = false
      form.isIframe = false
      form.externalLink = ''
    }
  }
)

const handleClose = () => {
  emit('update:visible', false)
}

const normalizeForm = (): MenuDialogForm => {
  const result: MenuDialogForm = { ...form }

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
    emit('submit', normalizeForm())
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

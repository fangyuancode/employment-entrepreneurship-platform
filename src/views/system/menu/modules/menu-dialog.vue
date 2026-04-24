<template>
  <ElDialog
    :model-value="visible"
    :title="dialogTitle"
    width="700px"
    destroy-on-close
    @update:model-value="handleClose"
  >
    <ElAlert
      v-if="parentTitle"
      :title="`当前父级：${parentTitle}`"
      type="info"
      :closable="false"
      class="mb-16"
    />

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="92px">
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
            <ElInput v-model="form.title" placeholder="请输入菜单名称" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="排序" prop="sort">
            <ElInputNumber
              v-model="form.sort"
              :min="1"
              controls-position="right"
              style="width: 100%"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="路由地址" prop="path">
            <ElInput
              v-model="form.path"
              :placeholder="form.menuType === 'button' ? '按钮类型可留空' : '如：/system 或 user'"
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="图标">
            <ElInput v-model="form.icon" placeholder="如：ri:user-line" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24" v-if="form.menuType !== 'button'">
          <ElFormItem label="组件路径" prop="component">
            <ElInput v-model="form.component" placeholder="如：/system/user，目录可留空" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="24">
          <ElFormItem label="权限标识" prop="permission">
            <ElInput
              v-model="form.permission"
              :placeholder="form.menuType === 'button' ? '如：user:add' : '如：SystemUser'"
            />
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

        <ElCol :span="12">
          <ElFormItem label="菜单显示">
            <ElSwitch v-model="form.visible" />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12" v-if="form.menuType !== 'button'">
          <ElFormItem label="页面缓存">
            <ElSwitch v-model="form.keepAlive" />
          </ElFormItem>
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

  type MenuType = 'directory' | 'menu' | 'button'

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
    menuType: 'menu',
    path: '',
    component: '',
    permission: '',
    icon: '',
    sort: 1,
    status: '1',
    visible: true,
    keepAlive: true
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

      if (props.editData) {
        Object.assign(form, props.editData)
      } else if (props.parentTitle) {
        form.menuType = props.editData?.menuType || 'menu'
      }
    },
    { immediate: true }
  )

  const handleClose = () => {
    emit('update:visible', false)
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()

      if (form.menuType === 'directory') {
        form.component = ''
      }

      if (form.menuType === 'button') {
        form.path = ''
        form.component = ''
        form.icon = ''
        form.keepAlive = false
      }

      emit('submit', { ...form })
    } catch {
      ElMessage.error('请完善表单信息')
    }
  }
</script>

<style scoped lang="scss">
  .mb-16 {
    margin-bottom: 16px;
  }

  :deep(.el-dialog__body) {
    padding-top: 18px;
    padding-bottom: 10px;
  }
</style>

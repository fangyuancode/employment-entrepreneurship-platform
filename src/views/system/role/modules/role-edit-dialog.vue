<template>
  <ElDialog
    v-model="visible"
    :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
    width="460px"
    align-center
    @close="handleClose"
  >
    <ElAlert
      title="角色编码建议使用 R_英文大写标识，例如 R_DATA_MANAGER。提交时系统会自动转为大写。"
      type="info"
      :closable="false"
      class="role-code-tip"
    />

    <ElForm ref="formRef" :model="form" :rules="rules" label-width="96px">
      <ElFormItem label="角色名称" prop="roleName">
        <ElInput v-model="form.roleName" placeholder="请输入角色名称，例如 数据管理员" />
      </ElFormItem>

      <ElFormItem label="角色编码" prop="roleCode">
        <ElInput
          v-model="form.roleCode"
          placeholder="例如 R_DATA_MANAGER"
          @blur="normalizeRoleCode"
        />
      </ElFormItem>

      <ElFormItem label="角色描述" prop="description">
        <ElInput
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入角色描述"
        />
      </ElFormItem>

      <ElFormItem label="角色状态">
        <ElSwitch
          v-model="form.enabled"
          inline-prompt
          active-text="启用"
          inactive-text="禁用"
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="handleClose">取消</ElButton>
      <ElButton type="primary" :loading="submitting" @click="handleSubmit">提交</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchAddRole, fetchUpdateRole } from '@/api/system-manage'

  type RoleListItem = Api.SystemManage.RoleListItem
  type RoleSaveParams = Api.SystemManage.RoleSaveParams

  interface Props {
    modelValue: boolean
    dialogType: 'add' | 'edit'
    roleData?: RoleListItem
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    dialogType: 'add',
    roleData: undefined
  })

  const emit = defineEmits<Emits>()

  const formRef = ref<FormInstance>()
  const submitting = ref(false)

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const validateRoleCode = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    const code = normalizeRoleCodeValue(value)
    if (!/^R_[A-Z0-9_]{2,48}$/.test(code)) {
      callback(new Error('角色编码格式应为 R_英文大写标识，例如 R_DATA_MANAGER'))
      return
    }
    callback()
  }

  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '请输入角色名称', trigger: 'blur' },
      { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
    ],
    roleCode: [
      { required: true, message: '请输入角色编码', trigger: 'blur' },
      { validator: validateRoleCode, trigger: 'blur' }
    ],
    description: [{ max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }]
  })

  const form = reactive<RoleSaveParams>({
    roleId: undefined,
    roleName: '',
    roleCode: '',
    description: '',
    enabled: true
  })

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) initForm()
    }
  )

  watch(
    () => props.roleData,
    () => {
      if (props.modelValue) initForm()
    },
    { deep: true }
  )

  const normalizeRoleCodeValue = (value?: string) => {
    const raw = String(value || '').trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_')
    if (!raw) return ''
    return raw.startsWith('R_') ? raw : `R_${raw}`
  }

  const normalizeRoleCode = () => {
    form.roleCode = normalizeRoleCodeValue(form.roleCode)
  }

  const initForm = () => {
    if (props.dialogType === 'edit' && props.roleData) {
      Object.assign(form, {
        roleId: props.roleData.roleId,
        roleName: props.roleData.roleName,
        roleCode: props.roleData.roleCode,
        description: props.roleData.description,
        enabled: props.roleData.enabled
      })
    } else {
      Object.assign(form, {
        roleId: undefined,
        roleName: '',
        roleCode: '',
        description: '',
        enabled: true
      })
    }
    nextTick(() => formRef.value?.clearValidate())
  }

  const handleClose = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    normalizeRoleCode()
    await formRef.value.validate()

    submitting.value = true
    try {
      const payload: RoleSaveParams = {
        roleId: form.roleId,
        roleName: form.roleName,
        roleCode: form.roleCode,
        description: form.description,
        enabled: form.enabled
      }

      if (props.dialogType === 'add') {
        await fetchAddRole(payload)
      } else {
        await fetchUpdateRole(payload)
      }

      emit('success')
      handleClose()
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped lang="scss">
  .role-code-tip {
    margin-bottom: 16px;
  }
</style>

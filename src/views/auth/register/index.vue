<template>
  <div class="auth-page">
    <div class="auth-shell">
      <section class="auth-hero">
        <div class="auth-hero__inner">
          <div class="auth-brand">
            <div>
              <h1 class="auth-brand__title">{{ systemName }}</h1>
              <p class="auth-brand__desc">AI 创业助手 · 智能创作与协作平台</p>
            </div>
          </div>

          <div class="auth-hero__content">
            <div class="auth-badge">创建账号</div>
            <h2 class="auth-hero__title">
              加入统一的 AI 创作空间，<br />
              开始你的高效协作流程
            </h2>
            <p class="auth-hero__text">
              注册后默认为普通用户角色，可体验 AI 应用与数据分析相关功能；管理员可在后台进一步分配角色与操作权限。
            </p>

            <div class="auth-feature-list">
              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:user-add-line" />
                </div>
                <div>
                  <h3>快速注册</h3>
                  <p>用户名、邮箱、密码校验统一处理，注册成功后直接返回登录页。</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:apps-2-line" />
                </div>
                <div>
                  <h3>统一入口</h3>
                  <p>账号创建后进入统一认证体系，后续由角色控制可访问菜单。</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:checkbox-circle-line" />
                </div>
                <div>
                  <h3>校验清晰</h3>
                  <p>登录后自动获取角色和按钮权限，控制新增、编辑、删除等操作。</p>
                </div>
              </div>
            </div>
          </div>

          <div class="auth-hero__stats">
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">Stable</span>
              <span class="auth-stat-card__label">原有功能不变</span>
            </div>
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">Clean</span>
              <span class="auth-stat-card__label">布局更简洁主流</span>
            </div>
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">Better</span>
              <span class="auth-stat-card__label">整体更协调舒适</span>
            </div>
          </div>
        </div>

        <div class="auth-hero__decoration auth-hero__decoration--one"></div>
        <div class="auth-hero__decoration auth-hero__decoration--two"></div>
        <div class="auth-hero__grid"></div>
      </section>

      <section class="auth-panel">
        <AuthTopBar />

        <div class="auth-panel__body">
          <div class="auth-card">
            <div class="auth-card__header">
              <h3 class="auth-card__title">{{ $t('register.title') }}</h3>
              <p class="auth-card__subtitle">{{ $t('register.subTitle') }}</p>
            </div>

            <ElForm
              ref="formRef"
              :model="formData"
              :rules="rules"
              label-position="top"
              :key="formKey"
              class="auth-form"
            >
              <ElFormItem prop="username">
                <ElInput
                  class="auth-input"
                  v-model.trim="formData.username"
                  :placeholder="$t('register.placeholder.username')"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:user-3-line" />
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="email">
                <ElInput
                  class="auth-input"
                  v-model.trim="formData.email"
                  placeholder="请输入邮箱（可选）"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:mail-line" />
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="password">
                <ElInput
                  class="auth-input"
                  v-model.trim="formData.password"
                  :placeholder="$t('register.placeholder.password')"
                  type="password"
                  autocomplete="off"
                  show-password
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:lock-2-line" />
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="confirmPassword">
                <ElInput
                  class="auth-input"
                  v-model.trim="formData.confirmPassword"
                  :placeholder="$t('register.placeholder.confirmPassword')"
                  type="password"
                  autocomplete="off"
                  @keyup.enter="register"
                  show-password
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:shield-keyhole-line" />
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="agreement" class="auth-agreement">
                <ElCheckbox v-model="formData.agreement">
                  {{ $t('register.agreeText') }}
                  <RouterLink class="auth-link" to="/privacy-policy">
                    {{ $t('register.privacyPolicy') }}
                  </RouterLink>
                </ElCheckbox>
              </ElFormItem>

              <ElButton
                class="auth-submit"
                type="primary"
                @click="register"
                :loading="loading"
                v-ripple
              >
                {{ $t('register.submitBtnText') }}
              </ElButton>

              <div class="auth-bottom-tip">
                <span>{{ $t('register.hasAccount') }}</span>
                <RouterLink class="auth-link" :to="{ name: 'Login' }">
                  {{ $t('register.toLogin') }}
                </RouterLink>
              </div>
            </ElForm>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import type { FormInstance, FormRules } from 'element-plus'
  import AppConfig from '@/config'
  import { fetchRegister } from '@/api/auth'

  defineOptions({ name: 'Register' })

  interface RegisterForm {
    username: string
    email: string
    password: string
    confirmPassword: string
    agreement: boolean
  }

  const USERNAME_MIN_LENGTH = 3
  const USERNAME_MAX_LENGTH = 20
  const PASSWORD_MIN_LENGTH = 6
  const REDIRECT_DELAY = 1000

  const { t, locale } = useI18n()
  const router = useRouter()
  const formRef = ref<FormInstance>()
  const systemName = AppConfig.systemInfo.name

  const loading = ref(false)
  const formKey = ref(0)

  watch(locale, () => {
    formKey.value++
  })

  const formData = reactive<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: false
  })

  const validatePassword = (_rule: any, value: string, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('register.placeholder.password')))
      return
    }

    if (formData.confirmPassword) {
      formRef.value?.validateField('confirmPassword')
    }

    callback()
  }

  const validateConfirmPassword = (
    _rule: any,
    value: string,
    callback: (error?: Error) => void
  ) => {
    if (!value) {
      callback(new Error(t('register.rule.confirmPasswordRequired')))
      return
    }

    if (value !== formData.password) {
      callback(new Error(t('register.rule.passwordMismatch')))
      return
    }

    callback()
  }

  const validateAgreement = (_rule: any, value: boolean, callback: (error?: Error) => void) => {
    if (!value) {
      callback(new Error(t('register.rule.agreementRequired')))
      return
    }
    callback()
  }

  const rules = computed<FormRules<RegisterForm>>(() => ({
    username: [
      { required: true, message: t('register.placeholder.username'), trigger: 'blur' },
      {
        min: USERNAME_MIN_LENGTH,
        max: USERNAME_MAX_LENGTH,
        message: t('register.rule.usernameLength'),
        trigger: 'blur'
      }
    ],
    email: [{ type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }],
    password: [
      { required: true, validator: validatePassword, trigger: 'blur' },
      { min: PASSWORD_MIN_LENGTH, message: t('register.rule.passwordLength'), trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }],
    agreement: [{ validator: validateAgreement, trigger: 'change' }]
  }))

  const register = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true

      await fetchRegister({
        username: formData.username,
        password: formData.password,
        email: formData.email || undefined
      })

      ElMessage.success('注册成功，请登录')
      toLogin()
    } catch (error) {
      console.error('注册失败:', error)
    } finally {
      loading.value = false
    }
  }

  const toLogin = () => {
    setTimeout(() => {
      router.push({ name: 'Login' })
    }, REDIRECT_DELAY)
  }
</script>

<style scoped>
  @import '../login/style.css';
</style>

<style lang="scss" scoped>
  :deep(.el-input__wrapper) {
    min-height: 46px !important;
    border-radius: 14px !important;
  }
</style>

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
              注册后即可进入平台，体验商业计划书生成、品牌文案创作、会议纪要总结、
              岗位数据分析、可视化设计等一体化能力。
            </p>

            <div class="auth-feature-list">
              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:user-add-line" />
                </div>
                <div>
                  <h3>快速注册</h3>
                  <p>简洁字段布局，突出主要操作路径，减少视觉干扰。</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:apps-2-line" />
                </div>
                <div>
                  <h3>统一入口</h3>
                  <p>登录、注册、找回密码保持同一视觉体系，页面切换更自然。</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:checkbox-circle-line" />
                </div>
                <div>
                  <h3>校验清晰</h3>
                  <p>保留原有表单校验逻辑与跳转流程，功能完全不变。</p>
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

  defineOptions({ name: 'Register' })

  interface RegisterForm {
    username: string
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

      setTimeout(() => {
        loading.value = false
        ElMessage.success('注册成功')
        toLogin()
      }, REDIRECT_DELAY)
    } catch (error) {
      console.error('表单验证失败:', error)
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

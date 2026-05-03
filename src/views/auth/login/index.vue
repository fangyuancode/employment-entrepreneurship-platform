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
            <div class="auth-badge">智能化工作台</div>&nbsp;&nbsp;
            <div class="auth-badge" @click="backHome">系统主页</div>
            <h2 class="auth-hero__title">
              更自然的登录体验，<br />
              更高效地进入你的 AI 工作空间
            </h2>
            <p class="auth-hero__text">
              聚合商业计划书、品牌文案、产品设计、会议纪要、岗位分析、车辆识别等核心能力，
              用更统一的体验提升项目效率。
            </p>

            <div class="auth-feature-list">
              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:flashlight-line" />
                </div>
                <div>
                  <h3>高效进入</h3>
                  <p>支持真实账号登录与权限初始化，登录后自动进入对应角色可访问页面。</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:shield-check-line" />
                </div>
                <div>
                  <h3>安全验证</h3>
                  <p>JWT 登录态与接口拦截统一处理，避免未登录访问业务页面。</p>
                </div>
              </div>

              <div class="auth-feature-item">
                <div class="auth-feature-item__icon">
                  <ArtSvgIcon icon="ri:layout-5-line" />
                </div>
                <div>
                  <h3>主流布局</h3>
                  <p>角色菜单与按钮权限自动生效，新增、编辑、删除操作按权限展示。</p>
                </div>
              </div>
            </div>
          </div>

          <div class="auth-hero__stats">
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">10+</span>
              <span class="auth-stat-card__label">AI 应用模块</span>
            </div>
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">24h</span>
              <span class="auth-stat-card__label">随时创作协作</span>
            </div>
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">One</span>
              <span class="auth-stat-card__label">统一入口体验</span>
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
              <h3 class="auth-card__title">{{ $t('login.title') }}</h3>
              <p class="auth-card__subtitle">{{ $t('login.subTitle') }}</p>
            </div>

            <ElForm ref="formRef" :model="formData" :rules="rules" :key="formKey" class="auth-form" @keyup.enter="handleSubmit">
              <!-- <ElFormItem prop="account">
                <ElSelect v-model="formData.account" @change="setupAccount">
                  <ElOption
                    v-for="account in accounts"
                    :key="account.key"
                    :label="account.label"
                    :value="account.key"
                  >
                    <span>{{ account.label }}</span>
                  </ElOption>
                </ElSelect>
              </ElFormItem> -->

              <ElFormItem prop="username">
                <ElInput class="auth-input" :placeholder="$t('login.placeholder.username')" v-model.trim="formData.username">
                  <template #prefix>
                    <ArtSvgIcon icon="ri:user-3-line" />
                  </template>
                </ElInput>
              </ElFormItem>

              <ElFormItem prop="password">
                <ElInput class="auth-input" :placeholder="$t('login.placeholder.password')" v-model.trim="formData.password" type="password" autocomplete="off" show-password>
                  <template #prefix>
                    <ArtSvgIcon icon="ri:lock-2-line" />
                  </template>
                </ElInput>
              </ElFormItem>

              <div class="auth-verify">
                <div class="auth-verify__box" :class="{ 'is-error': !isPassing && isClickPass }">
                  <ArtDragVerify ref="dragVerify" v-model:value="isPassing" :text="$t('login.sliderText')" textColor="var(--art-gray-700)" :successText="$t('login.sliderSuccessText')" progressBarBg="var(--main-color)" :background="isDark ? '#26272F' : '#F5F7FA'" handlerBg="var(--default-box-color)" />
                </div>
                <p class="auth-verify__error" :class="{ visible: !isPassing && isClickPass }">
                  {{ $t('login.placeholder.slider') }}
                </p>
              </div>

              <div class="auth-form__meta">
                <ElCheckbox v-model="formData.rememberPassword">
                  {{ $t('login.rememberPwd') }}
                </ElCheckbox>
                <RouterLink class="auth-link" :to="{ name: 'ForgetPassword' }">
                  {{ $t('login.forgetPwd') }}
                </RouterLink>
              </div>

              <ElButton class="auth-submit" type="primary" @click="handleSubmit" :loading="loading" v-ripple>
                {{ $t('login.btnText') }}
              </ElButton>

              <div class="auth-bottom-tip">
                <span>{{ $t('login.noAccount') }}</span>
                <RouterLink class="auth-link" :to="{ name: 'Register' }">
                  {{ $t('login.register') }}
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
import AppConfig from '@/config'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from 'vue-i18n'
import { HttpError } from '@/utils/http/error'
import { fetchLogin } from '@/api/auth'
import { ElNotification, type FormInstance, type FormRules } from 'element-plus'
import { useSettingStore } from '@/store/modules/setting'

defineOptions({ name: 'Login' })

const settingStore = useSettingStore()
const { isDark } = storeToRefs(settingStore)
const { t, locale } = useI18n()
const formKey = ref(0)

watch(locale, () => {
  formKey.value++
})

type AccountKey = 'super' | 'admin' | 'user'

export interface Account {
  key: AccountKey
  label: string
  userName: string
  password: string
  roles: string[]
}

const accounts = computed<Account[]>(() => [
  // {
  //   key: 'super',
  //   label: t('login.roles.super'),
  //   userName: 'Super',
  //   password: '123456',
  //   roles: ['R_SUPER']
  // },
  {
    key: 'super',
    label: t('login.roles.super'),
    userName: 'admin',
    password: '123456',
    roles: ['R_SUPER']
  },
  {
    key: 'admin',
    label: t('login.roles.admin'),
    userName: 'Admin',
    password: '123456',
    roles: ['R_ADMIN']
  },
  {
    key: 'user',
    label: t('login.roles.user'),
    userName: 'User',
    password: '123456',
    roles: ['R_USER']
  }
])

const dragVerify = ref()
const userStore = useUserStore()
const router = useRouter()
const isPassing = ref(false)
const isClickPass = ref(false)

const systemName = AppConfig.systemInfo.name
const formRef = ref<FormInstance>()

const formData = reactive({
  account: '',
  username: 'admin',
  password: '123456',
  rememberPassword: true
})

const rules = computed<FormRules>(() => ({
  username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }]
}))

const loading = ref(false)

const setupAccount = (key: AccountKey) => {
  const selectedAccount = accounts.value.find((account: Account) => account.key === key)
  formData.account = key
  formData.username = selectedAccount?.userName ?? ''
  formData.password = selectedAccount?.password ?? ''
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    if (!isPassing.value) {
      isClickPass.value = true
      return
    }

    loading.value = true

    const { username, password } = formData
    const { token, refreshToken } = await fetchLogin({
      username,
      password
    })

    if (!token) {
      throw new Error('Login failed - no token received')
    }

    userStore.setToken(token, refreshToken)
    userStore.setLoginStatus(true)

    showLoginSuccessNotice()

    const redirect = router.currentRoute.value.query.redirect

    const targetPath =
      typeof redirect === 'string' && redirect && redirect !== '/' && redirect !== '/home'
        ? redirect
        : '/dashboard/console'

    router.replace(targetPath)
  } catch (error) {
    if (error instanceof HttpError) {
    } else {
      console.error('[Login] Unexpected error:', error)
    }
  } finally {
    loading.value = false
    resetDragVerify()
  }
}
const backHome = () => {
  router.push('/home')
}
const resetDragVerify = () => {
  dragVerify.value?.reset?.()
}

const showLoginSuccessNotice = () => {
  setTimeout(() => {
    ElNotification({
      title: t('login.success.title'),
      type: 'success',
      duration: 2500,
      zIndex: 10000,
      message: `${t('login.success.message')}, ${systemName}!`
    })
  }, 1000)
}
</script>

<style scoped>
@import './style.css';
</style>

<style lang="scss" scoped>
:deep(.el-select__wrapper) {
  min-height: 46px !important;
  border-radius: 14px !important;
}

:deep(.el-input__wrapper) {
  min-height: 46px !important;
  border-radius: 14px !important;
}
</style>

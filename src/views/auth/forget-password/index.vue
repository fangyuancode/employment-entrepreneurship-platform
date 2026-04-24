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
            <div class="auth-badge">账号找回</div>
            <h2 class="auth-hero__title">
              通过更清晰的流程，<br />
              快速完成账号恢复操作
            </h2>
            <p class="auth-hero__text">
              页面结构与登录、注册保持一致，减少视觉跳转感，提升整体页面统一性与使用体验。
            </p>
          </div>

          <div class="auth-hero__stats">
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">Unified</span>
              <span class="auth-stat-card__label">页面风格统一</span>
            </div>
            <div class="auth-stat-card">
              <span class="auth-stat-card__value">Simple</span>
              <span class="auth-stat-card__label">流程更直接</span>
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
              <h3 class="auth-card__title">{{ $t('forgetPassword.title') }}</h3>
              <p class="auth-card__subtitle">{{ $t('forgetPassword.subTitle') }}</p>
            </div>

            <div class="auth-form">
              <div class="auth-field">
                <span class="auth-field__label" v-if="showInputLabel">账号</span>
                <ElInput
                  class="auth-input"
                  :placeholder="$t('forgetPassword.placeholder')"
                  v-model.trim="username"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:user-search-line" />
                  </template>
                </ElInput>
              </div>

              <ElButton
                class="auth-submit"
                type="primary"
                @click="register"
                :loading="loading"
                v-ripple
              >
                {{ $t('forgetPassword.submitBtnText') }}
              </ElButton>

              <ElButton class="auth-submit auth-submit--plain" plain @click="toLogin">
                {{ $t('forgetPassword.backBtnText') }}
              </ElButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'

  defineOptions({ name: 'ForgetPassword' })

  const router = useRouter()
  const showInputLabel = ref(false)
  const systemName = AppConfig.systemInfo.name

  const username = ref('')
  const loading = ref(false)

  const register = async () => {}

  const toLogin = () => {
    router.push({ name: 'Login' })
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

let timer: number | undefined
let triggered = false

interface DevtoolsGuardOptions {
  enabled?: boolean
  interval?: number
  threshold?: number
  onOpen?: () => void
}

/**
 * 检测浏览器控制台是否打开
 * 注意：前端无法真正关闭浏览器，只能退出登录、跳转页面或清空当前页面
 */
export function startDevtoolsGuard(options: DevtoolsGuardOptions = {}) {
  const { enabled = import.meta.env.PROD, interval = 500, threshold = 160, onOpen } = options

  if (!enabled) return

  const handleOpen = () => {
    if (triggered) return
    triggered = true

    stopDevtoolsGuard()

    if (onOpen) {
      onOpen()
      return
    }

    // 默认处理：清除缓存并跳转登录页
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      console.warn('清除缓存失败：', error)
    }

    // 根据你的项目路由调整
    window.location.replace('/#/auth/login')
  }

  const checkDevtools = () => {
    const widthDiff = window.outerWidth - window.innerWidth
    const heightDiff = window.outerHeight - window.innerHeight

    const isOpen = widthDiff > threshold || heightDiff > threshold

    if (isOpen) {
      handleOpen()
    }
  }

  timer = window.setInterval(checkDevtools, interval)

  window.addEventListener('resize', checkDevtools)
}

export function stopDevtoolsGuard() {
  if (timer) {
    window.clearInterval(timer)
    timer = undefined
  }
}

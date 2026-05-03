import { router } from '@/router'
import { useUserStore } from '@/store/modules/user'
import { App, Directive, DirectiveBinding } from 'vue'

export type AuthDirective = Directive<HTMLElement, string>

function checkAuthPermission(el: HTMLElement, binding: DirectiveBinding<string>): void {
  const authMark = binding.value
  if (!authMark) return

  const userStore = useUserStore()
  const userButtons = userStore.getUserInfo?.buttons ?? []

  // 后端/当前用户返回了按钮权限时，以用户按钮权限为准
  if (userButtons.length > 0) {
    if (!userButtons.includes(authMark)) removeElement(el)
    return
  }

  // 兼容后端菜单模式：当前路由 meta.authList 中只会包含已授权按钮
  const authList = (router.currentRoute.value.meta.authList as Array<{ authMark: string }>) || []
  const hasPermission = authList.some((item) => item.authMark === authMark)
  if (!hasPermission) removeElement(el)
}

function removeElement(el: HTMLElement): void {
  if (el.parentNode) {
    el.parentNode.removeChild(el)
  }
}

const authDirective: AuthDirective = {
  mounted: checkAuthPermission,
  updated: checkAuthPermission
}

export function setupAuthDirective(app: App): void {
  app.directive('auth', authDirective)
}

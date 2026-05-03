import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'
import type { AppRouteRecord } from '@/types/router'

type AuthItem = NonNullable<AppRouteRecord['meta']['authList']>[number]

export const useAuth = () => {
  const route = useRoute()
  const userStore = useUserStore()
  const { info } = storeToRefs(userStore)

  /**
   * 检查是否拥有某权限标识。
   * 优先使用后端 /api/user/info 返回的 buttons；如果没有 buttons，兼容当前路由 meta.authList。
   */
  const hasAuth = (auth: string): boolean => {
    const userButtons = info.value?.buttons ?? []
    if (userButtons.length > 0) {
      return userButtons.includes(auth)
    }

    const routeAuthList: AuthItem[] = Array.isArray(route.meta.authList)
      ? (route.meta.authList as AuthItem[])
      : []

    return routeAuthList.some((item) => item?.authMark === auth)
  }

  return {
    hasAuth
  }
}

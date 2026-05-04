import { AppRouteRecord } from '@/types/router'

/**
 * 系统设置模块。
 * 后端动态菜单模式下，侧边栏主要读取 sys_menu；这里保留静态路由，便于开发环境和前端路由模式使用。
 */
export const test1Routes: AppRouteRecord = {
  path: '/test1',
  name: 'Test1',
  component: '/index/index',
  meta: {
    title: '测试1',
    icon: 'ri-user-settings-line',
    roles: ['R_SUPER']
  },
  children: [
    {
      path: 'test2',
      name: 'test2',
      component: '/test1/test2',
      meta: {
        title: '测试11',
        roles: ['R_SUPER'],
        keepAlive: true,
        fixedTab: false,

      }
    },

  ]
}

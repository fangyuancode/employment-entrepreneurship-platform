import { AppRouteRecord } from '@/types/router'

/**
 * 系统设置模块。
 * 后端动态菜单模式下，侧边栏主要读取 sys_menu；这里保留静态路由，便于开发环境和前端路由模式使用。
 */
export const setingRoutes: AppRouteRecord = {
  path: '/seting',
  name: 'Setting',
  component: '/index/index',
  meta: {
    title: '系统设置',
    icon: 'ri-user-settings-line',
    roles: ['R_SUPER']
  },
  children: [
    // {
    //   path: 'menuconfig',
    //   name: 'MenuConfig',
    //   component: '/seting/menuconfig',
    //   meta: {
    //     title: '菜单配置',
    //     roles: ['R_SUPER'],
    //     keepAlive: true,
    //     fixedTab: false,
    //     authList: [
    //       { title: '新增菜单', authMark: 'menu:add' },
    //       { title: '编辑菜单', authMark: 'menu:edit' },
    //       { title: '删除菜单', authMark: 'menu:delete' },
    //       { title: '启停菜单', authMark: 'menu:status' }
    //     ]
    //   }
    // },
    {
      path: 'usermanger',
      name: 'UserLoginManager',
      component: '/seting/usermanger',
      meta: {
        title: '用户登录管理',
        roles: ['R_SUPER'],
        keepAlive: false,
        fixedTab: false
      }
    }
  ]
}

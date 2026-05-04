import { AppRouteRecord } from '@/types/router'

export const setingRoutes: AppRouteRecord = {
  path: '/seting',
  name: 'seting',
  component: '/index/index',
  meta: {
    title: 'menus.seting.title',

    icon: 'ri-user-settings-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_USER']

  },
  children: [
    {
      path: 'usermanger',
      name: 'usermanger ',
      component: '/seting/usermanger',
      meta: {
        title: 'menus.seting.usermanage',
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER'],

        keepAlive: false,
        fixedTab: true
      }
    },


  ]
}
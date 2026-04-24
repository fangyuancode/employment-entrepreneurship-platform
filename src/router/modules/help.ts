import { AppRouteRecord } from '@/types/router'

export const helpRoutes: AppRouteRecord = {
  path: '/help',
  name: 'help',

  component: '/index/index',
  meta: {
    title: 'menus.help.title',
    // <i class="ri-inbox-archive-line"></i>
    // <i class="ri-tools-line"></i>
    icon: 'ri-tools-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [

    {
      path: 'vehicle',
      name: 'vehicle',
      component: '/help/vehicle',
      meta: {
        title: 'menus.help.vehicle',
        keepAlive: false,
        fixedTab: true
      }
    },
    {
      path: 'detect',
      name: 'detect',
      component: '/help/detect',
      meta: {
        title: '通用目标检测',
        keepAlive: false,
        fixedTab: false
      }
    },

    {
      path: 'vision',
      name: 'vision',
      component: '/help/vision',
      meta: {
        title: '视觉分析助手',
        keepAlive: false,
        fixedTab: true
      }
    }


  ]
}
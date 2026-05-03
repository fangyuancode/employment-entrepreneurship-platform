import { AppRouteRecord } from '@/types/router'

export const toolboxRoutes: AppRouteRecord = {
  path: '/toolbox',
  name: 'toolbox',
  component: '/index/index',
  meta: {
    title: 'menus.toolbox.title',
    icon: 'ri-send-ins-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
  },
  children: [
    {
      path: 'jobcollection',
      name: 'jobcollection',
      component: '/toolbox/jobcollection',
      meta: {
        title: 'menus.toolbox.jobcollection',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'joblist',
      name: 'joblist',
      component: '/toolbox/joblist',
      meta: {
        title: 'menus.toolbox.joblist',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'jobanalysis',
      name: 'jobanalysis',
      component: '/toolbox/jobanalysis',
      meta: {
        title: 'menus.toolbox.jobanalysis',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'quantity',
      name: 'quantity',
      component: '/toolbox/quantity',
      meta: {
        title: 'menus.toolbox.quantity',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'migration',
      name: 'migration',
      component: '/toolbox/migration',
      meta: {
        title: 'menus.toolbox.migration',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'jobskillgraph',
      name: 'jobskillgraph',
      component: '/toolbox/jobskillgraph',
      meta: {
        title: 'menus.toolbox.jobskillgraph',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    }
  ]
}

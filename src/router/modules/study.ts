import { AppRouteRecord } from '@/types/router'

export const studyRoutes: AppRouteRecord = {
  path: '/study',
  name: 'study',
  component: '/index/index',
  meta: {
    title: 'menus.study.title',
    icon: 'ri-book-open-line',
    roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
  },
  children: [
    {
      path: 'business',
      name: 'business',
      component: '/study/business',
      meta: {
        title: 'menus.study.business',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'copywriting',
      name: 'copywriting',
      component: '/study/copywriting',
      meta: {
        title: 'menus.study.copywriting',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'assistance',
      name: 'assistance',
      component: '/study/assistance',
      meta: {
        title: 'menus.study.assistance',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'pitchppt',
      name: 'pitchppt',
      component: '/study/pitchppt',
      meta: {
        title: 'menus.study.pitchPpt',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'meeting',
      name: 'meeting',
      component: '/study/meeting',
      meta: {
        title: 'menus.study.meeting',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    },
    {
      path: 'relationship',
      name: 'relationship',
      component: '/study/relationship',
      meta: {
        title: 'menus.study.relationship',
        keepAlive: false,
        fixedTab: true,
        roles: ['R_SUPER', 'R_ADMIN', 'R_USER']
      }
    }
  ]
}

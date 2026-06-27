import { AppRouteRecordRaw } from '@/utils/router'

/**
 * 静态路由配置（不需要权限就能访问的路由）
 *
 * 属性说明：
 * isHideTab: true 表示不在标签页中显示
 *
 * 注意事项：
 * 1、path、name 不要和动态路由冲突，否则会导致路由冲突无法访问
 * 2、静态路由不管是否登录都可以访问
 */
export const staticRoutes: AppRouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@views/auth/login/index.vue'),
    meta: { title: 'menus.login.title', isHideTab: true }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@views/auth/register/index.vue'),
    meta: { title: 'menus.register.title', isHideTab: true }
  },
  {
    path: '/auth/forget-password',
    name: 'ForgetPassword',
    component: () => import('@views/auth/forget-password/index.vue'),
    meta: { title: 'menus.forgetPassword.title', isHideTab: true }
  },
  {
    path: '/toolbox/job-skill-graph/view',
    name: 'JobSkillGraphView',
    component: () => import('@/views/toolbox/jobskillgraph/graphview.vue'),
    meta: { title: '岗位技能图谱大屏' }
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/exhibition',
    name: 'DigitalExhibition',
    component: () => import('@/views/exhibition/index.vue'),
    meta: { title: 'AI创业就业助手数字展厅' }
  },
  {
    path: '/gesture',
    name: 'GestureStar',
    component: () => import('@/views/gesture/index.vue'),
    meta: { title: '手势星空' }
  },
  {
    path: '/jobscreen',
    name: 'jobscreen',
    component: () => import('@/views/jobscreen/index.vue'),
    meta: { title: '大屏' }
  },
  {
    path: '/jobmap',
    name: 'jobmap',
    component: () => import('@/views/jobmap/index.vue'),
    meta: { title: '图谱' }
  },
  {
    path: '/jobscreen/bigmap',
    name: 'JobScreenBigMap',
    component: () => import('@/views/jobscreen/bigmap.vue'),
    // component: '/jobscreen/bigmap',
    meta: {
      title: '岗位分布大地图'
      // keepAlive: false,
      // fixedTab: false,
      // hideMenu: true
    }
  },
  {
    path: '/aichat',
    name: 'aichat',
    component: () => import('@/views/aichat/index.vue'),
    meta: { title: '智能聊天' }
  },
  {
    path: '/outside',
    component: () => import('@views/index/index.vue'),
    name: 'Outside',
    meta: { title: 'menus.outside.title' },
    children: [
      // iframe 内嵌页面
      {
        path: '/outside/iframe/:path',
        name: 'Iframe',
        component: () => import('@/views/outside/Iframe.vue'),
        meta: { title: 'iframe' }
      }
    ]
  }
]

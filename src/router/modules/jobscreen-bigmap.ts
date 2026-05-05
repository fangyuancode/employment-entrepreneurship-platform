import { AppRouteRecord } from '@/types/router'

/**
 * 岗位分布大地图隐藏路由。
 *
 * 说明：
 * 1. 这个页面是从 src/views/jobscreen/index.vue 右上角“打开大图”按钮进入的；
 * 2. 必须注册为前端静态/基础路由，不能只依赖菜单跳转，否则新页面刷新时动态菜单未命中会被守卫重定向到 /dashboard/console；
 * 3. hideMenu/hidden/isHide 同时保留，是为了兼容项目里不同菜单组件的隐藏字段判断。
 */
export const jobScreenBigMapRoute: AppRouteRecord = {
  path: '/jobscreen/bigmap',
  name: 'JobScreenBigMap',
  component: '/jobscreen/bigmap',
  meta: {
    title: '岗位分布大地图',
    keepAlive: false,
    fixedTab: false,
    hideMenu: true,
    hidden: true,
    isHide: true
  }
}

export default jobScreenBigMapRoute

import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { studyRoutes } from './study'
import { toolboxRoutes } from './toolbox'
import { helpRoutes } from './help'
import { setingRoutes } from './seting'
import { test1Routes } from './test1'

/**
 * 导出所有模块化路由。
 * 如果 VITE_ACCESS_MODE=backend，侧边栏以 /api/menu/routes 返回为准；
 * 这里仍保留 setingRoutes，方便前端路由模式和开发环境调试。
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  systemRoutes,
  setingRoutes,
  studyRoutes,
  toolboxRoutes,
  helpRoutes,
  test1Routes
]

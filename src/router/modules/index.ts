import { AppRouteRecord } from '@/types/router'
import { dashboardRoutes } from './dashboard'
import { systemRoutes } from './system'
import { resultRoutes } from './result'
import { exceptionRoutes } from './exception'
import { studyRoutes } from './study'
import { toolboxRoutes } from "./toolbox"
import { helpRoutes } from './help'
import { setingRoutes } from './seting'
/**
 * 导出所有模块化路由
 */
export const routeModules: AppRouteRecord[] = [
  dashboardRoutes,
  systemRoutes,
  // resultRoutes,
  // exceptionRoutes,
  studyRoutes,
  toolboxRoutes,
  helpRoutes,
  setingRoutes
]

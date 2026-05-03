import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 获取用户统计
export function fetchGetUserStatistics() {
  return request.get<Api.SystemManage.UserStatistics>({
    url: '/api/user/statistics'
  })
}

// 新增用户
export function fetchAddUser(data: Api.SystemManage.UserSaveParams) {
  return request.post<string>({
    url: '/api/user/add',
    data,
    showSuccessMessage: true
  })
}

// 编辑用户
export function fetchUpdateUser(data: Api.SystemManage.UserSaveParams) {
  return request.put<string>({
    url: '/api/user/update',
    data,
    showSuccessMessage: true
  })
}

// 删除单个用户
export function fetchDeleteUser(id: number) {
  return request.del<string>({
    url: `/api/user/delete/${id}`,
    showSuccessMessage: true
  })
}

// 批量删除用户
export function fetchBatchDeleteUsers(ids: number[]) {
  return request.post<string>({
    url: '/api/user/deleteBatch',
    data: { ids },
    showSuccessMessage: true
  })
}

// 修改用户状态
export function fetchUpdateUserStatus(id: number, status: string) {
  return request.put<string>({
    url: `/api/user/status/${id}`,
    data: { status },
    showSuccessMessage: true
  })
}

// 重置用户密码
export function fetchResetUserPassword(id: number, password = '123456') {
  return request.put<string>({
    url: `/api/user/reset-password/${id}`,
    data: { password },
    showSuccessMessage: true
  })
}

// 获取角色分页列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取角色下拉选项
export function fetchGetRoleOptions() {
  return request.get<Api.SystemManage.RoleListItem[]>({
    url: '/api/role/options'
  })
}

// 获取当前登录用户可访问的动态菜单路由
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/menu/routes'
  })
}

// 获取菜单管理树列表
export function fetchGetMenuManageList(params?: Api.SystemManage.MenuSearchParams) {
  return request.get<Api.SystemManage.MenuListItem[]>({
    url: '/api/menu/list',
    params
  })
}

// 获取角色授权使用的完整菜单权限树
export function fetchGetMenuPermissionTree() {
  return request.get<Api.SystemManage.MenuListItem[]>({
    url: '/api/menu/permission-tree'
  })
}

// 获取菜单统计
export function fetchGetMenuStatistics() {
  return request.get<Api.SystemManage.MenuStatistics>({
    url: '/api/menu/statistics'
  })
}

// 新增菜单
export function fetchAddMenu(data: Api.SystemManage.MenuSaveParams) {
  return request.post<string>({
    url: '/api/menu/add',
    data,
    showSuccessMessage: true
  })
}

// 编辑菜单
export function fetchUpdateMenu(data: Api.SystemManage.MenuSaveParams) {
  return request.put<string>({
    url: '/api/menu/update',
    data,
    showSuccessMessage: true
  })
}

// 删除菜单
export function fetchDeleteMenu(id: number) {
  return request.del<string>({
    url: `/api/menu/delete/${id}`,
    showSuccessMessage: true
  })
}

// 修改菜单状态
export function fetchUpdateMenuStatus(id: number, status: string) {
  return request.put<string>({
    url: `/api/menu/status/${id}`,
    data: { status },
    showSuccessMessage: true
  })
}

// 获取某个角色已授权的菜单 ID
export function fetchGetRoleMenuIds(roleId: number) {
  return request.get<number[]>({
    url: `/api/role/menu-ids/${roleId}`
  })
}

// 保存角色菜单权限
export function fetchSaveRoleMenus(data: Api.SystemManage.RoleMenuPermissionParams) {
  return request.post<string>({
    url: '/api/role/menus',
    data,
    showSuccessMessage: true
  })
}


declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      /** 用户名 */
      username: string
      /** 密码 */
      password: string
    }

    /** 注册参数 */
    interface RegisterParams {
      username: string
      password: string
      email?: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken?: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email?: string
      avatar?: string
    }
  }


  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      roleId: number
      roleName: string
      userRoles: string[]
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
      ip?: string
      address?: string
      age?: number
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<
        UserListItem,
        'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status' | 'roleId'
      > &
        Api.Common.CommonSearchParams
    >

    /** 新增/编辑用户参数 */
    interface UserSaveParams {
      id?: number
      userName: string
      nickName?: string
      userPhone?: string
      userEmail?: string
      userGender?: string
      genderId?: number
      status?: string
      roleId?: number
      avatar?: string
      password?: string
      age?: number
    }

    /** 用户统计 */
    interface UserStatistics {
      total: number
      enabled: number
      disabled: number
      admin: number
    }

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
      updateTime?: string
    }

    /** 新增/编辑角色参数 */
    interface RoleSaveParams {
      roleId?: number
      roleName: string
      roleCode: string
      description?: string
      enabled?: boolean
    }

    /** 角色统计 */
    interface RoleStatistics {
      total: number
      enabled: number
      disabled: number
      boundUsers: number
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >


    /** 菜单类型 */
    type MenuType = 'directory' | 'menu' | 'button'

    /** 菜单列表项 */
    interface MenuListItem {
      id: number
      parentId: number | null
      title: string
      name: string
      menuType: MenuType
      path: string
      component: string
      permission: string
      icon: string
      sort: number
      status: string
      visible: boolean
      keepAlive: boolean
      isHide: boolean
      isHideTab: boolean
      fixedTab: boolean
      isIframe: boolean
      externalLink: string
      createTime?: string
      updateTime?: string
      children?: MenuListItem[]
    }

    /** 菜单搜索参数 */
    interface MenuSearchParams {
      title?: string
      path?: string
      menuType?: MenuType | ''
      status?: string
    }

    /** 新增/编辑菜单参数 */
    interface MenuSaveParams {
      id?: number
      parentId?: number | null
      title: string
      name: string
      menuType: MenuType
      path?: string
      component?: string
      permission?: string
      icon?: string
      sort?: number
      status?: string
      visible?: boolean
      keepAlive?: boolean
      isHide?: boolean
      isHideTab?: boolean
      fixedTab?: boolean
      isIframe?: boolean
      externalLink?: string
    }

    /** 菜单统计 */
    interface MenuStatistics {
      total: number
      directory: number
      menu: number
      button: number
      enabled: number
      disabled: number
    }

    /** 角色菜单授权参数 */
    interface RoleMenuPermissionParams {
      roleId: number
      menuIds: number[]
    }
  }
}

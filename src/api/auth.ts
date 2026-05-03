import request from '@/utils/http'

/**
 * 登录。
 * 后端兼容 /api/auth/login 和 /api/login，这里优先使用新地址。
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params
  })
}

/**
 * 注册。
 */
export function fetchRegister(params: Record<string, any>) {
  return request.post<string>({
    url: '/api/auth/register',
    params,
    showSuccessMessage: true
  })
}

/**
 * 获取当前用户信息、角色和按钮权限。
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/info'
  })
}

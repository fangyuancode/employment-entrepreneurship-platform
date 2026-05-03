import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  /** 是否显示错误提示，默认显示 */
  showErrorMessage?: boolean
  /** 是否显示成功提示，默认不显示 */
  showSuccessMessage?: boolean
  /** 是否返回 Axios 原始响应。文件下载、需要响应头时使用 */
  rawResponse?: boolean
}

type MaybeBaseResponse<T> = BaseResponse<T> | T

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) {
      // 后端 JWTInterceptor 原先读取 token，新版同时兼容 Authorization。
      request.headers.set('Authorization', accessToken)
      request.headers.set('token', accessToken)
    }

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse<MaybeBaseResponse<any>>) => {
    const config = response.config as ExtendedAxiosRequestConfig

    // 文件流、二进制流或调用方主动要求原始响应时，不做业务 code 判断。
    if (config.rawResponse || isBinaryResponse(config)) return response

    const payload = response.data

    // 兼容没有 { code, msg, data } 包装的接口。
    if (!isBaseResponse(payload)) return response

    const rawCode = payload.code
    const code = Number(rawCode)
    const msg = payload.msg

    if (code === ApiStatus.success) return response
    if (code === ApiStatus.unauthorized) handleUnauthorizedError(msg)

    throw createHttpError(msg || $t('httpMsg.requestFailed'), code || ApiStatus.error)
  },
  (error) => {
    if (error.response?.status === ApiStatus.unauthorized) handleUnauthorizedError()
    return Promise.reject(handleError(error))
  }
)

function isBinaryResponse (config: ExtendedAxiosRequestConfig) {
  return ['blob', 'arraybuffer'].includes(String(config.responseType || ''))
}

function isBaseResponse<T = unknown> (payload: unknown): payload is BaseResponse<T> {
  return !!payload && typeof payload === 'object' && 'code' in payload && 'data' in payload
}

function createHttpError (message: string, code: number) {
  return new HttpError(message, code)
}

function handleUnauthorizedError (message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()
    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)
    showError(error, true)
    throw error
  }

  throw error
}

function resetUnauthorizedError () {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

function logOut () {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

function shouldRetry (statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

async function retryRequest<T> (
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

function delay (ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request<T = any> (config: ExtendedAxiosRequestConfig): Promise<T> {
  if (
    ['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<MaybeBaseResponse<T>>(config)

    if (config.rawResponse) return res as unknown as T
    if (isBinaryResponse(config)) return res.data as T

    const payload = res.data

    if (isBaseResponse<T>(payload)) {
      if (config.showSuccessMessage && payload.msg) {
        showSuccess(payload.msg)
      }
      return payload.data as T
    }

    return payload as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

const api = {
  get<T> (config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T> (config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T> (config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T> (config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T> (config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  },
  blob (config: ExtendedAxiosRequestConfig) {
    return retryRequest<Blob>({ ...config, method: config.method || 'GET', responseType: 'blob' })
  }
}

export default api

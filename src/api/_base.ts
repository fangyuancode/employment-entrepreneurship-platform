/**
 * API 基础地址工具。
 * Java 接口默认走 VITE_API_URL；Python AI/视觉服务走 VITE_PYTHON_API_URL。
 * 开发环境建议 Java 使用 /api 代理，Python 使用 /python-api 代理。
 */
export const JAVA_API_BASE_URL = import.meta.env.VITE_API_URL || '/'
export const PYTHON_API_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || ''

const ABSOLUTE_URL_REG = /^(https?:)?\/\//i

function trimRightSlash (value: string) {
  return value.replace(/\/+$/, '')
}

function ensureStartSlash (value: string) {
  return value.startsWith('/') ? value : `/${value}`
}

export function isAbsoluteUrl (url: string) {
  return ABSOLUTE_URL_REG.test(url) || url.startsWith('blob:') || url.startsWith('data:')
}

export function buildApiUrl (baseURL: string, path: string) {
  if (!path) return ''
  if (isAbsoluteUrl(path)) return path

  const normalizedPath = ensureStartSlash(path)
  const normalizedBase = trimRightSlash(baseURL || '')

  if (!normalizedBase || normalizedBase === '/') return normalizedPath
  return `${normalizedBase}${normalizedPath}`
}

export function buildJavaApiUrl (path: string) {
  return buildApiUrl(JAVA_API_BASE_URL, path)
}

export function buildPythonApiUrl (path: string) {
  return buildApiUrl(PYTHON_API_BASE_URL, path)
}

export function normalizePythonMediaUrl (path: string) {
  return buildPythonApiUrl(path)
}

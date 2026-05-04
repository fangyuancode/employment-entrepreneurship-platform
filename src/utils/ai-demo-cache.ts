/**
 * AI 示例请求本地缓存工具。
 * 作用：示例数据首次请求大模型后，将结果保存到 localStorage；下次相同示例请求命中缓存，等待 3 秒后直接展示。
 */
const CACHE_PREFIX = 'AI_DEMO_LOCAL_CACHE_V1'
const DEFAULT_TTL_DAYS = 30
const DEFAULT_DELAY = 3000

type CacheRecord<T> = {
  version: number
  createdAt: number
  expiresAt: number
  payload: unknown
  data: T
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

/**
 * 对请求参数做稳定化处理，避免对象 key 顺序不同导致缓存无法命中。
 * 字符串会 trim，undefined/function 会被忽略。
 */
export function normalizeAiCacheValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeAiCacheValue(item))
  }

  if (isPlainObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((target, key) => {
        const item = value[key]
        if (typeof item === 'undefined' || typeof item === 'function') return target
        target[key] = normalizeAiCacheValue(item)
        return target
      }, {})
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  return value
}

export function stableAiStringify(value: unknown): string {
  return JSON.stringify(normalizeAiCacheValue(value))
}

function hashString(text: string): string {
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

function getStorage() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function cloneAiCachePayload<T>(value: T): T {
  return JSON.parse(JSON.stringify(normalizeAiCacheValue(value))) as T
}

export function isSameAiPayload(left: unknown, right: unknown): boolean {
  return stableAiStringify(left) === stableAiStringify(right)
}

export function buildAiDemoCacheKey(moduleName: string, payload: unknown): string {
  return `${CACHE_PREFIX}:${moduleName}:${hashString(stableAiStringify(payload))}`
}

export function getAiDemoCache<T>(moduleName: string, payload: unknown): T | null {
  const storage = getStorage()
  if (!storage) return null

  const key = buildAiDemoCacheKey(moduleName, payload)
  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    const record = JSON.parse(raw) as CacheRecord<T>
    if (!record || record.version !== 1) {
      storage.removeItem(key)
      return null
    }

    if (record.expiresAt && Date.now() > record.expiresAt) {
      storage.removeItem(key)
      return null
    }

    return record.data || null
  } catch {
    storage.removeItem(key)
    return null
  }
}

export function setAiDemoCache<T>(
  moduleName: string,
  payload: unknown,
  data: T,
  ttlDays = DEFAULT_TTL_DAYS
): void {
  const storage = getStorage()
  if (!storage || !data) return

  const key = buildAiDemoCacheKey(moduleName, payload)
  const record: CacheRecord<T> = {
    version: 1,
    createdAt: Date.now(),
    expiresAt: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
    payload: normalizeAiCacheValue(payload),
    data: cloneAiCachePayload(data)
  }

  try {
    storage.setItem(key, JSON.stringify(record))
  } catch (error) {
    console.warn('[AI Demo Cache] localStorage 写入失败，已尝试清理旧缓存。', error)
    clearExpiredAiDemoCache()
  }
}

export function clearExpiredAiDemoCache(): void {
  const storage = getStorage()
  if (!storage) return

  const now = Date.now()
  Object.keys(storage).forEach((key) => {
    if (!key.startsWith(CACHE_PREFIX)) return
    try {
      const record = JSON.parse(storage.getItem(key) || '{}') as CacheRecord<unknown>
      if (!record.expiresAt || now > record.expiresAt) {
        storage.removeItem(key)
      }
    } catch {
      storage.removeItem(key)
    }
  })
}

export function waitAiCacheDelay(delay = DEFAULT_DELAY): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, delay))
}

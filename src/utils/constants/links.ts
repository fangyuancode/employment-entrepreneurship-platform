/**
 * 系统外部链接配置
 *
 * 说明：
 * - 这里不要保留为空对象，否则 TypeScript 会把 WEB_LINKS 推断为 `{}`，
 *   在打包时访问 WEB_LINKS.DOCS / WEB_LINKS.GITHUB 等字段会报 TS2339。
 * - 如果后续有真实的项目官网、文档、仓库地址，直接替换下面的字符串即可。
 */
export const WEB_LINKS = {
  /** 项目官网或系统首页 */
  DOCS: '/#/dashboard/console',
  /** 项目介绍 / 使用说明 */
  INTRODUCE: '/#/dashboard/console',
  /** GitHub 仓库 */
  GITHUB: 'https://github.com',
  /** GitHub 主页 */
  GITHUB_HOME: 'https://github.com',
  /** 社区 / 技术支持入口 */
  COMMUNITY: 'mailto:support@example.com',
  /** 哔哩哔哩主页 */
  BILIBILI: 'https://www.bilibili.com'
} as const

export type WebLinkKey = keyof typeof WEB_LINKS

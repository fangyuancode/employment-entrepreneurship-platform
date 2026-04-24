import { MenuThemeEnum, MenuTypeEnum, SystemThemeEnum } from '@/enums/appEnum'
import { SystemConfig } from '@/types/config'
import { configImages } from './assets/images'
import fastEnterConfig from './modules/fastEnter'
import { headerBarConfig } from './modules/headerBar'

const appConfig: SystemConfig = {
  // 系统信息
  systemInfo: {
    name: 'AI 创业就业助手' // 系统名称
  },
  // 系统主题
  systemThemeStyles: {
    [SystemThemeEnum.LIGHT]: { className: '' },
    [SystemThemeEnum.DARK]: { className: SystemThemeEnum.DARK }
  },
  // 系统主题列表
  settingThemeList: [
    {
      name: 'Light',
      theme: SystemThemeEnum.LIGHT,
      color: ['#fff', '#fff'],
      leftLineColor: '#EDEEF0',
      rightLineColor: '#EDEEF0',
      img: configImages.themeStyles.light
    },
    {
      name: 'Dark',
      theme: SystemThemeEnum.DARK,
      color: ['#22252A'],
      leftLineColor: '#3F4257',
      rightLineColor: '#3F4257',
      img: configImages.themeStyles.dark
    },
    {
      name: 'System',
      theme: SystemThemeEnum.AUTO,
      color: ['#fff', '#22252A'],
      leftLineColor: '#EDEEF0',
      rightLineColor: '#3F4257',
      img: configImages.themeStyles.system
    }
  ],
  // 菜单布局列表
  menuLayoutList: [
    { name: 'Left', value: MenuTypeEnum.LEFT, img: configImages.menuLayouts.vertical },
    { name: 'Top', value: MenuTypeEnum.TOP, img: configImages.menuLayouts.horizontal },
    { name: 'Mixed', value: MenuTypeEnum.TOP_LEFT, img: configImages.menuLayouts.mixed },
    { name: 'Dual Column', value: MenuTypeEnum.DUAL_MENU, img: configImages.menuLayouts.dualColumn }
  ],
  // 菜单主题列表
  themeList: [
    {
      theme: MenuThemeEnum.DESIGN,
      background: '#FFFFFF',
      systemNameColor: 'var(--art-gray-800)',
      iconColor: '#6B6B6B',
      textColor: '#29343D',
      img: configImages.menuStyles.design
    },
    {
      theme: MenuThemeEnum.DARK,
      background: '#191A23',
      systemNameColor: '#D9DADB',
      iconColor: '#BABBBD',
      textColor: '#BABBBD',
      img: configImages.menuStyles.dark
    },
    {
      theme: MenuThemeEnum.LIGHT,
      background: '#ffffff',
      systemNameColor: 'var(--art-gray-800)',
      iconColor: '#6B6B6B',
      textColor: '#29343D',
      img: configImages.menuStyles.light
    }
  ],
  // 暗黑模式菜单样式
  darkMenuStyles: [
    {
      theme: MenuThemeEnum.DARK,
      background: 'var(--default-box-color)',
      systemNameColor: '#DDDDDD',
      iconColor: '#BABBBD',
      textColor: 'rgba(#FFFFFF, 0.7)'
    }
  ],
  // 系统主色
  systemMainColor: [
    '#5D87FF',
    '#B48DF3',
    '#1D84FF',
    '#60C041',
    '#38C0FC',
    '#F9901F',
    '#FF80C8'
  ] as const,
  // 快速入口配置
  fastEnter: fastEnterConfig,
  // 顶部栏功能配置
  headerBar: headerBarConfig
}

export default Object.freeze(appConfig)

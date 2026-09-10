# 创业就业数字化辅助平台（传智杯国三作品）

一个基于 **Vue 3 + TypeScript + Vite + Element Plus** 构建的 AI 创业就业数字化平台前端项目。平台围绕“就业分析、职业规划、创业辅助、AI 问答、数据可视化与视觉智能”提供一体化功能，并通过业务后端与 Python AI/视觉服务完成数据处理和智能能力调用。

> 当前压缩包主要包含 **Web 前端工程**。业务后端与 Python AI/视觉服务代码未包含在本项目中，运行完整功能时需要分别启动对应服务。

## 项目概览

项目整体可以分为五类能力：

- **AI 就业助手**：岗位采集、岗位信息统计、职位分析、职业规划、数据挖掘、技能迁移、岗位技能图谱。
- **AI 创业助手**：商业计划书、品牌与文案、产品设计、路演 PPT、会议纪要、知识图谱分析。
- **智能交互与展示**：AI 智能聊天、创业就业首页、3D 数字展厅、岗位数据大屏、岗位关系图谱。
- **视觉辅助工具**：车辆识别、图像视觉分析、通用目标检测。
- **系统管理**：登录注册、用户管理、角色管理、菜单权限、个人中心、登录日志等。

项目采用前后端分离架构。前端负责页面交互、图表展示、状态管理和接口调用；Java/业务服务主要承载用户权限、岗位数据和 AI 业务接口；Python 服务主要承载岗位采集、目标检测和视觉分析等功能。

## 技术栈

| 分类         | 技术                                                         |
| ------------ | ------------------------------------------------------------ |
| 前端框架     | Vue 3.5                                                      |
| 开发语言     | TypeScript / JavaScript                                      |
| 构建工具     | Vite 7                                                       |
| UI 组件库    | Element Plus                                                 |
| 路由         | Vue Router 4                                                 |
| 状态管理     | Pinia + pinia-plugin-persistedstate                          |
| HTTP 请求    | Axios                                                        |
| 数据可视化   | ECharts 6 + ECharts GL                                       |
| 3D 可视化    | Three.js                                                     |
| 样式方案     | SCSS + Tailwind CSS 4                                        |
| 图标         | Element Plus Icons + Iconify                                 |
| 富文本       | WangEditor                                                   |
| 流程/关系图  | Mermaid                                                      |
| 表格文件     | xlsx                                                         |
| PDF/截图导出 | jsPDF + html2canvas                                          |
| 视频播放     | xgplayer                                                     |
| 视觉能力     | MediaPipe Tasks Vision                                       |
| 工程规范     | ESLint + Prettier + Stylelint + Husky + lint-staged + Commitlint |

## 系统架构

```text
┌─────────────────────────────────────────────┐
│               Web Browser                   │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│          Vue 3 + Vite Frontend               │
│                                             │
│  Router / Pinia / Element Plus / ECharts    │
│  Three.js / Axios / Mermaid / MediaPipe     │
└───────────────┬────────────────┬────────────┘
                │                │
          /api/*│                │/python-api/*
                ▼                ▼
┌──────────────────────┐  ┌──────────────────────┐
│  业务后端服务          │  │ Python AI/视觉服务    │
│  默认开发端口 9093     │  │ 默认开发端口 5001     │
│                      │  │                      │
│ 用户/角色/菜单         │  │ 岗位采集              │
│ 岗位数据与统计         │  │ 车辆识别              │
│ AI 创业/就业业务接口   │  │ 通用目标检测          │
│ 登录日志等             │  │ 图像视觉分析          │
└──────────────────────┘  └──────────────────────┘
```

开发环境中，Vite 会将 `/api` 请求代理到业务后端，将 `/python-api` 请求代理到 Python 服务，并在转发 Python 请求时移除 `/python-api` 前缀。

## 核心功能

### 1. 首页与工作台

系统首页提供平台介绍、核心功能入口和场景导航；登录后的工作台集中展示项目概览、工具调用情况、项目模块进度和常用功能入口。

主要页面：

```text
/home
/dashboard/console
```

### 2. AI 就业助手

#### 岗位采集

支持获取岗位分类、岗位搜索项，按城市和职位执行岗位采集，并提供采集结果、预览及文件下载能力。

路由：`/toolbox/jobcollection`

主要接口模块：`src/api/job-collect.ts`

#### 岗位信息统计

支持岗位分页查询、关键词筛选、城市筛选、岗位详情查看以及岗位相关基础选项加载。

路由：`/toolbox/joblist`

主要接口模块：`src/api/job-list.ts`

#### 职位信息分析

提供岗位总量、企业数量、城市数量、岗位类别、热门岗位、热门企业、学历要求、工作经验、城市分布等统计信息，并支持 AI 求职推荐。

路由：`/toolbox/jobanalysis`

主要接口模块：`src/api/job-analysis.ts`

#### AI 职业规划中心

根据目标岗位、所在城市、学历、工作经验、已有技能、项目经历、简历文本、期望薪资等信息生成职业诊断和规划结果。

路由：`/toolbox/careercenter`

主要接口模块：`src/api/career-center.ts`

#### 数据挖掘

用于分析岗位、城市、行业类别、学历、经验、薪资、技能热点以及创业机会等招聘数据特征。

路由：`/toolbox/quantity`

主要接口模块：`src/api/job-mining.ts`

#### 技能迁移

围绕源岗位与目标岗位进行技能迁移分析，展示技能重合度、薪资变化、岗位需求变化、迁移收益、风险和建议，并支持迁移路径图。

路由：`/toolbox/migration`

主要接口模块：`src/api/skill-migration.ts`

#### 岗位技能图谱

支持岗位技能节点、关系、关联增强、节点关系查询和 AI 推荐，并提供独立的大屏图谱展示页面。

路由：

```text
/toolbox/jobskillgraph
/toolbox/job-skill-graph/view
/jobmap
```

主要接口模块：`src/api/job-skill-graph.ts`

### 3. AI 智能聊天

提供面向就业场景的智能问答能力，当前接口设计覆盖普通求职问答、简历优化、面试准备、职业规划、岗位推荐、趋势分析、历史总结、常见问题和使用指南等场景。

路由：`/aichat`

主要接口模块：`src/api/job-chat.ts`

### 4. 岗位数据大屏

系统内置全国、省、市三级岗位数据分析能力，可展示岗位地域分布、高薪岗位、技能热度、学历与经验结构等信息，并提供岗位分布大地图。

主要路由：

```text
/jobscreen
/jobscreen/bigmap
```

主要接口模块：`src/api/job-screen.ts`

地图数据位于 `src/echarts/geo/`，包含全国、省级及世界地图 GeoJSON 数据。

### 5. AI 创业助手

#### 商业计划书生成器

根据项目名称、行业、项目阶段、目标用户、核心痛点、解决方案、商业模式、竞争优势、团队、预算等信息生成完整商业计划内容，并支持配图生成和 PDF 导出。

路由：`/study/business`

接口：`src/api/business-plan.ts`

#### AI 品牌与文案生成

用于生成品牌名称、品牌口号、品牌定位、品牌故事、首页文案、海报文案、社交媒体文案、短视频脚本、直播脚本、广告文案及相关视觉提示词。

路由：`/study/copywriting`

接口：`src/api/brand-copywriting.ts`

#### AI 产品设计助手

支持产品定位、用户画像、页面结构、功能拆解、交互方案、设计系统、UX 文案、流程图、信息架构以及视觉设计建议生成。

路由：`/study/assistance`

接口：`src/api/product-design.ts`

#### 路演 PPT 助手

根据创业项目资料生成路演 PPT 的页数、页面标题、核心内容、视觉建议、演讲备注、开场词、结束语及答辩建议，并支持构建演示文件。

路由：`/study/pitchppt`

接口：`src/api/pitch-ppt.ts`

#### AI 会议纪要助手

将会议内容整理为会议摘要、参会人员、关键决策、待办任务、风险提醒和后续建议，并预留邮件发送能力。

路由：`/study/meeting`

接口：`src/api/meeting-minutes.ts`

#### 知识图谱分析

支持从文本中提取实体、实体关系、事件和时间线，并可按领域、实体类型和关系类型配置抽取任务。

路由：`/study/relationship`

接口：`src/api/entity-relationship.ts`

### 6. 数字展厅

项目使用 Three.js 构建 3D 数字展厅，用于展示就业分析、AI 问答、技能分析和创业孵化等平台核心能力，可作为项目演示或创新创业竞赛展示入口。

路由：`/exhibition`

核心代码：

```text
src/views/exhibition/index.vue
src/views/exhibition/components/ThreeExhibitionScene.vue
src/views/exhibition/data.ts
```

### 7. 视觉辅助工具

系统提供车辆图片/视频识别、实时识别、通用目标检测和图像质量/边缘/轮廓等视觉分析功能。这部分接口主要由 Python 服务提供。

主要路由：

```text
/help/vehicle
/help/detect
/help/vision
```

主要接口：

```text
src/api/vehicle-recognition.ts
src/api/general-detection.ts
src/api/vision-analysis.ts
```

### 8. 系统管理与权限

系统当前使用后端权限模式：

```env
VITE_ACCESS_MODE=backend
```

登录成功后，前端通过 Pinia 持久化用户信息与 Token，并在 Axios 请求拦截器中同时写入：

```http
Authorization: <token>
token: <token>
```

系统管理模块包含用户、角色、菜单和权限相关功能，并支持登录日志管理。

主要路由：

```text
/system/user
/system/role
/system/menu
/system/user-center
/seting/usermanger
```

## 项目目录

```text
AssistantSystem/
├── public/                     # 公共静态资源
├── scripts/                    # 工程脚本
├── src/
│   ├── api/                    # API 请求模块
│   ├── assets/                 # 图片、样式、SVG 等静态资源
│   ├── config/                 # 系统主题、布局、快捷入口配置
│   ├── directives/             # 自定义指令（权限、高亮、波纹等）
│   ├── echarts/                # ECharts 地图数据与地图脚本
│   ├── enums/                  # 枚举定义
│   ├── hooks/                  # Composition API 公共 Hooks
│   ├── locales/                # 中英文国际化资源
│   ├── mock/                   # 部分演示/升级数据
│   ├── plugins/                # 插件初始化
│   ├── router/                 # 路由、动态菜单与权限处理
│   ├── store/                  # Pinia 状态管理
│   ├── types/                  # TypeScript 类型声明
│   ├── utils/                  # HTTP、缓存、存储、路由等工具
│   ├── views/                  # 页面模块
│   │   ├── aichat/             # AI 智能聊天
│   │   ├── auth/               # 登录、注册、找回密码
│   │   ├── dashboard/          # 工作台
│   │   ├── exhibition/         # 3D 数字展厅
│   │   ├── help/               # 视觉辅助工具
│   │   ├── home/               # 平台首页
│   │   ├── jobmap/             # 岗位关系图谱
│   │   ├── jobscreen/          # 岗位数据大屏
│   │   ├── study/              # AI 创业助手
│   │   ├── system/             # 系统管理
│   │   └── toolbox/            # AI 就业助手
│   ├── App.vue
│   └── main.ts
├── .env                        # 通用环境变量
├── .env.development            # 开发环境配置
├── .env.production             # 生产环境配置
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
└── tsconfig.json
```

## 环境要求

项目 `package.json` 中声明：

```text
Node.js >= 20.19.0
pnpm   >= 8.8.0
```

推荐使用较新的 Node.js 20 LTS，并统一使用 pnpm 安装依赖，避免 npm、yarn 和 pnpm 混用造成锁文件变化。

## 快速开始

### 1. 获取项目

```bash
git clone <your-repository-url>
cd AssistantSystem
```

如果已经拿到源码压缩包，直接进入项目根目录即可。

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置开发环境

默认 `.env.development`：

```env
# 业务后端
VITE_API_URL=/
VITE_API_PROXY_URL=http://127.0.0.1:9093

# Python AI/视觉服务
VITE_PYTHON_API_URL=/python-api
VITE_PYTHON_API_PROXY_URL=http://127.0.0.1:5001

VITE_DROP_CONSOLE=false
```

如后端部署在其他机器，只需要修改对应代理地址。

### 4. 启动后端服务

完整运行前，请确保业务后端和 Python 服务已经启动：

```text
业务后端：127.0.0.1:9093
Python 服务：127.0.0.1:5001
```

如果暂时只查看前端静态页面，可以先启动前端，但涉及接口数据的功能会出现请求失败。

### 5. 启动前端

```bash
pnpm dev
```

默认端口来自 `.env`：

```env
VITE_PORT=3006
```

启动后访问：

```text
http://localhost:3006
```

`pnpm dev` 使用了 `vite --open`，正常情况下会自动打开浏览器。

## 环境变量说明

| 变量                        | 说明                     | 默认/示例               |
| --------------------------- | ------------------------ | ----------------------- |
| `VITE_VERSION`              | 前端版本号               | `3.0.2`                 |
| `VITE_PORT`                 | Vite 开发端口            | `3006`                  |
| `VITE_BASE_URL`             | 前端部署基础路径         | `/`                     |
| `VITE_ACCESS_MODE`          | 权限模式                 | `backend`               |
| `VITE_WITH_CREDENTIALS`     | 跨域请求是否携带 Cookie  | `false`                 |
| `VITE_OPEN_ROUTE_INFO`      | 是否输出路由信息         | `false`                 |
| `VITE_LOCK_ENCRYPT_KEY`     | 锁屏相关加密 Key         | 请按部署环境修改        |
| `VITE_API_URL`              | 业务 API 基础地址        | 开发环境 `/`            |
| `VITE_API_PROXY_URL`        | 开发环境业务后端代理地址 | `http://127.0.0.1:9093` |
| `VITE_PYTHON_API_URL`       | Python API 基础地址      | `/python-api`           |
| `VITE_PYTHON_API_PROXY_URL` | Python 服务代理地址      | `http://127.0.0.1:5001` |
| `VITE_DROP_CONSOLE`         | 生产环境是否移除 console | 生产环境 `true`         |

> 不建议将生产服务器地址、模型密钥、数据库密码、JWT 密钥等敏感配置直接提交到 Git 仓库。生产部署时应通过服务器环境变量或独立配置文件管理。

## 常用命令

```bash
# 启动开发环境
pnpm dev

# 类型检查并构建生产版本
pnpm build

# 本地预览打包结果
pnpm serve

# ESLint 检查
pnpm lint

# ESLint 自动修复
pnpm fix

# Prettier 格式化
pnpm lint:prettier

# Stylelint 检查并修复
pnpm lint:stylelint

# 执行 lint-staged
pnpm lint:lint-staged

# Commitizen 规范提交
pnpm commit

# 清理开发环境缓存/临时内容
pnpm clean:dev
```

## 路由与权限机制

项目路由主要分为两类。

### 静态路由

定义在：

```text
src/router/routes/staticRoutes.ts
```

包含首页、登录、注册、数字展厅、岗位大屏、岗位图谱、AI 聊天等页面。

### 动态路由

定义入口：

```text
src/router/routes/asyncRoutes.ts
src/router/modules/
```

动态路由用于系统菜单及权限控制。项目已经封装菜单处理、路由转换、权限验证、组件动态加载等核心逻辑：

```text
src/router/core/ComponentLoader.ts
src/router/core/MenuProcessor.ts
src/router/core/RoutePermissionValidator.ts
src/router/core/RouteRegistry.ts
src/router/core/RouteTransformer.ts
src/router/core/RouteValidator.ts
```

新增后台管理页面时，建议优先遵循现有路由模块化结构。

## API 组织方式

统一请求封装位于：

```text
src/utils/http/index.ts
```

API 地址工具位于：

```text
src/api/_base.ts
```

业务 API 按功能拆分，主要包括：

| 文件                     | 功能                       |
| ------------------------ | -------------------------- |
| `auth.ts`                | 登录、注册、用户信息       |
| `system-manage.ts`       | 用户、角色、菜单、登录日志 |
| `job-collect.ts`         | 岗位采集                   |
| `job-list.ts`            | 岗位列表与详情             |
| `job-analysis.ts`        | 岗位统计分析与 AI 推荐     |
| `career-center.ts`       | AI 职业规划                |
| `job-mining.ts`          | 招聘数据挖掘               |
| `skill-migration.ts`     | 技能迁移分析               |
| `job-skill-graph.ts`     | 岗位技能图谱               |
| `job-screen.ts`          | 岗位数据大屏               |
| `job-chat.ts`            | AI 就业智能聊天            |
| `business-plan.ts`       | 商业计划书                 |
| `brand-copywriting.ts`   | 品牌和文案生成             |
| `product-design.ts`      | AI 产品设计                |
| `pitch-ppt.ts`           | 路演 PPT                   |
| `meeting-minutes.ts`     | AI 会议纪要                |
| `entity-relationship.ts` | 实体关系/知识图谱分析      |
| `vehicle-recognition.ts` | 车辆识别                   |
| `general-detection.ts`   | 通用目标检测               |
| `vision-analysis.ts`     | 图像视觉分析               |

部分 AI 内容生成接口超时时间设置为 120～180 秒，岗位采集等长任务接口最高设置到 600 秒，因此部署 Nginx 或网关时需要同步调整反向代理超时时间。

## 状态管理

Pinia Store 位于：

```text
src/store/modules/
```

当前主要包括：

```text
user.ts       用户、Token、语言、锁屏状态
menu.ts       菜单状态
setting.ts    系统设置
worktab.ts    多标签页状态
table.ts      表格相关状态
```

用户 Store 使用 `pinia-plugin-persistedstate` 写入 LocalStorage，因此调试登录、权限或菜单缓存问题时，需要注意浏览器本地缓存的影响。

## 数据可视化

项目使用 ECharts、ECharts GL 和 Three.js 实现多种可视化能力，包括：

```text
全国/省/市岗位地图
岗位分布大屏
技能热点图
薪资/学历/经验统计
岗位技能关系图谱
3D 数字展厅
```

地图资源主要位于：

```text
src/echarts/geo/
src/echarts/map/
```

图表公共 Hook：

```text
src/hooks/core/useChart.ts
```

在新增 ECharts 页面时，建议复用现有 Hook 并正确处理窗口 `resize`，避免浏览器尺寸变化后图表宽高不更新。

## 国际化与主题

系统已集成 `vue-i18n`，语言资源位于：

```text
src/locales/langs/zh.json
src/locales/langs/en.json
```

主题配置位于：

```text
src/config/index.ts
src/config/setting.ts
src/assets/styles/core/
```

支持 Light、Dark 和跟随系统主题，并提供多种菜单布局与主题色配置。

## 构建与部署

### 构建

```bash
pnpm build
```

构建过程会先执行：

```bash
vue-tsc --noEmit
```

类型检查通过后再执行 Vite 打包，生成目录：

```text
dist/
```

项目已启用 gzip 静态资源压缩，超过约 10 KB 的资源会额外生成 `.gz` 文件。

### Nginx 部署示例

以下仅作为同源部署思路参考，请根据实际域名和服务器地址调整：

```nginx
server {
    listen 80;
    server_name example.com;

    root /var/www/assistant-system/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 业务后端
    location /api/ {
        proxy_pass http://127.0.0.1:9093;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 600s;
    }

    # Python AI/视觉服务
    location /python-api/ {
        proxy_pass http://127.0.0.1:5001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 600s;
    }

    # 如果服务器支持，可以直接返回 Vite 生成的 gzip 文件
    gzip_static on;
}
```

此时生产环境可以考虑配置为：

```env
VITE_API_URL=/
VITE_PYTHON_API_URL=/python-api
```

这样前端、业务后端和 Python 服务通过同一域名访问，可以减少跨域配置问题。

## 开发规范

项目已经集成 Husky、lint-staged、ESLint、Prettier、Stylelint 和 Commitlint。提交代码前会对暂存文件执行格式和规范检查。

推荐提交方式：

```bash
pnpm commit
```

项目使用 `cz-git` 辅助生成规范化 Git Commit。

## 常见问题

### 页面能打开，但接口全部失败

检查业务后端是否启动，以及 `.env.development` 中的：

```env
VITE_API_PROXY_URL=http://127.0.0.1:9093
```

是否与实际服务地址一致。

### 视觉识别或岗位采集功能请求失败

检查 Python 服务及：

```env
VITE_PYTHON_API_PROXY_URL=http://127.0.0.1:5001
```

同时确认 Vite 开发环境正在通过 `/python-api` 转发请求。

### 登录成功后仍然没有菜单

当前项目使用后端权限模式，需要确认后端菜单/路由接口正常，并检查浏览器 LocalStorage 中是否残留旧用户、旧 Token 或旧菜单缓存。

### API 返回 401 后自动退出

这是当前 HTTP 封装的预期行为。请求收到未授权状态后会调用用户 Store 的退出逻辑，清空登录状态和 Token，并跳转登录页面。

### AI 请求时间较长后被网关中断

部分接口前端超时时间达到 120～600 秒。如果生产环境通过 Nginx、API Gateway 或其他代理转发，需要同步增大 `proxy_read_timeout`、网关超时等配置。

### 修改 `.env` 后没有生效

Vite 环境变量通常在开发服务器启动时读取。修改 `.env`、`.env.development` 或 `.env.production` 后，请重新启动前端服务。

## 当前项目维护建议

根据当前代码结构，后续可以进一步整理以下内容：

1. `package.json` 中的包名仍为 `art-design-pro`，如果项目已经正式命名，建议同步修改为项目自己的 npm 包名。
2. `src/config/index.ts` 中系统名称当前为“数字化平台”，可统一修改为正式产品名称，例如“创业就业数字化平台”或项目品牌名称。
3. 项目中仍存在 `test1` 测试路由，以及内容较少的 `study/finance` 页面，正式发布前建议确认是否保留。
4. 当前 `.env.production` 中包含具体服务地址。建议生产部署时改用服务器环境变量或部署平台配置，避免环境地址直接提交到公共仓库。
5. `src/src/echarts` 存在额外的重复层级目录，建议确认是否仍被引用；如无引用可清理，减少目录歧义。
6. 前端同时存在较多 ECharts/地图/Three.js 页面，建议对大体积模块继续使用按需加载和路由懒加载，控制首屏资源体积。
7. 如果后续开放 GitHub 仓库，建议补充项目截图、在线演示地址、后端项目地址、接口文档和数据库初始化说明。

## 二次开发建议

新增普通业务页面时，推荐按以下路径组织：

```text
src/views/<module>/              页面
src/api/<module>.ts              API
src/router/modules/<module>.ts   路由
src/types/                       公共类型（需要时）
src/store/modules/               跨页面状态（需要时）
```

新增 API 时尽量复用 `src/utils/http/index.ts`，不要在页面中直接创建新的 Axios 实例，以保证 Token、业务状态码、错误提示和 401 退出逻辑保持一致。

新增 Python 服务接口时，可以使用：

```ts
import { PYTHON_API_BASE_URL } from '@/api/_base'
```

并在请求配置中指定：

```ts
baseURL: PYTHON_API_BASE_URL
```

从而同时兼容开发代理和生产环境地址。

## License

当前仓库包含 MIT License，具体版权信息以项目根目录 `LICENSE` 文件为准。

如果项目基于第三方开源后台模板进行二次开发，正式发布或商业使用前请同时核对原模板、组件库及其他依赖的开源许可证要求。

---

**项目名称：** 创业就业数字化平台 / AI 创业就业助手  
**前端目录：** `AssistantSystem`  
**默认开发端口：** `3006`  
**业务后端默认开发地址：** `http://127.0.0.1:9093`  
**Python 服务默认开发地址：** `http://127.0.0.1:5001`

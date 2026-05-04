<template>
  <div class="career-chat-page">
    <div class="career-chat-shell">
      <aside class="left-sidebar">
        <div class="brand-block">
          <div class="brand-logo">职</div>
          <div class="brand-info">
            <h2>AI就业助手</h2>
            <p>岗位数据问答</p>
          </div>
        </div>

        <div class="sidebar-actions">
          <el-button type="primary" :disabled="loading" @click="clearChat">
            <el-icon>
              <Plus />
            </el-icon>
            <span>新建对话</span>
          </el-button>
          <button class="icon-only-btn" :disabled="loading" title="编辑当前对话" @click="focusInput">
            <el-icon>
              <EditPen />
            </el-icon>
          </button>
        </div>

        <nav class="nav-list">
          <button v-for="item in navItems" :key="item.key" class="nav-item" :class="{ active: activeNav === item.key }" type="button" @click="handleNavClick(item)">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <div class="recent-box">
          <div class="section-label">最近对话</div>
          <button v-for="item in recentChats" :key="item.id" class="recent-item" type="button" :disabled="loading" @click="sendPrompt(item.question || item.title)">
            <el-icon>
              <ChatDotRound />
            </el-icon>
            <span>
              <strong>{{ item.title }}</strong>
              <small>{{ item.time }}</small>
            </span>
          </button>
        </div>

        <div class="user-card" @click="handleUserCardClick">
          <div class="user-avatar">
            <img v-if="userAvatar" :src="userAvatar" alt="用户头像" />
            <span v-else>{{ userInitial }}</span>
          </div>
          <div class="user-meta">
            <strong>{{ userName }}</strong>
            <span>{{ isLogin ? '已登录' : '请先登录' }}</span>
          </div>
          <el-icon>
            <ArrowDown />
          </el-icon>
        </div>
      </aside>

      <main class="chat-center">
        <header class="chat-header">
          <div>
            <h1>AI就业助手</h1>
            <p><span></span>在线 · 基于岗位数据库回答</p>
          </div>
          <div class="header-tools">
            <button type="button" title="固定会话">
              <el-icon>
                <Notification />
              </el-icon>
            </button>
            <button type="button" title="更多操作">
              <el-icon>
                <MoreFilled />
              </el-icon>
            </button>
          </div>
        </header>

        <section ref="chatBodyRef" class="chat-scroll-area">
          <div v-if="messages.length === 0" class="welcome-panel">
            <button class="welcome-close" type="button" title="收起欢迎卡片">
              <el-icon>
                <Close />
              </el-icon>
            </button>
            <div class="assistant-avatar large">职</div>
            <div class="welcome-copy">
              <h2>你好，{{ userName }}，欢迎使用AI就业助手</h2>
              <p>
                你可以咨询岗位需求、技能要求、薪资参考、城市机会、简历优化和面试准备等问题。
                回答会优先结合平台岗位数据库统计结果。
              </p>
              <div class="welcome-actions">
                <button v-for="item in quickPrompts.slice(0, 4)" :key="item.title" type="button" :disabled="loading" @click="sendPrompt(item.question)">
                  <el-icon>
                    <component :is="item.icon" />
                  </el-icon>
                  <span>{{ item.title }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="message-list">
            <div v-for="message in messages" :key="message.id" class="message-row" :class="message.role === 'user' ? 'from-user' : 'from-assistant'">
              <template v-if="message.role === 'assistant'">
                <div class="assistant-avatar">职</div>
                <div class="message-main">
                  <div class="message-name">
                    <strong>AI就业助手</strong>
                    <span>{{ message.time }}</span>
                  </div>
                  <div class="assistant-bubble">
                    <div class="message-text" v-html="renderMessage(message.content)"></div>
                  </div>

                  <div v-if="message.result" class="data-summary-card">
                    <div class="data-card-title">
                      <strong>数据库参考结果</strong>
                      <span>{{ message.result.usedAi ? '已结合大模型整理' : '数据库统计回答' }}</span>
                    </div>

                    <div v-if="message.result.metrics?.length" class="metric-grid">
                      <div v-for="metric in message.result.metrics.slice(0, 4)" :key="metric.label">
                        <b>{{ metric.value }}</b>
                        <span>{{ metric.label }}</span>
                      </div>
                    </div>

                    <div v-if="message.result.topSkills?.length" class="skill-list">
                      <span v-for="skill in message.result.topSkills.slice(0, 8)" :key="skill.name">
                        {{ skill.name }} {{ skill.value }}
                      </span>
                    </div>

                    <div v-if="message.result.relatedJobs?.length" class="job-result-list">
                      <button v-for="job in message.result.relatedJobs.slice(0, 3)" :key="job.id || `${job.jobName}-${job.companyName}`" class="job-result-item" type="button" title="点击前往岗位列表查看详情" @click="goToJobList(job)">
                        <div class="job-result-main">
                          <strong>{{ job.jobName || '相关岗位' }}</strong>
                          <p>{{ job.companyName || '企业信息暂缺' }}</p>
                          <div class="job-tags">
                            <span>{{ job.city || '城市未知' }}</span>
                            <span>{{ job.salary || '薪资面议' }}</span>
                            <span>{{ job.degree || '学历不限' }}</span>
                          </div>
                        </div>
                        <div class="job-link-tip">
                          <span>查看岗位</span>
                          <el-icon>
                            <ArrowRight />
                          </el-icon>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <div class="message-main user-message-main">
                  <div class="message-name user-name">
                    <strong>我</strong>
                    <span>{{ message.time }}</span>
                  </div>
                  <div class="user-bubble">
                    <div class="message-text" v-html="renderMessage(message.content)"></div>
                  </div>
                </div>
                <div class="user-avatar small">
                  <img v-if="userAvatar" :src="userAvatar" alt="用户头像" />
                  <span v-else>{{ userInitial }}</span>
                </div>
              </template>
            </div>

            <div v-if="loading" class="message-row from-assistant loading-message">
              <div class="assistant-avatar">职</div>
              <div class="message-main">
                <div class="message-name">
                  <strong>AI就业助手</strong>
                  <span>正在处理</span>
                </div>
                <div class="assistant-bubble loading-bubble">
                  <div class="typing-dots"><i></i><i></i><i></i></div>
                  <div>
                    <strong>{{ loadingTitle }}</strong>
                    <p>{{ loadingDesc }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="chat-composer">
          <div v-if="attachments.length" class="attachment-strip">
            <div v-for="file in attachments" :key="file.id" class="attachment-card">
              <div class="attachment-icon">{{ file.ext }}</div>
              <div>
                <strong>{{ file.name }}</strong>
                <span>{{ file.sizeText }}</span>
              </div>
              <button type="button" @click="removeAttachment(file.id)">
                <el-icon>
                  <Close />
                </el-icon>
              </button>
            </div>
          </div>

          <div class="input-row">
            <button type="button" class="plain-tool" title="上传简历或职位描述" @click="triggerFileInput">
              <el-icon>
                <Paperclip />
              </el-icon>
            </button>
            <el-input ref="inputRef" v-model="inputValue" type="textarea" resize="none" :disabled="loading" :autosize="{ minRows: 1, maxRows: 4 }" placeholder="请输入你的问题，例如：Java岗位需求、杭州薪资水平、简历优化建议..." @keydown.enter.exact.prevent="handleEnter" />
            <button class="send-button" :class="{ loading }" type="button" :disabled="loading || !inputValue.trim()" @click="handleSubmit">
              <el-icon v-if="!loading">
                <Position />
              </el-icon>
              <span v-else></span>
            </button>
          </div>

          <div class="composer-foot">
            <span>内容由系统结合岗位数据库生成，仅供求职参考。</span>
            <span>Enter 发送，Shift + Enter 换行</span>
          </div>

          <input ref="fileInputRef" class="hidden-file-input" type="file" multiple accept=".txt,.md,.doc,.docx,.pdf,.xls,.xlsx" @change="onFileChange" />
        </section>
      </main>

      <aside class="right-panel">
        <section class="side-card quick-card">
          <h3>快捷功能</h3>
          <button v-for="item in rightActions" :key="item.title" type="button" :disabled="loading" @click="sendPrompt(item.question)">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
            <el-icon class="arrow">
              <ArrowRight />
            </el-icon>
          </button>
        </section>

        <section class="side-card plan-card">
          <div class="side-card-head">
            <h3>求职计划</h3>
            <el-icon>
              <Calendar />
            </el-icon>
          </div>
          <div class="plan-list">
            <div class="plan-item finished">
              <i></i>
              <span>
                <strong>完善简历内容</strong>
                <small>建议优先完成</small>
              </span>
            </div>
            <div class="plan-item active">
              <i></i>
              <span>
                <strong>分析目标岗位</strong>
                <small>进行中</small>
              </span>
            </div>
            <div class="plan-item">
              <i></i>
              <span>
                <strong>准备面试问答</strong>
                <small>待开始</small>
              </span>
            </div>
          </div>
          <button class="text-link" type="button" @click="sendPrompt('请帮我制定一份软件开发岗位求职计划，包含简历、技能、投递和面试准备。')">
            生成完整计划
            <el-icon>
              <ArrowRight />
            </el-icon>
          </button>
        </section>

        <section class="side-card tip-card">
          <div class="tip-icon">
            <el-icon>
              <Opportunity />
            </el-icon>
          </div>
          <h3>求职提示</h3>
          <p>提问时写清楚城市、岗位方向、学历和经验，系统可以给出更贴近数据库的分析结果。</p>
        </section>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  ArrowRight,
  Briefcase,
  Calendar,
  ChatDotRound,
  Close,
  DataAnalysis,
  Document,
  EditPen,
  Files,
  Guide,
  MoreFilled,
  Notification,
  Opportunity,
  Paperclip,
  Plus,
  Position,
  Setting,
  UserFilled
} from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import { askJobChat, type JobChatResponse } from '@/api/job-chat'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
  result?: JobChatResponse
}

interface RecentChat {
  id: string
  title: string
  time: string
  question?: string
}

interface AttachmentItem {
  id: string
  name: string
  sizeText: string
  ext: string
  textSnippet?: string
}

interface PromptAction {
  title: string
  question: string
  icon: any
}

interface NavItem extends PromptAction {
  key: string
  label: string
}

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const inputValue = ref('')
const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const loadingStep = ref(0)
const chatBodyRef = ref<HTMLElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const inputRef = ref<any>(null)
const attachments = ref<AttachmentItem[]>([])
const activeNav = ref('chat')

let loadingTimer: number | undefined

const isLogin = computed(() => Boolean(userStore.isLogin || userStore.accessToken))
const userInfo = computed(() => (userStore.info || {}) as Record<string, any>)
const userName = computed(() => {
  const info = userInfo.value
  return info.nickName || info.userName || info.username || info.email || '同学'
})
const userAvatar = computed(() => {
  const avatar = userInfo.value.avatar || userInfo.value.userAvatar || ''
  return typeof avatar === 'string' && avatar.trim() ? avatar : ''
})
const userInitial = computed(() =>
  String(userName.value || '同')
    .slice(0, 1)
    .toUpperCase()
)

const loadingTexts = [
  { title: '正在理解你的问题', desc: '识别岗位、城市、技能、学历和经验等关键词。' },
  { title: '正在检索岗位数据库', desc: '统计岗位数量、薪资参考、热门技能和相关企业。' },
  { title: '正在整理就业建议', desc: '结合数据库结果生成更清晰的求职分析。' }
]

const loadingTitle = computed(() => loadingTexts[loadingStep.value]?.title || loadingTexts[0].title)
const loadingDesc = computed(() => loadingTexts[loadingStep.value]?.desc || loadingTexts[0].desc)

const navItems: NavItem[] = [
  {
    key: 'chat',
    label: '对话咨询',
    title: '对话咨询',
    icon: ChatDotRound,
    question: ''
  },
  {
    key: 'history',
    label: '历史记录',
    title: '历史记录',
    icon: Files,
    question: '请根据我的历史提问，帮我整理一份近期求职关注点总结。'
  },
  {
    key: 'prompt',
    label: '常用问题',
    title: '常用问题',
    icon: Guide,
    question: '请列出软件开发求职中最值得关注的 10 个问题，并说明应该如何提问。'
  },
  {
    key: 'setting',
    label: '使用说明',
    title: '使用说明',
    icon: Setting,
    question: '请说明如何使用AI就业助手进行岗位分析、简历优化和面试准备。'
  }
]

const quickPrompts: PromptAction[] = [
  {
    title: '优化简历',
    icon: Document,
    question: '请从招聘岗位要求角度，告诉我软件开发简历应该重点优化哪些内容？'
  },
  {
    title: '面试准备',
    icon: UserFilled,
    question: '请帮我整理一份 Java 后端岗位的面试准备清单，包含基础知识、项目问题和常见追问。'
  },
  {
    title: '职业规划',
    icon: Guide,
    question: '我想从应届生进入软件开发岗位，请给我一份三个月求职准备规划。'
  },
  {
    title: '岗位推荐',
    icon: Briefcase,
    question: '请根据当前岗位数据库，推荐适合应届生关注的软件开发相关岗位方向。'
  }
]

const rightActions: PromptAction[] = [
  ...quickPrompts,
  {
    title: '岗位趋势分析',
    icon: DataAnalysis,
    question: '请分析当前软件开发岗位的就业趋势、热门城市、热门技能和薪资情况。'
  }
]

const recentChats = ref<RecentChat[]>([
  {
    id: 'r1',
    title: 'Java后端岗位需求分析',
    time: '今天',
    question: 'Java 后端岗位目前需求怎么样？主要分布在哪些城市？需要掌握哪些技能？'
  },
  {
    id: 'r2',
    title: '应届生求职准备清单',
    time: '昨天',
    question: '应届生想进入软件开发岗位，应该如何准备简历、技能和面试？'
  },
  {
    id: 'r3',
    title: '杭州高薪岗位分析',
    time: '5月10日',
    question: '杭州目前哪些岗位薪资较高？这些岗位通常要求哪些技能和经验？'
  },
  {
    id: 'r4',
    title: '前端热门技能',
    time: '5月8日',
    question: '前端开发岗位目前热门技能有哪些？Vue、React、TypeScript 的需求情况如何？'
  }
])

onMounted(() => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录后再使用就业智能聊天功能')
    router.replace({
      name: 'Login',
      query: { redirect: route.fullPath }
    })
  }
})

const handleNavClick = (item: NavItem) => {
  activeNav.value = item.key
  if (item.question) sendPrompt(item.question)
}

const handleUserCardClick = () => {
  if (!isLogin.value) {
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
  }
}

const focusInput = () => {
  nextTick(() => {
    inputRef.value?.focus?.()
  })
}

const handleEnter = () => {
  handleSubmit()
}

const handleSubmit = () => {
  sendQuestion(inputValue.value)
}

const sendPrompt = (question: string) => {
  if (!question) return
  sendQuestion(question)
}

const sendQuestion = async (question: string) => {
  if (!isLogin.value) {
    ElMessage.warning('请先登录后再使用就业智能聊天功能')
    router.push({ name: 'Login', query: { redirect: route.fullPath } })
    return
  }

  const displayQuestion = question.trim()
  if (!displayQuestion) {
    ElMessage.warning('请输入需要咨询的就业问题')
    return
  }
  if (loading.value) return

  messages.value.push({
    id: buildId(),
    role: 'user',
    content: displayQuestion,
    time: getTime()
  })

  updateRecent(displayQuestion)
  inputValue.value = ''
  startLoading()
  await scrollToBottom()

  try {
    const payloadQuestion = buildPayloadQuestion(displayQuestion)
    const res = await askJobChat({
      question: payloadQuestion,
      limit: 8
    })

    messages.value.push({
      id: buildId(),
      role: 'assistant',
      content: formatAnswer(res),
      time: getTime(),
      result: res
    })
  } catch (error) {
    messages.value.push({
      id: buildId(),
      role: 'assistant',
      content:
        '当前就业咨询接口请求失败，请检查后端服务是否启动，以及 /api/common/job-chat/ask 接口是否已经添加。',
      time: getTime()
    })
  } finally {
    stopLoading()
    await scrollToBottom()
  }
}

const goToJobList = (job: NonNullable<JobChatResponse['relatedJobs']>[number]) => {
  const query: Record<string, string> = {}

  if (job?.id) query.jobId = String(job.id)
  if (job?.jobName) query.keyword = job.jobName
  if (job?.companyName) query.companyName = job.companyName
  if (job?.city) query.city = job.city
  if (job?.categoryMain) query.categoryMain = job.categoryMain

  router.push({
    path: '/toolbox/joblist',
    query
  })
}

const buildPayloadQuestion = (question: string) => {
  if (!attachments.value.length) return question

  const fileSummary = attachments.value
    .map((item) => {
      const snippet = item.textSnippet ? `\n文件内容摘要：${item.textSnippet}` : ''
      return `文件名：${item.name}${snippet}`
    })
    .join('\n')

  return `${question}\n\n用户上传的辅助材料如下，仅作为求职分析参考：\n${fileSummary}`
}

const formatAnswer = (res: JobChatResponse) => {
  const answer = res?.answer || '暂未生成回答。'
  const suggestions = res?.suggestions?.length
    ? `\n\n你还可以继续追问：\n${res.suggestions
        .map((item, index) => `${index + 1}. ${item}`)
        .join('\n')}`
    : ''
  return `${answer}${suggestions}`
}

const renderMessage = (content: string) => {
  const safeText = escapeHtml(content || '').trim()

  return (
    safeText
      // 兼容大模型常见 Markdown：**标题**、__标题__，避免页面直接显示星号
      .replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
      // 兼容少量 Markdown 标题
      .replace(/(^|\n)#{1,6}\s*([^\n]+)/g, '$1<strong>$2</strong>')
      // 兼容无序列表，统一渲染成自然的圆点，不显示 - / * 符号
      .replace(/(^|\n)\s*[-*]\s+/g, '$1<span class="md-bullet">•</span> ')
      // 兼容有序列表
      .replace(/(^|\n)(\d+)\.\s/g, '$1<strong>$2.</strong> ')
      // 兼容行内代码样式
      .replace(/`([^`]+?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br />')
  )
}

const escapeHtml = (text: string) => {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const startLoading = () => {
  loading.value = true
  loadingStep.value = 0
  window.clearInterval(loadingTimer)
  loadingTimer = window.setInterval(() => {
    loadingStep.value = Math.min(loadingStep.value + 1, loadingTexts.length - 1)
  }, 1200)
}

const stopLoading = () => {
  loading.value = false
  window.clearInterval(loadingTimer)
  loadingTimer = undefined
}

const clearChat = () => {
  if (loading.value) return
  messages.value = []
  inputValue.value = ''
  attachments.value = []
  nextTick(() => scrollToBottom())
}

const updateRecent = (title: string) => {
  const text = title.length > 16 ? `${title.slice(0, 16)}...` : title
  recentChats.value = [
    { id: buildId(), title: text, time: '刚刚', question: title },
    ...recentChats.value.filter((item) => item.title !== text)
  ].slice(0, 6)
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (!files.length) return

  const remain = Math.max(0, 3 - attachments.value.length)
  const selected = files.slice(0, remain)

  if (files.length > remain) {
    ElMessage.warning('最多只能添加 3 个辅助文件')
  }

  const items = await Promise.all(
    selected.map(async (file) => ({
      id: buildId(),
      name: file.name,
      sizeText: formatFileSize(file.size),
      ext: getFileExt(file.name),
      textSnippet: await readTextSnippet(file)
    }))
  )

  attachments.value.push(...items)
  target.value = ''
}

const readTextSnippet = (file: File) => {
  const ext = getFileExt(file.name).toLowerCase()
  if (!['txt', 'md'].includes(ext)) return Promise.resolve('')

  return new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
        .replace(/\s+/g, ' ')
        .trim()
      resolve(text.slice(0, 800))
    }
    reader.onerror = () => resolve('')
    reader.readAsText(file, 'utf-8')
  })
}

const removeAttachment = (id: string) => {
  attachments.value = attachments.value.filter((item) => item.id !== id)
}

const getFileExt = (name: string) => {
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE'
  return ext.length > 4 ? ext.slice(0, 4) : ext
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

const scrollToBottom = async () => {
  await nextTick()
  const el = chatBodyRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

const getTime = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const buildId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`
</script>

<style scoped lang="scss">
.career-chat-page {
  /* 页面在系统布局内自适应视口高度，避免整页滚动导致输入框被顶出可视区 */
  height: calc(100vh);
  min-height: 560px;
  padding: 8px;
  box-sizing: border-box;
  overflow: hidden;
  color: #1f2937;
  background: #f5f7fb;
}

.career-chat-shell {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 288px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.left-sidebar,
.right-panel {
  min-height: 0;
  background: #fbfcfe;
}

.left-sidebar {
  display: flex;
  flex-direction: column;
  padding: 22px 18px 18px;
  border-right: 1px solid #e5e7eb;
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
}

.brand-logo,
.assistant-avatar {
  display: grid;
  place-items: center;
  color: #ffffff;
  background: #2563eb;
  font-weight: 700;
}

.brand-logo {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  font-size: 16px;
}

.brand-info {
  min-width: 0;

  h2 {
    margin: 0;
    color: #111827;
    font-size: 19px;
    line-height: 1.25;
    font-weight: 700;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 13px;
  }
}

.sidebar-actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 42px;
  gap: 10px;
  margin-bottom: 18px;
}

.primary-new-btn,
.icon-only-btn,
.nav-item,
.recent-item,
.right-panel button,
.welcome-actions button,
.plain-tool,
.send-button,
.welcome-close,
.attachment-card button {
  border: 0;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.16s ease, border-color 0.16s ease, color 0.16s ease,
    box-shadow 0.16s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }
}

.primary-new-btn {
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 7px;
  color: #ffffff;
  background: #2563eb;
  font-size: 14px;
  font-weight: 700;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }
}

.icon-only-btn {
  height: 42px;
  display: grid;
  place-items: center;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  color: #475569;
  background: #ffffff;
  font-size: 18px;

  &:hover:not(:disabled) {
    color: #2563eb;
    border-color: #bfdbfe;
    background: #eff6ff;
  }
}

.nav-list {
  display: grid;
  gap: 6px;
  padding: 6px 0 18px;
  border-bottom: 1px solid #e5e7eb;
}

.nav-item {
  height: 42px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border-radius: 7px;
  color: #475569;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  text-align: left;

  .el-icon {
    font-size: 18px;
  }

  &:hover,
  &.active {
    color: #2563eb;
    background: #eff6ff;
  }
}

.recent-box {
  flex: 1;
  min-height: 0;
  padding-top: 18px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

.section-label {
  margin-bottom: 10px;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}

.recent-item {
  width: 100%;
  min-height: 54px;
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
  padding: 9px 10px;
  border-radius: 8px;
  color: #475569;
  background: transparent;
  text-align: left;

  .el-icon {
    color: #64748b;
  }

  span {
    min-width: 0;
  }

  strong,
  small {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  strong {
    color: #334155;
    font-size: 13px;
    font-weight: 700;
  }

  small {
    margin-top: 4px;
    color: #94a3b8;
    font-size: 12px;
  }

  &:hover:not(:disabled) {
    background: #f1f5f9;
  }

  &:first-of-type {
    background: #eff6ff;
  }
}

.user-card {
  display: grid;
  grid-template-columns: 38px minmax(0, 1fr) 18px;
  align-items: center;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
  cursor: pointer;
}

.user-avatar,
.user-avatar img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
}

.user-avatar {
  display: grid;
  place-items: center;
  color: #1f2937;
  background: #e5e7eb;
  font-weight: 700;
  overflow: hidden;

  img {
    object-fit: cover;
  }
}

.user-avatar.small {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;

  img {
    width: 36px;
    height: 36px;
  }
}

.user-meta {
  min-width: 0;

  strong,
  span {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  strong {
    color: #1f2937;
    font-size: 14px;
  }

  span {
    margin-top: 3px;
    color: #64748b;
    font-size: 12px;
  }
}

.chat-center {
  position: relative;
  min-width: 0;
  min-height: 0;
  display: grid;
  grid-template-rows: 70px minmax(0, 1fr) auto;
  overflow: hidden;
  background: #ffffff;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 22px;
  border-bottom: 1px solid #e5e7eb;

  h1 {
    margin: 0;
    color: #111827;
    font-size: 21px;
    line-height: 1.25;
    font-weight: 700;
  }

  p {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 5px 0 0;
    color: #64748b;
    font-size: 13px;

    span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
    }
  }
}

.header-tools {
  display: flex;
  align-items: center;
  gap: 8px;

  button {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 7px;
    color: #475569;
    background: transparent;
    cursor: pointer;

    &:hover {
      background: #f1f5f9;
    }
  }
}

.chat-scroll-area {
  min-height: 0;
  overflow-y: auto;
  padding: 20px 22px 24px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

.welcome-panel,
.message-list {
  // width: min(760px, 100%);
  margin: 0 auto;
}

.welcome-panel {
  position: relative;
  display: flex;
  gap: 18px;
  padding: 22px 22px 18px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.welcome-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  color: #94a3b8;
  background: transparent;

  &:hover {
    color: #475569;
    background: #f1f5f9;
  }
}

.assistant-avatar {
  width: 38px;
  height: 38px;
  flex: 0 0 38px;
  border-radius: 50%;
  font-size: 15px;
}

.assistant-avatar.large {
  width: 54px;
  height: 54px;
  flex: 0 0 54px;
  border-radius: 50%;
  font-size: 20px;
}

.welcome-copy {
  min-width: 0;

  h2 {
    margin: 0 34px 8px 0;
    color: #1f2937;
    font-size: 18px;
    line-height: 1.35;
    font-weight: 700;
  }

  p {
    max-width: 620px;
    margin: 0 0 18px;
    color: #475569;
    font-size: 14px;
    line-height: 1.8;
  }
}

.welcome-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  button {
    height: 36px;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 0 12px;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    color: #334155;
    background: #ffffff;
    font-size: 13px;
    font-weight: 600;

    .el-icon {
      color: #2563eb;
    }

    &:hover:not(:disabled) {
      border-color: #bfdbfe;
      background: #eff6ff;
    }
  }
}

.message-list {
  padding-bottom: 6px;
}

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.from-user {
  justify-content: flex-end;
}

.message-main {
  max-width: 72%;
  min-width: 0;
}

.user-message-main {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
  color: #94a3b8;
  font-size: 12px;

  strong {
    color: #475569;
    font-weight: 700;
  }
}

.user-name {
  justify-content: flex-end;
}

.assistant-bubble,
.user-bubble {
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.8;
  word-break: break-word;
}

.assistant-bubble {
  color: #334155;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.user-bubble {
  color: #1f2937;
  border: 1px solid #dbeafe;
  background: #eff6ff;
}

.message-text {
  :deep(b),
  b {
    font-weight: 700;
  }
}

.loading-bubble {
  display: flex;
  align-items: center;
  gap: 12px;

  strong {
    display: block;
    margin-bottom: 3px;
    color: #1f2937;
    font-size: 14px;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
  }
}

.typing-dots {
  display: inline-flex;
  gap: 4px;

  i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #2563eb;
    animation: dotPulse 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.16s;
    }

    &:nth-child(3) {
      animation-delay: 0.32s;
    }
  }
}

@keyframes dotPulse {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.data-summary-card {
  margin-top: 10px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.data-card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;

  strong {
    color: #1f2937;
    font-size: 14px;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 10px;

  div {
    padding: 9px;
    border: 1px solid #e5e7eb;
    border-radius: 7px;
    background: #ffffff;
  }

  b,
  span {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  b {
    color: #2563eb;
    font-size: 17px;
    line-height: 1.2;
  }

  span {
    margin-top: 4px;
    color: #64748b;
    font-size: 12px;
  }
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 10px;

  span {
    padding: 5px 9px;
    border-radius: 6px;
    color: #1d4ed8;
    background: #eff6ff;
    font-size: 12px;
    font-weight: 600;
  }
}

.job-result-list {
  display: grid;
  gap: 8px;
}

.job-result-item {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 7px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;
  font-family: inherit;

  strong {
    display: block;
    color: #1f2937;
    font-size: 13px;
  }

  p {
    margin: 5px 0 7px;
    color: #64748b;
    font-size: 12px;
  }

  .job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .job-tags span {
    padding: 3px 7px;
    border-radius: 6px;
    color: #64748b;
    background: #f1f5f9;
    font-size: 12px;
  }

  &:hover {
    .job-link-tip {
      color: #2563eb;
    }
  }
}

.job-result-main {
  min-width: 0;
}

.job-link-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  .el-icon {
    font-size: 14px;
  }
}

.chat-composer {
  /* 底部吸附效果：对话内容滚动时输入框始终停留在底部可见区域 */
  position: sticky;
  bottom: 0;
  z-index: 20;
  margin: 0 22px 18px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 9px;
  background: #ffffff;
  box-shadow: 0 -8px 18px rgba(15, 23, 42, 0.05);
}

.attachment-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.attachment-card {
  width: 230px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 9px;
  padding: 8px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #eff6ff;

  strong,
  span {
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  strong {
    color: #334155;
    font-size: 13px;
  }

  span {
    margin-top: 3px;
    color: #64748b;
    font-size: 12px;
  }

  button {
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 6px;
    color: #64748b;
    background: transparent;

    &:hover {
      color: #2563eb;
      background: #dbeafe;
    }
  }
}

.attachment-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  color: #ffffff;
  background: #2563eb;
  font-size: 10px;
  font-weight: 700;
}

.input-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) 44px;
  align-items: end;
  gap: 8px;
}

.plain-tool {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  margin-bottom: 2px;
  border-radius: 7px;
  color: #475569;
  background: transparent;
  font-size: 20px;

  &:hover {
    color: #2563eb;
    background: #eff6ff;
  }
}

.input-row :deep(.el-textarea__inner) {
  min-height: 40px !important;
  padding: 9px 0;
  border: 0;
  box-shadow: none;
  color: #1f2937;
  background: transparent;
  line-height: 1.6;
}

.input-row :deep(.el-textarea__inner::placeholder) {
  color: #aeb7c4;
}

.send-button {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #ffffff;
  background: #2563eb;

  .el-icon {
    font-size: 20px;
    transform: rotate(-18deg);
  }

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &.loading span {
    width: 17px;
    height: 17px;
    border: 2px solid rgba(255, 255, 255, 0.45);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: rotateCircle 0.8s linear infinite;
  }
}

@keyframes rotateCircle {
  to {
    transform: rotate(360deg);
  }
}

.composer-foot {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 6px;
  padding: 0 52px 0 44px;
  color: #94a3b8;
  font-size: 12px;
}

.hidden-file-input {
  display: none;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 18px;
  border-left: 1px solid #e5e7eb;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
}

.side-card {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.035);

  h3 {
    margin: 0 0 14px;
    color: #1f2937;
    font-size: 15px;
    font-weight: 700;
  }
}

.quick-card {
  button {
    width: 100%;
    height: 46px;
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) 18px;
    align-items: center;
    gap: 9px;
    padding: 0;
    border-bottom: 1px solid #f1f5f9;
    color: #475569;
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    text-align: left;

    .el-icon:first-child {
      color: #64748b;
      font-size: 18px;
    }

    .arrow {
      color: #94a3b8;
    }

    &:hover:not(:disabled) {
      color: #2563eb;
    }

    &:last-child {
      border-bottom: 0;
    }
  }
}

.side-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin-bottom: 12px;
  }

  .el-icon {
    color: #64748b;
  }
}

.plan-list {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

.plan-item {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  gap: 10px;

  i {
    width: 16px;
    height: 16px;
    margin-top: 2px;
    border: 2px solid #cbd5e1;
    border-radius: 50%;
    box-sizing: border-box;
  }

  strong,
  small {
    display: block;
  }

  strong {
    color: #334155;
    font-size: 13px;
    line-height: 1.45;
  }

  small {
    margin-top: 3px;
    color: #94a3b8;
    font-size: 12px;
  }

  &.finished i {
    border-color: #22c55e;
    background: #22c55e;
  }

  &.active i {
    border-color: #2563eb;
  }

  &.active small {
    color: #2563eb;
  }
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2563eb;
  background: transparent;
  font-size: 13px;
  font-weight: 700;
}

.tip-card {
  color: #475569;
  background: #f8fafc;

  .tip-icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    margin-bottom: 10px;
    border-radius: 8px;
    color: #2563eb;
    background: #eff6ff;
    font-size: 18px;
  }

  h3 {
    margin-bottom: 8px;
  }

  p {
    margin: 0;
    color: #475569;
    font-size: 13px;
    line-height: 1.8;
  }
}

@media screen and (max-width: 1440px) {
  .career-chat-shell {
    grid-template-columns: 260px minmax(0, 1fr) 260px;
  }

  .message-main {
    max-width: 78%;
  }
}

@media screen and (max-width: 1180px) {
  .career-chat-shell {
    grid-template-columns: 250px minmax(0, 1fr);
  }

  .right-panel {
    display: none;
  }
}

@media screen and (max-width: 900px) {
  .career-chat-page {
    height: calc(100vh - 76px);
    padding: 6px;
  }

  .career-chat-shell {
    grid-template-columns: 1fr;
  }

  .left-sidebar {
    display: none;
  }

  .chat-header {
    height: 64px;
    padding: 0 16px;
  }

  .chat-scroll-area {
    padding: 16px 14px;
  }

  .welcome-panel {
    flex-direction: column;
  }

  .message-main {
    max-width: calc(100% - 48px);
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chat-composer {
    bottom: 0;
    margin: 0 12px 12px;
  }

  .composer-foot {
    display: none;
  }
}

@media screen and (max-height: 760px) and (min-width: 901px) {
  .career-chat-page {
    height: calc(100vh - 78px);
    min-height: 520px;
  }

  .chat-center {
    grid-template-rows: 62px minmax(0, 1fr) auto;
  }

  .left-sidebar,
  .right-panel {
    padding-top: 16px;
  }

  .chat-scroll-area {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .welcome-panel {
    padding: 18px;
  }

  .chat-composer {
    margin-bottom: 12px;
    padding: 10px;
  }

  .composer-foot {
    display: none;
  }
}

/* ===== 页面舒适度与 Markdown 回复优化 ===== */
.career-chat-page {
  padding: 12px;
  background: var(--el-bg-color-page, #f5f7fa);
}

.career-chat-shell {
  border-color: var(--el-border-color-lighter, #ebeef5);
  border-radius: 6px;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.05);
}

.left-sidebar,
.right-panel {
  background: #fbfcff;
}

.brand-logo,
.assistant-avatar,
.attachment-icon {
  background: var(--el-color-primary, #409eff);
}

.primary-new-btn,
.send-button {
  background: var(--el-color-primary, #409eff);
}

.primary-new-btn:hover:not(:disabled),
.send-button:hover:not(:disabled) {
  background: var(--el-color-primary-light-3, #79bbff);
}

.nav-item,
.recent-item,
.quick-card button,
.welcome-actions button,
.icon-only-btn,
.plain-tool,
.header-tools button {
  transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease,
    transform 0.18s ease, box-shadow 0.18s ease;
}

.nav-item:hover,
.recent-item:hover:not(:disabled),
.quick-card button:hover:not(:disabled),
.welcome-actions button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.nav-item:hover,
.nav-item.active,
.recent-item:first-of-type,
.plain-tool:hover,
.header-tools button:hover {
  color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}

.welcome-panel {
  border-color: var(--el-border-color-lighter, #ebeef5);
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.04);
}

.welcome-actions button:hover:not(:disabled) {
  border-color: var(--el-color-primary-light-5, #a0cfff);
  color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.08);
}

.message-row {
  margin-bottom: 18px;
}

.assistant-bubble,
.user-bubble,
.data-summary-card,
.chat-composer,
.side-card {
  border-color: var(--el-border-color-lighter, #ebeef5);
}

.assistant-bubble {
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.04);
}

.user-bubble {
  color: var(--el-color-primary-dark-2, #337ecc);
  border-color: var(--el-color-primary-light-7, #c6e2ff);
  background: var(--el-color-primary-light-9, #ecf5ff);
}

.message-text {
  color: inherit;
  line-height: 1.9;
}

.message-text :deep(strong),
.message-text strong {
  color: var(--el-text-color-primary, #303133);
  font-weight: 700;
}

.message-text :deep(code),
.message-text code {
  display: inline-block;
  padding: 0 5px;
  border-radius: 4px;
  color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary-light-9, #ecf5ff);
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
}

.message-text :deep(.md-bullet),
.message-text .md-bullet {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  color: var(--el-color-primary, #409eff);
  font-weight: 700;
}

.data-summary-card {
  background: #fbfcff;
}

.metric-grid div,
.job-result-item {
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.metric-grid div:hover,
.job-result-item:hover {
  transform: translateY(-1px);
  border-color: var(--el-color-primary-light-7, #c6e2ff);
  box-shadow: 0 6px 16px rgba(31, 45, 61, 0.05);
}

.metric-grid b,
.skill-list span,
.text-link,
.tip-card .tip-icon,
.welcome-actions button .el-icon,
.attachment-card button:hover,
.quick-card button:hover:not(:disabled),
.plan-item.active small {
  color: var(--el-color-primary, #409eff);
}

.skill-list span {
  background: var(--el-color-primary-light-9, #ecf5ff);
}

.chat-composer {
  margin: 0 22px 16px;
  box-shadow: 0 -6px 18px rgba(31, 45, 61, 0.04);
}

.input-row {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 6px;
  padding: 6px 8px;
  background: #ffffff;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.input-row:focus-within {
  border-color: var(--el-color-primary-light-5, #a0cfff);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.08);
}

.plain-tool {
  margin-bottom: 0;
}

.send-button {
  width: 36px;
  height: 36px;
  border-radius: 6px;
}

.right-panel {
  gap: 14px;
}

.side-card {
  border-radius: 6px;
  box-shadow: 0 6px 18px rgba(31, 45, 61, 0.035);
}

.tip-card {
  background: #fbfcff;
}

@media screen and (max-width: 900px) {
  .career-chat-page {
    padding: 8px;
  }

  .chat-composer {
    margin: 0 12px 12px;
  }
}
</style>

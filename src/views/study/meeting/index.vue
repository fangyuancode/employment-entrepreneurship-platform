<template>
  <div class="meeting-page">
    <div class="page-header card">
      <div class="header-left">
        <h2>AI会议纪要 / 任务拆解助手</h2>
        <p>
          支持粘贴会议内容或上传文本文件，自动生成会议总结、关键决策、待办事项、责任人、截止时间与风险提醒，适合项目协作、创业团队周会、产品评审会与任务推进会。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="fillDemo">一键填充示例</el-button>
        <el-button :disabled="!result.summary" @click="openEmailDialog">发送邮件</el-button>
        <el-button type="primary" :loading="loading" @click="handleAnalyze">生成会议纪要</el-button>
      </div>
    </div>

    <div class="content-layout">
      <div class="card input-card">
        <div class="section-title">会议信息输入</div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="项目名称" prop="projectName">
                <el-input v-model="form.projectName" placeholder="请输入项目名称" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="会议标题" prop="meetingTitle">
                <el-input v-model="form.meetingTitle" placeholder="请输入会议标题" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="会议类型" prop="meetingType">
                <el-select v-model="form.meetingType" placeholder="请选择会议类型" style="width: 100%">
                  <el-option label="项目推进会" value="项目推进会" />
                  <el-option label="产品评审会" value="产品评审会" />
                  <el-option label="周例会" value="周例会" />
                  <el-option label="需求讨论会" value="需求讨论会" />
                  <el-option label="创业复盘会" value="创业复盘会" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="输出风格">
                <el-select v-model="form.outputStyle" style="width: 100%">
                  <el-option label="结构化汇总" value="结构化汇总" />
                  <el-option label="简洁纪要" value="简洁纪要" />
                  <el-option label="行动导向" value="行动导向" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="参会人提示（可选）">
                <el-select v-model="form.attendeeHints" multiple filterable allow-create default-first-option placeholder="可手动输入参会人" style="width: 100%" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="上传会议文本（支持 txt / md）">
                <el-upload class="upload-block" :auto-upload="false" :show-file-list="true" :limit="1" accept=".txt,.md" :on-change="handleFileChange">
                  <el-button>选择文件</el-button>
                  <template #tip>
                    <div class="upload-tip">
                      当前版本优先支持 txt / md 文本文件，上传后会自动读取并填充到会议内容中。
                    </div>
                  </template>
                </el-upload>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="会议内容" prop="meetingContent">
                <el-input v-model="form.meetingContent" type="textarea" :rows="14" resize="vertical" placeholder="请输入或上传会议内容" />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-footer">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" :loading="loading" @click="handleAnalyze">生成会议纪要</el-button>
          </div>
        </el-form>
      </div>

      <div v-loading="loading" :element-loading-text="loadingText" element-loading-background="rgba(255,255,255,0.72)" class="result-area">
        <div class="overview-grid">
          <div class="card overview-card">
            <div class="metric-label">关键决策</div>
            <div class="metric-value">{{ result.keyDecisions.length }}</div>
          </div>
          <div class="card overview-card">
            <div class="metric-label">待办事项</div>
            <div class="metric-value">{{ result.actionItems.length }}</div>
          </div>
          <div class="card overview-card">
            <div class="metric-label">风险提醒</div>
            <div class="metric-value">{{ result.riskWarnings.length }}</div>
          </div>
          <div class="card overview-card">
            <div class="metric-label">参会人员</div>
            <div class="metric-value">{{ result.attendeeList.length }}</div>
          </div>
        </div>

        <div class="card block-card">
          <div class="section-head">
            <div class="section-title">会议总结</div>
          </div>

          <div v-if="!result.summary && !loading" class="empty-wrap">
            <el-empty description="填写左侧内容后，点击“生成会议纪要”查看结果" />
          </div>

          <div v-if="result.summary" class="summary-box">
            {{ result.summary }}
          </div>
        </div>

        <div class="double-grid">
          <div class="card block-card">
            <div class="section-head">
              <div class="section-title">参会人员</div>
            </div>
            <div class="tag-wrap">
              <el-tag v-for="item in result.attendeeList" :key="item" effect="plain" round>
                {{ item }}
              </el-tag>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-head">
              <div class="section-title">关键决策</div>
            </div>
            <div class="info-list">
              <div v-for="(item, index) in result.keyDecisions" :key="index" class="info-item">
                {{ index + 1 }}. {{ item }}
              </div>
            </div>
          </div>
        </div>

        <div class="card block-card">
          <div class="section-head">
            <div class="section-title">待办事项拆解</div>
          </div>

          <el-table :data="result.actionItems" stripe border>
            <el-table-column prop="taskName" label="任务事项" min-width="220" />
            <el-table-column prop="owner" label="责任人" width="120" />
            <el-table-column prop="dueDate" label="截止时间" width="140" />
            <el-table-column prop="priority" label="优先级" width="100" />
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column prop="note" label="备注" min-width="220" show-overflow-tooltip />
          </el-table>
        </div>

        <div class="double-grid">
          <div class="card block-card">
            <div class="section-head">
              <div class="section-title">风险提醒</div>
            </div>
            <div class="info-list risk-list">
              <div v-for="(item, index) in result.riskWarnings" :key="index" class="info-item risk-item">
                {{ index + 1 }}. {{ item }}
              </div>
            </div>
          </div>

          <div class="card block-card">
            <div class="section-head">
              <div class="section-title">后续建议</div>
            </div>
            <div class="info-list">
              <div v-for="(item, index) in result.followUpSuggestions" :key="index" class="info-item">
                {{ index + 1 }}. {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <el-dialog v-model="emailDialogVisible" title="发送会议纪要邮件" width="520px">
      <el-form label-position="top">
        <el-form-item label="邮件主题">
          <el-input v-model="emailForm.subject" placeholder="请输入邮件主题" />
        </el-form-item>

        <el-form-item label="收件人（仅支持 QQ 邮箱）">
          <el-select v-model="emailForm.recipientEmails" multiple filterable allow-create default-first-option placeholder="请输入或选择 QQ 邮箱" style="width: 100%">
            <el-option v-for="item in presetRecipients" :key="item.email" :label="`${item.name}（${item.email}）`" :value="item.email" />
          </el-select>
        </el-form-item>

        <div class="mail-tip"> 当前发送通道为 QQ 邮箱 SMTP，收件人需使用 QQ 邮箱地址。 </div>
      </el-form>

      <template #footer>
        <el-button @click="emailDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="emailSending" @click="handleSendEmail">
          确认发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  analyzeMeetingMinutes,
  getMeetingDemo,
  sendMeetingMinutesEmail,
  type MeetingMinutesForm,
  type MeetingMinutesResult
} from '@/api/meeting-minutes'
import { ElMessage, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import {
  cloneAiCachePayload,
  getAiDemoCache,
  isSameAiPayload,
  setAiDemoCache,
  waitAiCacheDelay
} from '@/utils/ai-demo-cache'
import { reactive, ref } from 'vue'
// import {
//   analyzeMeetingMinutes,
//   getMeetingDemo,
//   type MeetingMinutesForm,
//   type MeetingMinutesResult
// } from '@/api/meeting-minutes'

const formRef = ref<FormInstance>()
const loading = ref(false)
const demoFormSnapshot = ref<MeetingMinutesForm | null>(null)
const loadingText = ref('正在分析会议内容并拆解任务...')
const emailDialogVisible = ref(false)
const emailSending = ref(false)

const presetRecipients = ref([
  { name: '张晨', email: '3258552734@qq.com' },
  { name: '李悦', email: 'liyue@qq.com' },
  { name: '王磊', email: 'wanglei@qq.com' }
])

const emailForm = reactive({
  subject: '',
  recipientEmails: [] as string[]
})
const form = reactive<MeetingMinutesForm>({
  projectName: 'AI创业助手',
  meetingTitle: '项目周例会',
  meetingType: '项目推进会',
  meetingContent: '',
  attendeeHints: [],
  outputStyle: '结构化汇总'
})

const result = reactive<MeetingMinutesResult>({
  projectName: '',
  meetingTitle: '',
  meetingType: '',
  summary: '',
  attendeeList: [],
  keyDecisions: [],
  actionItems: [],
  riskWarnings: [],
  followUpSuggestions: []
})

const rules: FormRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  meetingTitle: [{ required: true, message: '请输入会议标题', trigger: 'blur' }],
  meetingType: [{ required: true, message: '请选择会议类型', trigger: 'change' }],
  meetingContent: [{ required: true, message: '请输入会议内容', trigger: 'blur' }]
}

function resetResult() {
  result.projectName = ''
  result.meetingTitle = ''
  result.meetingType = ''
  result.summary = ''
  result.attendeeList = []
  result.keyDecisions = []
  result.actionItems = []
  result.riskWarnings = []
  result.followUpSuggestions = []
}

function handleReset() {
  form.projectName = 'AI创业助手'
  form.meetingTitle = '项目周例会'
  form.meetingType = '项目推进会'
  form.meetingContent = ''
  form.attendeeHints = []
  form.outputStyle = '结构化汇总'
  resetResult()
  demoFormSnapshot.value = null
}

async function fillDemo() {
  try {
    const data = await getMeetingDemo()
    form.meetingTitle = data.meetingTitle
    form.meetingType = data.meetingType
    form.meetingContent = data.meetingContent
    demoFormSnapshot.value = cloneAiCachePayload(form)
    ElMessage.success('示例数据已填充，首次生成后会自动缓存结果')
  } catch (error) {
    console.error(error)
  }
}

async function handleAnalyze() {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const payload = cloneAiCachePayload(form)
  const isDemoRequest = demoFormSnapshot.value
    ? isSameAiPayload(payload, demoFormSnapshot.value)
    : false
  const cachedData = isDemoRequest
    ? getAiDemoCache<MeetingMinutesResult>('meeting-minutes.analyze', payload)
    : null

  loading.value = true

  if (cachedData) {
    try {
      loadingText.value = '检测到示例数据已有本地缓存，3秒后直接展示会议纪要...'
      await waitAiCacheDelay()
      result.projectName = cachedData.projectName || ''
      result.meetingTitle = cachedData.meetingTitle || ''
      result.meetingType = cachedData.meetingType || ''
      result.summary = cachedData.summary || ''
      result.attendeeList = cachedData.attendeeList || []
      result.keyDecisions = cachedData.keyDecisions || []
      result.actionItems = cachedData.actionItems || []
      result.riskWarnings = cachedData.riskWarnings || []
      result.followUpSuggestions = cachedData.followUpSuggestions || []
      ElMessage.success('已加载示例本地缓存结果')
    } finally {
      loading.value = false
      loadingText.value = '正在分析会议内容并拆解任务...'
    }
    return
  }

  const loadingTexts = [
    '正在分析会议内容...',
    '正在提炼会议总结...',
    '正在拆解待办事项...',
    '正在识别责任人与截止时间...',
    '正在整理风险提醒...'
  ]
  let idx = 0
  const timer = window.setInterval(() => {
    loadingText.value = loadingTexts[idx % loadingTexts.length]
    idx++
  }, 900)

  try {
    const data = await analyzeMeetingMinutes(payload)

    result.projectName = data.projectName || ''
    result.meetingTitle = data.meetingTitle || ''
    result.meetingType = data.meetingType || ''
    result.summary = data.summary || ''
    result.attendeeList = data.attendeeList || []
    result.keyDecisions = data.keyDecisions || []
    result.actionItems = data.actionItems || []
    result.riskWarnings = data.riskWarnings || []
    result.followUpSuggestions = data.followUpSuggestions || []

    if (isDemoRequest) {
      setAiDemoCache('meeting-minutes.analyze', payload, cloneAiCachePayload(result))
    }

    ElMessage.success(isDemoRequest ? '会议纪要生成成功，示例结果已缓存' : '会议纪要生成成功')
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || '会议纪要生成失败')
  } finally {
    loading.value = false
    window.clearInterval(timer)
    loadingText.value = '正在分析会议内容并拆解任务...'
  }
}

async function handleFileChange(uploadFile: UploadFile) {
  const rawFile = uploadFile.raw
  if (!rawFile) return

  const fileName = rawFile.name.toLowerCase()
  if (!fileName.endsWith('.txt') && !fileName.endsWith('.md')) {
    ElMessage.warning('当前仅支持 txt / md 文件')
    return
  }

  try {
    const text = await rawFile.text()
    form.meetingContent = text
    demoFormSnapshot.value = null
    ElMessage.success('文件内容已读取')
  } catch (error) {
    console.error(error)
    ElMessage.error('文件读取失败')
  }
}
function openEmailDialog() {
  if (!result.summary) {
    ElMessage.warning('请先生成会议纪要')
    return
  }

  emailForm.subject = `${result.meetingTitle || form.meetingTitle} - 会议纪要`
  emailForm.recipientEmails = []
  emailDialogVisible.value = true
}

function isValidQqEmail(email: string) {
  return /^[a-zA-Z0-9_.-]+@qq\.com$/i.test(email)
}

async function handleSendEmail() {
  if (!result.summary) {
    ElMessage.warning('暂无可发送的会议纪要内容')
    return
  }

  if (!emailForm.subject.trim()) {
    ElMessage.warning('请输入邮件主题')
    return
  }

  if (!emailForm.recipientEmails.length) {
    ElMessage.warning('请选择至少一个收件人')
    return
  }

  const invalidEmail = emailForm.recipientEmails.find((item) => !isValidQqEmail(item))
  if (invalidEmail) {
    ElMessage.warning(`仅支持 QQ 邮箱，当前无效地址：${invalidEmail}`)
    return
  }

  try {
    emailSending.value = true
    await sendMeetingMinutesEmail({
      subject: emailForm.subject,
      recipientEmails: emailForm.recipientEmails,
      meetingData: { ...result }
    })
    ElMessage.success('会议纪要邮件发送成功')
    emailDialogVisible.value = false
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || '邮件发送失败')
  } finally {
    emailSending.value = false
  }
}
</script>

<style scoped lang="scss">
.meeting-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 6px;
}

.card {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.page-header,
.input-card,
.block-card,
.overview-card {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.header-left {
  flex: 1;

  h2 {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
  }

  p {
    margin: 0;
    line-height: 1.8;
    color: #6b7280;
    font-size: 14px;
    max-width: 900px;
  }
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.content-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 16px;
  align-items: start;
}

.section-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-tip {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
  line-height: 1.6;
}

.result-area {
  display: flex;
  flex-direction: column;
  width: calc(100vw - 720px);
  gap: 16px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.metric-label {
  color: #6b7280;
  font-size: 13px;
}

.metric-value {
  margin-top: 10px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.summary-box {
  padding: 14px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  line-height: 1.9;
  color: #374151;
}

.double-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.tag-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  line-height: 1.75;
  color: #374151;
  font-size: 14px;
}

.risk-item {
  background: #fff7ed;
  border-color: #fed7aa;
}

.empty-wrap {
  padding: 20px 0;
}

:deep(.el-table) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-textarea__inner) {
  min-height: 280px !important;
}

@media (max-width: 1280px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .overview-grid,
  .double-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .meeting-page {
    padding: 0;
  }

  .page-header {
    flex-direction: column;
  }

  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.mail-tip {
  padding: 10px 12px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
}
</style>

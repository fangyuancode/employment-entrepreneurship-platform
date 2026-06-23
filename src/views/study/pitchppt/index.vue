<template>
  <div class="pitch-page">
    <div class="page-header">
      <div class="header-left">
        <h2>路演 PPT 助手</h2>
        <p>
          输入项目基础信息，自动生成路演 PPT 结构、每页内容、演讲备注、答辩问题和展示配图；
          在生成文案后，还可以继续生成真实 PPT 文件，支持在线预览和下载。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="fillDemo">一键填充示例</el-button>
        <el-button type="primary" :loading="loading" @click="handleGenerate">
          生成路演 PPT 文案
        </el-button>
        <el-button type="success" :loading="buildingFile" :disabled="!result.projectName || !result.slideList?.length" @click="handleBuildPptFile">
          生成 PPT 文件
        </el-button>
      </div>
    </div>

    <div class="page-body">
      <div class="form-panel card">
        <div class="card-title">项目输入信息</div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="项目名称" prop="projectName">
                <el-input v-model="form.projectName" placeholder="请输入项目名称" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="行业赛道" prop="industry">
                <el-select v-model="form.industry" placeholder="请选择行业赛道" style="width: 100%">
                  <el-option label="AI 创业助手" value="AI 创业助手" />
                  <el-option label="智慧教育" value="智慧教育" />
                  <el-option label="文化创意" value="文化创意" />
                  <el-option label="数字营销" value="数字营销" />
                  <el-option label="校园服务" value="校园服务" />
                  <el-option label="企业服务 SaaS" value="企业服务 SaaS" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="目标用户" prop="targetUsers">
                <el-input v-model="form.targetUsers" type="textarea" :rows="3" placeholder="请输入目标用户群体，例如：大学生创业团队、独立开发者、比赛参赛者" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心痛点" prop="coreProblem">
                <el-input v-model="form.coreProblem" type="textarea" :rows="3" placeholder="请输入用户或行业当前存在的主要问题" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="解决方案" prop="solution">
                <el-input v-model="form.solution" type="textarea" :rows="4" placeholder="请输入你的项目方案、产品能力和服务模式" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="商业模式" prop="businessModel">
                <el-input v-model="form.businessModel" type="textarea" :rows="3" placeholder="如：会员订阅、企业服务、按次收费、联合运营" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心竞争优势" prop="competitiveAdvantage">
                <el-input v-model="form.competitiveAdvantage" type="textarea" :rows="3" placeholder="请输入项目相较于竞品和传统方案的优势" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="团队信息" prop="teamInfo">
                <el-input v-model="form.teamInfo" placeholder="如：前端2人、后端1人、AI工程师1人" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="项目阶段" prop="stage">
                <el-select v-model="form.stage" placeholder="请选择项目阶段" style="width: 100%">
                  <el-option label="创意阶段" value="创意阶段" />
                  <el-option label="MVP 验证期" value="MVP 验证期" />
                  <el-option label="种子期" value="种子期" />
                  <el-option label="初步运营期" value="初步运营期" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="输出风格" prop="style">
                <el-select v-model="form.style" placeholder="请选择输出风格" style="width: 100%">
                  <el-option label="比赛答辩型" value="比赛答辩型" />
                  <el-option label="投资路演型" value="投资路演型" />
                  <el-option label="简洁专业型" value="简洁专业型" />
                  <el-option label="创新展示型" value="创新展示型" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-footer">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" :loading="loading" @click="handleGenerate">
              生成路演 PPT 文案
            </el-button>
            <el-button type="success" plain :loading="buildingFile" :disabled="!result.projectName || !result.slideList?.length" @click="handleBuildPptFile">
              生成 PPT 文件
            </el-button>
          </div>
        </el-form>
      </div>

      <div class="result-panel card">
        <div class="card-title">生成结果</div>

        <div v-if="!result.projectName && !loading && !buildingFile" class="ai-state-card ai-state-empty">
          <!-- <div class="ai-state-icon">AI</div>
          <div class="ai-state-title">等待生成路演 PPT</div> -->
          <div class="ai-state-desc">填写左侧项目信息后，点击「生成路演 PPT 文案」，系统会生成页面大纲、演讲备注、答辩问题和展示配图。</div>
          <div class="ai-state-tips">
            <span>PPT 大纲</span>
            <span>演讲备注</span>
            <span>文件预览</span>
          </div>
        </div>

        <div v-else-if="loading || buildingFile" class="ai-state-card ai-loading-state">
          <div class="ai-loading-ring"></div>
          <div class="ai-state-title">{{ loading ? '正在生成路演 PPT 文案' : '正在生成 PPT 文件' }}</div>
          <div class="ai-state-desc">{{ loading ? loadingText : buildingText }}</div>
          <div class="ai-loading-progress"><span></span></div>
          <div class="ai-loading-steps">
            <span>梳理结构</span>
            <span>生成页面</span>
            <span>组织讲稿</span>
            <span>准备预览</span>
          </div>
        </div>

        <template v-else-if="result.projectName">
          <div class="result-top">
            <h3>{{ result.projectName }}</h3>
            <p>{{ result.pptSummary }}</p>
          </div>

          <div class="result-vertical">
            <div class="result-section">
              <div class="section-title">PPT 总体说明</div>
              <div class="section-content pre-wrap">{{ result.pptSummary }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">开场话术</div>
              <div class="section-content pre-wrap">{{ result.openingScript }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">结尾话术</div>
              <div class="section-content pre-wrap">{{ result.closingScript }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">答辩高频问题建议</div>
              <div class="section-content pre-wrap">{{ result.qaSuggestions }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">视觉风格建议</div>
              <div class="section-content pre-wrap">{{ result.designStyleSuggestion }}</div>
            </div>

            <div class="result-section" v-if="result.slideList?.length">
              <div class="section-title">PPT 页面结构（共 {{ result.totalPages }} 页）</div>

              <div class="slide-list">
                <div v-for="slide in result.slideList" :key="slide.pageNumber" class="slide-card">
                  <div class="slide-header">
                    <span class="slide-page">第 {{ slide.pageNumber }} 页</span>
                    <span class="slide-title">{{ slide.title }}</span>
                  </div>

                  <div class="slide-block">
                    <div class="block-label">核心内容</div>
                    <div class="section-content pre-wrap">{{ slide.corePoints }}</div>
                  </div>

                  <div class="slide-block">
                    <div class="block-label">视觉建议</div>
                    <div class="section-content pre-wrap">{{ slide.visualSuggestion }}</div>
                  </div>

                  <div class="slide-block">
                    <div class="block-label">演讲备注</div>
                    <div class="section-content pre-wrap">{{ slide.speakingNotes }}</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.coverScene">
              <div class="section-title">封面主视觉图</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.coverScene)" alt="封面主视觉图" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.solutionScene">
              <div class="section-title">方案展示图</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.solutionScene)" alt="方案展示图" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.marketScene">
              <div class="section-title">市场场景图</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.marketScene)" alt="市场场景图" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.teamScene">
              <div class="section-title">团队展示图</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.teamScene)" alt="团队展示图" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.imagePrompts?.length">
              <div class="section-title">图片提示词</div>
              <div class="prompt-list">
                <div v-for="(prompt, index) in result.imagePrompts" :key="index" class="prompt-item">
                  <div class="prompt-index">提示词 {{ index + 1 }}</div>
                  <div class="section-content pre-wrap">{{ prompt }}</div>
                </div>
              </div>
            </div>

            <div class="result-section" v-if="pptFile.fileId">
              <div class="section-title">PPT 文件输出</div>

              <div class="file-header">
                <div class="file-info">
                  <div class="file-name">{{ pptFile.fileName || '已生成 PPT 文件' }}</div>
                  <div class="file-tip">支持在线预览，也可以直接下载到本地</div>
                </div>

                <div class="file-actions">
                  <a class="download-link" :href="getFullDownloadUrl(pptFile.downloadUrl)" target="_blank" rel="noopener noreferrer">
                    下载 PPT 文件
                  </a>
                </div>
              </div>

              <div class="preview-grid" v-if="pptFile.previewImages?.length">
                <div v-for="(img, index) in pptFile.previewImages" :key="`${img}-${index}`" class="preview-card">
                  <div class="preview-index">第 {{ index + 1 }} 页</div>
                  <img :src="getPreviewUrl(img)" :alt="`slide-${index + 1}`" />
                </div>
              </div>

              <div v-else class="empty-preview">
                <el-empty description="当前暂无预览图" />
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  cloneAiCachePayload,
  getAiDemoCache,
  isSameAiPayload,
  setAiDemoCache,
  waitAiCacheDelay
} from '@/utils/ai-demo-cache'
import {
  buildPitchPptFile,
  buildPitchPptResourceUrl,
  generatePitchPpt,
  previewPitchPptImage,
  type PitchPptBuildRequest,
  type PitchPptFileResponse,
  type PitchPptForm,
  type PitchPptResult
} from '@/api/pitch-ppt'

defineOptions({ name: 'PitchPpt' })

const formRef = ref<FormInstance>()
const demoFormSnapshot = ref<PitchPptForm | null>(null)
const loading = ref(false)
const buildingFile = ref(false)
const loadingText = ref('正在生成路演 PPT 结构...')
const buildingText = ref('正在生成 PPT 文件...')

const form = reactive<PitchPptForm>({
  projectName: '',
  industry: '',
  targetUsers: '',
  coreProblem: '',
  solution: '',
  businessModel: '',
  competitiveAdvantage: '',
  teamInfo: '',
  stage: '',
  style: ''
})

const createEmptyResult = (): PitchPptResult => ({
  projectName: '',
  totalPages: 0,
  pptSummary: '',
  openingScript: '',
  closingScript: '',
  qaSuggestions: '',
  designStyleSuggestion: '',
  slideList: [],
  imagePrompts: [],
  imageUrls: [],
  sceneImageMap: {}
})

const createEmptyPptFile = (): PitchPptFileResponse => ({
  fileId: '',
  fileName: '',
  downloadUrl: '',
  previewImages: []
})

const result = reactive<PitchPptResult>(createEmptyResult())
const pptFile = reactive<PitchPptFileResponse>(createEmptyPptFile())

const rules: FormRules<PitchPptForm> = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择行业赛道', trigger: 'change' }],
  targetUsers: [{ required: true, message: '请输入目标用户', trigger: 'blur' }],
  coreProblem: [{ required: true, message: '请输入核心痛点', trigger: 'blur' }],
  solution: [{ required: true, message: '请输入解决方案', trigger: 'blur' }],
  businessModel: [{ required: true, message: '请输入商业模式', trigger: 'blur' }],
  competitiveAdvantage: [{ required: true, message: '请输入核心竞争优势', trigger: 'blur' }],
  stage: [{ required: true, message: '请选择项目阶段', trigger: 'change' }],
  style: [{ required: true, message: '请选择输出风格', trigger: 'change' }]
}

function assignResult(data: PitchPptResult) {
  Object.assign(result, createEmptyResult(), data || {})
}

function assignPptFile(data?: PitchPptFileResponse) {
  Object.assign(pptFile, createEmptyPptFile(), data || {})
}

function fillDemo() {
  Object.assign(form, {
    projectName: '智创 AI 创业助手',
    industry: 'AI 创业助手',
    targetUsers: '大学生创业团队、独立开发者、比赛参赛者、初创项目负责人',
    coreProblem:
      '很多创业团队缺乏从想法到项目包装的完整能力，商业计划、品牌表达、产品设计和路演材料准备效率低。',
    solution:
      '通过 创业就业数字化平台，为用户提供商业计划书生成、品牌文案生成、产品设计助手、路演 PPT 助手、图片生成等一体化能力。',
    businessModel: '基础功能免费，高级生成会员订阅，比赛指导服务与企业定制服务收费。',
    competitiveAdvantage:
      '功能链条完整、适合比赛展示、生成速度快、可视化表达强、面向创业场景更聚焦。',
    teamInfo: '前端2人、后端1人、AI工程师1人、产品策划1人',
    stage: 'MVP 验证期',
    style: '比赛答辩型'
  })
  demoFormSnapshot.value = cloneAiCachePayload(form)
  ElMessage.success('示例数据已填充，首次生成后会自动缓存结果')
}

function handleReset() {
  Object.assign(form, {
    projectName: '',
    industry: '',
    targetUsers: '',
    coreProblem: '',
    solution: '',
    businessModel: '',
    competitiveAdvantage: '',
    teamInfo: '',
    stage: '',
    style: ''
  })
  assignResult(createEmptyResult())
  assignPptFile()
  demoFormSnapshot.value = null
}

function getPreviewImage(url?: string) {
  if (!url) return ''
  return previewPitchPptImage(url)
}

function getFullDownloadUrl(url?: string) {
  if (!url) return ''
  return buildPitchPptResourceUrl(url)
}

function getPreviewUrl(url?: string) {
  if (!url) return ''
  return buildPitchPptResourceUrl(url)
}

async function handleGenerate() {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  const payload = cloneAiCachePayload(form)
  const isDemoRequest = demoFormSnapshot.value
    ? isSameAiPayload(payload, demoFormSnapshot.value)
    : false
  const cachedData = isDemoRequest
    ? getAiDemoCache<PitchPptResult>('pitch-ppt.generate', payload)
    : null

  loading.value = true
  assignPptFile()

  if (cachedData) {
    try {
      loadingText.value = '检测到示例数据已有本地缓存，3秒后直接展示 PPT 文案...'
      await waitAiCacheDelay()
      assignResult(cachedData)
      ElMessage.success('已加载示例本地缓存结果')
    } finally {
      loading.value = false
      loadingText.value = '正在生成路演 PPT 结构...'
    }
    return
  }

  const loadingSteps = [
    '正在分析项目内容...',
    '正在生成 PPT 页面结构...',
    '正在编写每页核心内容...',
    '正在生成演讲备注与答辩问题...',
    '正在生成路演配图...'
  ]

  let timer: ReturnType<typeof setInterval> | null = null
  let index = 0

  try {
    loadingText.value = loadingSteps[0]
    timer = setInterval(() => {
      index = (index + 1) % loadingSteps.length
      loadingText.value = loadingSteps[index]
    }, 1800)

    const data = await generatePitchPpt(payload)

    if (!data) {
      ElMessage.error('生成失败')
      return
    }

    assignResult(data)

    if (isDemoRequest) {
      setAiDemoCache('pitch-ppt.generate', payload, cloneAiCachePayload(result))
    }

    ElMessage.success(
      isDemoRequest ? '路演 PPT 文案生成成功，示例结果已缓存' : '路演 PPT 文案生成成功'
    )
  } catch (error: any) {
    ElMessage.error(error?.message || '生成失败，请稍后重试')
  } finally {
    loading.value = false
    if (timer) clearInterval(timer)
    loadingText.value = '正在生成路演 PPT 结构...'
  }
}

async function handleBuildPptFile() {
  if (!result.projectName || !result.slideList?.length) {
    ElMessage.warning('请先生成 PPT 文案')
    return
  }

  const payload: PitchPptBuildRequest = cloneAiCachePayload({
    projectName: result.projectName,
    pptSummary: result.pptSummary,
    openingScript: result.openingScript,
    closingScript: result.closingScript,
    qaSuggestions: result.qaSuggestions,
    designStyleSuggestion: result.designStyleSuggestion,
    slideList: result.slideList
  })
  const isDemoRequest = demoFormSnapshot.value
    ? isSameAiPayload(cloneAiCachePayload(form), demoFormSnapshot.value)
    : false
  const cachedData = isDemoRequest
    ? getAiDemoCache<PitchPptFileResponse>('pitch-ppt.build-file', payload)
    : null

  buildingFile.value = true

  if (cachedData) {
    try {
      buildingText.value = '检测到示例 PPT 文件已有本地缓存，3秒后直接展示...'
      await waitAiCacheDelay()
      assignPptFile(cachedData)
      ElMessage.success('已加载示例 PPT 文件缓存')
    } finally {
      buildingFile.value = false
      buildingText.value = '正在生成 PPT 文件...'
    }
    return
  }

  const buildingSteps = [
    '正在整理 PPT 页面内容...',
    '正在调用 Kimi 优化 PPT 结构...',
    '正在生成真实 PPT 文件...',
    '正在生成在线预览图片...',
    '正在整理下载链接...'
  ]

  let timer: ReturnType<typeof setInterval> | null = null
  let index = 0

  try {
    buildingText.value = buildingSteps[0]
    timer = setInterval(() => {
      index = (index + 1) % buildingSteps.length
      buildingText.value = buildingSteps[index]
    }, 1800)

    const data = await buildPitchPptFile(payload)

    if (!data) {
      ElMessage.error('PPT 文件生成失败')
      return
    }

    assignPptFile(data)

    if (isDemoRequest) {
      setAiDemoCache('pitch-ppt.build-file', payload, cloneAiCachePayload(pptFile))
    }

    ElMessage.success(isDemoRequest ? 'PPT 文件生成成功，示例结果已缓存' : 'PPT 文件生成成功')
  } catch (error: any) {
    ElMessage.error(error?.message || 'PPT 文件生成失败')
  } finally {
    buildingFile.value = false
    if (timer) clearInterval(timer)
    buildingText.value = '正在生成 PPT 文件...'
  }
}
</script>

<style scoped>
.pitch-page,
.pitch-page * {
  box-sizing: border-box;
}

.pitch-page {
  min-height: 100%;
  padding: 16px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 16px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.header-left {
  min-width: 0;
}

.header-left h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.header-left p {
  max-width: 920px;
  margin: 0;
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.page-body {
  display: grid;
  grid-template-columns: minmax(430px, 0.92fr) minmax(0, 1.28fr);
  gap: 16px;
  align-items: flex-start;
}

.card {
  padding: 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 14px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.form-panel {
  position: sticky;
  top: 16px;
  align-self: flex-start;
  height: fit-content;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.form-panel::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.result-panel {
  min-width: 0;
  align-self: flex-start;
}

.card-title {
  position: relative;
  margin-bottom: 18px;
  padding-left: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
}

.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 3px;
  height: 16px;
  border-radius: 999px;
  background: #409eff;
}

.form-footer {
  position: sticky;
  bottom: 0;
  z-index: 4;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 8px -20px -20px;
  padding: 14px 20px 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  border-radius: 0 0 14px 14px;
  flex-wrap: wrap;
}

.result-top {
  margin-bottom: 16px;
  padding: 18px 20px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.result-top h3 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  line-height: 1.5;
}

.result-top p {
  margin: 0;
  color: #606266;
  line-height: 1.9;
  font-size: 14px;
}

.result-vertical {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-section {
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.result-section:hover {
  border-color: #dcdfe6;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
}

.section-title {
  position: relative;
  margin-bottom: 12px;
  padding-left: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  width: 3px;
  height: 16px;
  border-radius: 999px;
  background: #409eff;
}

.section-content {
  color: #606266;
  line-height: 1.9;
  font-size: 14px;
}

.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.slide-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.slide-card {
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #edf1f7;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.slide-card:hover {
  background: #fff;
  border-color: #dcdfe6;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.slide-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
}

.slide-page {
  flex-shrink: 0;
  padding: 4px 10px;
  color: #409eff;
  font-size: 13px;
  font-weight: 600;
  background: rgba(64, 158, 255, 0.1);
  border-radius: 999px;
}

.slide-title {
  min-width: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
}

.slide-block {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
}

.slide-block + .slide-block {
  margin-top: 10px;
}

.block-label {
  margin-bottom: 6px;
  color: #409eff;
  font-size: 13px;
  font-weight: 600;
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-item {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.prompt-index {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
}

.single-image-card {
  width: 100%;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.single-image-card img {
  display: block;
  width: 100%;
  max-height: 420px;
  object-fit: cover;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  padding: 16px 18px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  flex-wrap: wrap;
}

.file-info {
  min-width: 0;
}

.file-name {
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  word-break: break-word;
}

.file-tip {
  margin-top: 4px;
  color: #909399;
  font-size: 13px;
  line-height: 1.6;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.download-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 16px;
  color: #fff;
  font-size: 14px;
  text-decoration: none;
  background: #67c23a;
  border-radius: 8px;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.download-link:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.preview-card {
  overflow: hidden;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.preview-card:hover {
  border-color: #dcdfe6;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.preview-index {
  padding: 10px 12px;
  color: #606266;
  font-size: 13px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
}

.preview-card img {
  display: block;
  width: 100%;
  max-height: 360px;
  object-fit: contain;
  background: #f8fafc;
}

.empty-state {
  padding: 72px 0;
  background: #f8fafc;
  border: 1px dashed #dcdfe6;
  border-radius: 12px;
}

.empty-preview {
  padding: 20px 0 0;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  color: #303133;
  font-weight: 500;
}

:deep(.el-textarea__inner) {
  line-height: 1.7;
}

:deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (max-width: 1200px) {
  .page-body {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
  }

  .form-panel {
    position: static;
    max-height: none;
    overflow-y: visible;
  }

  .form-footer {
    position: static;
    margin: 8px 0 0;
    padding: 0;
    border-top: none;
    border-radius: 0;
  }
}

@media (max-width: 900px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .pitch-page {
    padding: 12px;
  }

  .page-header {
    padding: 18px;
  }

  .header-actions,
  .form-footer {
    width: 100%;
  }

  .header-actions .el-button,
  .form-footer .el-button {
    flex: 1;
    min-width: 120px;
  }

  .card {
    padding: 16px;
  }

  .single-image-card img {
    max-height: 300px;
  }
}

/* 统一 AI 生成页：默认态 + 生成中状态 */
.ai-state-card {
  min-height: 460px;
  padding: 56px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1px dashed #d8e2ef;
  border-radius: 14px;
  box-sizing: border-box;
}

.ai-state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #409eff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 20px;
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.12);
}

.ai-state-title {
  margin-bottom: 8px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.6;
}

.ai-state-desc {
  max-width: 520px;
  color: #606266;
  font-size: 14px;
  line-height: 1.9;
}

.ai-state-tips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 18px;
}

.ai-state-tips span {
  padding: 6px 12px;
  color: #606266;
  font-size: 13px;
  line-height: 1;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 999px;
}

.ai-loading-state {
  border-style: solid;
  border-color: #d9ecff;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.ai-loading-ring {
  width: 58px;
  height: 58px;
  margin-bottom: 20px;
  border: 4px solid #e8f3ff;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: aiStateSpin 1s linear infinite;
}

.ai-loading-progress {
  width: min(360px, 80%);
  height: 8px;
  margin-top: 20px;
  overflow: hidden;
  background: #edf2f7;
  border-radius: 999px;
}

.ai-loading-progress span {
  display: block;
  width: 45%;
  height: 100%;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2), #409eff, rgba(64, 158, 255, 0.2));
  border-radius: inherit;
  animation: aiStateProgress 1.35s ease-in-out infinite;
}

.ai-loading-steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
}

.ai-loading-steps span {
  padding: 6px 10px;
  color: #409eff;
  font-size: 12px;
  background: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 999px;
}

@keyframes aiStateSpin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes aiStateProgress {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(240%);
  }
}

@media (max-width: 768px) {
  .ai-state-card {
    min-height: 360px;
    padding: 42px 18px;
  }

  .ai-state-tips,
  .ai-loading-steps {
    gap: 8px;
  }
}
</style>

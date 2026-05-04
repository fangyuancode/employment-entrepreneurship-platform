<template>
  <div class="business-page">
    <div class="page-header">
      <div class="header-left">
        <h2>商业计划生成器</h2>
        <p>输入你的创业想法，快速生成完整商业计划书、思维导图、项目配图，并支持导出 PDF。</p>
      </div>
      <div class="header-actions">
        <el-button @click="fillDemo">一键填充示例</el-button>
        <el-button type="primary" :loading="loading" @click="handleGenerate">生成商业计划</el-button>
      </div>
    </div>

    <div class="page-body">
      <div class="form-panel card">
        <div class="card-title">项目输入信息</div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="plan-form">
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
                  <el-option label="文化创意" value="文化创意" />
                  <el-option label="智慧教育" value="智慧教育" />
                  <el-option label="健康守护" value="健康守护" />
                  <el-option label="绿色生活" value="绿色生活" />
                  <el-option label="电商零售" value="电商零售" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="项目阶段" prop="stage">
                <el-select v-model="form.stage" placeholder="请选择项目阶段" style="width: 100%">
                  <el-option label="创意阶段" value="创意阶段" />
                  <el-option label="种子期" value="种子期" />
                  <el-option label="MVP验证期" value="MVP验证期" />
                  <el-option label="早期运营期" value="早期运营期" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="覆盖区域" prop="region">
                <el-input v-model="form.region" placeholder="如：甘肃 / 全国 / 校园场景" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="目标用户" prop="targetUsers">
                <el-input v-model="form.targetUsers" type="textarea" :rows="3" placeholder="请输入目标用户群体，例如：高校创业团队、独立开发者、文化创作者" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心痛点" prop="coreProblem">
                <el-input v-model="form.coreProblem" type="textarea" :rows="3" placeholder="请输入当前用户或行业存在的主要问题" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="解决方案" prop="solution">
                <el-input v-model="form.solution" type="textarea" :rows="4" placeholder="请输入你的产品方案、AI能力或服务模式" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="商业模式" prop="businessModel">
                <el-input v-model="form.businessModel" type="textarea" :rows="3" placeholder="如：会员订阅、按次付费、企业定制、联名合作等" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心竞争优势" prop="competitiveAdvantage">
                <el-input v-model="form.competitiveAdvantage" type="textarea" :rows="3" placeholder="请输入项目相较于竞品或传统方案的优势" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="团队信息" prop="teamInfo">
                <el-input v-model="form.teamInfo" placeholder="如：前端2人、后端1人、AI工程师1人" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="启动预算" prop="budget">
                <el-input v-model="form.budget" placeholder="如：10万元 / 30万元" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="输出风格" prop="style">
                <el-select v-model="form.style" placeholder="请选择输出风格" style="width: 100%">
                  <el-option label="专业型" value="专业型" />
                  <el-option label="比赛展示型" value="比赛展示型" />
                  <el-option label="路演简洁型" value="路演简洁型" />
                  <el-option label="创新包装型" value="创新包装型" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-footer">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" :loading="loading" @click="handleGenerate">生成商业计划</el-button>
          </div>
        </el-form>
      </div>

      <div class="result-panel card">
        <div class="card-title">生成结果</div>

        <div v-if="!result.projectName && !loading" class="ai-state-card ai-state-empty">
          <!-- <div class="ai-state-icon">AI</div> -->
          <!-- <div class="ai-state-title">等待生成商业计划</div> -->
          <div class="ai-state-desc">填写左侧项目信息后，点击「生成商业计划」，系统会生成完整计划书、项目配图和导出内容。</div>
          <div class="ai-state-tips">
            <span>商业计划书</span>
            <span>项目配图</span>
            <span>PDF 导出</span>
          </div>
        </div>

        <div v-else-if="loading" class="ai-state-card ai-loading-state">
          <div class="ai-loading-ring"></div>
          <div class="ai-state-title">正在生成商业计划</div>
          <div class="ai-state-desc">{{ loadingText }}</div>
          <div class="ai-loading-progress"><span></span></div>
          <div class="ai-loading-steps">
            <span>理解项目</span>
            <span>分析市场</span>
            <span>组织内容</span>
            <span>生成报告</span>
          </div>
        </div>

        <div v-else-if="result.projectName" class="result-content">
          <template v-if="result.projectName">
            <div ref="pdfContentRef" class="pdf-export-content">
              <div class="result-top">
                <h3>{{ result.projectName }}</h3>
                <p>已生成完整商业计划书，可用于比赛答辩、项目展示与后续优化。</p>
              </div>

              <div class="result-vertical">
                <div class="plan-section">
                  <div class="section-title">一、项目概述</div>
                  <div class="section-content pre-wrap">{{ result.summary }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">二、市场分析</div>
                  <div class="section-content pre-wrap">{{ result.marketAnalysis }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">三、用户画像</div>
                  <div class="section-content pre-wrap">{{ result.userPersona }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">四、产品方案</div>
                  <div class="section-content pre-wrap">{{ result.productPlan }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">五、商业模式</div>
                  <div class="section-content pre-wrap">{{ result.businessModel }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">六、营销策略</div>
                  <div class="section-content pre-wrap">{{ result.marketingStrategy }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">七、运营规划</div>
                  <div class="section-content pre-wrap">{{ result.operationPlan }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">八、风险分析</div>
                  <div class="section-content pre-wrap">{{ result.riskAnalysis }}</div>
                </div>

                <div class="plan-section">
                  <div class="section-title">九、发展里程碑</div>
                  <div class="section-content pre-wrap">{{ result.milestones }}</div>
                </div>

                <div class="plan-section highlight">
                  <div class="section-title">十、路演摘要</div>
                  <div class="section-content pre-wrap">{{ result.pitchSummary }}</div>
                </div>

                <div class="plan-section" v-if="result.imageKeywords?.length">
                  <div class="section-title">图片关键词</div>
                  <div class="keyword-list">
                    <el-tag v-for="item in result.imageKeywords" :key="item" class="keyword-tag">
                      {{ item }}
                    </el-tag>
                  </div>
                </div>

                <div class="plan-section" v-if="result.imagePrompts?.length">
                  <div class="section-title">图片提示词</div>
                  <div class="prompt-list">
                    <div v-for="(prompt, index) in result.imagePrompts" :key="index" class="prompt-item">
                      <div class="prompt-index">提示词 {{ index + 1 }}</div>
                      <div class="section-content pre-wrap">{{ prompt }}</div>
                    </div>
                  </div>
                </div>

                <div class="plan-section" v-if="result.imageUrls?.length">
                  <div class="section-title">项目配图</div>
                  <div class="image-grid">
                    <div v-for="(url, index) in result.imageUrls" :key="`${url}-${index}`" class="image-card">
                      <img :src="getPreviewImage(url)" :alt="`项目配图${index + 1}`" crossorigin="anonymous" />
                    </div>
                  </div>
                </div>

                <div class="plan-section full">
                  <div class="section-title">完整商业计划书</div>
                  <div class="section-content pre-wrap">{{ result.fullText }}</div>
                </div>
              </div>
            </div>

            <div class="result-actions">
              <el-button :loading="generatingImages" @click="handleGenerateImages">重新生成配图</el-button>
              <el-button :loading="exportingPdf" @click="handleExportPdf">导出 PDF</el-button>
              <el-button @click="copyFullText">复制完整计划书</el-button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import {
  cloneAiCachePayload,
  getAiDemoCache,
  isSameAiPayload,
  setAiDemoCache,
  waitAiCacheDelay
} from '@/utils/ai-demo-cache'
// import html2canvas from 'html2canvas'
// import jsPDF from 'jspdf'
// import {
//   generateBusinessPlan,
//   generateBusinessPlanImages,
//   type BusinessPlanForm,
//   type BusinessPlanResult
// } from '@/api/business-plan'
import {
  generateBusinessPlan,
  generateBusinessPlanImages,
  exportBusinessPlanPdf,
  previewBusinessPlanImage,
  type BusinessPlanForm,
  type BusinessPlanResult
} from '@/api/business-plan'
defineOptions({ name: 'BusinessPlanPage' })

const formRef = ref<FormInstance>()
const pdfContentRef = ref<HTMLElement | null>(null)
const demoFormSnapshot = ref<BusinessPlanForm | null>(null)
const isUsingDemoResult = ref(false)

const loading = ref(false)
const generatingImages = ref(false)
const exportingPdf = ref(false)
const loadingText = ref('正在准备生成...')
const form = reactive<BusinessPlanForm>({
  projectName: '',
  industry: '',
  stage: '',
  targetUsers: '',
  coreProblem: '',
  solution: '',
  businessModel: '',
  competitiveAdvantage: '',
  teamInfo: '',
  budget: '',
  region: '',
  style: '比赛展示型'
})

const createEmptyResult = (): BusinessPlanResult => ({
  projectName: '',
  summary: '',
  marketAnalysis: '',
  userPersona: '',
  productPlan: '',
  businessModel: '',
  marketingStrategy: '',
  operationPlan: '',
  riskAnalysis: '',
  milestones: '',
  pitchSummary: '',
  fullText: '',
  mindMapMermaid: '',
  imagePrompts: [],
  imageKeywords: [],
  imageUrls: []
})

const result = reactive<BusinessPlanResult>(createEmptyResult())

const rules: FormRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择行业赛道', trigger: 'change' }],
  stage: [{ required: true, message: '请选择项目阶段', trigger: 'change' }],
  targetUsers: [{ required: true, message: '请输入目标用户', trigger: 'blur' }],
  coreProblem: [{ required: true, message: '请输入核心痛点', trigger: 'blur' }],
  solution: [{ required: true, message: '请输入解决方案', trigger: 'blur' }],
  businessModel: [{ required: true, message: '请输入商业模式', trigger: 'blur' }]
}

const getPreviewImage = (url: string) => previewBusinessPlanImage(url)

const handleGenerateImages = async (fromGenerate = false) => {
  if (!result.projectName || !result.imagePrompts?.length) {
    if (!fromGenerate) {
      ElMessage.warning('请先生成商业计划')
    }
    return
  }

  const imagePayload = cloneAiCachePayload({
    projectName: result.projectName,
    imagePrompts: result.imagePrompts
  })
  const cachedImages = isUsingDemoResult.value
    ? getAiDemoCache<{ imageUrls: string[] }>('business-plan.images', imagePayload)
    : null

  try {
    generatingImages.value = true

    if (!fromGenerate) {
      loading.value = true
      loadingText.value = cachedImages
        ? '检测到示例配图已有本地缓存，3秒后直接展示...'
        : '正在生成项目配图，请稍候...'
    }

    if (cachedImages) {
      await waitAiCacheDelay()
      result.imageUrls = cachedImages.imageUrls || []
      if (!fromGenerate) ElMessage.success('已加载示例配图缓存')
      return
    }

    const data = await generateBusinessPlanImages(imagePayload)

    result.imageUrls = data?.imageUrls || []

    if (isUsingDemoResult.value) {
      setAiDemoCache('business-plan.images', imagePayload, { imageUrls: result.imageUrls || [] })
    }

    if (!fromGenerate) {
      if (result.imageUrls.length > 0) {
        ElMessage.success('图片生成完成')
      } else {
        ElMessage.warning('图片生成成功，但未返回图片地址')
      }
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '图片生成失败')
  } finally {
    generatingImages.value = false
    if (!fromGenerate) {
      loading.value = false
      loadingText.value = '正在准备生成...'
    }
  }
}

const handleGenerate = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    const payload = cloneAiCachePayload(form)
    const isDemoRequest = demoFormSnapshot.value
      ? isSameAiPayload(payload, demoFormSnapshot.value)
      : false
    const cachedData = isDemoRequest
      ? getAiDemoCache<BusinessPlanResult>('business-plan.generate', payload)
      : null

    loading.value = true

    if (cachedData) {
      loadingText.value = '检测到示例数据已有本地缓存，3秒后直接展示商业计划...'
      await waitAiCacheDelay()
      Object.assign(result, createEmptyResult(), cachedData)
      isUsingDemoResult.value = true
      ElMessage.success('已加载示例本地缓存结果')
      return
    }

    isUsingDemoResult.value = isDemoRequest
    loadingText.value = '正在检查输入内容...'

    await new Promise((resolve) => setTimeout(resolve, 300))

    loadingText.value = '正在连接大模型接口...'

    await new Promise((resolve) => setTimeout(resolve, 400))

    loadingText.value = '正在生成商业计划书，请稍候...'

    const data = await generateBusinessPlan(payload)

    Object.assign(result, createEmptyResult(), data || {})

    loadingText.value = '计划书生成完成，正在整理展示内容...'
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (result.imagePrompts?.length) {
      loadingText.value = '正在生成项目配图，请稍候...'
      await handleGenerateImages(true)
    }

    if (isDemoRequest) {
      setAiDemoCache('business-plan.generate', payload, cloneAiCachePayload(result))
    }

    loadingText.value = '全部内容生成完成'
    ElMessage.success(isDemoRequest ? '商业计划生成成功，示例结果已缓存' : '商业计划生成成功')
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '生成失败，请稍后重试')
  } finally {
    loading.value = false
    loadingText.value = '正在准备生成...'
  }
}

const handleExportPdf = async () => {
  if (!result.projectName) {
    ElMessage.warning('请先生成商业计划书')
    return
  }

  try {
    exportingPdf.value = true

    const data = await exportBusinessPlanPdf({
      projectName: result.projectName,
      summary: result.summary,
      marketAnalysis: result.marketAnalysis,
      userPersona: result.userPersona,
      productPlan: result.productPlan,
      businessModel: result.businessModel,
      marketingStrategy: result.marketingStrategy,
      operationPlan: result.operationPlan,
      riskAnalysis: result.riskAnalysis,
      milestones: result.milestones,
      pitchSummary: result.pitchSummary,
      fullText: result.fullText,
      imageUrls: result.imageUrls || []
    })

    const blob = new Blob([data], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.projectName || '商业计划书'}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)

    ElMessage.success('PDF 导出成功')
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || error?.message || 'PDF 导出失败')
  } finally {
    exportingPdf.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  Object.assign(result, createEmptyResult())
  demoFormSnapshot.value = null
  isUsingDemoResult.value = false
}

const fillDemo = () => {
  Object.assign(form, {
    projectName: '创文星球：AI创业与文化共创平台',
    industry: 'AI 创业助手',
    stage: '种子期',
    targetUsers: '高校创业团队、独立开发者、地方文化创作者、文创品牌主理人',
    coreProblem:
      '创业团队缺少高效的商业策划工具，地方文化内容传播方式老套，优质创意难以快速落地和商业化。',
    solution:
      '打造一个融合 AI 商业计划生成、品牌文案生成、文化内容共创、项目展示与传播的 Web 平台，帮助用户完成从创业灵感到项目包装的全流程。',
    businessModel: '会员订阅 + 比赛项目定制服务 + 企业合作 + 文化IP联名',
    competitiveAdvantage:
      '将 AI 创业辅助与文化共创结合，兼顾工具价值、内容价值和传播价值，形成差异化平台能力。',
    teamInfo: '2名前端开发、1名后端开发、1名AI应用工程师、1名视觉设计师',
    budget: '30万元',
    region: '甘肃 + 全国高校市场',
    style: '比赛展示型'
  })
  demoFormSnapshot.value = cloneAiCachePayload(form)
  isUsingDemoResult.value = false
  ElMessage.success('示例数据已填充，首次生成后会自动缓存结果')
}

const copyFullText = async () => {
  if (!result.fullText) {
    ElMessage.warning('暂无可复制内容')
    return
  }

  try {
    await navigator.clipboard.writeText(result.fullText)
    ElMessage.success('完整计划书已复制')
  } catch (error) {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped lang="scss">
.business-page {
  min-height: 100%;
  padding: 16px;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  padding: 20px 24px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 14px;

  .header-left {
    h2 {
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 600;
      color: #303133;
    }

    p {
      margin: 0;
      color: #606266;
      line-height: 1.8;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }
}

.page-body {
  display: grid;
  grid-template-columns: minmax(430px, 0.92fr) minmax(0, 1.28fr);
  gap: 16px;
  align-items: flex-start;
}

.card {
  box-sizing: border-box;
  padding: 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 14px;
}

/* 左侧输入区保持自身内容高度，不再被右侧长结果撑高 */
.form-panel {
  position: sticky;
  top: 16px;
  align-self: flex-start;
  height: fit-content;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
}

.form-panel::-webkit-scrollbar,
.result-panel::-webkit-scrollbar,
.plan-section.full::-webkit-scrollbar {
  width: 6px;
}

.form-panel::-webkit-scrollbar-thumb,
.result-panel::-webkit-scrollbar-thumb,
.plan-section.full::-webkit-scrollbar-thumb {
  background: #d8dde8;
  border-radius: 10px;
}

.result-panel {
  align-self: flex-start;
  min-width: 0;
}

.card-title {
  margin-bottom: 18px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.result-content {
  min-height: 420px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
}

.result-top {
  margin-bottom: 16px;
  padding: 16px 18px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 12px;

  h3 {
    margin: 0 0 8px;
    font-size: 20px;
    color: #303133;
  }

  p {
    margin: 0;
    color: #606266;
    line-height: 1.7;
  }
}

.pdf-export-content {
  background: #fff;
}

.result-vertical {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.plan-section {
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #dcdfe6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  &.highlight {
    border-color: #cfe3ff;
    background: #f5f9ff;
  }

  &.full {
    max-height: 560px;
    overflow-y: auto;
  }
}

.section-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-content {
  font-size: 14px;
  line-height: 1.9;
  color: #606266;
}

.pre-wrap {
  white-space: pre-wrap;
  word-break: break-word;
}

.keyword-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.keyword-tag {
  margin: 0;
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-item {
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #edf1f7;
  border-radius: 10px;
}

.prompt-index {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #409eff;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.image-card {
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  background: #f8fafc;

  img {
    display: block;
    width: 100%;
    height: 220px;
    object-fit: cover;
  }
}

.result-actions {
  position: sticky;
  bottom: 0;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 14px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.76), #fff 42%);
}

@media (max-width: 1200px) {
  .page-body {
    grid-template-columns: 1fr;
  }

  .form-panel {
    position: static;
    max-height: none;
    overflow: visible;
  }
}

@media (max-width: 768px) {
  .business-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
  }

  .header-actions,
  .result-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-actions .el-button,
  .result-actions .el-button {
    flex: 1;
    min-width: 120px;
  }

  .image-grid {
    grid-template-columns: 1fr;
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

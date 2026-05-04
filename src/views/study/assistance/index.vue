<template>
  <div class="design-page">
    <div class="page-header">
      <div class="header-left">
        <h2>AI产品设计助手</h2>
        <p>
          输入产品信息，自动生成产品定位、页面结构、用户流程、视觉风格建议、组件设计方案，并生成设计主视觉图、线框图概念图与高保真界面图。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="fillDemo">一键填充示例</el-button>
        <el-button type="primary" :loading="loading" @click="handleGenerate">
          生成产品设计方案
        </el-button>
      </div>
    </div>

    <div class="page-body">
      <div class="form-panel card">
        <div class="card-title">产品信息输入</div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="项目名称" prop="projectName">
                <el-input v-model="form.projectName" placeholder="请输入项目名称" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="产品类型" prop="productType">
                <el-select v-model="form.productType" placeholder="请选择产品类型" style="width: 100%">
                  <el-option label="AI Web 平台" value="AI Web 平台" />
                  <el-option label="SaaS 管理平台" value="SaaS 管理平台" />
                  <el-option label="校园服务平台" value="校园服务平台" />
                  <el-option label="内容创作工具" value="内容创作工具" />
                  <el-option label="数据分析平台" value="数据分析平台" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="目标用户" prop="targetUsers">
                <el-input v-model="form.targetUsers" type="textarea" :rows="3" placeholder="如：大学生创业团队、产品经理、运营人员、内容创作者" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心使用场景" prop="coreScenario">
                <el-input v-model="form.coreScenario" type="textarea" :rows="3" placeholder="如：从想法输入到生成商业计划、品牌文案、页面原型与视觉设计稿" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心功能模块" prop="coreFeatures">
                <el-input v-model="form.coreFeatures" type="textarea" :rows="4" placeholder="如：AI问答、计划书生成、品牌文案生成、产品设计助手、图片生成、导出功能" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="设计风格偏好" prop="stylePreference">
                <el-select v-model="form.stylePreference" placeholder="请选择风格" style="width: 100%">
                  <el-option label="科技简洁" value="科技简洁" />
                  <el-option label="高级专业" value="高级专业" />
                  <el-option label="年轻活力" value="年轻活力" />
                  <el-option label="轻量卡片化" value="轻量卡片化" />
                  <el-option label="未来感可视化" value="未来感可视化" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="目标平台" prop="platform">
                <el-select v-model="form.platform" placeholder="请选择平台" style="width: 100%">
                  <el-option label="PC Web" value="PC Web" />
                  <el-option label="响应式 Web" value="响应式 Web" />
                  <el-option label="后台管理系统" value="后台管理系统" />
                  <el-option label="移动端 H5" value="移动端 H5" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="竞品/参考产品" prop="competitorReference">
                <el-input v-model="form.competitorReference" placeholder="如：Notion、Figma、Canva、秘塔、即梦" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="品牌关键词" prop="brandKeywords">
                <el-input v-model="form.brandKeywords" placeholder="如：智能、高效、协作、创新、可视化" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="颜色偏好" prop="colorPreference">
                <el-input v-model="form.colorPreference" placeholder="如：蓝紫科技感、浅色背景、低饱和、局部强调色" />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-footer">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" :loading="loading" @click="handleGenerate">
              生成产品设计方案
            </el-button>
          </div>
        </el-form>
      </div>

      <div class="result-panel card">
        <div class="card-title">生成结果</div>

        <div v-if="!result.projectName && !loading" class="ai-state-card ai-state-empty">
          <!-- <div class="ai-state-icon">AI</div>
          <div class="ai-state-title">等待生成产品设计方案</div> -->
          <div class="ai-state-desc">填写左侧产品信息后，点击「生成产品设计方案」，系统会输出产品定位、页面结构、用户流程和视觉建议。</div>
          <div class="ai-state-tips">
            <span>产品定位</span>
            <span>页面结构</span>
            <span>视觉方案</span>
          </div>
        </div>

        <div v-else-if="loading" class="ai-state-card ai-loading-state">
          <div class="ai-loading-ring"></div>
          <div class="ai-state-title">正在生成产品设计方案</div>
          <div class="ai-state-desc">{{ loadingText }}</div>
          <div class="ai-loading-progress"><span></span></div>
          <div class="ai-loading-steps">
            <span>理解需求</span>
            <span>规划结构</span>
            <span>设计视觉</span>
            <span>生成方案</span>
          </div>
        </div>

        <template v-else-if="result.projectName">
          <div class="result-top">
            <h3>{{ result.projectName }}</h3>
            <p>{{ result.designGoal }}</p>
          </div>

          <div class="result-vertical">
            <div class="result-section">
              <div class="section-title">产品定位</div>
              <div class="section-content pre-wrap">{{ result.productPositioning }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">用户画像</div>
              <div class="section-content pre-wrap">{{ result.userPersona }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">设计策略</div>
              <div class="section-content pre-wrap">{{ result.designStrategy }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">功能模块拆解</div>
              <div class="section-content pre-wrap">{{ result.featureModules }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">页面结构规划</div>
              <div class="section-content pre-wrap">{{ result.pageStructure }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">交互亮点建议</div>
              <div class="section-content pre-wrap">{{ result.interactionHighlights }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">视觉风格建议</div>
              <div class="section-content pre-wrap">{{ result.visualStyle }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">设计系统建议</div>
              <div class="section-content pre-wrap">{{ result.designSystemSuggestion }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">UX 文案建议</div>
              <div class="section-content pre-wrap">{{ result.uxWritingSuggestion }}</div>
            </div>

            <div class="result-section" v-if="result.designKeywords?.length">
              <div class="section-title">设计关键词</div>
              <div class="tag-list">
                <el-tag v-for="item in result.designKeywords" :key="item" class="tag-item">
                  {{ item }}
                </el-tag>
              </div>
            </div>

            <div class="result-section" v-if="result.colorPalette?.length">
              <div class="section-title">推荐配色方案</div>
              <div class="palette-list">
                <div v-for="(color, index) in result.colorPalette" :key="`${color}-${index}`" class="palette-item">
                  <div class="palette-color" :style="{ backgroundColor: color }"></div>
                  <div class="palette-text">{{ color }}</div>
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">字体建议</div>
              <div class="section-content pre-wrap">{{ result.typographySuggestion }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">图标风格建议</div>
              <div class="section-content pre-wrap">{{ result.iconStyleSuggestion }}</div>
            </div>

            <div class="result-section" v-if="result.componentSuggestions?.length">
              <div class="section-title">组件建议</div>
              <div class="component-list">
                <div v-for="(item, index) in result.componentSuggestions" :key="`${item}-${index}`" class="component-item">
                  {{ index + 1 }}. {{ item }}
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">用户流程图（Mermaid）</div>
              <pre class="code-block">{{ result.mermaidUserFlow }}</pre>
            </div>

            <div class="result-section">
              <div class="section-title">信息架构图（Mermaid）</div>
              <pre class="code-block">{{ result.mermaidInfoArchitecture }}</pre>
            </div>

            <div class="result-section">
              <div class="section-title">低保真线框说明</div>
              <div class="section-content pre-wrap">{{ result.wireframeDescription }}</div>

              <div v-if="result.sceneImageMap?.wireframeScene" class="inline-image-block">
                <div class="inline-image-title">线框图概念视觉</div>
                <div class="single-image-card">
                  <img :src="getPreviewImage(result.sceneImageMap.wireframeScene)" alt="线框图概念视觉" crossorigin="anonymous" />
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">高保真原型说明</div>
              <div class="section-content pre-wrap">{{ result.prototypeDescription }}</div>

              <div v-if="result.sceneImageMap?.prototypeScene" class="inline-image-block">
                <div class="inline-image-title">高保真界面视觉</div>
                <div class="single-image-card">
                  <img :src="getPreviewImage(result.sceneImageMap.prototypeScene)" alt="高保真界面视觉" crossorigin="anonymous" />
                </div>
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.moodboardScene">
              <div class="section-title">视觉风格板</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.moodboardScene)" alt="视觉风格板" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.homepageScene">
              <div class="section-title">首页主视觉图</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.homepageScene)" alt="首页主视觉图" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.dashboardScene">
              <div class="section-title">控制台页面视觉</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.dashboardScene)" alt="控制台页面视觉" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.designSystemScene">
              <div class="section-title">设计系统展示图</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.designSystemScene)" alt="设计系统展示图" crossorigin="anonymous" />
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
  generateProductDesign,
  previewProductDesignImage,
  type ProductDesignForm,
  type ProductDesignResult
} from '@/api/product-design'

defineOptions({ name: 'Assistance' })

const formRef = ref<FormInstance>()
const demoFormSnapshot = ref<ProductDesignForm | null>(null)
const loading = ref(false)
const loadingText = ref('正在分析产品需求并生成设计方案...')

const form = reactive<ProductDesignForm>({
  projectName: '',
  productType: '',
  targetUsers: '',
  coreScenario: '',
  coreFeatures: '',
  stylePreference: '',
  platform: '',
  competitorReference: '',
  brandKeywords: '',
  colorPreference: ''
})

const createEmptyResult = (): ProductDesignResult => ({
  projectName: '',
  productPositioning: '',
  designGoal: '',
  userPersona: '',
  designStrategy: '',
  featureModules: '',
  pageStructure: '',
  interactionHighlights: '',
  visualStyle: '',
  designSystemSuggestion: '',
  uxWritingSuggestion: '',
  wireframeDescription: '',
  prototypeDescription: '',
  mermaidUserFlow: '',
  mermaidInfoArchitecture: '',
  colorPalette: [],
  typographySuggestion: '',
  iconStyleSuggestion: '',
  componentSuggestions: [],
  designKeywords: [],
  imagePrompts: [],
  imageUrls: [],
  sceneImageMap: {}
})

const result = reactive<ProductDesignResult>(createEmptyResult())

const rules: FormRules<ProductDesignForm> = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  productType: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  targetUsers: [{ required: true, message: '请输入目标用户', trigger: 'blur' }],
  coreScenario: [{ required: true, message: '请输入核心使用场景', trigger: 'blur' }],
  coreFeatures: [{ required: true, message: '请输入核心功能模块', trigger: 'blur' }],
  stylePreference: [{ required: true, message: '请选择设计风格偏好', trigger: 'change' }],
  platform: [{ required: true, message: '请选择目标平台', trigger: 'change' }]
}

function assignResult(data: ProductDesignResult) {
  Object.assign(result, createEmptyResult(), data || {})
}

function fillDemo() {
  Object.assign(form, {
    projectName: '智创AI创业助手',
    productType: 'AI Web 平台',
    targetUsers: '大学生创业团队、独立开发者、初创项目负责人、比赛参赛者',
    coreScenario:
      '用户输入创业想法后，系统帮助其完成商业计划书、品牌文案、产品设计方案、视觉海报和展示材料生成。',
    coreFeatures:
      'AI 对话问答、商业计划生成、品牌文案生成、产品设计助手、页面原型建议、图片生成、结果导出与项目展示。',
    stylePreference: '科技简洁',
    platform: 'PC Web',
    competitorReference: 'Notion、Figma、Canva、秘塔、即梦',
    brandKeywords: '智能、高效、专业、协作、可视化、创新',
    colorPreference: '浅色背景、蓝紫科技感、局部高亮色、整体简洁高级'
  })
  demoFormSnapshot.value = cloneAiCachePayload(form)
  ElMessage.success('示例数据已填充，首次生成后会自动缓存结果')
}

function handleReset() {
  Object.assign(form, {
    projectName: '',
    productType: '',
    targetUsers: '',
    coreScenario: '',
    coreFeatures: '',
    stylePreference: '',
    platform: '',
    competitorReference: '',
    brandKeywords: '',
    colorPreference: ''
  })
  assignResult(createEmptyResult())
  demoFormSnapshot.value = null
}

function getPreviewImage(url?: string) {
  if (!url) return ''
  return previewProductDesignImage(url)
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
    ? getAiDemoCache<ProductDesignResult>('product-design.generate', payload)
    : null

  loading.value = true

  if (cachedData) {
    try {
      loadingText.value = '检测到示例数据已有本地缓存，3秒后直接展示产品设计方案...'
      await waitAiCacheDelay()
      assignResult(cachedData)
      ElMessage.success('已加载示例本地缓存结果')
    } finally {
      loading.value = false
      loadingText.value = '正在分析产品需求并生成设计方案...'
    }
    return
  }

  const loadingSteps = [
    '正在分析产品需求...',
    '正在生成设计策略与页面结构...',
    '正在生成用户流程图与信息架构...',
    '正在构建设计系统建议...',
    '正在生成视觉化设计图片...'
  ]

  let timer: ReturnType<typeof setInterval> | null = null
  let index = 0

  try {
    loadingText.value = loadingSteps[0]
    timer = setInterval(() => {
      index = (index + 1) % loadingSteps.length
      loadingText.value = loadingSteps[index]
    }, 1800)

    const data = await generateProductDesign(payload)

    if (!data) {
      ElMessage.error('生成失败')
      return
    }

    assignResult(data)

    if (isDemoRequest) {
      setAiDemoCache('product-design.generate', payload, cloneAiCachePayload(result))
    }

    ElMessage.success(
      isDemoRequest ? '产品设计方案生成成功，示例结果已缓存' : '产品设计方案生成成功'
    )
  } catch (error: any) {
    ElMessage.error(error?.message || '生成失败，请稍后重试')
  } finally {
    loading.value = false
    if (timer) clearInterval(timer)
    loadingText.value = '正在分析产品需求并生成设计方案...'
  }
}
</script>

<style scoped>
.design-page {
  min-height: 100%;
  padding: 16px;
  background: #f5f7fa;
  box-sizing: border-box;
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
  box-sizing: border-box;
}

.header-left {
  min-width: 0;
}

.header-left h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
  color: #303133;
}

.header-left p {
  max-width: 900px;
  margin: 0;
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
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
  box-sizing: border-box;
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
  margin-bottom: 18px;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-footer {
  position: sticky;
  bottom: -20px;
  z-index: 4;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 8px -20px -20px;
  padding: 14px 20px 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  border-radius: 0 0 14px 14px;
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
  line-height: 1.8;
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
  transition: all 0.2s ease;
}

.result-section:hover {
  border-color: #dcdfe6;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.section-title {
  position: relative;
  margin-bottom: 12px;
  padding-left: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 4px;
  width: 3px;
  height: 16px;
  border-radius: 4px;
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

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  margin: 0;
}

.palette-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}

.palette-item {
  overflow: hidden;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 12px;
}

.palette-color {
  height: 72px;
}

.palette-text {
  padding: 10px 12px;
  font-size: 13px;
  color: #606266;
  text-align: center;
  background: #fff;
}

.component-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.component-item {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #edf1f7;
  border-radius: 10px;
  color: #606266;
  line-height: 1.7;
  font-size: 14px;
}

.code-block {
  max-height: 360px;
  margin: 0;
  padding: 14px 16px;
  overflow: auto;
  color: #e2e8f0;
  background: #0f172a;
  border-radius: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.8;
  font-size: 13px;
  box-sizing: border-box;
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

.inline-image-block {
  margin-top: 16px;
}

.inline-image-title {
  margin-bottom: 10px;
  font-size: 14px;
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

.empty-state {
  padding: 70px 0;
  background: #f8fafc;
  border: 1px dashed #dcdfe6;
  border-radius: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 18px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-textarea__inner) {
  line-height: 1.7;
}

@media (max-width: 1200px) {
  .page-body {
    grid-template-columns: 1fr;
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

  .page-header {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .design-page {
    padding: 12px;
  }

  .page-header {
    padding: 18px;
  }

  .header-actions,
  .form-footer {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-actions .el-button,
  .form-footer .el-button {
    flex: 1;
    margin-left: 0;
  }

  .page-body {
    gap: 12px;
  }

  .card {
    padding: 16px;
  }

  .palette-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
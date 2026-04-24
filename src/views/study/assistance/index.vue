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
                <el-select
                  v-model="form.productType"
                  placeholder="请选择产品类型"
                  style="width: 100%"
                >
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
                <el-input
                  v-model="form.targetUsers"
                  type="textarea"
                  :rows="3"
                  placeholder="如：大学生创业团队、产品经理、运营人员、内容创作者"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心使用场景" prop="coreScenario">
                <el-input
                  v-model="form.coreScenario"
                  type="textarea"
                  :rows="3"
                  placeholder="如：从想法输入到生成商业计划、品牌文案、页面原型与视觉设计稿"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心功能模块" prop="coreFeatures">
                <el-input
                  v-model="form.coreFeatures"
                  type="textarea"
                  :rows="4"
                  placeholder="如：AI问答、计划书生成、品牌文案生成、产品设计助手、图片生成、导出功能"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="设计风格偏好" prop="stylePreference">
                <el-select
                  v-model="form.stylePreference"
                  placeholder="请选择风格"
                  style="width: 100%"
                >
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
                <el-input
                  v-model="form.competitorReference"
                  placeholder="如：Notion、Figma、Canva、秘塔、即梦"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="品牌关键词" prop="brandKeywords">
                <el-input
                  v-model="form.brandKeywords"
                  placeholder="如：智能、高效、协作、创新、可视化"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="颜色偏好" prop="colorPreference">
                <el-input
                  v-model="form.colorPreference"
                  placeholder="如：蓝紫科技感、浅色背景、低饱和、局部强调色"
                />
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

      <div
        v-loading="loading"
        :element-loading-text="loadingText"
        element-loading-background="rgba(255,255,255,0.76)"
        class="result-panel card"
      >
        <div class="card-title">生成结果</div>

        <div v-if="!result.projectName && !loading" class="empty-state">
          <el-empty description="填写左侧信息后，点击“生成产品设计方案”查看结果" />
        </div>

        <template v-if="result.projectName">
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
                <div
                  v-for="(color, index) in result.colorPalette"
                  :key="`${color}-${index}`"
                  class="palette-item"
                >
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
                <div
                  v-for="(item, index) in result.componentSuggestions"
                  :key="`${item}-${index}`"
                  class="component-item"
                >
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
                  <img
                    :src="getPreviewImage(result.sceneImageMap.wireframeScene)"
                    alt="线框图概念视觉"
                    crossorigin="anonymous"
                  />
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">高保真原型说明</div>
              <div class="section-content pre-wrap">{{ result.prototypeDescription }}</div>

              <div v-if="result.sceneImageMap?.prototypeScene" class="inline-image-block">
                <div class="inline-image-title">高保真界面视觉</div>
                <div class="single-image-card">
                  <img
                    :src="getPreviewImage(result.sceneImageMap.prototypeScene)"
                    alt="高保真界面视觉"
                    crossorigin="anonymous"
                  />
                </div>
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.moodboardScene">
              <div class="section-title">视觉风格板</div>
              <div class="single-image-card">
                <img
                  :src="getPreviewImage(result.sceneImageMap.moodboardScene)"
                  alt="视觉风格板"
                  crossorigin="anonymous"
                />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.homepageScene">
              <div class="section-title">首页主视觉图</div>
              <div class="single-image-card">
                <img
                  :src="getPreviewImage(result.sceneImageMap.homepageScene)"
                  alt="首页主视觉图"
                  crossorigin="anonymous"
                />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.dashboardScene">
              <div class="section-title">控制台页面视觉</div>
              <div class="single-image-card">
                <img
                  :src="getPreviewImage(result.sceneImageMap.dashboardScene)"
                  alt="控制台页面视觉"
                  crossorigin="anonymous"
                />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.designSystemScene">
              <div class="section-title">设计系统展示图</div>
              <div class="single-image-card">
                <img
                  :src="getPreviewImage(result.sceneImageMap.designSystemScene)"
                  alt="设计系统展示图"
                  crossorigin="anonymous"
                />
              </div>
            </div>

            <div class="result-section" v-if="result.imagePrompts?.length">
              <div class="section-title">图片提示词</div>
              <div class="prompt-list">
                <div
                  v-for="(prompt, index) in result.imagePrompts"
                  :key="index"
                  class="prompt-item"
                >
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
    generateProductDesign,
    previewProductDesignImage,
    type ProductDesignForm,
    type ProductDesignResult
  } from '@/api/product-design'

  defineOptions({ name: 'Assistance' })

  const formRef = ref<FormInstance>()
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
  }

  function getPreviewImage(url?: string) {
    if (!url) return ''
    return previewProductDesignImage(url)
  }

  async function handleGenerate() {
    if (!formRef.value) return

    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return

    loading.value = true

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

      const res = await generateProductDesign({ ...form })
      const data = res.data?.data

      if (!data) {
        ElMessage.error(res.data?.msg || '生成失败')
        return
      }

      assignResult(data)
      ElMessage.success('产品设计方案生成成功')
    } catch (error: any) {
      ElMessage.error(error?.message || '生成失败，请稍后重试')
    } finally {
      loading.value = false
      if (timer) clearInterval(timer)
    }
  }
</script>

<style scoped>
  .design-page {
    padding: 16px;
    background: #f5f7fa;
    min-height: 100%;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }

  .header-left h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #1f2d3d;
  }

  .header-left p {
    margin: 0;
    color: #606266;
    line-height: 1.8;
    max-width: 820px;
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
  }

  .page-body {
    display: grid;
    grid-template-columns: 430px 1fr;
    gap: 16px;
    align-items: start;
  }

  .card {
    background: #fff;
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 6px 20px rgba(15, 23, 42, 0.05);
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2d3d;
    margin-bottom: 16px;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 8px;
  }

  .result-top {
    padding: 16px 18px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #ebeef5;
    margin-bottom: 18px;
  }

  .result-top h3 {
    margin: 0 0 8px;
    font-size: 22px;
    color: #1f2d3d;
  }

  .result-top p {
    margin: 0;
    color: #606266;
    line-height: 1.8;
  }

  .result-vertical {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .result-section {
    border: 1px solid #ebeef5;
    border-radius: 12px;
    padding: 16px;
    background: #fff;
  }

  .section-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
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
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .palette-item {
    border: 1px solid #ebeef5;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
  }

  .palette-color {
    height: 72px;
  }

  .palette-text {
    padding: 10px 12px;
    font-size: 13px;
    color: #606266;
    text-align: center;
  }

  .component-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .component-item {
    padding: 10px 12px;
    background: #f8fafc;
    border-radius: 10px;
    color: #606266;
    line-height: 1.7;
  }

  .code-block {
    margin: 0;
    background: #0f172a;
    color: #e2e8f0;
    padding: 14px;
    border-radius: 12px;
    overflow-x: auto;
    white-space: pre-wrap;
    line-height: 1.8;
    font-size: 13px;
  }

  .prompt-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .prompt-item {
    background: #f8fafc;
    border: 1px solid #ebeef5;
    border-radius: 12px;
    padding: 14px;
  }

  .prompt-index {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .single-image-card {
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid #ebeef5;
    background: #fff;
  }

  .single-image-card img {
    display: block;
    width: 100%;
    height: auto;
  }

  .inline-image-block {
    margin-top: 16px;
  }

  .inline-image-title {
    font-size: 14px;
    color: #606266;
    margin-bottom: 10px;
  }

  .empty-state {
    padding: 50px 0;
  }

  @media (max-width: 1200px) {
    .page-body {
      grid-template-columns: 1fr;
    }

    .page-header {
      flex-direction: column;
    }
  }
</style>

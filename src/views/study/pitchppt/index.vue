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
        <el-button
          type="success"
          :loading="buildingFile"
          :disabled="!result.projectName || !result.slideList?.length"
          @click="handleBuildPptFile"
        >
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
                <el-input
                  v-model="form.targetUsers"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入目标用户群体，例如：大学生创业团队、独立开发者、比赛参赛者"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心痛点" prop="coreProblem">
                <el-input
                  v-model="form.coreProblem"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入用户或行业当前存在的主要问题"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="解决方案" prop="solution">
                <el-input
                  v-model="form.solution"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入你的项目方案、产品能力和服务模式"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="商业模式" prop="businessModel">
                <el-input
                  v-model="form.businessModel"
                  type="textarea"
                  :rows="3"
                  placeholder="如：会员订阅、企业服务、按次收费、联合运营"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心竞争优势" prop="competitiveAdvantage">
                <el-input
                  v-model="form.competitiveAdvantage"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入项目相较于竞品和传统方案的优势"
                />
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
            <el-button
              type="success"
              plain
              :loading="buildingFile"
              :disabled="!result.projectName || !result.slideList?.length"
              @click="handleBuildPptFile"
            >
              生成 PPT 文件
            </el-button>
          </div>
        </el-form>
      </div>

      <div
        v-loading="loading || buildingFile"
        :element-loading-text="loading ? loadingText : buildingText"
        element-loading-background="rgba(255,255,255,0.76)"
        class="result-panel card"
      >
        <div class="card-title">生成结果</div>

        <div v-if="!result.projectName && !loading" class="empty-state">
          <el-empty description="填写左侧信息后，点击“生成路演 PPT 文案”查看结果" />
        </div>

        <template v-if="result.projectName">
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
                <img
                  :src="getPreviewImage(result.sceneImageMap.coverScene)"
                  alt="封面主视觉图"
                  crossorigin="anonymous"
                />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.solutionScene">
              <div class="section-title">方案展示图</div>
              <div class="single-image-card">
                <img
                  :src="getPreviewImage(result.sceneImageMap.solutionScene)"
                  alt="方案展示图"
                  crossorigin="anonymous"
                />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.marketScene">
              <div class="section-title">市场场景图</div>
              <div class="single-image-card">
                <img
                  :src="getPreviewImage(result.sceneImageMap.marketScene)"
                  alt="市场场景图"
                  crossorigin="anonymous"
                />
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.teamScene">
              <div class="section-title">团队展示图</div>
              <div class="single-image-card">
                <img
                  :src="getPreviewImage(result.sceneImageMap.teamScene)"
                  alt="团队展示图"
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

            <div class="result-section" v-if="pptFile.fileId">
              <div class="section-title">PPT 文件输出</div>

              <div class="file-header">
                <div class="file-info">
                  <div class="file-name">{{ pptFile.fileName || '已生成 PPT 文件' }}</div>
                  <div class="file-tip">支持在线预览，也可以直接下载到本地</div>
                </div>

                <div class="file-actions">
                  <a
                    class="download-link"
                    :href="getFullDownloadUrl(pptFile.downloadUrl)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    下载 PPT 文件
                  </a>
                </div>
              </div>

              <div class="preview-grid" v-if="pptFile.previewImages?.length">
                <div
                  v-for="(img, index) in pptFile.previewImages"
                  :key="`${img}-${index}`"
                  class="preview-card"
                >
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
        '通过 AI 创业就业助手平台，为用户提供商业计划书生成、品牌文案生成、产品设计助手、路演 PPT 助手、图片生成等一体化能力。',
      businessModel: '基础功能免费，高级生成会员订阅，比赛指导服务与企业定制服务收费。',
      competitiveAdvantage:
        '功能链条完整、适合比赛展示、生成速度快、可视化表达强、面向创业场景更聚焦。',
      teamInfo: '前端2人、后端1人、AI工程师1人、产品策划1人',
      stage: 'MVP 验证期',
      style: '比赛答辩型'
    })
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

    loading.value = true
    assignPptFile()

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

      const data = await generatePitchPpt({ ...form })

      if (!data) {
        ElMessage.error('生成失败')
        return
      }

      assignResult(data)
      ElMessage.success('路演 PPT 文案生成成功')
    } catch (error: any) {
      ElMessage.error(error?.message || '生成失败，请稍后重试')
    } finally {
      loading.value = false
      if (timer) clearInterval(timer)
    }
  }

  async function handleBuildPptFile() {
    if (!result.projectName || !result.slideList?.length) {
      ElMessage.warning('请先生成 PPT 文案')
      return
    }

    buildingFile.value = true

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

      const payload: PitchPptBuildRequest = {
        projectName: result.projectName,
        pptSummary: result.pptSummary,
        openingScript: result.openingScript,
        closingScript: result.closingScript,
        qaSuggestions: result.qaSuggestions,
        designStyleSuggestion: result.designStyleSuggestion,
        slideList: result.slideList
      }

      const data = await buildPitchPptFile(payload)

      if (!data) {
        ElMessage.error('PPT 文件生成失败')
        return
      }

      assignPptFile(data)
      ElMessage.success('PPT 文件生成成功')
    } catch (error: any) {
      ElMessage.error(error?.message || 'PPT 文件生成失败')
    } finally {
      buildingFile.value = false
      if (timer) clearInterval(timer)
    }
  }
</script>

<style scoped>
  .pitch-page {
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
    max-width: 860px;
  }

  .header-actions {
    display: flex;
    flex-wrap: wrap;
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
    flex-wrap: wrap;
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

  .slide-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .slide-card {
    border: 1px solid #ebeef5;
    border-radius: 12px;
    padding: 14px;
    background: #f8fafc;
  }

  .slide-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .slide-page {
    font-size: 13px;
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
    padding: 4px 10px;
    border-radius: 999px;
  }

  .slide-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .slide-block + .slide-block {
    margin-top: 12px;
  }

  .block-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 6px;
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

  .file-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
    padding: 14px 16px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #ebeef5;
    flex-wrap: wrap;
  }

  .file-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .file-tip {
    margin-top: 4px;
    font-size: 13px;
    color: #909399;
  }

  .file-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .download-link {
    display: inline-block;
    padding: 10px 16px;
    background: #67c23a;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .download-link:hover {
    opacity: 0.92;
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .preview-card {
    border: 1px solid #ebeef5;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
  }

  .preview-index {
    padding: 10px 12px;
    font-size: 13px;
    color: #606266;
    border-bottom: 1px solid #ebeef5;
    background: #fafafa;
  }

  .preview-card img {
    display: block;
    width: 100%;
    height: auto;
  }

  .empty-state {
    padding: 50px 0;
  }

  .empty-preview {
    padding: 20px 0 0;
  }

  @media (max-width: 1200px) {
    .page-body {
      grid-template-columns: 1fr;
    }

    .page-header {
      flex-direction: column;
    }
  }

  @media (max-width: 900px) {
    .preview-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<template>
  <div class="copywriting-page">
    <div class="page-header">
      <div class="header-left">
        <h2>AI品牌与文案生成</h2>
        <p>
          输入项目基础信息，一键生成品牌名称、品牌口号、官网首屏文案、海报文案、社媒文案、短视频脚本，并自动生成配图辅助理解与展示。
        </p>
      </div>
      <div class="header-actions">
        <el-button @click="fillDemo">一键填充示例</el-button>
        <el-button type="primary" :loading="loading" @click="handleGenerate">生成品牌文案</el-button>
      </div>
    </div>

    <div class="page-body">
      <div class="form-panel card">
        <div class="card-title">项目信息输入</div>

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
                  <el-option label="文化创意" value="文化创意" />
                  <el-option label="智慧教育" value="智慧教育" />
                  <el-option label="数字营销" value="数字营销" />
                  <el-option label="新消费品牌" value="新消费品牌" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="目标用户" prop="targetUsers">
                <el-input v-model="form.targetUsers" type="textarea" :rows="3" placeholder="如：高校创业团队、文创品牌主理人、独立开发者" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心产品/服务" prop="coreProduct">
                <el-input v-model="form.coreProduct" type="textarea" :rows="3" placeholder="请输入你的核心产品或服务内容" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="品牌调性" prop="brandTone">
                <el-select v-model="form.brandTone" placeholder="请选择品牌调性" style="width: 100%">
                  <el-option label="专业可信" value="专业可信" />
                  <el-option label="年轻活力" value="年轻活力" />
                  <el-option label="温暖治愈" value="温暖治愈" />
                  <el-option label="科技创新" value="科技创新" />
                  <el-option label="高端简洁" value="高端简洁" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="区域定位" prop="region">
                <el-input v-model="form.region" placeholder="如：甘肃 / 西北 / 全国高校市场" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="核心优势" prop="coreAdvantage">
                <el-input v-model="form.coreAdvantage" type="textarea" :rows="3" placeholder="如：AI生成效率高、内容包装完整、适合比赛与项目展示" />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="使用场景" prop="usageScenario">
                <el-input v-model="form.usageScenario" type="textarea" :rows="3" placeholder="如：比赛路演、官网展示、公众号宣传、海报推广、短视频传播" />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="输出风格" prop="style">
                <el-select v-model="form.style" placeholder="请选择输出风格" style="width: 100%">
                  <el-option label="比赛展示型" value="比赛展示型" />
                  <el-option label="品牌专业型" value="品牌专业型" />
                  <el-option label="传播营销型" value="传播营销型" />
                  <el-option label="创新包装型" value="创新包装型" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-footer">
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" :loading="loading" @click="handleGenerate">生成品牌文案</el-button>
          </div>
        </el-form>
      </div>

      <div v-loading="loading" :element-loading-text="loadingText" element-loading-background="rgba(255,255,255,0.76)" class="result-panel card">
        <div class="card-title">生成结果</div>

        <div v-if="!result.projectName && !loading" class="empty-state">
          <el-empty description="填写左侧信息后，点击“生成品牌文案”查看结果" />
        </div>

        <template v-if="result.projectName">
          <div class="result-top">
            <h3>{{ result.brandName }}</h3>
            <p>{{ result.brandSlogan }}</p>
          </div>

          <div class="result-vertical">
            <div class="result-section">
              <div class="section-title">品牌定位</div>
              <div class="section-content pre-wrap">{{ result.brandPositioning }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">品牌故事</div>
              <div class="section-content pre-wrap">{{ result.brandStory }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">品牌愿景</div>
              <div class="section-content pre-wrap">{{ result.brandVision }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">用户洞察</div>
              <div class="section-content pre-wrap">{{ result.targetAudienceInsight }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">品牌调性说明</div>
              <div class="section-content pre-wrap">{{ result.brandToneDescription }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">品牌关键词</div>
              <div class="section-content pre-wrap">{{ result.brandKeywords }}</div>
            </div>

            <div class="result-section highlight">
              <div class="section-title">官网首屏文案</div>
              <div class="hero-box">
                <div class="hero-title">{{ result.homepageHeroTitle }}</div>
                <div class="hero-subtitle">{{ result.homepageHeroSubtitle }}</div>
              </div>

              <div v-if="result.sceneImageMap?.heroScene" class="inline-image-block">
                <div class="inline-image-title">官网首屏场景图</div>
                <div class="single-image-card">
                  <img :src="getPreviewImage(result.sceneImageMap.heroScene)" alt="官网首屏场景图" crossorigin="anonymous" />
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">海报文案</div>
              <div class="section-content pre-wrap">{{ result.posterCopy }}</div>

              <div v-if="result.sceneImageMap?.posterScene" class="inline-image-block">
                <div class="inline-image-title">海报文案宣传图</div>
                <div class="single-image-card">
                  <img :src="getPreviewImage(result.sceneImageMap.posterScene)" alt="海报文案宣传图" crossorigin="anonymous" />
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">社媒文案</div>
              <div class="section-content pre-wrap">{{ result.socialMediaCopy }}</div>

              <div v-if="result.sceneImageMap?.socialScene" class="inline-image-block">
                <div class="inline-image-title">社媒传播配图</div>
                <div class="single-image-card">
                  <img :src="getPreviewImage(result.sceneImageMap.socialScene)" alt="社媒传播配图" crossorigin="anonymous" />
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">短视频脚本</div>
              <div class="section-content pre-wrap">{{ result.shortVideoScript }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">直播话术</div>
              <div class="section-content pre-wrap">{{ result.liveStreamScript }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">产品卖点</div>
              <div class="section-content pre-wrap">{{ result.productSellingPoints }}</div>

              <div v-if="result.sceneImageMap?.sellingPoints" class="inline-image-block">
                <div class="inline-image-title">产品卖点理解图</div>
                <div class="single-image-card">
                  <img :src="getPreviewImage(result.sceneImageMap.sellingPoints)" alt="产品卖点理解图" crossorigin="anonymous" />
                </div>
              </div>
            </div>

            <div class="result-section">
              <div class="section-title">活动主题</div>
              <div class="section-content pre-wrap">{{ result.campaignTheme }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">广告标题</div>
              <div class="section-content pre-wrap">{{ result.adTitleSet }}</div>
            </div>

            <div class="result-section">
              <div class="section-title">广告描述</div>
              <div class="section-content pre-wrap">{{ result.adDescriptionSet }}</div>
            </div>

            <div class="result-section" v-if="result.imagePrompts?.length">
              <div class="section-title">图片提示词</div>
              <div class="prompt-list">
                <div v-for="(item, index) in result.imagePrompts" :key="index" class="prompt-item">
                  <div class="prompt-index">提示词 {{ index + 1 }}</div>
                  <div class="section-content pre-wrap">{{ item }}</div>
                </div>
              </div>
            </div>

            <div class="result-section" v-if="result.sceneImageMap?.brandVisual">
              <div class="section-title">品牌主视觉图</div>
              <div class="single-image-card">
                <img :src="getPreviewImage(result.sceneImageMap.brandVisual)" alt="品牌主视觉图" crossorigin="anonymous" />
              </div>
            </div>

            <div class="result-section" v-if="result.imageUrls?.length">
              <div class="section-title">全部品牌配图</div>
              <div class="image-grid">
                <div v-for="(url, index) in result.imageUrls" :key="`${url}-${index}`" class="image-card">
                  <img :src="getPreviewImage(url)" :alt="`品牌配图${index + 1}`" crossorigin="anonymous" />
                </div>
              </div>
            </div>
          </div>

          <div class="result-actions">
            <el-button :loading="generatingImages" @click="handleGenerateImages">重新生成配图</el-button>
            <el-button @click="copyAllContent">复制全部文案</el-button>
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
  generateBrandCopywriting,
  generateBrandImages,
  previewBrandImage,
  type BrandCopywritingForm,
  type BrandCopywritingResult
} from '@/api/brand-copywriting'

defineOptions({ name: 'BrandCopywritingPage' })

const formRef = ref<FormInstance>()
const loading = ref(false)
const generatingImages = ref(false)
const loadingText = ref('正在准备生成...')

const form = reactive<BrandCopywritingForm>({
  projectName: '',
  industry: '',
  targetUsers: '',
  coreProduct: '',
  brandTone: '科技创新',
  coreAdvantage: '',
  usageScenario: '',
  region: '',
  style: '比赛展示型'
})

const createEmptyResult = (): BrandCopywritingResult => ({
  projectName: '',
  brandName: '',
  brandSlogan: '',
  brandPositioning: '',
  brandStory: '',
  brandVision: '',
  brandKeywords: '',
  targetAudienceInsight: '',
  brandToneDescription: '',
  homepageHeroTitle: '',
  homepageHeroSubtitle: '',
  posterCopy: '',
  socialMediaCopy: '',
  shortVideoScript: '',
  liveStreamScript: '',
  productSellingPoints: '',
  campaignTheme: '',
  adTitleSet: '',
  adDescriptionSet: '',
  imagePrompts: [],
  imageUrls: [],
  sceneImageMap: {}
})

const result = reactive<BrandCopywritingResult>(createEmptyResult())

const rules: FormRules = {
  projectName: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  industry: [{ required: true, message: '请选择行业赛道', trigger: 'change' }],
  targetUsers: [{ required: true, message: '请输入目标用户', trigger: 'blur' }],
  coreProduct: [{ required: true, message: '请输入核心产品/服务', trigger: 'blur' }],
  brandTone: [{ required: true, message: '请选择品牌调性', trigger: 'change' }],
  coreAdvantage: [{ required: true, message: '请输入核心优势', trigger: 'blur' }],
  usageScenario: [{ required: true, message: '请输入使用场景', trigger: 'blur' }]
}

const getPreviewImage = (url: string) => previewBrandImage(url)

const buildSceneImageMap = (imageUrls: string[]) => {
  const map: Record<string, string> = {}
  if (imageUrls.length > 0) map.brandVisual = imageUrls[0]
  if (imageUrls.length > 1) map.heroScene = imageUrls[1]
  if (imageUrls.length > 2) map.sellingPoints = imageUrls[2]
  if (imageUrls.length > 3) map.posterScene = imageUrls[3]
  if (imageUrls.length > 4) map.socialScene = imageUrls[4]
  return map
}

const handleGenerate = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    loading.value = true
    loadingText.value = '正在检查输入内容...'
    await new Promise((resolve) => setTimeout(resolve, 300))

    loadingText.value = '正在连接大模型接口...'
    await new Promise((resolve) => setTimeout(resolve, 400))

    loadingText.value = '正在生成品牌名称与核心文案...'
    const data = await generateBrandCopywriting({ ...form })

    Object.assign(result, createEmptyResult(), data || {})

    if (!result.sceneImageMap || Object.keys(result.sceneImageMap).length === 0) {
      result.sceneImageMap = buildSceneImageMap(result.imageUrls || [])
    }

    if (!result.imageUrls?.length && result.imagePrompts?.length) {
      loadingText.value = '正在生成品牌宣传配图...'
      await handleGenerateImages(true)
    }

    loadingText.value = '全部内容生成完成'
    ElMessage.success('品牌与文案生成成功')
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '生成失败，请稍后重试')
  } finally {
    loading.value = false
    loadingText.value = '正在准备生成...'
  }
}

const handleGenerateImages = async (silent = false) => {
  if (!result.projectName || !result.imagePrompts?.length) {
    if (!silent) ElMessage.warning('请先生成品牌文案')
    return
  }

  try {
    generatingImages.value = true

    const data = await generateBrandImages({
      projectName: result.projectName,
      imagePrompts: result.imagePrompts
    })

    const imageUrls = data?.imageUrls || []
    const sceneImageMap = data?.sceneImageMap || buildSceneImageMap(imageUrls)

    result.imageUrls = imageUrls
    result.sceneImageMap = sceneImageMap

    if (!silent) {
      ElMessage.success(
        result.imageUrls.length ? '品牌配图生成完成' : '图片接口调用成功，但未返回图片'
      )
    }
  } catch (error: any) {
    console.error(error)
    ElMessage.error(error?.response?.data?.msg || error?.message || '配图生成失败')
  } finally {
    generatingImages.value = false
  }
}

const handleReset = () => {
  formRef.value?.resetFields()
  Object.assign(result, createEmptyResult())
}

const fillDemo = () => {
  Object.assign(form, {
    projectName: '创文星球',
    industry: 'AI 创业助手',
    targetUsers: '高校创业团队、文创品牌主理人、独立开发者、创新项目负责人',
    coreProduct: '基于AI的品牌命名、品牌定位、营销文案生成、宣传配图生成与项目包装平台',
    brandTone: '科技创新',
    coreAdvantage: '既能输出完整品牌表达，又能结合比赛展示场景快速生成高质量宣传内容',
    usageScenario: '比赛路演、项目官网、公众号推文、短视频推广、活动海报、品牌展示页',
    region: '甘肃 + 全国高校市场',
    style: '比赛展示型'
  })
}

const copyAllContent = async () => {
  const text = `
项目名称：${result.projectName}
品牌名称：${result.brandName}
品牌口号：${result.brandSlogan}

品牌定位：
${result.brandPositioning}

品牌故事：
${result.brandStory}

品牌愿景：
${result.brandVision}

用户洞察：
${result.targetAudienceInsight}

品牌调性说明：
${result.brandToneDescription}

官网首屏标题：
${result.homepageHeroTitle}

官网首屏副标题：
${result.homepageHeroSubtitle}

海报文案：
${result.posterCopy}

社媒文案：
${result.socialMediaCopy}

短视频脚本：
${result.shortVideoScript}

直播话术：
${result.liveStreamScript}

产品卖点：
${result.productSellingPoints}

活动主题：
${result.campaignTheme}

广告标题：
${result.adTitleSet}

广告描述：
${result.adDescriptionSet}
    `.trim()

  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('全部文案已复制')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped lang="scss">
.copywriting-page {
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
  padding: 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 14px;
  box-sizing: border-box;
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
  z-index: 3;
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
  padding: 16px 18px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
  border-radius: 12px;

  h3 {
    margin: 0 0 8px;
    font-size: 22px;
    color: #303133;
  }

  p {
    margin: 0;
    font-size: 15px;
    color: #409eff;
    font-weight: 600;
    line-height: 1.8;
  }
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

  &:hover {
    border-color: #dcdfe6;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  }

  &.highlight {
    border-color: #dbeafe;
    background: #f8fbff;
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

.hero-box {
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #ebeef5;
}

.hero-title {
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  line-height: 1.5;
}

.hero-subtitle {
  font-size: 14px;
  color: #606266;
  line-height: 1.9;
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
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  background: #f8fafc;

  img {
    display: block;
    width: 100%;
    max-height: 360px;
    object-fit: cover;
  }
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
  z-index: 5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 16px -20px -20px;
  padding: 14px 20px 16px;
  background: #fff;
  border-top: 1px solid #ebeef5;
  border-radius: 0 0 14px 14px;
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
  }
}

@media (max-width: 768px) {
  .copywriting-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    padding: 18px;
  }

  .header-actions,
  .result-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .header-actions .el-button,
  .result-actions .el-button,
  .form-footer .el-button {
    flex: 1;
  }

  .image-grid {
    grid-template-columns: 1fr;
  }
}
</style>
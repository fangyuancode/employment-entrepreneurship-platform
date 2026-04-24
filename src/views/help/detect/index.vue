<template>
  <div class="general-detect-page">
    <div class="page-header card">
      <div>
        <h2>通用目标检测</h2>
        <p> 基于 YOLOv8n 通用模型，对图片中的人物、车辆、动物、日常物体等目标进行识别与统计。 </p>
      </div>
      <div class="header-actions">
        <el-button :loading="modelLoading" @click="handleCheckModel">检查模型</el-button>
      </div>
    </div>

    <div class="content-layout">
      <div class="card input-card">
        <div class="section-title">上传检测图片</div>

        <el-upload
          class="upload-block"
          drag
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          accept=".jpg,.jpeg,.png,.bmp,.webp"
          :on-change="handleImageChange"
          :on-remove="handleImageRemove"
        >
          <div class="el-upload__text">拖拽图片到这里，或 <em>点击上传</em></div>
          <template #tip>
            <div class="upload-tip">支持 jpg / jpeg / png / bmp / webp。</div>
          </template>
        </el-upload>

        <div class="form-item">
          <div class="form-label">置信度阈值</div>
          <el-slider v-model="confidence" :min="0.1" :max="0.9" :step="0.05" show-input />
        </div>

        <div class="form-footer">
          <el-button @click="resetResult">重置</el-button>
          <el-button type="primary" :loading="loading" @click="handleDetect">开始检测</el-button>
        </div>

        <div class="model-box">
          <div class="model-title">模型状态</div>
          <div class="model-text">{{ modelStatusText }}</div>
          <div v-if="modelInfo.classPreview.length" class="tag-wrap compact">
            <el-tag v-for="item in modelInfo.classPreview" :key="item" round effect="plain">
              {{ item }}
            </el-tag>
          </div>
        </div>
      </div>

      <div
        v-loading="loading"
        element-loading-text="正在分析图片中的目标..."
        element-loading-background="rgba(255,255,255,0.72)"
        class="result-area"
      >
        <div class="overview-grid">
          <div class="card overview-card">
            <div class="metric-label">检测目标数</div>
            <div class="metric-value">{{ result.totalCount }}</div>
          </div>
          <div class="card overview-card">
            <div class="metric-label">目标类别数</div>
            <div class="metric-value">{{ classKeys(result.classCountMap).length }}</div>
          </div>
          <div class="card overview-card">
            <div class="metric-label">当前阈值</div>
            <div class="metric-value small">{{
              Number(result.confidence || confidence).toFixed(2)
            }}</div>
          </div>
        </div>

        <div class="double-grid">
          <div class="card block-card">
            <div class="section-head"><div class="section-title">原始图片</div></div>
            <div v-if="!displaySourceImageUrl" class="empty-wrap">
              <el-empty description="上传后这里会显示原始图片" />
            </div>
            <div v-else class="preview-wrap">
              <img :src="displaySourceImageUrl" alt="原始图片" class="result-image" />
            </div>
          </div>

          <div class="card block-card">
            <div class="section-head"><div class="section-title">检测结果图</div></div>
            <div v-if="!result.resultImageUrl && !loading" class="empty-wrap">
              <el-empty description="检测完成后这里会显示结果图片" />
            </div>
            <div v-else-if="result.resultImageUrl" class="preview-wrap">
              <img :src="withTs(result.resultImageUrl)" alt="检测结果图" class="result-image" />
            </div>
          </div>
        </div>

        <div class="double-grid">
          <div class="card block-card">
            <div class="section-head"><div class="section-title">结果摘要</div></div>
            <div class="summary-box">{{ result.summary || '暂无结果摘要' }}</div>
          </div>
          <div class="card block-card">
            <div class="section-head"><div class="section-title">类别统计</div></div>
            <div class="tag-wrap">
              <el-tag v-for="(value, key) in result.classCountMap" :key="key" effect="plain" round>
                {{ key }}：{{ value }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="card block-card">
          <div class="section-head"><div class="section-title">目标明细</div></div>
          <el-table :data="result.detections" stripe border>
            <el-table-column prop="classId" label="类别ID" width="90" />
            <el-table-column prop="className" label="类别" width="180" />
            <el-table-column label="置信度" width="120">
              <template #default="{ row }">
                {{ Number(row.confidence || 0).toFixed(4) }}
              </template>
            </el-table-column>
            <el-table-column label="边界框" min-width="260">
              <template #default="{ row }">
                {{ formatBox(row.box) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, reactive, ref } from 'vue'
  import type { UploadFile } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import {
    buildMediaUrl,
    checkGeneralModel,
    detectGeneralImage,
    type GeneralImageDetectResponse,
    type GeneralModelCheckResponse
  } from '@/api/general-detection'

  const loading = ref(false)
  const modelLoading = ref(false)
  const selectedImageFile = ref<File | null>(null)
  const localPreviewUrl = ref('')
  const confidence = ref(0.25)

  const result = reactive<GeneralImageDetectResponse>({
    sourceFileName: '',
    sourceImagePath: '',
    resultImagePath: '',
    sourceImageUrl: '',
    resultImageUrl: '',
    totalCount: 0,
    classCountMap: {},
    detections: [],
    summary: '',
    confidence: 0.25
  })

  const modelInfo = reactive<GeneralModelCheckResponse>({
    modelPath: '',
    modelExists: false,
    classPreview: [],
    classCount: 0,
    downloadUrl: ''
  })

  const modelStatusText = computed(() => {
    if (!modelInfo.modelPath) return '尚未检查模型。'
    return modelInfo.modelExists
      ? `模型已就绪：共支持约 ${modelInfo.classCount} 个类别。`
      : '模型尚未就绪，请先检查或下载模型。'
  })

  const displaySourceImageUrl = computed(() => {
    if (localPreviewUrl.value) return localPreviewUrl.value
    return buildMediaUrl(result.sourceImageUrl)
  })

  function classKeys(map: Record<string, number>) {
    return Object.keys(map || {})
  }

  function withTs(url: string) {
    const target = buildMediaUrl(url)
    if (!target) return ''
    return `${target}${target.includes('?') ? '&' : '?'}t=${Date.now()}`
  }

  function formatBox(box: number[] = []) {
    if (!Array.isArray(box) || box.length !== 4) return '-'
    return `[${box.map((item) => Number(item || 0).toFixed(2)).join(', ')}]`
  }

  function resetResult() {
    result.sourceFileName = ''
    result.sourceImagePath = ''
    result.resultImagePath = ''
    result.sourceImageUrl = ''
    result.resultImageUrl = ''
    result.totalCount = 0
    result.classCountMap = {}
    result.detections = []
    result.summary = ''
    result.confidence = confidence.value
  }

  function revokeLocalPreview() {
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
      localPreviewUrl.value = ''
    }
  }

  function handleImageChange(uploadFile: UploadFile) {
    const raw = uploadFile.raw
    if (!raw) return
    selectedImageFile.value = raw
    revokeLocalPreview()
    localPreviewUrl.value = URL.createObjectURL(raw)
    resetResult()
  }

  function handleImageRemove() {
    selectedImageFile.value = null
    revokeLocalPreview()
    resetResult()
  }

  async function handleCheckModel() {
    modelLoading.value = true
    try {
      const { data } = await checkGeneralModel()
      if (Number(data.code) !== 200) {
        ElMessage.error(data.msg || '模型检查失败')
        return
      }
      Object.assign(modelInfo, data.data || {})
      ElMessage.success(data.msg || '模型已就绪')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '模型检查失败')
    } finally {
      modelLoading.value = false
    }
  }

  async function handleDetect() {
    if (!selectedImageFile.value) {
      ElMessage.warning('请先上传图片')
      return
    }

    loading.value = true
    try {
      const { data } = await detectGeneralImage(selectedImageFile.value, confidence.value)
      if (Number(data.code) !== 200) {
        ElMessage.error(data.msg || '通用目标检测失败')
        return
      }
      Object.assign(result, data.data || {})
      ElMessage.success(data.msg || '通用目标检测完成')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '通用目标检测失败')
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void handleCheckModel()
  })
</script>

<style scoped>
  .general-detect-page {
    padding: 16px;
    background: #f5f7fa;
    min-height: 100%;
  }

  .card {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    border: 1px solid #ebeef5;
  }

  .page-header {
    padding: 22px 24px;
    margin-bottom: 16px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  .page-header h2 {
    margin: 0 0 8px;
    font-size: 24px;
    color: #1f2937;
  }

  .page-header p {
    margin: 0;
    color: #606266;
    line-height: 1.75;
  }

  .content-layout {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 16px;
  }

  .input-card,
  .block-card,
  .overview-card {
    padding: 18px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .section-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .upload-block {
    margin-top: 16px;
  }

  .form-item {
    margin-top: 18px;
  }

  .form-label {
    margin-bottom: 10px;
    color: #606266;
    font-size: 14px;
  }

  .form-footer {
    display: flex;
    gap: 12px;
    margin-top: 18px;
  }

  .model-box {
    margin-top: 18px;
    padding: 14px;
    border-radius: 12px;
    background: #f8fafc;
    border: 1px solid #ebeef5;
  }

  .model-title {
    font-weight: 600;
    margin-bottom: 8px;
    color: #1f2937;
  }

  .model-text {
    color: #606266;
    line-height: 1.7;
    font-size: 14px;
  }

  .result-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .metric-label {
    color: #909399;
    font-size: 14px;
  }

  .metric-value {
    margin-top: 8px;
    font-size: 28px;
    line-height: 1.2;
    font-weight: 700;
    color: #1f2937;
  }

  .metric-value.small {
    font-size: 22px;
  }

  .double-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .preview-wrap {
    width: 100%;
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #ebeef5;
  }

  .result-image {
    display: block;
    width: 100%;
    max-height: 620px;
    object-fit: contain;
  }

  .empty-wrap {
    min-height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #dcdfe6;
  }

  .summary-box {
    min-height: 120px;
    padding: 14px 16px;
    border-radius: 12px;
    background: #f8fafc;
    color: #606266;
    line-height: 1.85;
    white-space: pre-wrap;
  }

  .tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .tag-wrap.compact {
    margin-top: 10px;
  }

  @media (max-width: 1100px) {
    .content-layout {
      grid-template-columns: 1fr;
    }

    .overview-grid,
    .double-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

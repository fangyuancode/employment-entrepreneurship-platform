<template>
  <div class="vision-page">
    <div class="page-header card">
      <div>
        <h2>视觉分析助手</h2>
        <p>
          基于 Python + OpenCV + YOLO
          的可视化分析工具，支持图像质量分析、边缘与轮廓可视化、伪彩热力图生成，以及车辆目标裁剪画廊展示。
        </p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="vision-tabs">
      <el-tab-pane label="图像视觉分析" name="analyze">
        <div class="layout-grid">
          <div class="card input-card">
            <div class="section-title">上传分析图片</div>
            <el-upload
              drag
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              accept=".jpg,.jpeg,.png"
              :on-change="handleAnalyzeChange"
              :on-remove="handleAnalyzeRemove"
            >
              <div class="el-upload__text">拖拽图片到这里，或 <em>点击上传</em></div>
              <template #tip>
                <div class="upload-tip">支持 jpg / jpeg / png，适合展示项目的视觉能力。</div>
              </template>
            </el-upload>

            <div class="form-footer">
              <el-button @click="resetAnalyzeResult">重置</el-button>
              <el-button type="primary" :loading="analyzeLoading" @click="submitAnalyze">
                开始分析
              </el-button>
            </div>
          </div>

          <div
            class="result-area"
            v-loading="analyzeLoading"
            element-loading-text="正在进行图像视觉分析..."
            element-loading-background="rgba(255,255,255,0.72)"
          >
            <div class="overview-grid">
              <div class="card overview-card">
                <div class="metric-label">分辨率</div>
                <div class="metric-value small">{{ formatResolution }}</div>
              </div>
              <div class="card overview-card">
                <div class="metric-label">清晰度评分</div>
                <div class="metric-value">{{ analyzeResult.metrics.blurScore || 0 }}</div>
              </div>
              <div class="card overview-card">
                <div class="metric-label">轮廓数量</div>
                <div class="metric-value">{{ analyzeResult.contourCount || 0 }}</div>
              </div>
              <div class="card overview-card color-card">
                <div class="metric-label">主色调</div>
                <div class="color-row">
                  <span
                    class="color-block"
                    :style="{ background: analyzeResult.metrics.dominantColor?.hex || '#f3f4f6' }"
                  />
                  <span class="metric-text">{{
                    analyzeResult.metrics.dominantColor?.hex || '-'
                  }}</span>
                </div>
              </div>
            </div>

            <div class="double-grid">
              <div class="card block-card">
                <div class="section-head"><div class="section-title">原始图片</div></div>
                <div v-if="!analyzePreviewUrl" class="empty-wrap">
                  <el-empty description="上传后这里显示原始图" />
                </div>
                <div v-else class="preview-wrap"
                  ><img :src="analyzePreviewUrl" class="result-image" alt="原始图"
                /></div>
              </div>

              <div class="card block-card">
                <div class="section-head"><div class="section-title">分析摘要</div></div>
                <div class="summary-box">{{ analyzeResult.summary || '暂无分析结果' }}</div>
                <div class="metrics-list">
                  <div>亮度：{{ analyzeResult.metrics.brightness || 0 }}</div>
                  <div>对比度：{{ analyzeResult.metrics.contrast || 0 }}</div>
                  <div>曝光判断：{{ analyzeResult.metrics.exposureLevel || '-' }}</div>
                  <div>图像质量：{{ analyzeResult.metrics.qualityLevel || '-' }}</div>
                  <div>宽高比：{{ analyzeResult.metrics.aspectRatio || 0 }}</div>
                </div>
              </div>
            </div>

            <div class="triple-grid">
              <div v-for="item in analyzeImageCards" :key="item.key" class="card block-card">
                <div class="section-head"
                  ><div class="section-title">{{ item.title }}</div></div
                >
                <div v-if="!item.url" class="empty-wrap">
                  <el-empty description="暂无图像结果" />
                </div>
                <div v-else class="preview-wrap"
                  ><img :src="withTs(item.url)" class="result-image" :alt="item.title"
                /></div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="目标裁剪画廊" name="gallery">
        <div class="layout-grid">
          <div class="card input-card">
            <div class="section-title">上传检测图片</div>
            <el-upload
              drag
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              accept=".jpg,.jpeg,.png"
              :on-change="handleGalleryChange"
              :on-remove="handleGalleryRemove"
            >
              <div class="el-upload__text">拖拽图片到这里，或 <em>点击上传</em></div>
              <template #tip>
                <div class="upload-tip"
                  >会自动生成检测框结果、检测热力图，以及每个目标的裁剪画廊。</div
                >
              </template>
            </el-upload>

            <div class="form-footer">
              <el-button @click="resetGalleryResult">重置</el-button>
              <el-button type="primary" :loading="galleryLoading" @click="submitGallery">
                生成画廊
              </el-button>
            </div>
          </div>

          <div
            class="result-area"
            v-loading="galleryLoading"
            element-loading-text="正在生成目标裁剪画廊..."
            element-loading-background="rgba(255,255,255,0.72)"
          >
            <div class="overview-grid">
              <div class="card overview-card">
                <div class="metric-label">识别目标数</div>
                <div class="metric-value">{{ galleryResult.totalCount || 0 }}</div>
              </div>
              <div class="card overview-card">
                <div class="metric-label">类别数</div>
                <div class="metric-value">{{
                  Object.keys(galleryResult.classCountMap || {}).length
                }}</div>
              </div>
            </div>

            <div class="double-grid">
              <div class="card block-card">
                <div class="section-head"><div class="section-title">原始图片</div></div>
                <div v-if="!galleryPreviewUrl" class="empty-wrap">
                  <el-empty description="上传后这里显示原始图" />
                </div>
                <div v-else class="preview-wrap"
                  ><img :src="galleryPreviewUrl" class="result-image" alt="原始图"
                /></div>
              </div>

              <div class="card block-card">
                <div class="section-head"><div class="section-title">检测结果图</div></div>
                <div v-if="!galleryResult.resultImageUrl" class="empty-wrap">
                  <el-empty description="生成后显示检测结果图" />
                </div>
                <div v-else class="preview-wrap"
                  ><img
                    :src="withTs(galleryResult.resultImageUrl)"
                    class="result-image"
                    alt="检测结果图"
                /></div>
              </div>
            </div>

            <div class="double-grid">
              <div class="card block-card">
                <div class="section-head"><div class="section-title">检测热力图</div></div>
                <div v-if="!galleryResult.heatmap?.heatmapImageUrl" class="empty-wrap">
                  <el-empty description="生成后显示热力图" />
                </div>
                <div v-else class="preview-wrap"
                  ><img
                    :src="withTs(galleryResult.heatmap.heatmapImageUrl)"
                    class="result-image"
                    alt="检测热力图"
                /></div>
              </div>

              <div class="card block-card">
                <div class="section-head"><div class="section-title">统计摘要</div></div>
                <div class="summary-box">{{ galleryResult.summary || '暂无摘要' }}</div>
                <div class="tag-wrap">
                  <el-tag
                    v-for="(value, key) in galleryResult.classCountMap"
                    :key="key"
                    effect="plain"
                    round
                  >
                    {{ key }}：{{ value }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="card block-card">
              <div class="section-head"><div class="section-title">目标裁剪画廊</div></div>
              <div v-if="!galleryResult.crops?.length" class="empty-wrap">
                <el-empty description="暂无裁剪结果" />
              </div>
              <div v-else class="crop-grid">
                <div v-for="item in galleryResult.crops" :key="item.cropFileName" class="crop-item">
                  <div class="crop-image-wrap">
                    <img
                      :src="withTs(item.cropImageUrl)"
                      :alt="item.className"
                      class="crop-image"
                    />
                  </div>
                  <div class="crop-meta">
                    <div class="crop-title">{{ item.className }} #{{ item.index }}</div>
                    <div>置信度：{{ Number(item.confidence || 0).toFixed(4) }}</div>
                    <div>尺寸：{{ item.width }} × {{ item.height }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    analyzeVisionImage,
    createDetectionGallery,
    type VisionAnalyzeResponse,
    type VisionGalleryResponse
  } from '@/api/vision-analysis'

  const activeTab = ref('analyze')
  const analyzeLoading = ref(false)
  const galleryLoading = ref(false)

  const analyzeFile = ref<File | null>(null)
  const galleryFile = ref<File | null>(null)
  const analyzePreviewUrl = ref('')
  const galleryPreviewUrl = ref('')

  const createDefaultAnalyzeResult = (): VisionAnalyzeResponse => ({
    sourceFileName: '',
    sourceImagePath: '',
    sourceImageUrl: '',
    metrics: {
      width: 0,
      height: 0,
      aspectRatio: 0,
      brightness: 0,
      contrast: 0,
      blurScore: 0,
      qualityLevel: '',
      exposureLevel: '',
      dominantColor: { rgb: [], hex: '' }
    },
    summary: '',
    contourCount: 0,
    derivedImages: {
      gray: { fileName: '', imagePath: '', imageUrl: '', title: '灰度图' },
      edge: { fileName: '', imagePath: '', imageUrl: '', title: '边缘提取图' },
      binary: { fileName: '', imagePath: '', imageUrl: '', title: '二值化图' },
      contour: { fileName: '', imagePath: '', imageUrl: '', title: '轮廓可视化图' },
      heatmap: { fileName: '', imagePath: '', imageUrl: '', title: '伪彩热力图' },
      sharpen: { fileName: '', imagePath: '', imageUrl: '', title: '锐化增强图' }
    }
  })

  const createDefaultGalleryResult = (): VisionGalleryResponse => ({
    sourceFileName: '',
    sourceImagePath: '',
    sourceImageUrl: '',
    resultImagePath: '',
    resultImageUrl: '',
    resultFileName: '',
    totalCount: 0,
    classCountMap: {},
    detections: [],
    heatmap: {
      heatmapFileName: '',
      heatmapImagePath: '',
      heatmapImageUrl: ''
    },
    crops: [],
    summary: ''
  })

  const analyzeResult = reactive<VisionAnalyzeResponse>(createDefaultAnalyzeResult())
  const galleryResult = reactive<VisionGalleryResponse>(createDefaultGalleryResult())

  const analyzeImageCards = computed(() => {
    const items = analyzeResult.derivedImages
    return [
      { key: 'gray', title: items.gray.title, url: items.gray.imageUrl },
      { key: 'edge', title: items.edge.title, url: items.edge.imageUrl },
      { key: 'binary', title: items.binary.title, url: items.binary.imageUrl },
      { key: 'contour', title: items.contour.title, url: items.contour.imageUrl },
      { key: 'heatmap', title: items.heatmap.title, url: items.heatmap.imageUrl },
      { key: 'sharpen', title: items.sharpen.title, url: items.sharpen.imageUrl }
    ]
  })

  const formatResolution = computed(() => {
    const { width, height } = analyzeResult.metrics
    return width && height ? `${width} × ${height}` : '-'
  })

  function revokeObjectUrl(url: string) {
    if (url && url.startsWith('blob:')) URL.revokeObjectURL(url)
  }

  function withTs(url: string) {
    if (!url) return ''
    if (url.startsWith('blob:') || url.startsWith('data:')) return url
    return `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`
  }

  function handleAnalyzeChange(file: any) {
    const rawFile = file.raw
    if (!rawFile) return
    analyzeFile.value = rawFile
    Object.assign(analyzeResult, createDefaultAnalyzeResult())
    revokeObjectUrl(analyzePreviewUrl.value)
    analyzePreviewUrl.value = URL.createObjectURL(rawFile)
  }

  function handleAnalyzeRemove() {
    analyzeFile.value = null
    revokeObjectUrl(analyzePreviewUrl.value)
    analyzePreviewUrl.value = ''
  }

  function handleGalleryChange(file: any) {
    const rawFile = file.raw
    if (!rawFile) return
    galleryFile.value = rawFile
    Object.assign(galleryResult, createDefaultGalleryResult())
    revokeObjectUrl(galleryPreviewUrl.value)
    galleryPreviewUrl.value = URL.createObjectURL(rawFile)
  }

  function handleGalleryRemove() {
    galleryFile.value = null
    revokeObjectUrl(galleryPreviewUrl.value)
    galleryPreviewUrl.value = ''
  }

  function resetAnalyzeResult() {
    Object.assign(analyzeResult, createDefaultAnalyzeResult())
    analyzeFile.value = null
    revokeObjectUrl(analyzePreviewUrl.value)
    analyzePreviewUrl.value = ''
  }

  function resetGalleryResult() {
    Object.assign(galleryResult, createDefaultGalleryResult())
    galleryFile.value = null
    revokeObjectUrl(galleryPreviewUrl.value)
    galleryPreviewUrl.value = ''
  }

  async function submitAnalyze() {
    if (!analyzeFile.value) {
      ElMessage.warning('请先选择一张图片')
      return
    }
    analyzeLoading.value = true
    try {
      const data = await analyzeVisionImage(analyzeFile.value)
      Object.assign(analyzeResult, data)
      ElMessage.success('图像视觉分析完成')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '图像视觉分析失败')
    } finally {
      analyzeLoading.value = false
    }
  }

  async function submitGallery() {
    if (!galleryFile.value) {
      ElMessage.warning('请先选择一张图片')
      return
    }
    galleryLoading.value = true
    try {
      const data = await createDetectionGallery(galleryFile.value)
      Object.assign(galleryResult, data)
      ElMessage.success('目标裁剪画廊生成完成')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '目标裁剪画廊生成失败')
    } finally {
      galleryLoading.value = false
    }
  }
</script>

<style scoped>
  .vision-page {
    padding: 18px;
    background: #f6f8fb;
    min-height: 100%;
  }

  .card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
    border: 1px solid #edf1f5;
  }

  .page-header {
    padding: 24px 26px;
    margin-bottom: 16px;
  }

  .page-header h2 {
    margin: 0 0 10px;
    font-size: 24px;
    color: #1f2937;
  }

  .page-header p {
    margin: 0;
    color: #6b7280;
    line-height: 1.75;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 340px 1fr;
    gap: 16px;
    align-items: start;
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
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .upload-block {
    margin-top: 16px;
  }

  .upload-tip {
    color: #909399;
    line-height: 1.6;
  }

  .form-footer {
    display: flex;
    gap: 12px;
    margin-top: 18px;
  }

  .result-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .metric-label {
    color: #6b7280;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
  }

  .metric-value.small,
  .metric-text {
    font-size: 16px;
    font-weight: 600;
  }

  .color-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-block {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    display: inline-block;
  }

  .double-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .triple-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  .preview-wrap {
    background: #f8fafc;
    border-radius: 14px;
    padding: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 260px;
  }

  .result-image {
    width: 100%;
    max-height: 420px;
    object-fit: contain;
    border-radius: 12px;
  }

  .summary-box,
  .metrics-list {
    color: #4b5563;
    line-height: 1.9;
    font-size: 14px;
  }

  .metrics-list {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #eef2f7;
  }

  .tag-wrap {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .empty-wrap {
    min-height: 240px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .crop-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .crop-item {
    border: 1px solid #eef2f7;
    border-radius: 14px;
    overflow: hidden;
    background: #fafbfc;
  }

  .crop-image-wrap {
    height: 180px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
  }

  .crop-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .crop-meta {
    padding: 12px;
    color: #4b5563;
    line-height: 1.8;
    font-size: 13px;
  }

  .crop-title {
    font-size: 15px;
    color: #111827;
    font-weight: 600;
    margin-bottom: 4px;
  }

  @media (max-width: 1200px) {
    .layout-grid,
    .double-grid,
    .triple-grid,
    .crop-grid,
    .overview-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

<template>
  <div class="vehicle-page">
    <div class="page-header card">
      <div class="header-left">
        <h2>车辆识别助手</h2>
        <p>
          车辆识别服务，支持图片识别、视频识别、原始媒体回显、识别结果回显，以及实时视频识别。
        </p>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="vehicle-tabs">
      <!-- 图片识别 -->
      <el-tab-pane label="图片车辆识别" name="image">
        <div class="content-layout">
          <div class="card input-card">
            <div class="section-title">上传识别图片</div>

            <el-upload
              class="upload-block"
              drag
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              accept=".jpg,.jpeg,.png"
              :on-change="handleImageChange"
              :on-remove="handleImageRemove"
            >
              <div class="el-upload__text">拖拽图片到这里，或 <em>点击上传</em></div>
              <template #tip>
                <div class="upload-tip">支持 jpg / jpeg / png。</div>
              </template>
            </el-upload>

            <div class="form-footer">
              <el-button @click="resetImageResult">重置</el-button>
              <el-button type="primary" :loading="imageLoading" @click="handleImageDetect">
                开始图片识别
              </el-button>
            </div>
          </div>

          <div
            v-loading="imageLoading"
            element-loading-text="正在识别图片中的车辆目标..."
            element-loading-background="rgba(255,255,255,0.72)"
            class="result-area"
          >
            <div class="overview-grid">
              <div class="card overview-card">
                <div class="metric-label">识别目标数</div>
                <div class="metric-value">{{ imageResult.totalCount }}</div>
              </div>
              <div class="card overview-card">
                <div class="metric-label">车辆类别数</div>
                <div class="metric-value">{{ classKeys(imageResult.classCountMap).length }}</div>
              </div>
            </div>

            <div class="double-grid">
              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">原始图片</div>
                </div>
                <div v-if="!displaySourceImageUrl" class="empty-wrap">
                  <el-empty description="上传后这里会显示原始图片" />
                </div>
                <div v-else class="preview-wrap">
                  <img :src="displaySourceImageUrl" alt="原始图片" class="result-image" />
                </div>
              </div>

              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">识别结果图</div>
                </div>
                <div v-if="!imageResult.resultImageUrl && !imageLoading" class="empty-wrap">
                  <el-empty description="识别完成后这里会显示结果图片" />
                </div>
                <div v-else-if="imageResult.resultImageUrl" class="preview-wrap">
                  <img
                    :src="withTs(imageResult.resultImageUrl)"
                    alt="车辆识别结果图"
                    class="result-image"
                  />
                </div>
              </div>
            </div>

            <div class="double-grid">
              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">结果摘要</div>
                </div>
                <div class="summary-box">
                  {{ imageResult.summary || '暂无结果摘要' }}
                </div>
              </div>

              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">类别统计</div>
                </div>
                <div class="tag-wrap">
                  <el-tag
                    v-for="(value, key) in imageResult.classCountMap"
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
              <div class="section-head">
                <div class="section-title">目标明细</div>
              </div>

              <el-table :data="imageResult.detections" stripe border>
                <el-table-column prop="className" label="类别" width="140" />
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
      </el-tab-pane>

      <!-- 视频识别 -->
      <el-tab-pane label="视频车辆识别" name="video">
        <div class="content-layout">
          <div class="card input-card">
            <div class="section-title">上传识别视频</div>

            <el-upload
              class="upload-block"
              drag
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              accept=".mp4,.avi,.mov,.mkv"
              :on-change="handleVideoChange"
              :on-remove="handleVideoRemove"
            >
              <div class="el-upload__text">拖拽视频到这里，或 <em>点击上传</em></div>
              <template #tip>
                <div class="upload-tip">
                  支持 mp4 / avi / mov /
                  mkv。上传后先显示本地原视频，识别完成后再显示后端生成的可播放预览视频。
                </div>
              </template>
            </el-upload>

            <div class="form-footer">
              <el-button @click="resetVideoResult">重置</el-button>
              <el-button type="primary" :loading="videoLoading" @click="handleVideoDetect">
                开始视频识别
              </el-button>
            </div>
          </div>

          <div
            v-loading="videoLoading"
            element-loading-text="正在逐帧分析视频中的车辆目标..."
            element-loading-background="rgba(255,255,255,0.72)"
            class="result-area"
          >
            <div class="overview-grid">
              <div class="card overview-card">
                <div class="metric-label">视频帧数</div>
                <div class="metric-value">{{ videoResult.totalFrames }}</div>
              </div>
              <div class="card overview-card">
                <div class="metric-label">累计检测数</div>
                <div class="metric-value">{{ videoResult.totalDetections }}</div>
              </div>
            </div>

            <div class="double-grid">
              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">原始视频</div>
                </div>

                <div v-if="!displaySourceVideoUrl" class="empty-wrap">
                  <el-empty description="上传后这里会显示原始视频" />
                </div>

                <div v-else class="preview-wrap video-wrap">
                  <video
                    :key="displaySourceVideoUrl"
                    :src="displaySourceVideoUrl"
                    controls
                    preload="metadata"
                    playsinline
                    class="result-video"
                  >
                    当前浏览器不支持视频播放
                  </video>
                </div>
              </div>

              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">识别结果视频</div>
                </div>

                <div v-if="!videoResult.resultVideoUrl && !videoLoading" class="empty-wrap">
                  <el-empty description="识别完成后这里会显示结果视频" />
                </div>

                <div v-else-if="videoResult.resultVideoUrl" class="preview-wrap video-wrap">
                  <video
                    :key="videoResult.resultVideoUrl"
                    :src="withTs(videoResult.resultVideoUrl)"
                    controls
                    preload="metadata"
                    playsinline
                    class="result-video"
                  >
                    当前浏览器不支持视频播放
                  </video>
                </div>
              </div>
            </div>

            <div class="double-grid">
              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">结果摘要</div>
                </div>
                <div class="summary-box">
                  {{ videoResult.summary || '暂无结果摘要' }}
                </div>
              </div>

              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">类别统计</div>
                </div>
                <div class="tag-wrap">
                  <el-tag
                    v-for="(value, key) in videoResult.classCountMap"
                    :key="key"
                    effect="plain"
                    round
                  >
                    {{ key }}：{{ value }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="card block-card" v-if="videoResult.codecUsed">
              <div class="section-head">
                <div class="section-title">编码信息</div>
              </div>
              <div class="summary-box">当前结果视频编码器：{{ videoResult.codecUsed }}</div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 实时视频识别 -->
      <el-tab-pane label="实时视频识别" name="realtime">
        <div class="content-layout">
          <div class="card input-card">
            <div class="section-title">实时识别控制台</div>

            <el-form label-width="90px">
              <el-form-item label="摄像头索引">
                <el-input-number v-model="cameraIndex" :min="0" :max="10" />
              </el-form-item>
            </el-form>

            <div class="form-footer left-footer">
              <el-button type="primary" :loading="realtimeLoading" @click="handleStartRealtime">
                启动实时识别
              </el-button>
              <el-button :disabled="!realtimeRunning" @click="handleStopRealtime">
                停止实时识别
              </el-button>
            </div>

            <div class="tips-box">
              <div>1. 需要本机有可用摄像头。</div>
              <div>2. 前端和 Python 服务最好运行在同一台机器。</div>
              <div>3. 若服务器没有摄像头，实时识别将无法启动。</div>
            </div>
          </div>

          <div class="result-area">
            <div class="overview-grid">
              <div class="card overview-card">
                <div class="metric-label">运行状态</div>
                <div class="metric-value small-value">
                  {{ realtimeRunning ? '运行中' : '未启动' }}
                </div>
              </div>
              <div class="card overview-card">
                <div class="metric-label">当前帧检测数</div>
                <div class="metric-value">{{ realtimeStatus.lastDetectionCount }}</div>
              </div>
            </div>

            <div class="double-grid realtime-grid">
              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">实时识别画面</div>
                </div>

                <div v-if="!realtimeRunning || !realtimeStreamUrl" class="empty-wrap">
                  <el-empty description="启动后这里会显示实时识别画面" />
                </div>

                <div v-else class="preview-wrap realtime-stream-wrap">
                  <img :src="realtimeStreamUrl" alt="实时识别流" class="realtime-image" />
                </div>
              </div>

              <div class="card block-card">
                <div class="section-head">
                  <div class="section-title">实时类别统计</div>
                </div>

                <div v-if="classKeys(realtimeStatus.lastClassCountMap).length" class="tag-wrap">
                  <el-tag
                    v-for="(value, key) in realtimeStatus.lastClassCountMap"
                    :key="key"
                    effect="plain"
                    round
                  >
                    {{ key }}：{{ value }}
                  </el-tag>
                </div>
                <div v-else class="summary-box">当前暂无车辆目标</div>
              </div>
            </div>

            <div class="card block-card">
              <div class="section-head">
                <div class="section-title">实时状态信息</div>
              </div>

              <div class="summary-box">
                摄像头索引：{{ realtimeStatus.cameraIndex }}<br />
                最近帧时间：{{ formatTime(realtimeStatus.lastFrameTime) }}<br />
                服务启动时间：{{ formatTime(realtimeStatus.startedAt) }}
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, onBeforeUnmount } from 'vue'
  import { ElMessage } from 'element-plus'
  import {
    detectVehicleImage,
    detectVehicleVideo,
    startRealtimeDetect,
    stopRealtimeDetect,
    getRealtimeStatus,
    buildRealtimeStreamUrl,
    type VehicleImageDetectResponse,
    type VehicleVideoDetectResponse,
    type RealtimeStatusResponse
  } from '@/api/vehicle-recognition'

  const activeTab = ref('image')

  const imageLoading = ref(false)
  const videoLoading = ref(false)
  const realtimeLoading = ref(false)

  const imageFile = ref<File | null>(null)
  const videoFile = ref<File | null>(null)

  const localImagePreviewUrl = ref('')
  const localVideoPreviewUrl = ref('')

  const cameraIndex = ref(0)
  const realtimeRunning = ref(false)
  const realtimeStreamUrl = ref('')
  let realtimeTimer: number | null = null

  const createDefaultImageResult = (): VehicleImageDetectResponse => ({
    sourceFileName: '',
    sourceImagePath: '',
    resultImagePath: '',
    sourceImageUrl: '',
    resultImageUrl: '',
    totalCount: 0,
    classCountMap: {},
    detections: [],
    summary: ''
  })

  const createDefaultVideoResult = (): VehicleVideoDetectResponse => ({
    sourceFileName: '',
    sourceVideoPath: '',
    resultVideoPath: '',
    sourceVideoUrl: '',
    resultVideoUrl: '',
    totalFrames: 0,
    totalDetections: 0,
    classCountMap: {},
    summary: '',
    codecUsed: ''
  })

  const createDefaultRealtimeStatus = (): RealtimeStatusResponse => ({
    running: false,
    cameraIndex: 0,
    lastFrameTime: null,
    lastDetectionCount: 0,
    lastClassCountMap: {},
    startedAt: null,
    streamUrl: ''
  })

  const imageResult = reactive<VehicleImageDetectResponse>(createDefaultImageResult())
  const videoResult = reactive<VehicleVideoDetectResponse>(createDefaultVideoResult())
  const realtimeStatus = reactive<RealtimeStatusResponse>(createDefaultRealtimeStatus())

  const displaySourceImageUrl = computed(() => {
    return imageResult.sourceImageUrl || localImagePreviewUrl.value || ''
  })

  const displaySourceVideoUrl = computed(() => {
    return videoResult.sourceVideoUrl || localVideoPreviewUrl.value || ''
  })

  function classKeys(map: Record<string, number>) {
    return Object.keys(map || {})
  }

  function formatBox(box: number[] = []) {
    if (!box.length) return '-'
    return `[${box.map((item) => Number(item).toFixed(2)).join(', ')}]`
  }

  function revokeObjectUrl(url: string) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  function withTs(url: string) {
    if (!url) return ''
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return url
    }
    const connector = url.includes('?') ? '&' : '?'
    return `${url}${connector}t=${Date.now()}`
  }

  function formatTime(timestamp?: number | null) {
    if (!timestamp) return '-'
    const date = new Date(timestamp * 1000)
    const y = date.getFullYear()
    const m = `${date.getMonth() + 1}`.padStart(2, '0')
    const d = `${date.getDate()}`.padStart(2, '0')
    const hh = `${date.getHours()}`.padStart(2, '0')
    const mm = `${date.getMinutes()}`.padStart(2, '0')
    const ss = `${date.getSeconds()}`.padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  }

  function handleImageChange(file: any) {
    const rawFile = file.raw
    if (!rawFile) return

    Object.assign(imageResult, createDefaultImageResult())
    imageFile.value = rawFile

    revokeObjectUrl(localImagePreviewUrl.value)
    localImagePreviewUrl.value = URL.createObjectURL(rawFile)
  }

  function handleImageRemove() {
    imageFile.value = null
    revokeObjectUrl(localImagePreviewUrl.value)
    localImagePreviewUrl.value = ''
  }

  function handleVideoChange(file: any) {
    const rawFile = file.raw
    if (!rawFile) return

    const maxSize = 300 * 1024 * 1024
    if (rawFile.size > maxSize) {
      ElMessage.warning('视频文件不能超过 300MB，请压缩后再上传')
      return
    }

    Object.assign(videoResult, createDefaultVideoResult())
    videoFile.value = rawFile

    revokeObjectUrl(localVideoPreviewUrl.value)
    localVideoPreviewUrl.value = URL.createObjectURL(rawFile)
  }

  function handleVideoRemove() {
    videoFile.value = null
    revokeObjectUrl(localVideoPreviewUrl.value)
    localVideoPreviewUrl.value = ''
  }

  function resetImageResult() {
    Object.assign(imageResult, createDefaultImageResult())
    imageFile.value = null
    revokeObjectUrl(localImagePreviewUrl.value)
    localImagePreviewUrl.value = ''
  }

  function resetVideoResult() {
    Object.assign(videoResult, createDefaultVideoResult())
    videoFile.value = null
    revokeObjectUrl(localVideoPreviewUrl.value)
    localVideoPreviewUrl.value = ''
  }

  async function handleImageDetect() {
    if (!imageFile.value) {
      ElMessage.warning('请先选择图片文件')
      return
    }

    try {
      imageLoading.value = true
      const { data } = await detectVehicleImage(imageFile.value)

      if (String(data.code) !== '200') {
        ElMessage.error(data.msg || '图片识别失败')
        return
      }

      Object.assign(imageResult, data.data)
      ElMessage.success('图片识别完成')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '图片识别失败')
    } finally {
      imageLoading.value = false
    }
  }

  async function handleVideoDetect() {
    if (!videoFile.value) {
      ElMessage.warning('请先选择视频文件')
      return
    }

    try {
      videoLoading.value = true
      const { data } = await detectVehicleVideo(videoFile.value)

      if (String(data.code) !== '200') {
        ElMessage.error(data.msg || '视频识别失败')
        return
      }

      Object.assign(videoResult, data.data)
      ElMessage.success('视频识别完成')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '视频识别失败')
    } finally {
      videoLoading.value = false
    }
  }

  async function fetchRealtimeStatus() {
    try {
      const { data } = await getRealtimeStatus()
      if (String(data.code) !== '200') return

      Object.assign(realtimeStatus, data.data)
      realtimeRunning.value = !!data.data.running

      if (data.data.running) {
        realtimeStreamUrl.value = buildRealtimeStreamUrl()
      }
    } catch (error) {
      console.error('获取实时状态失败', error)
    }
  }

  function startRealtimePolling() {
    stopRealtimePolling()
    realtimeTimer = window.setInterval(() => {
      fetchRealtimeStatus()
    }, 1500)
  }

  function stopRealtimePolling() {
    if (realtimeTimer) {
      window.clearInterval(realtimeTimer)
      realtimeTimer = null
    }
  }

  async function handleStartRealtime() {
    try {
      realtimeLoading.value = true
      const { data } = await startRealtimeDetect(cameraIndex.value)

      if (String(data.code) !== '200') {
        ElMessage.error(data.msg || '启动实时识别失败')
        return
      }

      realtimeRunning.value = true
      realtimeStreamUrl.value = buildRealtimeStreamUrl()
      await fetchRealtimeStatus()
      startRealtimePolling()
      ElMessage.success('实时识别已启动')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '启动实时识别失败')
    } finally {
      realtimeLoading.value = false
    }
  }

  async function handleStopRealtime() {
    try {
      realtimeLoading.value = true
      const { data } = await stopRealtimeDetect()

      if (String(data.code) !== '200') {
        ElMessage.error(data.msg || '停止实时识别失败')
        return
      }

      realtimeRunning.value = false
      realtimeStreamUrl.value = ''
      stopRealtimePolling()
      Object.assign(realtimeStatus, createDefaultRealtimeStatus())
      ElMessage.success('实时识别已停止')
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || error?.message || '停止实时识别失败')
    } finally {
      realtimeLoading.value = false
    }
  }

  onBeforeUnmount(() => {
    stopRealtimePolling()
    revokeObjectUrl(localImagePreviewUrl.value)
    revokeObjectUrl(localVideoPreviewUrl.value)
  })
</script>

<style scoped lang="scss">
  .vehicle-page {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card {
    background: #fff;
    border: 1px solid #ebeef5;
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  }

  .page-header {
    padding: 24px 28px;

    h2 {
      margin: 0 0 10px;
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
    }

    p {
      margin: 0;
      line-height: 1.8;
      color: #64748b;
    }
  }

  .vehicle-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 8px;
    }
  }

  .content-layout {
    display: grid;
    grid-template-columns: 420px 1fr;
    gap: 16px;
    align-items: start;
  }

  .input-card,
  .block-card,
  .overview-card {
    padding: 20px;
  }

  .section-title {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
  }

  .upload-tip {
    color: #94a3b8;
    line-height: 1.6;
  }

  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }

  .left-footer {
    justify-content: flex-start;
  }

  .result-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 400px;
  }

  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .double-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .realtime-grid {
    align-items: stretch;
  }

  .metric-label {
    color: #64748b;
    font-size: 14px;
  }

  .metric-value {
    margin-top: 10px;
    font-size: 30px;
    font-weight: 700;
    color: #111827;
  }

  .small-value {
    font-size: 24px;
  }

  .section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .empty-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 260px;
  }

  .preview-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-wrap {
    min-height: 320px;
  }

  .result-image,
  .result-video {
    width: 100%;
    max-height: 520px;
    object-fit: contain;
    border-radius: 12px;
    background: #f8fafc;
  }

  .realtime-stream-wrap {
    min-height: 420px;
    background: #0f172a;
    border-radius: 12px;
    overflow: hidden;
  }

  .realtime-image {
    width: 100%;
    max-height: 620px;
    object-fit: contain;
    display: block;
    background: #0f172a;
  }

  .summary-box {
    white-space: pre-wrap;
    line-height: 1.9;
    color: #475569;
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
  }

  .tips-box {
    margin-top: 16px;
    padding: 14px 16px;
    border-radius: 12px;
    background: #f8fafc;
    color: #64748b;
    line-height: 1.9;
    font-size: 14px;
  }

  .tag-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  @media (max-width: 1200px) {
    .content-layout,
    .overview-grid,
    .double-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

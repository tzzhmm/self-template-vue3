<script setup lang="ts">
type PaddleOcrModule = typeof import('@paddlejs-models/ocr');
type ModelState = 'idle' | 'loading' | 'ready' | 'error';

const fileInputRef = ref<HTMLInputElement | null>(null);
const previewImageRef = ref<HTMLImageElement | null>(null);
const overlayCanvasRef = ref<HTMLCanvasElement | null>(null);

const previewUrl = ref('');
const selectedFile = ref<File | null>(null);
const imageLoaded = ref(false);
const isRecognizing = ref(false);
const statusMessage = ref('请选择一张图片后开始识别');
const errorMessage = ref('');
const recognizedLines = ref<string[]>([]);
const rawResult = ref('');
const detectedCount = ref(0);
const modelState = ref<ModelState>('idle');

const recognizedTextValue = computed(() => recognizedLines.value.join('\n'));
const canRecognize = computed(
  () => Boolean(selectedFile.value) && imageLoaded.value && !isRecognizing.value,
);
const modelTagText = computed(() => {
  switch (modelState.value) {
    case 'loading':
      return '模型加载中';
    case 'ready':
      return '模型已就绪';
    case 'error':
      return '模型加载失败';
    default:
      return '模型未加载';
  }
});
const modelTagColor = computed(() => {
  switch (modelState.value) {
    case 'loading':
      return '#165dff';
    case 'ready':
      return '#00b42a';
    case 'error':
      return '#f53f3f';
    default:
      return '#86909c';
  }
});

let ocrModulePromise: Promise<PaddleOcrModule> | null = null;

const revokePreviewUrl = () => {
  if (!previewUrl.value) return;
  URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = '';
};

const syncOverlayCanvas = () => {
  const image = previewImageRef.value;
  const canvas = overlayCanvasRef.value;
  if (!canvas) return;

  if (!image?.naturalWidth || !image.naturalHeight) {
    const context = canvas.getContext('2d');
    context?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
    return;
  }

  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
};

const clearOverlay = () => {
  const canvas = overlayCanvasRef.value;
  if (!canvas) return;
  const context = canvas.getContext('2d');
  context?.clearRect(0, 0, canvas.width, canvas.height);
};

const clearRecognitionResult = (nextStatus?: string) => {
  recognizedLines.value = [];
  rawResult.value = '';
  detectedCount.value = 0;
  errorMessage.value = '';
  clearOverlay();

  if (nextStatus) {
    statusMessage.value = nextStatus;
  }
};

const openFileDialog = () => {
  fileInputRef.value?.click();
};

const handleImageLoad = () => {
  imageLoaded.value = true;
  syncOverlayCanvas();
  statusMessage.value = '图片已加载，可以开始识别';
};

const normalizeText = (text?: string | string[]) => {
  if (Array.isArray(text)) {
    return text.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof text === 'string') {
    return text
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const ensureOcrModule = async () => {
  if (!ocrModulePromise) {
    ocrModulePromise = (async () => {
      modelState.value = 'loading';
      statusMessage.value =
        '正在加载 Paddle.js OCR 模型，首次识别会下载官方模型文件，请稍候';

      await import('@paddlejs/paddlejs-backend-webgl');
      const ocr = await import('@paddlejs-models/ocr');
      await ocr.init();

      modelState.value = 'ready';
      statusMessage.value = 'Paddle.js OCR 模型已就绪';
      return ocr;
    })().catch((error) => {
      modelState.value = 'error';
      ocrModulePromise = null;
      throw error;
    });
  }

  return ocrModulePromise;
};

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    errorMessage.value = '请选择 PNG、JPG、JPEG、WEBP 这类图片文件';
    statusMessage.value = '文件类型不支持';
    input.value = '';
    return;
  }

  revokePreviewUrl();
  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  imageLoaded.value = false;
  clearRecognitionResult('图片已选择，等待识别');
  input.value = '';
};

const handleRecognize = async () => {
  const image = previewImageRef.value;
  const canvas = overlayCanvasRef.value;

  if (!selectedFile.value || !image) {
    errorMessage.value = '请先选择一张图片';
    return;
  }

  if (!imageLoaded.value) {
    errorMessage.value = '图片仍在加载中，请稍候再试';
    return;
  }

  errorMessage.value = '';
  isRecognizing.value = true;
  clearRecognitionResult('正在识别图片中的文字...');

  try {
    syncOverlayCanvas();
    const ocr = await ensureOcrModule();
    const result = await ocr.recognize(image, {
      canvas: canvas ?? undefined,
      style: {
        strokeStyle: '#f85959',
        lineWidth: 2,
        fillStyle: 'rgba(248, 89, 89, 0.14)',
      },
    });

    const lines = normalizeText(result.text);
    recognizedLines.value = lines;
    detectedCount.value = Array.isArray(result.points) ? result.points.length : 0;
    rawResult.value = JSON.stringify(result, null, 2);
    statusMessage.value = lines.length
      ? `识别完成，共提取 ${lines.length} 段文字`
      : '识别完成，但当前图片没有提取到可读文字';
  } catch (error) {
    clearOverlay();
    errorMessage.value =
      error instanceof Error ? error.message : '识别失败，请稍后重试';
    statusMessage.value = '识别失败';
  } finally {
    isRecognizing.value = false;
  }
};

const resetDemo = () => {
  revokePreviewUrl();
  selectedFile.value = null;
  imageLoaded.value = false;
  clearRecognitionResult('请选择一张图片后开始识别');
};

onBeforeUnmount(() => {
  revokePreviewUrl();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-6xl space-y-6">
      <section class="space-y-3">
        <a-tag :color="modelTagColor" bordered>{{ modelTagText }}</a-tag>
        <div class="space-y-2">
          <h1 class="text-3xl font-semibold tracking-tight text-slate-900">
            Paddle.js 图片文字识别 Demo
          </h1>
          <p class="max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
            当前页面通过官方
            <code>@paddlejs-models/ocr</code>
            和
            <code>@paddlejs/paddlejs-backend-webgl</code>
            接入 OCR。首次识别时会加载官方模型文件，所以会比后续识别稍慢一些。
          </p>
        </div>
      </section>

      <a-alert type="info" show-icon>
        先上传一张带文字的图片，再点击“开始识别”。识别完成后，左侧图片会叠加文字框，右侧会显示提取出的文本和原始返回数据。
      </a-alert>

      <div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <a-card :bordered="false" class="shadow-sm" title="上传与预览">
          <div class="space-y-4">
            <input
              ref="fileInputRef"
              accept="image/*"
              class="hidden"
              type="file"
              @change="handleFileChange"
            />

            <div class="flex flex-wrap gap-3">
              <a-button type="primary" @click="openFileDialog">选择图片</a-button>
              <a-button
                :disabled="!canRecognize"
                :loading="isRecognizing"
                @click="handleRecognize"
              >
                开始识别
              </a-button>
              <a-button :disabled="!selectedFile && !previewUrl" @click="resetDemo">
                清空内容
              </a-button>
            </div>

            <div class="flex flex-wrap gap-2 text-xs text-slate-500">
              <a-tag bordered color="#e5e6eb">支持常见图片格式</a-tag>
              <a-tag bordered color="#e5e6eb">推荐清晰截图或文档照片</a-tag>
              <a-tag bordered color="#e5e6eb">识别框会直接绘制到预览图层</a-tag>
            </div>

            <a-alert v-if="errorMessage" type="error" show-icon>
              {{ errorMessage }}
            </a-alert>
            <a-alert v-else type="success" show-icon>
              {{ statusMessage }}
            </a-alert>

            <div class="rounded-2xl border border-dashed border-slate-300 bg-slate-100/80 p-4 sm:p-6">
              <div v-if="previewUrl" class="flex justify-center">
                <div class="relative inline-block max-w-full overflow-hidden rounded-xl bg-white shadow-sm">
                  <img
                    ref="previewImageRef"
                    :alt="selectedFile?.name || 'OCR preview image'"
                    :src="previewUrl"
                    class="block max-h-[560px] max-w-full rounded-xl"
                    @load="handleImageLoad"
                  />
                  <canvas
                    ref="overlayCanvasRef"
                    class="pointer-events-none absolute inset-0 h-full w-full rounded-xl"
                  />
                </div>
              </div>

              <div
                v-else
                class="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center text-slate-500"
              >
                <div class="space-y-2">
                  <h2 class="text-lg font-medium text-slate-700">还没有选择图片</h2>
                  <p class="max-w-md text-sm leading-6">
                    建议选择文字较清晰、背景对比明显的截图、文档照片或票据照片，这样更容易看出 Paddle.js OCR 的识别效果。
                  </p>
                </div>
                <a-button type="outline" @click="openFileDialog">上传一张图片试试</a-button>
              </div>
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="shadow-sm" title="识别结果">
          <div class="space-y-5">
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">当前文件</p>
                <p class="mt-3 break-all text-sm font-medium text-slate-700">
                  {{ selectedFile?.name || '未选择图片' }}
                </p>
              </div>
              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-xs uppercase tracking-[0.2em] text-slate-400">文本框数量</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">{{ detectedCount }}</p>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-medium text-slate-800">识别文本</h2>
                <span class="text-xs text-slate-400">{{ recognizedLines.length }} 段</span>
              </div>
              <a-textarea
                :auto-size="{ minRows: 10, maxRows: 18 }"
                :model-value="recognizedTextValue"
                placeholder="识别到的文字会显示在这里"
                readonly
              />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <h2 class="text-base font-medium text-slate-800">原始返回结果</h2>
                <span class="text-xs text-slate-400">方便你继续做业务封装</span>
              </div>
              <a-textarea
                :auto-size="{ minRows: 8, maxRows: 16 }"
                :model-value="rawResult"
                placeholder="Paddle.js 返回的 points、text 等原始数据会显示在这里"
                readonly
              />
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>
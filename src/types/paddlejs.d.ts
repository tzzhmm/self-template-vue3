declare module '@paddlejs/paddlejs-backend-webgl';

declare module '@paddlejs-models/ocr' {
  export interface OcrCanvasStyle {
    strokeStyle?: string;
    lineWidth?: number;
    fillStyle?: string;
  }

  export interface OcrRecognizeOptions {
    canvas?: HTMLCanvasElement;
    style?: OcrCanvasStyle;
  }

  export interface OcrResult {
    text?: string | string[];
    points?: unknown[];
    [key: string]: unknown;
  }

  export function init(): Promise<void>;

  export function recognize(
    image: HTMLImageElement | HTMLCanvasElement | string,
    options?: OcrRecognizeOptions,
  ): Promise<OcrResult>;

  export function detect(
    image: HTMLImageElement | HTMLCanvasElement | string,
  ): Promise<unknown>;
}
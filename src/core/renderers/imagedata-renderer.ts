import { EffectManager } from '../effects';
import type { RGBColor, PixelArray } from '../types';

export class ImageDataLEDRenderer {
  width: number;
  height: number;
  private pixelGap: number;
  private glowEnabled: boolean;
  private scale: number;
  buffer: RGBColor[];
  private _colorPixels: PixelArray;
  private _extendedColorPixels: PixelArray;
  extendedWidth: number;
  private effect: string;
  private speed: number;
  private animationId: number | null;
  private lastFrameTime: number;
  private _isRunning: boolean;
  private _canvas: HTMLCanvasElement | null;
  private _ctx: CanvasRenderingContext2D | null;
  private _imageData: ImageData | null;
  private _glowCanvas: HTMLCanvasElement | null;
  private _glowCtx: CanvasRenderingContext2D | null;
  private _wrapper: HTMLDivElement | null;
  private _canvasCreated: boolean;
  private _pixelTemplate: boolean[] | null;
  container: HTMLElement | null;
  effectManager: EffectManager;

  constructor(container: HTMLElement | null, options: {
    width?: number; height?: number; pixelGap?: number; glow?: boolean; scale?: number;
  } = {}) {
    this.container = container;
    this.width = options.width || 64;
    this.height = options.height || 16;
    this.pixelGap = options.pixelGap || 0.15;
    this.glowEnabled = options.glow !== false;
    this.scale = options.scale || 8;
    this.buffer = [];
    this._initBuffer();
    this._colorPixels = [];
    this._extendedColorPixels = [];
    this.extendedWidth = this.width;
    this.effect = 'fixed';
    this.speed = 100;
    this.animationId = null;
    this.lastFrameTime = 0;
    this._isRunning = false;
    this._canvas = null;
    this._ctx = null;
    this._imageData = null;
    this._glowCanvas = null;
    this._glowCtx = null;
    this._wrapper = null;
    this._canvasCreated = false;
    this._pixelTemplate = null;
    this.effectManager = new EffectManager(this as never);
  }

  private _initBuffer(): void {
    this.buffer = [];
    for (let i = 0; i < this.width * this.height; i++) {
      this.buffer.push([0, 0, 0]);
    }
  }

  private _createCanvas(): void {
    if (typeof document === 'undefined') return;

    const canvasWidth = this.width * this.scale;
    const canvasHeight = this.height * this.scale;

    this._wrapper = document.createElement('div');
    this._wrapper.style.cssText = `
      position: relative;
      width: 100%;
      aspect-ratio: ${this.width} / ${this.height};
      background: #0a0a0a;
      border-radius: 4px;
      overflow: hidden;
    `;

    if (this.glowEnabled) {
      this._glowCanvas = document.createElement('canvas');
      this._glowCanvas.width = canvasWidth;
      this._glowCanvas.height = canvasHeight;
      this._glowCanvas.style.cssText = `
        position: absolute; top: 0; left: 0; width: 100%; height: 100%;
        filter: blur(${this.scale * 0.6}px); opacity: 0.5; margin: 0;
      `;
      this._glowCtx = this._glowCanvas.getContext('2d', { alpha: false });
      this._wrapper.appendChild(this._glowCanvas);
    }

    this._canvas = document.createElement('canvas');
    this._canvas.width = canvasWidth;
    this._canvas.height = canvasHeight;
    this._canvas.style.cssText = `
      position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      image-rendering: pixelated; image-rendering: crisp-edges; margin: 0;
    `;
    this._ctx = this._canvas.getContext('2d', { alpha: false });
    this._wrapper.appendChild(this._canvas);

    this._imageData = this._ctx!.createImageData(canvasWidth, canvasHeight);
    this._createPixelTemplate();
    this._fillBackground();

    if (this.container && this.container.isConnected !== false) {
      this.container.innerHTML = '';
      this.container.appendChild(this._wrapper);
    }

    this._canvasCreated = true;
  }

  private _createPixelTemplate(): void {
    const scale = this.scale;
    const gap = Math.max(1, Math.floor(scale * this.pixelGap));
    const pixelSize = scale - gap;
    const radius = Math.max(1, Math.floor(scale * 0.15));

    this._pixelTemplate = [];

    for (let py = 0; py < scale; py++) {
      for (let px = 0; px < scale; px++) {
        let inside = false;

        if (px < pixelSize && py < pixelSize) {
          if (px < radius && py < radius) {
            const dx = radius - px;
            const dy = radius - py;
            inside = (dx * dx + dy * dy) <= (radius * radius);
          } else if (px >= pixelSize - radius && py < radius) {
            const dx = px - (pixelSize - radius - 1);
            const dy = radius - py;
            inside = (dx * dx + dy * dy) <= (radius * radius);
          } else if (px < radius && py >= pixelSize - radius) {
            const dx = radius - px;
            const dy = py - (pixelSize - radius - 1);
            inside = (dx * dx + dy * dy) <= (radius * radius);
          } else if (px >= pixelSize - radius && py >= pixelSize - radius) {
            const dx = px - (pixelSize - radius - 1);
            const dy = py - (pixelSize - radius - 1);
            inside = (dx * dx + dy * dy) <= (radius * radius);
          } else {
            inside = true;
          }
        }

        this._pixelTemplate.push(inside);
      }
    }
  }

  private _fillBackground(): void {
    if (!this._imageData) return;
    const data = this._imageData.data;
    const bgR = 10, bgG = 10, bgB = 10;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = bgR;
      data[i + 1] = bgG;
      data[i + 2] = bgB;
      data[i + 3] = 255;
    }
  }

  private _ensureCanvasInContainer(): boolean {
    if (!this.container) return false;
    if (this._wrapper && this._wrapper.parentNode === this.container) return true;
    if (this._wrapper && this.container.isConnected !== false) {
      this.container.innerHTML = '';
      this.container.appendChild(this._wrapper);
      return true;
    }
    return false;
  }

  setPixel(x: number, y: number, color: RGBColor): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const idx = y * this.width + x;
      if (idx < this.buffer.length) {
        this.buffer[idx] = color;
      }
    }
  }

  clear(): void {
    for (let i = 0; i < this.buffer.length; i++) {
      this.buffer[i] = [0, 0, 0];
    }
  }

  flush(): void {
    if (!this._canvasCreated) {
      this._createCanvas();
    } else if (!this._ensureCanvasInContainer()) {
      this._createCanvas();
    }

    if (!this._imageData || !this._ctx || !this._pixelTemplate) return;

    const data = this._imageData.data;
    const scale = this.scale;
    const canvasWidth = this.width * scale;
    const template = this._pixelTemplate;
    const bgR = 10, bgG = 10, bgB = 10;

    for (let ledY = 0; ledY < this.height; ledY++) {
      for (let ledX = 0; ledX < this.width; ledX++) {
        const bufferIdx = ledY * this.width + ledX;
        const color = this.buffer[bufferIdx];
        if (!color || !Array.isArray(color)) continue;

        const r = Math.round(color[0]);
        const g = Math.round(color[1]);
        const b = Math.round(color[2]);

        const baseX = ledX * scale;
        const baseY = ledY * scale;

        for (let py = 0; py < scale; py++) {
          for (let px = 0; px < scale; px++) {
            const templateIdx = py * scale + px;
            const canvasIdx = ((baseY + py) * canvasWidth + (baseX + px)) * 4;

            if (template[templateIdx]) {
              data[canvasIdx] = r;
              data[canvasIdx + 1] = g;
              data[canvasIdx + 2] = b;
              data[canvasIdx + 3] = 255;
            } else {
              data[canvasIdx] = bgR;
              data[canvasIdx + 1] = bgG;
              data[canvasIdx + 2] = bgB;
              data[canvasIdx + 3] = 255;
            }
          }
        }
      }
    }

    this._ctx.putImageData(this._imageData, 0, 0);

    if (this.glowEnabled && this._glowCtx) {
      this._glowCtx.drawImage(this._canvas!, 0, 0);
    }
  }

  setData(pixels: PixelArray, extendedPixels: PixelArray | null = null, extendedWidth: number | null = null): void {
    this._colorPixels = pixels || [];
    if (extendedPixels) {
      this._extendedColorPixels = extendedPixels;
      this.extendedWidth = extendedWidth || this.width;
    } else {
      this._extendedColorPixels = pixels || [];
      this.extendedWidth = this.width;
    }
  }

  setEffect(effect: string, speed = 100): void {
    const wasRunning = this._isRunning;
    if (this.effect !== effect) {
      this.effect = effect;
      this.effectManager.initEffect(effect, { speed });
    }
    this.speed = speed;
    if (wasRunning && effect !== 'fixed') {
      this.start();
    }
  }

  start(): void {
    if (this._isRunning) return;
    this._isRunning = true;
    this.lastFrameTime = performance.now();
    this._animate();
  }

  stop(): void {
    this._isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  get isRunning(): boolean {
    return this._isRunning;
  }

  private _animate(): void {
    if (!this._isRunning) return;
    const now = performance.now();
    const frameInterval = 500 - (this.speed - 1) * 4.7;
    if (now - this.lastFrameTime >= frameInterval) {
      this.lastFrameTime = now;
      this.effectManager.step();
    }
    this._renderFrame();
    this.animationId = requestAnimationFrame(() => this._animate());
  }

  private _renderFrame(): void {
    this.effectManager.render(this._colorPixels, this._extendedColorPixels, this.extendedWidth);
    this.flush();
  }

  renderStatic(): void {
    if (!this._canvasCreated) this._createCanvas();
    this._renderFrame();
  }

  setDimensions(width: number, height: number): void {
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.extendedWidth = width;
      this._initBuffer();
      this._canvasCreated = false;
      this.effectManager = new EffectManager(this as never);
      if (this.effect !== 'fixed') {
        this.effectManager.initEffect(this.effect, { speed: this.speed });
      }
    }
  }

  setContainer(container: HTMLElement): void {
    if (container !== this.container) {
      this.container = container;
      if (this._wrapper && container) {
        container.innerHTML = '';
        container.appendChild(this._wrapper);
      }
    }
  }

  destroy(): void {
    this.stop();
    this._canvas = null;
    this._ctx = null;
    this._imageData = null;
    this._glowCanvas = null;
    this._glowCtx = null;
    this._wrapper = null;
    this._canvasCreated = false;
    this._pixelTemplate = null;
  }
}

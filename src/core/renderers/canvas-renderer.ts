import { EffectManager } from '../effects';
import type { RGBColor, PixelArray } from '../types';

export class CanvasLEDRenderer {
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
  private _glowCanvas: HTMLCanvasElement | null;
  private _glowCtx: CanvasRenderingContext2D | null;
  private _wrapper: HTMLDivElement | null;
  private _canvasCreated: boolean;
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
    this._glowCanvas = null;
    this._glowCtx = null;
    this._wrapper = null;
    this._canvasCreated = false;
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
        filter: blur(${this.scale * 0.8}px); opacity: 0.6;
        image-rendering: pixelated; margin: 0;
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
    if (this._ctx) this._ctx.imageSmoothingEnabled = false;
    this._wrapper.appendChild(this._canvas);

    if (this.container && this.container.isConnected !== false) {
      this.container.innerHTML = '';
      this.container.appendChild(this._wrapper);
    }

    this._canvasCreated = true;
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

    const ctx = this._ctx;
    if (!ctx) return;
    const scale = this.scale;
    const gap = Math.max(1, Math.floor(scale * this.pixelGap));
    const pixelSize = scale - gap;
    const cornerRadius = Math.max(1, Math.floor(scale * 0.15));

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, this._canvas!.width, this._canvas!.height);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = y * this.width + x;
        const color = this.buffer[idx];
        if (!color || !Array.isArray(color)) continue;

        const [r, g, b] = color;
        const px = x * scale;
        const py = y * scale;

        ctx.fillStyle = `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
        this._roundRect(ctx, px, py, pixelSize, pixelSize, cornerRadius);
      }
    }

    if (this.glowEnabled && this._glowCtx) {
      this._glowCtx.drawImage(this._canvas!, 0, 0);
    }
  }

  private _roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
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

  setEffect(effect: string, speed = 100, options?: Record<string, unknown>): void {
    const wasRunning = this._isRunning;
    if (this.effect !== effect || options) {
      this.effect = effect;
      this.effectManager.initEffect(effect, { speed, ...options });
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
    this._glowCanvas = null;
    this._glowCtx = null;
    this._wrapper = null;
    this._canvasCreated = false;
  }
}

import { EffectManager } from '../effects';
import type { RGBColor, PixelArray } from '../types';

export class SVGLEDMatrixRenderer {
  width: number;
  height: number;
  private pixelGap: number;
  buffer: RGBColor[];
  private prevBuffer: RGBColor[];
  private _colorPixels: PixelArray;
  private _extendedColorPixels: PixelArray;
  extendedWidth: number;
  private effect: string;
  private speed: number;
  private animationId: number | null;
  private lastFrameTime: number;
  private _isRunning: boolean;
  private pixelElements: SVGRectElement[];
  private svgCreated: boolean;
  private _svg: SVGSVGElement | null;
  container: HTMLElement | null;
  effectManager: EffectManager;

  constructor(container: HTMLElement | null, options: {
    width?: number; height?: number; pixelGap?: number;
  } = {}) {
    this.container = container;
    this.width = options.width || 64;
    this.height = options.height || 16;
    this.pixelGap = options.pixelGap || 0.1;
    this.buffer = [];
    this.prevBuffer = [];
    this._initBuffer();
    this._colorPixels = [];
    this._extendedColorPixels = [];
    this.extendedWidth = this.width;
    this.effect = 'fixed';
    this.speed = 50;
    this.animationId = null;
    this.lastFrameTime = 0;
    this._isRunning = false;
    this.pixelElements = [];
    this.svgCreated = false;
    this._svg = null;
    this.effectManager = new EffectManager(this as never);
  }

  private _initBuffer(): void {
    this.buffer = [];
    this.prevBuffer = [];
    for (let i = 0; i < this.width * this.height; i++) {
      this.buffer.push([0, 0, 0]);
      this.prevBuffer.push([-1, -1, -1]);
    }
  }

  private _createSvg(): void {
    if (typeof document === 'undefined') return;

    const svgWidth = 100;
    const pxWidth = svgWidth / this.width;
    const pxHeight = pxWidth;
    const svgHeight = this.height * pxHeight;
    const gap = this.pixelGap;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.display = 'block';

    this.pixelElements = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', String(x * pxWidth));
        rect.setAttribute('y', String(y * pxHeight));
        rect.setAttribute('width', String(pxWidth - gap));
        rect.setAttribute('height', String(pxHeight - gap));
        rect.setAttribute('rx', '0.3');
        rect.setAttribute('fill', 'rgb(17, 17, 17)');
        svg.appendChild(rect);
        this.pixelElements.push(rect);
      }
    }

    if (this.container && this.container.isConnected !== false) {
      this.container.innerHTML = '';
      this.container.appendChild(svg);
    }

    this._svg = svg;
    this.svgCreated = true;
  }

  private _ensureSvgInContainer(): boolean {
    if (!this.container) return false;
    if (this._svg && this._svg.parentNode === this.container) return true;
    if (this._svg && this.container.isConnected !== false) {
      this.container.innerHTML = '';
      this.container.appendChild(this._svg);
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
    if (!this.svgCreated) {
      this._createSvg();
    } else if (!this._ensureSvgInContainer()) {
      this._createSvg();
    }

    for (let i = 0; i < this.buffer.length; i++) {
      const bufferItem = this.buffer[i];
      const prevItem = this.prevBuffer[i];

      if (!bufferItem || !Array.isArray(bufferItem)) continue;
      if (!prevItem || !Array.isArray(prevItem)) {
        this.prevBuffer[i] = [-1, -1, -1];
        continue;
      }

      const [r, g, b] = bufferItem;
      const [pr, pg, pb] = prevItem;

      if (r !== pr || g !== pg || b !== pb) {
        const rect = this.pixelElements[i];
        if (rect) {
          const isLit = r > 20 || g > 20 || b > 20;
          rect.setAttribute('fill', `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`);
          if (isLit) {
            rect.style.filter = `drop-shadow(0 0 2px rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}))`;
          } else {
            rect.style.filter = '';
          }
        }
        this.prevBuffer[i] = [r, g, b];
      }
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

  setEffect(effect: string, speed = 50): void {
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
    if (!this.svgCreated) this._createSvg();
    this._renderFrame();
  }

  setDimensions(width: number, height: number): void {
    if (width !== this.width || height !== this.height) {
      this.width = width;
      this.height = height;
      this.extendedWidth = width;
      this._initBuffer();
      this.svgCreated = false;
      this.effectManager = new EffectManager(this as never);
      if (this.effect !== 'fixed') {
        this.effectManager.initEffect(this.effect, { speed: this.speed });
      }
    }
  }

  setContainer(container: HTMLElement): void {
    if (container !== this.container) {
      this.container = container;
      if (this._svg && container) {
        container.innerHTML = '';
        container.appendChild(this._svg);
      }
    }
  }

  destroy(): void {
    this.stop();
    this.pixelElements = [];
    this._svg = null;
    this.svgCreated = false;
  }
}

export function createPixelSvg(width: number, height: number, pixels: string[], pixelGap = 1): string {
  const svgWidth = 100;
  const pxWidth = svgWidth / width;
  const pxHeight = pxWidth;
  const svgHeight = height * pxHeight;
  const gap = pixelGap * 0.1;

  let rects = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const color = pixels[y * width + x] || '#111';
      const isLit = color !== '#111' && color !== '#000' && color !== '#1a1a1a' && color !== '#050505';
      const style = isLit ? `filter:drop-shadow(0 0 2px ${color});` : '';
      rects += `<rect x="${x * pxWidth}" y="${y * pxHeight}" width="${pxWidth - gap}" height="${pxHeight - gap}" fill="${color}" rx="0.3" style="${style}"/>`;
    }
  }

  return `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;">${rects}</svg>`;
}

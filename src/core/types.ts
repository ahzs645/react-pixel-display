// === Pixel Data Types ===
export type RGBColor = [number, number, number];
export type HexColor = string;
export type PixelArray = HexColor[];

// === Renderer Types ===
export interface RendererOptions {
  width?: number;
  height?: number;
  pixelGap?: number;
  glow?: boolean;
  scale?: number;
}

export interface LEDRenderer {
  readonly width: number;
  readonly height: number;
  readonly isRunning: boolean;
  extendedWidth: number;
  buffer: RGBColor[];

  setPixel(x: number, y: number, color: RGBColor): void;
  clear(): void;
  flush(): void;
  setData(pixels: PixelArray, extendedPixels?: PixelArray | null, extendedWidth?: number | null): void;
  setEffect(effect: string, speed?: number): void;
  start(): void;
  stop(): void;
  renderStatic(): void;
  setDimensions(width: number, height: number): void;
  setContainer(container: HTMLElement): void;
  destroy(): void;
}

// === Effect Types ===
export type EffectCategory = 'text' | 'ambient' | 'color';

export interface EffectInfo {
  category: EffectCategory;
  name: string;
  description: string;
}

export type TextEffectName =
  | 'fixed' | 'scroll_ltr' | 'scroll_rtl' | 'blink' | 'breeze'
  | 'snow' | 'laser' | 'fade' | 'typewriter' | 'bounce' | 'sparkle'
  | 'scroll_up' | 'scroll_down' | 'dissolve' | 'blinds' | 'wipe'
  | 'scan_horiz' | 'scan_vert' | 'grow_up' | 'grow_down' | 'opening';

export type AmbientEffectName =
  | 'rainbow' | 'matrix' | 'plasma' | 'gradient' | 'fire'
  | 'water' | 'stars' | 'confetti' | 'plasma_wave' | 'radial_pulse'
  | 'hypnotic' | 'lava' | 'aurora'
  | 'starfield' | 'fireworks' | 'rain_storm' | 'munch' | 'bouncing' | 'flow_field';

export type ColorEffectName = 'color_cycle' | 'rainbow_text' | 'neon';

export type EffectName = TextEffectName | AmbientEffectName | ColorEffectName;

export interface EffectState {
  tick: number;
  speed?: number;
  [key: string]: unknown;
}

// === Font Types ===
export type FontType = 'legacy' | 'canvas' | 'bdf';

export interface FontResolver {
  (fontName: string, fileName?: string): string;
}

export interface FontMetrics {
  font_size: number;
  offset: [number, number];
  pixel_threshold: number;
  var_width: boolean;
}

export interface BdfFontConfig {
  file: string;
  yOffset: number;
}

export interface ScrollPixelsResult {
  pixels: PixelArray;
  width: number;
}

// === React Component Types ===
export type RendererType = 'imagedata' | 'canvas' | 'svg';

export interface PixelDisplayProps {
  width?: number;
  height?: number;
  pixels?: PixelArray;
  text?: string;
  font?: FontType | string;
  fontUrl?: string;
  fontName?: string;
  foregroundColor?: HexColor;
  backgroundColor?: HexColor;
  effect?: EffectName;
  speed?: number;
  renderer?: RendererType;
  glow?: boolean;
  scale?: number;
  pixelGap?: number;
  fontResolver?: FontResolver;
  onReady?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export interface PixelDisplayRef {
  start(): void;
  stop(): void;
  getRenderer(): LEDRenderer | null;
  isRunning(): boolean;
}

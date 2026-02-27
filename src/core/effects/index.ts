import { TextEffects } from './text-effects';
import { AmbientEffects } from './ambient-effects';
import { ColorEffects } from './color-effects';
import type { LEDRenderer, EffectInfo, EffectCategory, EffectState, PixelArray } from '../types';

export const EFFECT_CATEGORIES = {
  TEXT: 'text' as EffectCategory,
  AMBIENT: 'ambient' as EffectCategory,
  COLOR: 'color' as EffectCategory,
};

export const EFFECTS: Record<string, EffectInfo> = {
  // Text effects
  fixed: { category: 'text', name: 'Fixed', description: 'Static display' },
  scroll_ltr: { category: 'text', name: 'Scroll Left', description: 'Text scrolls left to right' },
  scroll_rtl: { category: 'text', name: 'Scroll Right', description: 'Text scrolls right to left' },
  blink: { category: 'text', name: 'Blink', description: 'Text blinks on/off' },
  breeze: { category: 'text', name: 'Breeze', description: 'Gentle wave brightness' },
  snow: { category: 'text', name: 'Snow', description: 'Sparkle effect' },
  laser: { category: 'text', name: 'Laser', description: 'Scanning beam' },
  fade: { category: 'text', name: 'Fade', description: 'Fade in/out' },
  typewriter: { category: 'text', name: 'Typewriter', description: 'Characters appear one by one' },
  bounce: { category: 'text', name: 'Bounce', description: 'Text bounces back and forth' },
  sparkle: { category: 'text', name: 'Sparkle', description: 'Random sparkle overlay' },

  // Parola-inspired transition effects
  scroll_up: { category: 'text', name: 'Scroll Up', description: 'Text scrolls upward' },
  scroll_down: { category: 'text', name: 'Scroll Down', description: 'Text scrolls downward' },
  dissolve: { category: 'text', name: 'Dissolve', description: 'Random pixel dissolve' },
  blinds: { category: 'text', name: 'Blinds', description: 'Vertical blinds reveal' },
  wipe: { category: 'text', name: 'Wipe', description: 'Column-by-column wipe with cursor' },
  scan_horiz: { category: 'text', name: 'Scan Horizontal', description: 'Horizontal scan beam reveals text' },
  scan_vert: { category: 'text', name: 'Scan Vertical', description: 'Vertical scan beam reveals text' },
  grow_up: { category: 'text', name: 'Grow Up', description: 'Rows reveal from bottom to top' },
  grow_down: { category: 'text', name: 'Grow Down', description: 'Rows reveal from top to bottom' },
  opening: { category: 'text', name: 'Opening', description: 'Center-outward expanding reveal' },
  closing: { category: 'text', name: 'Closing', description: 'Ends-inward closing reveal' },
  slice: { category: 'text', name: 'Slice', description: 'Columns enter one at a time from the right' },
  mesh: { category: 'text', name: 'Mesh', description: 'Columns move in alternating up/down directions' },
  random: { category: 'text', name: 'Random', description: 'Pixels appear and disappear randomly' },
  scroll_up_left: { category: 'text', name: 'Scroll Up-Left', description: 'Diagonal scroll up and to the left' },
  scroll_up_right: { category: 'text', name: 'Scroll Up-Right', description: 'Diagonal scroll up and to the right' },
  scroll_down_left: { category: 'text', name: 'Scroll Down-Left', description: 'Diagonal scroll down and to the left' },
  scroll_down_right: { category: 'text', name: 'Scroll Down-Right', description: 'Diagonal scroll down and to the right' },

  // Ambient effects
  rainbow: { category: 'ambient', name: 'Rainbow', description: 'HSV rainbow gradient' },
  matrix: { category: 'ambient', name: 'Matrix', description: 'Digital rain effect' },
  plasma: { category: 'ambient', name: 'Plasma', description: 'Classic plasma waves' },
  gradient: { category: 'ambient', name: 'Gradient', description: 'Moving color gradients' },
  fire: { category: 'ambient', name: 'Fire', description: 'Fire/flame simulation' },
  water: { category: 'ambient', name: 'Water', description: 'Ripple/wave effect' },
  stars: { category: 'ambient', name: 'Stars', description: 'Twinkling starfield' },
  confetti: { category: 'ambient', name: 'Confetti', description: 'Falling colored particles' },
  plasma_wave: { category: 'ambient', name: 'Plasma Wave', description: 'Multi-frequency sine waves' },
  radial_pulse: { category: 'ambient', name: 'Radial Pulse', description: 'Expanding ring patterns' },
  hypnotic: { category: 'ambient', name: 'Hypnotic', description: 'Spiral pattern' },
  lava: { category: 'ambient', name: 'Lava', description: 'Flowing lava/magma' },
  aurora: { category: 'ambient', name: 'Aurora', description: 'Northern lights' },

  // HUB75-inspired panel effects
  starfield: { category: 'ambient', name: 'Starfield', description: '3D starfield with depth' },
  fireworks: { category: 'ambient', name: 'Fireworks', description: 'Launching fireworks with particle bursts' },
  rain_storm: { category: 'ambient', name: 'Rain Storm', description: 'Rain with lightning flashes' },
  munch: { category: 'ambient', name: 'Munch', description: 'XOR bit-pattern animation' },
  bouncing: { category: 'ambient', name: 'Bouncing', description: 'Bouncing colored particles with trails' },
  flow_field: { category: 'ambient', name: 'Flow Field', description: 'Particles following noise-based flow' },
  attract: { category: 'ambient', name: 'Attract', description: 'Particles orbiting a central attractor' },
  snake: { category: 'ambient', name: 'Snake', description: 'Colored snakes moving with fading trails' },
  pendulum_wave: { category: 'ambient', name: 'Pendulum Wave', description: 'Oscillating dots forming wave patterns' },
  radar: { category: 'ambient', name: 'Radar', description: 'Rotating radar sweep with fading trail' },

  // Color effects
  color_cycle: { category: 'color', name: 'Color Cycle', description: 'Cycle through colors' },
  rainbow_text: { category: 'color', name: 'Rainbow Text', description: 'Rainbow gradient on text' },
  neon: { category: 'color', name: 'Neon', description: 'Pulsing neon glow' },
};

export class EffectManager {
  private renderer: LEDRenderer;
  private textEffects: TextEffects;
  private ambientEffects: AmbientEffects;
  private colorEffects: ColorEffects;
  currentEffect: string;
  effectState: EffectState;

  constructor(renderer: LEDRenderer) {
    this.renderer = renderer;
    this.textEffects = new TextEffects(renderer);
    this.ambientEffects = new AmbientEffects(renderer);
    this.colorEffects = new ColorEffects(renderer);
    this.currentEffect = 'fixed';
    this.effectState = { tick: 0 };
  }

  getEffectInfo(effectName: string): EffectInfo {
    return EFFECTS[effectName] || EFFECTS.fixed;
  }

  getEffectsByCategory(category: EffectCategory): Array<{ key: string } & EffectInfo> {
    return Object.entries(EFFECTS)
      .filter(([, info]) => info.category === category)
      .map(([key, info]) => ({ key, ...info }));
  }

  initEffect(effectName: string, options: Record<string, unknown> = {}): EffectState {
    const info = this.getEffectInfo(effectName);
    this.currentEffect = effectName;
    this.effectState = { tick: 0, ...options };

    switch (info.category) {
      case 'text':
        this.textEffects.init(effectName, this.effectState);
        break;
      case 'ambient':
        this.ambientEffects.init(effectName, this.effectState);
        break;
      case 'color':
        this.colorEffects.init(effectName, this.effectState);
        break;
    }

    return this.effectState;
  }

  step(): void {
    const info = this.getEffectInfo(this.currentEffect);
    this.effectState.tick = (this.effectState.tick || 0) + 1;

    switch (info.category) {
      case 'text':
        this.textEffects.step(this.currentEffect, this.effectState);
        break;
      case 'ambient':
        this.ambientEffects.step(this.currentEffect, this.effectState);
        break;
      case 'color':
        this.colorEffects.step(this.currentEffect, this.effectState);
        break;
    }
  }

  render(pixels: PixelArray, extendedPixels: PixelArray, extendedWidth: number): void {
    const info = this.getEffectInfo(this.currentEffect);

    switch (info.category) {
      case 'ambient':
        this.ambientEffects.render(this.currentEffect, this.effectState);
        break;
      case 'text':
        this.textEffects.render(this.currentEffect, this.effectState, pixels, extendedPixels, extendedWidth);
        break;
      case 'color':
        this.colorEffects.render(this.currentEffect, this.effectState, pixels);
        break;
    }
  }

  isAmbient(effectName: string): boolean {
    return this.getEffectInfo(effectName).category === 'ambient';
  }

  needsAnimation(effectName: string): boolean {
    return effectName !== 'fixed';
  }
}

export const TEXT_EFFECTS = Object.entries(EFFECTS)
  .filter(([, info]) => info.category === 'text')
  .map(([name]) => name);

export const AMBIENT_EFFECTS = Object.entries(EFFECTS)
  .filter(([, info]) => info.category === 'ambient')
  .map(([name]) => name);

export const COLOR_EFFECTS = Object.entries(EFFECTS)
  .filter(([, info]) => info.category === 'color')
  .map(([name]) => name);

export const ALL_EFFECTS = Object.keys(EFFECTS);

export { TextEffects } from './text-effects';
export { AmbientEffects } from './ambient-effects';
export { ColorEffects } from './color-effects';

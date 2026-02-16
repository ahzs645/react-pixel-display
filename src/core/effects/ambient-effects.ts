import type { LEDRenderer, EffectState, RGBColor } from '../types';
import { hsvToRgb } from '../utils';

export class AmbientEffects {
  private renderer: LEDRenderer;

  constructor(renderer: LEDRenderer) {
    this.renderer = renderer;
  }

  init(effectName: string, state: EffectState): void {
    const { width, height } = this.renderer;

    switch (effectName) {
      case 'rainbow':
        state.position = 0;
        break;
      case 'matrix': {
        const colorModes: RGBColor[] = [
          [0, 255, 0],
          [0, 255, 255],
          [255, 0, 255],
        ];
        state.colorMode = colorModes[Math.floor(Math.random() * colorModes.length)];
        state.buffer = [];
        for (let y = 0; y < height; y++) {
          (state.buffer as RGBColor[][]).push(
            Array(width).fill(null).map((): RGBColor => [0, 0, 0])
          );
        }
        break;
      }
      case 'plasma':
      case 'gradient':
        state.time = 0;
        break;
      case 'fire':
        state.heat = [];
        for (let i = 0; i < width * height; i++) {
          (state.heat as number[]).push(0);
        }
        state.palette = this._createFirePalette();
        break;
      case 'water':
        state.current = [];
        state.previous = [];
        for (let i = 0; i < width * height; i++) {
          (state.current as number[]).push(0);
          (state.previous as number[]).push(0);
        }
        state.damping = 0.95;
        break;
      case 'stars': {
        state.stars = [];
        const numStars = Math.floor(width * height * 0.15);
        for (let i = 0; i < numStars; i++) {
          (state.stars as Array<{ x: number; y: number; brightness: number; speed: number; phase: number }>).push({
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            brightness: Math.random(),
            speed: 0.02 + Math.random() * 0.05,
            phase: Math.random() * Math.PI * 2,
          });
        }
        break;
      }
      case 'confetti':
        state.particles = [];
        for (let i = 0; i < 20; i++) {
          (state.particles as unknown[]).push(this._createConfettiParticle(width, height, true));
        }
        break;
      case 'plasma_wave':
      case 'radial_pulse':
      case 'hypnotic':
      case 'aurora':
        state.time = 0;
        break;
      case 'lava':
        state.time = 0;
        state.noise = [];
        for (let i = 0; i < width * height; i++) {
          (state.noise as number[]).push(Math.random() * Math.PI * 2);
        }
        break;
    }
  }

  step(effectName: string, state: EffectState): void {
    const { width, height } = this.renderer;

    switch (effectName) {
      case 'rainbow':
        state.position = ((state.position as number) + 0.01) % 1;
        break;
      case 'matrix':
        this._stepMatrix(state, width, height);
        break;
      case 'plasma':
      case 'gradient':
        state.time = ((state.time as number) || 0) + 0.05;
        break;
      case 'fire':
        this._stepFire(state, width, height);
        break;
      case 'water':
        this._stepWater(state, width, height);
        break;
      case 'stars': {
        const stars = state.stars as Array<{ phase: number; speed: number }>;
        for (const star of stars) {
          star.phase += star.speed;
        }
        break;
      }
      case 'confetti': {
        const particles = state.particles as Array<{
          x: number; y: number; speed: number; drift: number;
          rotation: number; rotationSpeed: number;
        }>;
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.speed;
          p.x += p.drift;
          p.rotation += p.rotationSpeed;
          if (p.y > height) {
            particles[i] = this._createConfettiParticle(width, height, false);
          }
        }
        break;
      }
      case 'plasma_wave':
      case 'radial_pulse':
      case 'hypnotic':
      case 'lava':
      case 'aurora':
        state.time = ((state.time as number) || 0) + 0.03;
        break;
    }
  }

  render(effectName: string, state: EffectState): void {
    switch (effectName) {
      case 'rainbow': this._renderRainbow(state); break;
      case 'matrix': this._renderMatrix(state); break;
      case 'plasma': this._renderPlasma(state); break;
      case 'gradient': this._renderGradient(state); break;
      case 'fire': this._renderFire(state); break;
      case 'water': this._renderWater(state); break;
      case 'stars': this._renderStars(state); break;
      case 'confetti': this._renderConfetti(state); break;
      case 'plasma_wave': this._renderPlasmaWave(state); break;
      case 'radial_pulse': this._renderRadialPulse(state); break;
      case 'hypnotic': this._renderHypnotic(state); break;
      case 'lava': this._renderLava(state); break;
      case 'aurora': this._renderAurora(state); break;
    }
  }

  private _renderRainbow(state: EffectState): void {
    const { width, height } = this.renderer;
    const position = (state.position as number) || 0;

    for (let x = 0; x < width; x++) {
      const hue = (position + x / width) % 1;
      const [r, g, b] = hsvToRgb(hue, 1, 0.6);
      for (let y = 0; y < height; y++) {
        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _stepMatrix(state: EffectState, width: number, height: number): void {
    const buffer = state.buffer as RGBColor[][];
    const colorMode = state.colorMode as RGBColor;
    const fadeAmount = 0.15;

    buffer.pop();
    const newRow = buffer[0].map(([r, g, b]): RGBColor => [
      r * (1 - fadeAmount),
      g * (1 - fadeAmount),
      b * (1 - fadeAmount),
    ]);
    buffer.unshift(JSON.parse(JSON.stringify(newRow)));

    for (let x = 0; x < width; x++) {
      if (Math.random() < 0.08) {
        buffer[0][x] = [
          Math.floor(Math.random() * colorMode[0]),
          Math.floor(Math.random() * colorMode[1]),
          Math.floor(Math.random() * colorMode[2]),
        ];
      }
    }
  }

  private _renderMatrix(state: EffectState): void {
    const { width, height } = this.renderer;
    const buffer = state.buffer as RGBColor[][];
    if (!buffer) return;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [r, g, b] = buffer[y]?.[x] || [0, 0, 0];
        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _renderPlasma(state: EffectState): void {
    const { width, height } = this.renderer;
    const time = (state.time as number) || 0;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const v1 = Math.sin(x / 8 + time);
        const v2 = Math.sin(y / 6 + time * 0.8);
        const v3 = Math.sin(dist / 6 - time * 1.2);
        const v4 = Math.sin((x + y) / 10 + time * 0.5);

        const value = (v1 + v2 + v3 + v4 + 4) / 8;

        const r = Math.sin(value * Math.PI * 2) * 0.5 + 0.5;
        const g = Math.sin(value * Math.PI * 2 + 2) * 0.5 + 0.5;
        const b = Math.sin(value * Math.PI * 2 + 4) * 0.5 + 0.5;

        this.renderer.setPixel(x, y, [r * 255, g * 255, b * 255]);
      }
    }
  }

  private _renderGradient(state: EffectState): void {
    const { width, height } = this.renderer;
    const time = (state.time as number) || 0;
    const t = time * 10;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const r = (Math.sin((x + t) * 0.05) * 0.5 + 0.5) * 255;
        const g = (Math.cos((y + t) * 0.05) * 0.5 + 0.5) * 255;
        const b = (Math.sin((x + y + t) * 0.03) * 0.5 + 0.5) * 255;
        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _createFirePalette(): RGBColor[] {
    const palette: RGBColor[] = [];
    for (let i = 0; i < 256; i++) {
      let r: number, g: number, b: number;
      if (i < 64) {
        r = i * 4; g = 0; b = 0;
      } else if (i < 128) {
        r = 255; g = (i - 64) * 4; b = 0;
      } else if (i < 192) {
        r = 255; g = 255; b = (i - 128) * 4;
      } else {
        r = 255; g = 255; b = 255;
      }
      palette.push([r, g, b]);
    }
    return palette;
  }

  private _stepFire(state: EffectState, width: number, height: number): void {
    const heat = state.heat as number[];

    for (let i = 0; i < width * height; i++) {
      heat[i] = Math.max(0, heat[i] - Math.random() * 10);
    }

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const below = (y + 1) * width + x;
        const left = y * width + Math.max(0, x - 1);
        const right = y * width + Math.min(width - 1, x + 1);
        heat[idx] = (heat[below] + heat[left] + heat[right]) / 3.05;
      }
    }

    for (let x = 0; x < width; x++) {
      if (Math.random() < 0.6) {
        heat[(height - 1) * width + x] = 180 + Math.random() * 75;
      }
    }
  }

  private _renderFire(state: EffectState): void {
    const { width, height } = this.renderer;
    const heat = state.heat as number[];
    const palette = state.palette as RGBColor[];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const h = Math.floor(Math.min(255, heat[idx]));
        const [r, g, b] = palette[h];
        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _stepWater(state: EffectState, width: number, height: number): void {
    const current = state.current as number[];
    const previous = state.previous as number[];
    const damping = state.damping as number;

    const temp = [...previous];
    for (let i = 0; i < current.length; i++) {
      previous[i] = current[i];
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        current[idx] =
          (temp[(y - 1) * width + x] +
            temp[(y + 1) * width + x] +
            temp[y * width + (x - 1)] +
            temp[y * width + (x + 1)]) /
            2 -
          current[idx];
        current[idx] *= damping;
      }
    }

    if (Math.random() < 0.1) {
      const x = Math.floor(Math.random() * (width - 2)) + 1;
      const y = Math.floor(Math.random() * (height - 2)) + 1;
      current[y * width + x] = 255;
    }
  }

  private _renderWater(state: EffectState): void {
    const { width, height } = this.renderer;
    const current = state.current as number[];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const value = Math.abs(current[idx]);
        const intensity = Math.min(255, value * 2);

        const r = intensity > 200 ? intensity : 0;
        const g = intensity > 150 ? intensity * 0.8 : intensity * 0.3;
        const b = Math.min(255, 50 + intensity);

        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _renderStars(state: EffectState): void {
    const { width, height } = this.renderer;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.renderer.setPixel(x, y, [5, 5, 15]);
      }
    }

    const stars = state.stars as Array<{ x: number; y: number; phase: number }>;
    for (const star of stars) {
      const brightness = (Math.sin(star.phase) * 0.5 + 0.5) * 255;
      const x = Math.floor(star.x);
      const y = Math.floor(star.y);
      if (x >= 0 && x < width && y >= 0 && y < height) {
        this.renderer.setPixel(x, y, [brightness, brightness, brightness * 0.9]);
      }
    }
  }

  private _createConfettiParticle(
    width: number,
    height: number,
    randomY: boolean
  ): {
    x: number; y: number; speed: number; drift: number;
    color: RGBColor; size: number; rotation: number; rotationSpeed: number;
  } {
    const colors: RGBColor[] = [
      [255, 0, 0], [0, 255, 0], [0, 0, 255], [255, 255, 0],
      [255, 0, 255], [0, 255, 255], [255, 128, 0], [255, 192, 203],
    ];

    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -2,
      speed: 0.2 + Math.random() * 0.3,
      drift: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1 + Math.random(),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    };
  }

  private _renderConfetti(state: EffectState): void {
    const { width, height } = this.renderer;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.renderer.setPixel(x, y, [10, 10, 10]);
      }
    }

    const particles = state.particles as Array<{
      x: number; y: number; color: RGBColor; rotation: number;
    }>;
    for (const p of particles) {
      const x = Math.floor(p.x);
      const y = Math.floor(p.y);
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const shimmer = Math.abs(Math.sin(p.rotation)) * 0.5 + 0.5;
        const [r, g, b] = p.color;
        this.renderer.setPixel(x, y, [r * shimmer, g * shimmer, b * shimmer]);
      }
    }
  }

  private _renderPlasmaWave(state: EffectState): void {
    const { width, height } = this.renderer;
    const time = (state.time as number) || 0;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const uvX = x / width;
        const uvY = y / height;

        const v =
          Math.sin(uvX * 10.0 + time) +
          Math.sin(uvY * 10.0 + time) +
          Math.sin((uvX + uvY) * 10.0 + time) +
          Math.sin(Math.sqrt((uvX - 0.5) ** 2 + (uvY - 0.5) ** 2) * 20.0 - time * 2.0);

        const r = Math.sin(v * Math.PI) * 0.5 + 0.5;
        const g = Math.sin(v * Math.PI + 2.094) * 0.5 + 0.5;
        const b = Math.sin(v * Math.PI + 4.188) * 0.5 + 0.5;

        this.renderer.setPixel(x, y, [r * 255, g * 255, b * 255]);
      }
    }
  }

  private _renderRadialPulse(state: EffectState): void {
    const { width, height } = this.renderer;
    const time = (state.time as number) || 0;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const wave = Math.sin(dist * 0.8 - time * 3.0) * 0.5 + 0.5;
        const pulse = Math.sin(time * 2.0) * 0.3 + 0.7;

        const hue = (dist / 20 + time * 0.5) % 1;
        const [r, g, b] = hsvToRgb(hue, 0.8, wave * pulse);

        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _renderHypnotic(state: EffectState): void {
    const { width, height } = this.renderer;
    const time = (state.time as number) || 0;
    const centerX = width / 2;
    const centerY = height / 2;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);

        const spiral = Math.sin(angle * 4.0 + dist * 0.5 - time * 2.0);
        const intensity = spiral * 0.5 + 0.5;

        const r = intensity * (Math.sin(time) * 0.5 + 0.5);
        const g = intensity * (Math.sin(time + 2.094) * 0.5 + 0.5);
        const b = intensity * (Math.sin(time + 4.188) * 0.5 + 0.5);

        this.renderer.setPixel(x, y, [r * 255, g * 255, b * 255]);
      }
    }
  }

  private _renderLava(state: EffectState): void {
    const { width, height } = this.renderer;
    const time = (state.time as number) || 0;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const uvX = x / width;
        const uvY = y / height;

        const n1 = Math.sin(uvX * 8.0 + time * 0.7) * Math.cos(uvY * 6.0 + time * 0.5);
        const n2 = Math.sin(uvX * 12.0 - time * 0.3) * Math.sin(uvY * 10.0 + time * 0.8);
        const n3 = Math.cos((uvX + uvY) * 5.0 + time);

        const value = (n1 + n2 + n3 + 3) / 6;

        let r: number, g: number, b: number;
        if (value < 0.3) {
          r = value * 3 * 100; g = 0; b = 0;
        } else if (value < 0.6) {
          r = 100 + (value - 0.3) * 3 * 155;
          g = (value - 0.3) * 3 * 100;
          b = 0;
        } else {
          r = 255;
          g = 100 + (value - 0.6) * 2.5 * 155;
          b = (value - 0.6) * 2.5 * 100;
        }

        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _renderAurora(state: EffectState): void {
    const { width, height } = this.renderer;
    const time = (state.time as number) || 0;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const uvX = x / width;
        const uvY = y / height;

        const wave1 = Math.sin(uvX * 6.0 + time) * 0.3;
        const wave2 = Math.sin(uvX * 4.0 - time * 0.7) * 0.2;
        const wave3 = Math.sin(uvX * 8.0 + time * 1.3) * 0.15;

        const waveLine = 0.5 + wave1 + wave2 + wave3;
        const distFromWave = Math.abs(uvY - waveLine);

        const intensity = Math.max(0, 1 - distFromWave * 4);
        const glow = Math.pow(intensity, 1.5);

        const colorShift = Math.sin(uvX * 3.0 + time * 0.5);
        let r = glow * (0.2 + colorShift * 0.3) * 255;
        let g = glow * (0.8 + Math.sin(time + uvX) * 0.2) * 255;
        let b = glow * (0.6 + colorShift * 0.4) * 255;

        const starChance = Math.sin(x * 127.1 + y * 311.7) * 0.5 + 0.5;
        const starTwinkle = Math.sin(time * 3 + x + y) * 0.5 + 0.5;

        if (starChance > 0.98 && intensity < 0.3) {
          const starBright = starTwinkle * 180;
          r = Math.max(r, starBright);
          g = Math.max(g, starBright);
          b = Math.max(b, starBright * 0.9);
        }

        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }
}

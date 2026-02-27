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

      // HUB75-inspired panel effects
      case 'starfield': {
        const stars: Array<{ x: number; y: number; z: number; pz: number }> = [];
        for (let i = 0; i < 40; i++) {
          stars.push({
            x: (Math.random() - 0.5) * width * 4,
            y: (Math.random() - 0.5) * height * 4,
            z: Math.random() * width * 2,
            pz: 0,
          });
        }
        state.stars3d = stars;
        break;
      }
      case 'fireworks': {
        state.rockets = [];
        state.particles = [];
        state.spawnTimer = 0;
        break;
      }
      case 'rain_storm': {
        state.drops = [];
        for (let i = 0; i < 30; i++) {
          (state.drops as Array<{ x: number; y: number; speed: number; brightness: number; length: number }>).push({
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.3 + Math.random() * 0.5,
            brightness: 0.3 + Math.random() * 0.7,
            length: 2 + Math.floor(Math.random() * 3),
          });
        }
        state.lightning = 0;
        state.time = 0;
        break;
      }
      case 'munch':
        state.counter = 0;
        state.direction = 1;
        state.time = 0;
        break;
      case 'bouncing': {
        const balls: Array<{ x: number; y: number; vx: number; vy: number; color: RGBColor }> = [];
        const ballColors: RGBColor[] = [
          [255, 60, 60], [60, 255, 60], [60, 60, 255],
          [255, 255, 60], [255, 60, 255], [60, 255, 255],
        ];
        for (let i = 0; i < 6; i++) {
          balls.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            color: ballColors[i],
          });
        }
        state.balls = balls;
        state.trailBuffer = [];
        for (let i = 0; i < width * height; i++) {
          (state.trailBuffer as RGBColor[]).push([0, 0, 0]);
        }
        break;
      }
      case 'flow_field':
        state.time = 0;
        state.flowParticles = [];
        for (let i = 0; i < 50; i++) {
          (state.flowParticles as Array<{ x: number; y: number; hue: number }>).push({
            x: Math.random() * width,
            y: Math.random() * height,
            hue: Math.random(),
          });
        }
        state.trailBuffer = [];
        for (let i = 0; i < width * height; i++) {
          (state.trailBuffer as RGBColor[]).push([0, 0, 0]);
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

      // HUB75-inspired panel effects
      case 'starfield':
        this._stepStarfield(state, width, height);
        break;
      case 'fireworks':
        this._stepFireworks(state, width, height);
        break;
      case 'rain_storm':
        this._stepRainStorm(state, width, height);
        break;
      case 'munch':
        state.time = ((state.time as number) || 0) + 1;
        if ((state.time as number) % 2 === 0) {
          (state.counter as number) += (state.direction as number);
          if ((state.counter as number) >= width) {
            state.direction = -1;
            state.counter = width - 1;
          } else if ((state.counter as number) < 0) {
            state.direction = 1;
            state.counter = 0;
          }
        }
        break;
      case 'bouncing':
        this._stepBouncing(state, width, height);
        break;
      case 'flow_field':
        this._stepFlowField(state, width, height);
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
      // HUB75-inspired panel effects
      case 'starfield': this._renderStarfield(state); break;
      case 'fireworks': this._renderFireworks(state); break;
      case 'rain_storm': this._renderRainStorm(state); break;
      case 'munch': this._renderMunch(state); break;
      case 'bouncing': this._renderBouncing(state); break;
      case 'flow_field': this._renderFlowField(state); break;
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

  // =============================================
  // HUB75-inspired panel effects
  // =============================================

  private _stepStarfield(state: EffectState, _width: number, _height: number): void {
    const stars = state.stars3d as Array<{ x: number; y: number; z: number; pz: number }>;
    for (const star of stars) {
      star.pz = star.z;
      star.z -= 0.8;
      if (star.z <= 0) {
        star.x = (Math.random() - 0.5) * _width * 4;
        star.y = (Math.random() - 0.5) * _height * 4;
        star.z = _width * 2;
        star.pz = star.z;
      }
    }
  }

  private _renderStarfield(state: EffectState): void {
    const { width, height } = this.renderer;
    const stars = state.stars3d as Array<{ x: number; y: number; z: number; pz: number }>;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.renderer.setPixel(x, y, [2, 2, 8]);
      }
    }

    const cx = width / 2;
    const cy = height / 2;

    for (const star of stars) {
      const sx = Math.floor((star.x / star.z) * width * 0.3 + cx);
      const sy = Math.floor((star.y / star.z) * height * 0.3 + cy);

      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const brightness = Math.min(255, Math.floor((1 - star.z / (width * 2)) * 255));
        const size = star.z < width * 0.5 ? 1 : 0;
        this.renderer.setPixel(sx, sy, [brightness, brightness, brightness * 0.9]);
        if (size > 0 && sx + 1 < width) {
          this.renderer.setPixel(sx + 1, sy, [brightness * 0.5, brightness * 0.5, brightness * 0.45]);
        }
      }
    }
  }

  private _stepFireworks(state: EffectState, width: number, height: number): void {
    type Rocket = { x: number; y: number; vy: number; color: RGBColor; exploded: boolean };
    type Particle = { x: number; y: number; vx: number; vy: number; color: RGBColor; life: number };
    const rockets = state.rockets as Rocket[];
    const particles = state.particles as Particle[];

    (state.spawnTimer as number)++;
    if ((state.spawnTimer as number) > 40 && rockets.length < 3) {
      state.spawnTimer = 0;
      const hue = Math.random();
      const [r, g, b] = hsvToRgb(hue, 1, 1);
      rockets.push({
        x: Math.random() * width,
        y: height - 1,
        vy: -(1.0 + Math.random() * 0.5),
        color: [r, g, b],
        exploded: false,
      });
    }

    for (let i = rockets.length - 1; i >= 0; i--) {
      const rocket = rockets[i];
      rocket.y += rocket.vy;
      rocket.vy += 0.02; // gravity
      if (rocket.vy >= -0.2 && !rocket.exploded) {
        rocket.exploded = true;
        const numParticles = 16 + Math.floor(Math.random() * 8);
        for (let j = 0; j < numParticles; j++) {
          const angle = (j / numParticles) * Math.PI * 2;
          const speed = 0.5 + Math.random() * 0.8;
          particles.push({
            x: rocket.x,
            y: rocket.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: [rocket.color[0], rocket.color[1], rocket.color[2]],
            life: 1.0,
          });
        }
        rockets.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.03; // gravity
      p.life -= 0.02;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  private _renderFireworks(state: EffectState): void {
    const { width, height } = this.renderer;
    type Rocket = { x: number; y: number; color: RGBColor };
    type Particle = { x: number; y: number; color: RGBColor; life: number };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.renderer.setPixel(x, y, [5, 5, 10]);
      }
    }

    const rockets = state.rockets as Rocket[];
    for (const rocket of rockets) {
      const rx = Math.floor(rocket.x);
      const ry = Math.floor(rocket.y);
      if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
        this.renderer.setPixel(rx, ry, [255, 255, 200]);
      }
    }

    const particles = state.particles as Particle[];
    for (const p of particles) {
      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        this.renderer.setPixel(px, py, [
          p.color[0] * p.life,
          p.color[1] * p.life,
          p.color[2] * p.life,
        ]);
      }
    }
  }

  private _stepRainStorm(state: EffectState, width: number, height: number): void {
    const drops = state.drops as Array<{ x: number; y: number; speed: number; brightness: number; length: number }>;
    state.time = ((state.time as number) || 0) + 1;

    for (const drop of drops) {
      drop.y += drop.speed;
      if (drop.y > height + drop.length) {
        drop.y = -drop.length;
        drop.x = Math.random() * width;
        drop.speed = 0.3 + Math.random() * 0.5;
        drop.brightness = 0.3 + Math.random() * 0.7;
      }
    }

    // Random lightning flash
    if (Math.random() < 0.005) {
      state.lightning = 8;
    }
    if ((state.lightning as number) > 0) {
      (state.lightning as number)--;
    }
  }

  private _renderRainStorm(state: EffectState): void {
    const { width, height } = this.renderer;
    const drops = state.drops as Array<{ x: number; y: number; speed: number; brightness: number; length: number }>;
    const lightning = (state.lightning as number) || 0;

    const bgBright = lightning > 0 ? Math.min(80, lightning * 10) : 3;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.renderer.setPixel(x, y, [bgBright, bgBright, bgBright + 5]);
      }
    }

    for (const drop of drops) {
      for (let i = 0; i < drop.length; i++) {
        const dy = Math.floor(drop.y) - i;
        const dx = Math.floor(drop.x);
        if (dx >= 0 && dx < width && dy >= 0 && dy < height) {
          const fade = 1 - (i / drop.length);
          const b = drop.brightness * fade;
          this.renderer.setPixel(dx, dy, [b * 100, b * 150, b * 255]);
        }
      }
    }
  }

  private _renderMunch(state: EffectState): void {
    const { width, height } = this.renderer;
    const counter = (state.counter as number) || 0;
    const time = (state.time as number) || 0;
    const hueBase = (time * 0.005) % 1;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const xorVal = (x ^ y ^ counter) & 0xF;
        const brightness = xorVal / 15;
        const hue = (hueBase + brightness * 0.3) % 1;
        const [r, g, b] = hsvToRgb(hue, 0.8, brightness * 0.8);
        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _stepBouncing(state: EffectState, width: number, height: number): void {
    const balls = state.balls as Array<{ x: number; y: number; vx: number; vy: number; color: RGBColor }>;
    const trailBuffer = state.trailBuffer as RGBColor[];

    // Fade trail buffer
    for (let i = 0; i < trailBuffer.length; i++) {
      trailBuffer[i] = [
        trailBuffer[i][0] * 0.85,
        trailBuffer[i][1] * 0.85,
        trailBuffer[i][2] * 0.85,
      ];
    }

    for (const ball of balls) {
      ball.x += ball.vx;
      ball.y += ball.vy;

      if (ball.x <= 0 || ball.x >= width - 1) {
        ball.vx *= -1;
        ball.x = Math.max(0, Math.min(width - 1, ball.x));
      }
      if (ball.y <= 0 || ball.y >= height - 1) {
        ball.vy *= -1;
        ball.y = Math.max(0, Math.min(height - 1, ball.y));
      }

      const px = Math.floor(ball.x);
      const py = Math.floor(ball.y);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = py * width + px;
        trailBuffer[idx] = [ball.color[0], ball.color[1], ball.color[2]];
      }
    }
  }

  private _renderBouncing(state: EffectState): void {
    const { width, height } = this.renderer;
    const trailBuffer = state.trailBuffer as RGBColor[];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const [r, g, b] = trailBuffer[idx] || [0, 0, 0];
        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }

  private _stepFlowField(state: EffectState, width: number, height: number): void {
    state.time = ((state.time as number) || 0) + 0.02;
    const time = state.time as number;
    const particles = state.flowParticles as Array<{ x: number; y: number; hue: number }>;
    const trailBuffer = state.trailBuffer as RGBColor[];

    // Fade trail buffer
    for (let i = 0; i < trailBuffer.length; i++) {
      trailBuffer[i] = [
        trailBuffer[i][0] * 0.92,
        trailBuffer[i][1] * 0.92,
        trailBuffer[i][2] * 0.92,
      ];
    }

    for (const p of particles) {
      // Perlin-like flow using layered sine
      const angle =
        Math.sin(p.x * 0.3 + time) * 2.0 +
        Math.cos(p.y * 0.3 + time * 0.7) * 2.0 +
        Math.sin((p.x + p.y) * 0.2 + time * 1.3);

      p.x += Math.cos(angle) * 0.5;
      p.y += Math.sin(angle) * 0.5;
      p.hue = (p.hue + 0.002) % 1;

      // Wrap around edges
      if (p.x < 0) p.x += width;
      if (p.x >= width) p.x -= width;
      if (p.y < 0) p.y += height;
      if (p.y >= height) p.y -= height;

      const px = Math.floor(p.x);
      const py = Math.floor(p.y);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        const [r, g, b] = hsvToRgb(p.hue, 0.8, 0.9);
        const idx = py * width + px;
        trailBuffer[idx] = [
          Math.min(255, trailBuffer[idx][0] + r * 0.5),
          Math.min(255, trailBuffer[idx][1] + g * 0.5),
          Math.min(255, trailBuffer[idx][2] + b * 0.5),
        ];
      }
    }
  }

  private _renderFlowField(state: EffectState): void {
    const { width, height } = this.renderer;
    const trailBuffer = state.trailBuffer as RGBColor[];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const [r, g, b] = trailBuffer[idx] || [0, 0, 0];
        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }
}

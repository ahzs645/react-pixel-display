import type { LEDRenderer, EffectState, PixelArray } from '../types';
import { hexToRgb, hsvToRgb } from '../utils';

export class ColorEffects {
  private renderer: LEDRenderer;

  constructor(renderer: LEDRenderer) {
    this.renderer = renderer;
  }

  init(effectName: string, state: EffectState): void {
    switch (effectName) {
      case 'color_cycle':
        state.hue = 0;
        break;
      case 'rainbow_text':
        state.offset = 0;
        break;
      case 'neon':
        state.glowIntensity = 0;
        state.direction = 1;
        state.baseColor = state.fgColor || '#ff00ff';
        break;
    }
  }

  step(effectName: string, state: EffectState): void {
    switch (effectName) {
      case 'color_cycle':
        state.hue = ((state.hue as number) + 0.01) % 1;
        break;
      case 'rainbow_text':
        state.offset = ((state.offset as number) + 0.02) % 1;
        break;
      case 'neon':
        (state.glowIntensity as number) += (state.direction as number) * 0.05;
        if ((state.glowIntensity as number) >= 1) {
          state.glowIntensity = 1;
          state.direction = -1;
        } else if ((state.glowIntensity as number) <= 0.3) {
          state.glowIntensity = 0.3;
          state.direction = 1;
        }
        break;
    }
  }

  render(effectName: string, state: EffectState, pixels: PixelArray): void {
    const { width, height } = this.renderer;
    const displayPixels = pixels || [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = displayPixels[y * width + x] || '#111';
        let [r, g, b] = hexToRgb(color);
        const isLit = r > 20 || g > 20 || b > 20;

        if (isLit) {
          switch (effectName) {
            case 'color_cycle': {
              const [nr, ng, nb] = hsvToRgb(state.hue as number, 1, 0.8);
              const brightness = (r + g + b) / (3 * 255);
              r = nr * brightness;
              g = ng * brightness;
              b = nb * brightness;
              break;
            }
            case 'rainbow_text': {
              const hue = ((state.offset as number) + x / width) % 1;
              const [nr, ng, nb] = hsvToRgb(hue, 1, 0.8);
              const brightness = (r + g + b) / (3 * 255);
              r = nr * brightness;
              g = ng * brightness;
              b = nb * brightness;
              break;
            }
            case 'neon': {
              const baseColor = hexToRgb((state.baseColor as string) || '#ff00ff');
              const intensity = (state.glowIntensity as number) || 0.5;

              r = baseColor[0] * intensity;
              g = baseColor[1] * intensity;
              b = baseColor[2] * intensity;

              if (intensity > 0.8) {
                const whiteMix = (intensity - 0.8) * 5;
                r = r + (255 - r) * whiteMix * 0.3;
                g = g + (255 - g) * whiteMix * 0.3;
                b = b + (255 - b) * whiteMix * 0.3;
              }
              break;
            }
          }
        }

        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }
}

import type { LEDRenderer, EffectState, PixelArray } from '../types';
import { hexToRgb } from '../utils';

export class TextEffects {
  private renderer: LEDRenderer;

  constructor(renderer: LEDRenderer) {
    this.renderer = renderer;
  }

  init(effectName: string, state: EffectState): void {
    const { width, height } = this.renderer;

    switch (effectName) {
      case 'scroll_ltr':
      case 'scroll_rtl':
        // Start at the beginning of the text region instead of the leading blank padding.
        // This avoids long "empty" periods before the first glyph enters view.
        state.offset = -width;
        break;
      case 'blink':
        state.visible = true;
        break;
      case 'snow':
      case 'breeze':
        state.phases = [];
        for (let i = 0; i < width * height; i++) {
          (state.phases as number[]).push(Math.random() * Math.PI * 2);
        }
        break;
      case 'laser':
        state.position = 0;
        break;
      case 'fade':
        state.opacity = 0;
        state.direction = 1;
        break;
      case 'typewriter':
        state.charIndex = 0;
        state.cursorVisible = true;
        break;
      case 'bounce':
        state.offset = 0;
        state.direction = 1;
        break;
      case 'sparkle':
        state.sparkles = [];
        for (let i = 0; i < Math.floor(width * height * 0.1); i++) {
          (state.sparkles as Array<{ x: number; y: number; brightness: number; speed: number }>).push({
            x: Math.floor(Math.random() * width),
            y: Math.floor(Math.random() * height),
            brightness: Math.random(),
            speed: 0.05 + Math.random() * 0.1,
          });
        }
        break;

      // Parola-inspired transition effects
      case 'scroll_up':
        state.yOffset = -height;
        break;
      case 'scroll_down':
        state.yOffset = height;
        break;
      case 'dissolve': {
        // Create a random threshold for each pixel to control reveal order
        const thresholds: number[] = [];
        for (let i = 0; i < width * height; i++) {
          thresholds.push(Math.random());
        }
        state.thresholds = thresholds;
        state.progress = 0;
        state.direction = 1;
        break;
      }
      case 'blinds':
        state.progress = 0;
        state.direction = 1;
        break;
      case 'wipe':
        state.wipeX = -1;
        state.direction = 1;
        break;
      case 'scan_horiz':
        state.scanX = -1;
        state.revealed = false;
        state.direction = 1;
        break;
      case 'scan_vert':
        state.scanY = -1;
        state.revealed = false;
        state.direction = 1;
        break;
      case 'grow_up':
        state.rows = 0;
        state.direction = 1;
        break;
      case 'grow_down':
        state.rows = 0;
        state.direction = 1;
        break;
      case 'opening':
        state.halfWidth = 0;
        state.direction = 1;
        break;
    }
  }

  step(effectName: string, state: EffectState): void {
    const { width, extendedWidth } = this.renderer;

    switch (effectName) {
      case 'scroll_ltr':
        (state.offset as number) -= 1;
        if ((state.offset as number) <= -(extendedWidth || width)) {
          state.offset = width;
        }
        break;
      case 'scroll_rtl':
        (state.offset as number) += 1;
        if ((state.offset as number) >= (extendedWidth || width)) {
          state.offset = -width;
        }
        break;
      case 'blink':
        state.visible = !state.visible;
        break;
      case 'laser':
        state.position = ((state.position as number) + 1) % width;
        break;
      case 'fade':
        (state.opacity as number) += (state.direction as number) * 0.05;
        if ((state.opacity as number) >= 1) {
          state.opacity = 1;
          state.direction = -1;
        } else if ((state.opacity as number) <= 0) {
          state.opacity = 0;
          state.direction = 1;
        }
        break;
      case 'typewriter':
        if (state.tick % 3 === 0) {
          (state.charIndex as number)++;
        }
        state.cursorVisible = state.tick % 10 < 5;
        break;
      case 'bounce': {
        (state.offset as number) += (state.direction as number);
        const maxOffset = Math.max(0, (extendedWidth || width) - width);
        if ((state.offset as number) >= maxOffset) {
          state.offset = maxOffset;
          state.direction = -1;
        } else if ((state.offset as number) <= 0) {
          state.offset = 0;
          state.direction = 1;
        }
        break;
      }
      case 'sparkle': {
        const sparkles = state.sparkles as Array<{ x: number; y: number; brightness: number; speed: number }>;
        for (const sparkle of sparkles) {
          sparkle.brightness += sparkle.speed;
          if (sparkle.brightness > 1) {
            sparkle.brightness = 0;
            sparkle.x = Math.floor(Math.random() * width);
            sparkle.y = Math.floor(Math.random() * this.renderer.height);
          }
        }
        break;
      }

      // Parola-inspired transition effects
      case 'scroll_up':
        (state.yOffset as number) += 1;
        if ((state.yOffset as number) > this.renderer.height) {
          state.yOffset = -this.renderer.height;
        }
        break;
      case 'scroll_down':
        (state.yOffset as number) -= 1;
        if ((state.yOffset as number) < -this.renderer.height) {
          state.yOffset = this.renderer.height;
        }
        break;
      case 'dissolve':
        (state.progress as number) += (state.direction as number) * 0.02;
        if ((state.progress as number) >= 1) {
          state.progress = 1;
          state.direction = -1;
        } else if ((state.progress as number) <= 0) {
          state.progress = 0;
          state.direction = 1;
        }
        break;
      case 'blinds':
        (state.progress as number) += (state.direction as number) * 0.03;
        if ((state.progress as number) >= 1) {
          state.progress = 1;
          state.direction = -1;
        } else if ((state.progress as number) <= 0) {
          state.progress = 0;
          state.direction = 1;
        }
        break;
      case 'wipe':
        (state.wipeX as number) += (state.direction as number);
        if ((state.wipeX as number) >= width + 2) {
          state.direction = -1;
        } else if ((state.wipeX as number) <= -3) {
          state.direction = 1;
        }
        break;
      case 'scan_horiz':
        (state.scanX as number) += (state.direction as number);
        if ((state.scanX as number) >= width) {
          state.revealed = !(state.revealed as boolean);
          state.direction = -1;
          state.scanX = width - 1;
        } else if ((state.scanX as number) < 0) {
          state.revealed = !(state.revealed as boolean);
          state.direction = 1;
          state.scanX = 0;
        }
        break;
      case 'scan_vert': {
        const h = this.renderer.height;
        (state.scanY as number) += (state.direction as number);
        if ((state.scanY as number) >= h) {
          state.revealed = !(state.revealed as boolean);
          state.direction = -1;
          state.scanY = h - 1;
        } else if ((state.scanY as number) < 0) {
          state.revealed = !(state.revealed as boolean);
          state.direction = 1;
          state.scanY = 0;
        }
        break;
      }
      case 'grow_up':
        (state.rows as number) += (state.direction as number);
        if ((state.rows as number) >= this.renderer.height) {
          state.rows = this.renderer.height;
          state.direction = -1;
        } else if ((state.rows as number) <= 0) {
          state.rows = 0;
          state.direction = 1;
        }
        break;
      case 'grow_down':
        (state.rows as number) += (state.direction as number);
        if ((state.rows as number) >= this.renderer.height) {
          state.rows = this.renderer.height;
          state.direction = -1;
        } else if ((state.rows as number) <= 0) {
          state.rows = 0;
          state.direction = 1;
        }
        break;
      case 'opening': {
        const halfMax = Math.ceil(width / 2);
        (state.halfWidth as number) += (state.direction as number);
        if ((state.halfWidth as number) >= halfMax) {
          state.halfWidth = halfMax;
          state.direction = -1;
        } else if ((state.halfWidth as number) <= 0) {
          state.halfWidth = 0;
          state.direction = 1;
        }
        break;
      }
    }
  }

  render(
    effectName: string,
    state: EffectState,
    pixels: PixelArray,
    extendedPixels: PixelArray,
    extendedWidth: number
  ): void {
    const { width, height } = this.renderer;
    const srcPixels = extendedPixels || pixels || [];
    const displayPixels = pixels || [];
    const srcWidth = extendedWidth || width;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let color: string;
        let sourceX = x;

        if (effectName === 'scroll_ltr' || effectName === 'scroll_rtl' || effectName === 'bounce') {
          sourceX = x - ((state.offset as number) || 0);
          while (sourceX < 0) sourceX += srcWidth;
          while (sourceX >= srcWidth) sourceX -= srcWidth;
          color = srcPixels[y * srcWidth + sourceX] || '#111';
        } else if (effectName === 'typewriter') {
          const charWidth = 6;
          const maxX = ((state.charIndex as number) || 0) * charWidth;
          if (x < maxX) {
            color = displayPixels[y * width + x] || '#111';
          } else if (x === maxX && state.cursorVisible) {
            color = '#ffffff';
          } else {
            color = '#111';
          }
        } else if (effectName === 'scroll_up' || effectName === 'scroll_down') {
          const sourceY = y + ((state.yOffset as number) || 0);
          if (sourceY >= 0 && sourceY < height) {
            color = displayPixels[sourceY * width + x] || '#111';
          } else {
            color = '#111';
          }
        } else if (effectName === 'dissolve') {
          const thresholds = state.thresholds as number[];
          const progress = (state.progress as number) || 0;
          const idx = y * width + x;
          if (thresholds[idx] < progress) {
            color = displayPixels[idx] || '#111';
          } else {
            color = '#111';
          }
        } else if (effectName === 'blinds') {
          const progress = (state.progress as number) || 0;
          const blindWidth = 4;
          const posInBlind = x % blindWidth;
          const revealedCols = Math.floor(progress * blindWidth);
          if (posInBlind < revealedCols) {
            color = displayPixels[y * width + x] || '#111';
          } else {
            color = '#111';
          }
        } else if (effectName === 'wipe') {
          const wipeX = (state.wipeX as number) || 0;
          const dir = (state.direction as number) || 1;
          if (dir > 0) {
            // Wiping right: reveal pixels left of wipeX
            if (x <= wipeX) {
              color = displayPixels[y * width + x] || '#111';
            } else if (x === wipeX + 1 || x === wipeX + 2) {
              color = '#ffffff'; // cursor bar
            } else {
              color = '#111';
            }
          } else {
            // Wiping left: hide pixels right of wipeX
            if (x < wipeX) {
              color = displayPixels[y * width + x] || '#111';
            } else if (x === wipeX || x === wipeX + 1) {
              color = '#ffffff'; // cursor bar
            } else {
              color = '#111';
            }
          }
        } else if (effectName === 'scan_horiz') {
          const scanX = (state.scanX as number) || 0;
          const revealed = (state.revealed as boolean) || false;
          const dir = (state.direction as number) || 1;
          const isRevealed = dir > 0 ? (revealed ? true : x <= scanX) : (revealed ? x <= scanX : true);
          if (x === scanX) {
            color = '#ffffff'; // bright scan line
          } else if (isRevealed) {
            color = displayPixels[y * width + x] || '#111';
          } else {
            color = '#111';
          }
        } else if (effectName === 'scan_vert') {
          const scanY = (state.scanY as number) || 0;
          const revealed = (state.revealed as boolean) || false;
          const dir = (state.direction as number) || 1;
          const isRevealed = dir > 0 ? (revealed ? true : y <= scanY) : (revealed ? y <= scanY : true);
          if (y === scanY) {
            color = '#ffffff'; // bright scan line
          } else if (isRevealed) {
            color = displayPixels[y * width + x] || '#111';
          } else {
            color = '#111';
          }
        } else if (effectName === 'grow_up') {
          const rows = (state.rows as number) || 0;
          if (y >= height - rows) {
            color = displayPixels[y * width + x] || '#111';
          } else {
            color = '#111';
          }
        } else if (effectName === 'grow_down') {
          const rows = (state.rows as number) || 0;
          if (y < rows) {
            color = displayPixels[y * width + x] || '#111';
          } else {
            color = '#111';
          }
        } else if (effectName === 'opening') {
          const halfWidth = (state.halfWidth as number) || 0;
          const center = Math.floor(width / 2);
          if (x >= center - halfWidth && x <= center + halfWidth) {
            color = displayPixels[y * width + x] || '#111';
          } else {
            color = '#111';
          }
        } else {
          color = displayPixels[y * width + x] || '#111';
        }

        let [r, g, b] = hexToRgb(color);
        const isLit = r > 20 || g > 20 || b > 20;

        if (isLit) {
          switch (effectName) {
            case 'blink':
              if (!state.visible) {
                r = g = b = 17;
              }
              break;
            case 'snow': {
              const phases = state.phases as number[];
              const phase = phases?.[y * width + x] || 0;
              const tick = state.tick || 0;
              const factor = 0.3 + 0.7 * Math.abs(Math.sin(phase + tick * 0.3));
              r *= factor;
              g *= factor;
              b *= factor;
              break;
            }
            case 'breeze': {
              const phases = state.phases as number[];
              const phase = phases?.[y * width + x] || 0;
              const tick = state.tick || 0;
              const factor = 0.4 + 0.6 * Math.abs(Math.sin(phase + tick * 0.15 + x * 0.2));
              r *= factor;
              g *= factor;
              b *= factor;
              break;
            }
            case 'laser': {
              const pos = (state.position as number) || 0;
              const dist = Math.abs(x - pos);
              const factor = dist < 3 ? 1 : 0.3;
              r *= factor;
              g *= factor;
              b *= factor;
              break;
            }
            case 'fade': {
              const opacity = (state.opacity as number) || 1;
              r *= opacity;
              g *= opacity;
              b *= opacity;
              break;
            }
          }
        }

        if (effectName === 'sparkle' && state.sparkles) {
          const sparkles = state.sparkles as Array<{ x: number; y: number; brightness: number }>;
          for (const sparkle of sparkles) {
            if (sparkle.x === x && sparkle.y === y) {
              const sparkleIntensity = Math.sin(sparkle.brightness * Math.PI);
              r = Math.min(255, r + sparkleIntensity * 200);
              g = Math.min(255, g + sparkleIntensity * 200);
              b = Math.min(255, b + sparkleIntensity * 200);
            }
          }
        }

        this.renderer.setPixel(x, y, [r, g, b]);
      }
    }
  }
}

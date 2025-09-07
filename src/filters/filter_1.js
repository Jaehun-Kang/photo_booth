// CMYK 하프톤 프린터 필터
export const templateFilter1 = {
  setup(p5js) {
    // CMYK 색상 정의
    this.cmykColors = {
      C: [0, 174, 239], // 시안
      M: [236, 0, 140], // 마젠타
      Y: [255, 242, 0], // 옐로우
    };

    // 하프톤 설정
    this.baseDotSize = 28;
    this.spacingMultiplier = 1;
    this.minDotSize = 4;
    this.dotOffset = 0.6;

    // CMY 채널 오프셋 비율
    this.channelOffsetRatios = {
      C: { x: 0, y: -this.dotOffset / 3 },
      M: { x: -this.dotOffset / 2, y: this.dotOffset / 3 },
      Y: { x: this.dotOffset / 2, y: this.dotOffset / 3 },
    };

    // 기본 설정
    this.backgroundColor = [240, 240, 235];
    this.lastCanvasSize = { w: 0, h: 0 };
    this.cachedGrid = null;
    this.cmykLUT = new Map();
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    // 배경 그리기
    p5js.background(...this.backgroundColor);

    offscreen.loadPixels();
    if (!offscreen.pixels.length) return;

    const pixels = offscreen.pixels;
    const maxDotSize = this.baseDotSize;
    const dotSpacing = maxDotSize * this.spacingMultiplier;

    // 그리드 계산 및 캐싱
    const sizeChanged =
      this.lastCanvasSize.w !== canvasW || this.lastCanvasSize.h !== canvasH;
    if (sizeChanged || !this.cachedGrid) {
      this.lastCanvasSize = { w: canvasW, h: canvasH };

      const cols = Math.floor(canvasW / dotSpacing);
      const rows = Math.floor(canvasH / dotSpacing);
      const startX = (canvasW - (cols - 1) * dotSpacing) / 2;
      const startY = (canvasH - (rows - 1) * dotSpacing) / 2;

      this.cachedGrid = {
        cols,
        rows,
        startX,
        startY,
        dotSpacing,
        maxDotSize,
        scaleX: captureW / canvasW,
        scaleY: captureH / canvasH,
      };
    }

    const grid = this.cachedGrid;

    // 점 데이터 계산
    const dotData = [];
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const srcX = Math.floor(
          (col * grid.dotSpacing + grid.dotSpacing / 2) * grid.scaleX
        );
        const srcY = Math.floor(
          (row * grid.dotSpacing + grid.dotSpacing / 2) * grid.scaleY
        );

        if (srcX >= captureW || srcY >= captureH) continue;

        const pixelIndex = (srcY * captureW + srcX) * 4;
        const r = pixels[pixelIndex];
        const g = pixels[pixelIndex + 1];
        const b = pixels[pixelIndex + 2];

        const cmyk = this.rgbToCMYK(r, g, b);
        dotData.push({
          cmyk,
          x: grid.startX + col * grid.dotSpacing,
          y: grid.startY + row * grid.dotSpacing,
        });
      }
    }

    // 채널별 렌더링 (CMY만 사용 - 블랙 제거)
    const channels = ["Y", "C", "M"];

    for (const channel of channels) {
      const color = this.cmykColors[channel];
      const offsetRatio = this.channelOffsetRatios[channel];

      // 블렌드 모드 및 색상 설정 (CMY 전용)
      p5js.blendMode(p5js.MULTIPLY);
      p5js.fill(...color, 180); // 모든 CMY 채널 동일한 투명도
      p5js.noStroke();

      // 점 그리기
      for (const dot of dotData) {
        const channelValue = dot.cmyk[channel.toLowerCase()];
        const dotSize =
          this.minDotSize +
          (channelValue / 100) * (grid.maxDotSize - this.minDotSize);

        if (dotSize < 2) continue;

        // 점 크기에 비례한 동적 오프셋 계산
        const dynamicOffset = {
          x: offsetRatio.x * dotSize,
          y: offsetRatio.y * dotSize,
        };

        const x = dot.x + dynamicOffset.x;
        const y = dot.y + dynamicOffset.y;

        p5js.circle(x, y, dotSize);
      }
    }

    p5js.blendMode(p5js.BLEND);
  },

  // RGB → CMYK 변환 (캐싱 포함)
  rgbToCMYK(r, g, b) {
    const key = `${Math.round(r / 20) * 20}_${Math.round(g / 20) * 20}_${
      Math.round(b / 20) * 20
    }`;

    if (this.cmykLUT.has(key)) {
      return this.cmykLUT.get(key);
    }

    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    let k = (1 - Math.max(rNorm, gNorm, bNorm)) * 0.6; // 블랙 비중 감소

    let c, m, y;
    if (k < 1) {
      c = (1 - rNorm - k) / (1 - k);
      m = (1 - gNorm - k) / (1 - k);
      y = (1 - bNorm - k) / (1 - k);
    } else {
      c = m = y = 0;
    }

    // 색상 보정
    c = Math.max(0, Math.min(1, c * 1.2));
    m = Math.max(0, Math.min(1, m * 1.2));
    y = Math.max(0, Math.min(1, y * 1.1));

    const result = {
      c: c * 100,
      m: m * 100,
      y: y * 100,
      k: k * 100,
    };

    if (this.cmykLUT.size < 500) {
      this.cmykLUT.set(key, result);
    }

    return result;
  },
};

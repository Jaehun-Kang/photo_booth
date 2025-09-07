export const templateFilter4 = {
  setup(p5js) {
    p5js.noStroke();
    p5js.colorMode(p5js.RGB, 255);

    // 최적화된 매개변수
    this.pixelSize = 8; // 픽셀 크기
    this.clusterCount = 160; // 클러스터 개수
    this.analysisRadius = 1; // 분석 반경

    // 성능 최적화를 위한 캐싱
    this.dominantColors = null;
    this.isInitialized = false; // 초기화 상태 추적
    this.simplifiedMode = true; // 간소화 모드
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(20);

    offscreen.loadPixels();
    if (!offscreen.pixels.length) return;

    const pixels = offscreen.pixels;

    // 클러스터 생성
    if (!this.isInitialized) {
      this.dominantColors = this.extractDominantColors(
        pixels,
        captureW,
        captureH
      );
      this.isInitialized = true;

      // 디버그: 생성된 클러스터 개수 확인
      console.log(
        `클러스터 개수: ${this.clusterCount}, 실제 생성된 클러스터: ${this.dominantColors.length}`
      );
    }

    // 픽셀 그리기 최적화
    this.drawOptimizedPixels(
      p5js,
      pixels,
      canvasW,
      canvasH,
      captureW,
      captureH
    );
  },

  // 최적화된 픽셀 그리기
  drawOptimizedPixels(p5js, pixels, canvasW, canvasH, captureW, captureH) {
    const scaleX = captureW / canvasW;
    const scaleY = captureH / canvasH;
    const halfPixel = this.pixelSize / 2;

    // 색상별로 그룹화하여 draw call 줄이기
    const colorGroups = new Map();

    for (let y = 0; y < canvasH; y += this.pixelSize) {
      for (let x = 0; x < canvasW; x += this.pixelSize) {
        const sourceX = Math.floor(x * scaleX);
        const sourceY = Math.floor(y * scaleY);

        if (sourceX < captureW && sourceY < captureH) {
          const centerIndex = (sourceY * captureW + sourceX) * 4;
          const pixelColor = {
            r: pixels[centerIndex],
            g: pixels[centerIndex + 1],
            b: pixels[centerIndex + 2],
          };

          const clusterColor = this.findNearestClusterFast(pixelColor);
          const colorKey = `${clusterColor.r},${clusterColor.g},${clusterColor.b}`;

          if (!colorGroups.has(colorKey)) {
            colorGroups.set(colorKey, []);
          }
          colorGroups.get(colorKey).push({
            x: x + halfPixel,
            y: y + halfPixel,
          });
        }
      }
    }

    // 색상별로 일괄 렌더링 (draw call 최적화)
    p5js.noStroke();
    colorGroups.forEach((positions, colorKey) => {
      const [r, g, b] = colorKey.split(",").map(Number);
      p5js.fill(r, g, b);

      positions.forEach((pos) => {
        p5js.rect(
          pos.x - halfPixel,
          pos.y - halfPixel,
          this.pixelSize,
          this.pixelSize
        );
      });
    });
  },

  // 최적화된 클러스터 매칭 (캐싱 추가)
  findNearestClusterFast(pixelColor) {
    if (!this.dominantColors || this.dominantColors.length === 0) {
      return pixelColor;
    }

    // 색상 캐싱을 위한 간단한 키 생성 (정확도 vs 성능)
    const colorKey = `${Math.floor(pixelColor.r / 8)},${Math.floor(
      pixelColor.g / 8
    )},${Math.floor(pixelColor.b / 8)}`;

    // 캐시 초기화
    if (!this.colorCache) {
      this.colorCache = new Map();
    }

    // 캐시된 결과 반환
    if (this.colorCache.has(colorKey)) {
      return this.colorCache.get(colorKey);
    }

    let nearestColor = this.dominantColors[0].avgColor;
    let minDistance = this.colorDistanceFast(pixelColor, nearestColor);

    // 클러스터 개수에 맞춰 검사 (성능과 정확도 균형)
    const checkCount = Math.min(
      this.dominantColors.length,
      Math.max(8, this.clusterCount / 2)
    );

    for (let i = 1; i < checkCount; i++) {
      const distance = this.colorDistanceFast(
        pixelColor,
        this.dominantColors[i].avgColor
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = this.dominantColors[i].avgColor;
      }
    }

    // 결과 캐싱 (메모리 제한)
    if (this.colorCache.size < 1000) {
      this.colorCache.set(colorKey, nearestColor);
    }

    return nearestColor;
  },

  // 빠른 색상 거리 계산
  colorDistanceFast(color1, color2) {
    // 맨하탄 거리 사용
    return (
      Math.abs(color1.r - color2.r) +
      Math.abs(color1.g - color2.g) +
      Math.abs(color1.b - color2.b)
    );
  },

  // 최적화된 도미넌트 색상 추출
  extractDominantColors(pixels, width, height) {
    const sampleColors = [];
    const step = Math.max(1, Math.floor((width * height) / 600)); // 샘플링 더 효율적으로

    // 빠른 샘플링 (경계 체크 최소화)
    const pixelCount = pixels.length / 4;
    for (let i = 0; i < pixelCount; i += step) {
      const pixelIndex = i * 4;
      const r = pixels[pixelIndex];
      const g = pixels[pixelIndex + 1];
      const b = pixels[pixelIndex + 2];

      // 간단한 필터링
      const brightness = r + g + b; // 나누기 연산 제거
      if (brightness > 90 && brightness < 675) {
        // 30*3 = 90, 225*3 = 675
        sampleColors.push({ r, g, b });
      }
    }

    // 클러스터 초기화 (객체 생성 최소화)
    const clusters = new Array(this.clusterCount);
    for (let i = 0; i < this.clusterCount; i++) {
      clusters[i] = {
        colors: [],
        totalR: 0,
        totalG: 0,
        totalB: 0,
        count: 0,
      };
    }

    // 최적화된 색상 분류
    const hueStep = 360 / this.clusterCount;
    sampleColors.forEach((color) => {
      // 빠른 색조 계산 (정확도 vs 성능)
      const max = Math.max(color.r, color.g, color.b);
      const min = Math.min(color.r, color.g, color.b);
      const diff = max - min;

      let hue = 0;
      if (diff > 10) {
        // 임계값으로 계산 스킵
        if (max === color.r) {
          hue = ((color.g - color.b) / diff) * 60;
        } else if (max === color.g) {
          hue = ((color.b - color.r) / diff + 2) * 60;
        } else {
          hue = ((color.r - color.g) / diff + 4) * 60;
        }
        hue = (hue + 360) % 360;
      }

      const clusterIndex = Math.floor(hue / hueStep);
      const safeIndex = Math.min(clusterIndex, this.clusterCount - 1);

      const cluster = clusters[safeIndex];
      cluster.totalR += color.r;
      cluster.totalG += color.g;
      cluster.totalB += color.b;
      cluster.count++;
    });

    // 평균 색상 계산 및 결과 생성
    return clusters
      .filter((cluster) => cluster.count > 0)
      .map((cluster) => ({
        avgColor: {
          r: Math.round(cluster.totalR / cluster.count),
          g: Math.round(cluster.totalG / cluster.count),
          b: Math.round(cluster.totalB / cluster.count),
        },
      }));
  },
};

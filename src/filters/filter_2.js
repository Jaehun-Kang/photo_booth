export const templateFilter2 = {
  setup(p5js) {
    p5js.noStroke();
    p5js.colorMode(p5js.RGB, 255);

    // 극도로 최적화된 파라미터
    this.step = 6; // 더 큰 스텝으로 픽셀 처리량 대폭 감소
    this.dotSize = 4; // 도트 크기 증가로 시각적 밀도 유지
    this.thresh = 100; // 높은 임계값으로 렌더링 대상 최소화
    this.jitterAmt = 0.1; // 지터 최소화

    // 미리 계산된 색상들 (RGB 값 고정) - 5가지 색상
    this.colors = [
      [10, 25, 60], // 가장 어두운 색 (매우 진한 남색)
      [20, 50, 100], // 어두운 색 (진한 남색)
      [40, 80, 140], // 중간-어두운 색 (남색)
      [80, 120, 180], // 중간-밝은 색 (밝은 남색)
      [180, 200, 220], // 밝은 색 (연한 회색)
    ];

    // 성능 캐시 변수들
    this.halfDot = this.dotSize * 0.5;
    this.noiseScale = 0.008; // 더 부드러운 노이즈
    this.frameCount = 0;

    // 정적 노이즈 테이블 생성 (미리 계산된 노이즈 값들)
    this.noiseTable = new Array(64);
    for (let i = 0; i < 64; i++) {
      this.noiseTable[i] = (Math.random() - 0.5) * this.jitterAmt;
    }

    // 밝기 임계값 미리 계산 (5가지 색상을 위한 4개 임계값)
    this.brightThresholds = [60, 100, 150, 200];

    p5js.noiseSeed(42);
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(0);

    offscreen.loadPixels();
    if (!offscreen.pixels.length) return;

    const pixels = offscreen.pixels;

    // 프레임 카운트 (매우 느린 업데이트)
    this.frameCount = (this.frameCount + 1) % 1000;

    // 스케일링 최적화
    p5js.push();
    const scaleFactor = Math.min(canvasW / captureW, canvasH / captureH);
    p5js.translate(
      (canvasW - captureW * scaleFactor) * 0.5,
      (canvasH - captureH * scaleFactor) * 0.5
    );
    p5js.scale(scaleFactor);

    // 캐시된 변수들
    const step = this.step;
    const dotSize = this.dotSize;
    const halfDot = this.halfDot;
    const thresh = this.thresh;
    const brightThresholds = this.brightThresholds;
    const noiseTable = this.noiseTable;

    // 루프 범위 미리 계산
    const maxX = Math.floor(captureW / step);
    const maxY = Math.floor(captureH / step);

    // 고정 크기 배열로 메모리 할당 최소화
    const maxDots = maxX * maxY;
    const dotData = new Array(maxDots);
    const colorCounts = [0, 0, 0, 0, 0]; // 5가지 색상을 위한 카운터
    let totalDots = 0;

    // 1단계: 픽셀 분석 및 데이터 수집 (렌더링과 분리)
    for (let yi = 0; yi < maxY; yi++) {
      const y = yi * step;
      const yIdx = y * captureW;

      for (let xi = 0; xi < maxX; xi++) {
        const x = xi * step;
        const idx = (x + yIdx) << 2;

        // 빠른 밝기 계산 (정수 연산)
        const bright =
          ((pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) * 85) >> 8; // /3을 *85>>8로 근사
        if (bright < thresh) continue;

        // 정적 노이즈 테이블 사용 (노이즈 함수 호출 제거)
        const noiseIdx = (xi + yi + (this.frameCount >> 4)) % 64;
        const jx = noiseTable[noiseIdx];
        const jy = noiseTable[(noiseIdx + 32) % 64];

        // 5단계 색상 인덱스 결정
        let colorIndex;
        if (bright < brightThresholds[0]) {
          colorIndex = 0; // 가장 어두운 색
        } else if (bright < brightThresholds[1]) {
          colorIndex = 1; // 어두운 색
        } else if (bright < brightThresholds[2]) {
          colorIndex = 2; // 중간-어두운 색
        } else if (bright < brightThresholds[3]) {
          colorIndex = 3; // 중간-밝은 색
        } else {
          colorIndex = 4; // 밝은 색
        }

        // 데이터 저장
        dotData[totalDots] = {
          x: x - halfDot + jx,
          y: y - halfDot + jy,
          color: colorIndex,
        };
        colorCounts[colorIndex]++;
        totalDots++;
      }
    }

    // 2단계: 색상별 배치 렌더링 (최소한의 fill 호출)
    if (totalDots > 0) {
      // 5가지 색상별로 한 번씩만 fill 호출
      for (let colorIdx = 0; colorIdx < 5; colorIdx++) {
        if (colorCounts[colorIdx] === 0) continue;

        const color = this.colors[colorIdx];
        p5js.fill(color[0], color[1], color[2]);

        // 해당 색상의 모든 도트 렌더링
        for (let i = 0; i < totalDots; i++) {
          if (dotData[i].color === colorIdx) {
            p5js.rect(dotData[i].x, dotData[i].y, dotSize, dotSize);
          }
        }
      }
    }

    p5js.pop();
  },
};

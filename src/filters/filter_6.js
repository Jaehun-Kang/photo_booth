export const templateFilter6 = {
  setup(p5js) {
    // 기본 파라미터
    p5js.strokeW = 1;

    p5js.noFill();
    p5js.pixelDensity(1); // 디바이스에 관계없이 동일 렌더링

    // 성능 최적화를 위한 캐시 변수들
    this.brightScale = 1 / 765; // (r+g+b)/3/255를 한 번에 계산하기 위한 스케일
    this.strokeColor = [11, 120, 255, 220]; // 색상 미리 저장

    // 화면 크기별 설정 (모든 화면에 동일 적용)
    this.linesDensity = 0.1; // 전체적으로 라인 밀도 감소 (성능 최적화)
    this.distortionScale = 0.025; // 화면 너비 대비 왜곡 비율 (2.5%)
    this.ySamplingRatio = 2; // Y축 샘플링 비율을 줄여서 더 조밀하게
    this.maxVerticesPerLine = 200; // vertex 제한을 늘려서 아래쪽까지 커버
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(255);
    offscreen.loadPixels();

    if (!offscreen.pixels.length) return;

    const pixels = offscreen.pixels;

    // 모든 화면에서 동일한 계산 방식 적용
    const numLines = Math.floor(canvasW * this.linesDensity);
    const step = canvasW / numLines;

    // 화면 크기에 순수 비례하는 왜곡 정도
    const distortion = canvasW * this.distortionScale;

    // 미리 계산된 값들
    const scaleX = captureW / canvasW;
    const scaleY = captureH / canvasH;
    const brightScale = this.brightScale;
    const strokeColor = this.strokeColor;
    const distortionDouble = distortion * 2;

    // Y축 샘플링 - 원본처럼 조밀하게 하되 성능 고려
    const yStep = Math.max(
      1,
      Math.floor(canvasH / (numLines * this.ySamplingRatio))
    );

    // 스트로크 설정 한 번만
    p5js.strokeWeight(p5js.strokeW);
    p5js.stroke(strokeColor[0], strokeColor[1], strokeColor[2], strokeColor[3]);

    // 배치 처리를 위한 최적화
    const stepInt = Math.max(1, Math.floor(step));

    for (let x = 0; x < canvasW; x += stepInt) {
      const ix = Math.floor(x * scaleX);
      if (ix >= captureW) continue;

      p5js.beginShape();
      p5js.noFill();

      // 원본처럼 전체 높이를 커버하되 성능 최적화
      for (let y = 0; y < canvasH; y += yStep) {
        const iy = Math.floor(y * scaleY);
        if (iy >= captureH) continue;

        const index = (iy * captureW + ix) << 2;

        // 빠른 밝기 계산 (정수 연산)
        const bright =
          (pixels[index] + pixels[index + 1] + pixels[index + 2]) * brightScale;

        // 직접 계산으로 왜곡 적용
        const offsetX = (bright - 0.5) * distortionDouble;

        const posX = x + offsetX;
        const posY = y;

        p5js.vertex(posX, posY);
      }

      // 마지막 점을 반드시 추가하여 아래쪽 완전 커버
      if (yStep > 1) {
        const lastY = canvasH - 1;
        const iy = Math.floor(lastY * scaleY);
        if (iy < captureH) {
          const index = (iy * captureW + ix) << 2;
          const bright =
            (pixels[index] + pixels[index + 1] + pixels[index + 2]) *
            brightScale;
          const offsetX = (bright - 0.5) * distortionDouble;
          p5js.vertex(x + offsetX, lastY);
        }
      }

      p5js.endShape();
    }
  },
};

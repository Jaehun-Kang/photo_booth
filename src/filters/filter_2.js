export const templateFilter2 = {
  setup(p5js) {
    // 여기서는 전역 변수 초기화만
    p5js.noStroke();

    // 사용자 정의 파라미터
    this.step = 3;
    this.dotSize = 2;
    this.thresh = 50;
    this.rgbOffset = 4;
    this.jitterAmt = 1;
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(0);

    offscreen.loadPixels(); // 비디오 프레임 가져오기
    if (!offscreen.pixels.length) return;

    const vw = captureW;
    const vh = captureH;

    // === 좌우 반전 ===
    p5js.push();
    // p5js.translate(canvasW, 0);
    // p5js.scale(-1, 1);

    // 비율 맞추기
    const scaleFactor = Math.min(canvasW / vw, canvasH / vh);
    p5js.translate(
      (canvasW - vw * scaleFactor) / 2,
      (canvasH - vh * scaleFactor) / 2
    );
    p5js.scale(scaleFactor);

    const t = p5js.millis() * 0.001;

    for (let y = 0; y < vh; y += this.step) {
      for (let x = 0; x < vw; x += this.step) {
        const idx = 4 * (x + y * vw);
        const r = offscreen.pixels[idx];
        const g = offscreen.pixels[idx + 1];
        const b = offscreen.pixels[idx + 2];

        const bright = (r + g + b) / 2;
        if (bright < this.thresh - 15) continue;

        const jx =
          (p5js.noise(x * 0.03, y * 0.03, t) - 0.5) * 2 * this.jitterAmt;
        const jy =
          (p5js.noise(x * 0.03 + 99, y * 0.03 + 99, t) - 0.5) *
          2 *
          this.jitterAmt;
        const half = this.dotSize / 2.1;

        // 색상 보간
        const brightFactor = p5js.constrain(bright / 255, 0, 1);
        const c0 = p5js.color(20, 50, 100);
        const c1 = p5js.color(10, 50, 130);
        const c2 = p5js.color(210, 220, 240);
        let c;
        if (brightFactor < 0.5) {
          c = p5js.lerpColor(c0, c1, brightFactor * 2);
        } else {
          c = p5js.lerpColor(c1, c2, (brightFactor - 0.5) * 2);
        }

        // 테두리 블랙
        p5js.fill(0, 200);
        p5js.rect(x - half + jx, y - half + jy, this.dotSize, this.dotSize);

        // 세 번 찍는 RGB 분리 효과
        p5js.fill(c);
        p5js.rect(
          x - half - this.rgbOffset + jx,
          y - half + jy,
          this.dotSize,
          this.dotSize
        );

        p5js.fill(c);
        p5js.rect(
          x - half + jx,
          y - half - this.rgbOffset + jy,
          this.dotSize,
          this.dotSize
        );

        p5js.fill(c);
        p5js.rect(
          x - half + this.rgbOffset + jx,
          y - half + this.rgbOffset + jy,
          this.dotSize,
          this.dotSize
        );
      }
    }

    p5js.pop();
  },
};

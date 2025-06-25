export const fadeFilter = {
  setup(p5js) {
    p5js.rectMode(p5js.CORNER);
    p5js.noStroke();
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.fill(0, 0, 0, 15); // 배경 페이드
    p5js.rect(0, 0, canvasW, canvasH);

    offscreen.loadPixels();
    if (!offscreen.pixels || offscreen.pixels.length < 4 * captureW * captureH) return;

    for (let idx = 0; idx < captureW * captureH; idx++) {
      const r = offscreen.pixels[4 * idx];
      const g = offscreen.pixels[4 * idx + 1];
      const b = offscreen.pixels[4 * idx + 2];
      const brightness = p5js.brightness(p5js.color(r, g, b));

      if (brightness > 80) {
        const x = idx % captureW;
        const y = Math.floor(idx / captureW);
        const scaleX = canvasW / captureW;
        const scaleY = canvasH / captureH;

        // 밝은 정도에 비례해 알파값 결정 (최대 180)
        const alpha = p5js.map(brightness, 80, 255, 50, 180, true);

        // 밝은 부분일수록 원본 색상에 가깝고 투명도 조절
        p5js.fill(r, g, b, alpha);
        p5js.circle(x * scaleX + scaleX / 2, y * scaleY + scaleY / 2, 8);
      }
    }
  }
};

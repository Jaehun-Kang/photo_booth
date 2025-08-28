export const fadeFilter = {
  setup(p5js) {
    p5js.rectMode(p5js.CORNER);
    p5js.noStroke();
    p5js.colorMode(p5js.RGB, 255);
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.fill(0, 0, 0, 10);
    p5js.rect(0, 0, canvasW, canvasH);

    offscreen.loadPixels();
    const pixels = offscreen.pixels;
    const expectedLength = 4 * captureW * captureH;
    if (!pixels || pixels.length < expectedLength) return;

    // 캔버스 전체 크기에 맞춰 스케일링
    const scaleX = canvasW / captureW;
    const scaleY = canvasH / captureH;
    const baseDiameter = Math.min(scaleX, scaleY) * 5;

    for (let y = 0; y < captureH; y+= 10) {
      for (let x = 0; x < captureW; x+= 10) {
        const idx = 4 * (y * captureW + x);
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness > 120) {
          const alpha = p5js.map(brightness, 120, 255, 50, 150, true);

          p5js.fill(r, g, b, alpha);
          p5js.circle(
            x * scaleX + scaleX * 2.5,
            y * scaleY + scaleY * 2.5,
            baseDiameter
          );
        }
      }
    }
  }
};

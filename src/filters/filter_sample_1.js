export const circleFilter = {
  setup(p5js) {
    p5js.noStroke();
    p5js.colorMode(p5js.RGB, 255);
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(0);

    const actualW = p5js.width;
    const actualH = p5js.height;
    const scaleX = actualW / captureW;
    const scaleY = actualH / captureH;

    const pixels = offscreen.pixels;
    const expectedLength = 4 * captureW * captureH;
    if (!pixels || pixels.length < expectedLength) return;

    for (let y = 0; y < captureH; y += 10) {
      for (let x = 0; x < captureW; x += 10) {
        const idx = 4 * (y * captureW + x);
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        const diameter = p5js.map(
          brightness,
          0,
          255,
          1,
          Math.min(scaleX, scaleY) * 10
        );

        p5js.fill(255);
        p5js.circle(x * scaleX + scaleX * 5, y * scaleY + scaleY * 5, diameter);
      }
    }
  },
};

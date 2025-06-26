export const fadeFilter = {
  setup(p5js) {
    p5js.rectMode(p5js.CORNER);
    p5js.noStroke();
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.fill(0, 0, 0, 15);
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

        const alpha = p5js.map(brightness, 80, 255, 50, 180, true);

        p5js.fill(r, g, b, alpha);
        p5js.circle(x * scaleX + scaleX / 2, y * scaleY + scaleY / 2, 8);
      }
    }
  }
};

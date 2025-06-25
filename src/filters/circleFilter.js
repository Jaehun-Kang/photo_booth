export const circleFilter = {
  setup(p5js) {
    p5js.noStroke(); // 필요하면 여기에 다른 초기 설정도 가능
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(0);

    for (let idx = 0; idx < captureW * captureH; idx++) {
      const r = offscreen.pixels[4 * idx];
      const g = offscreen.pixels[4 * idx + 1];
      const b = offscreen.pixels[4 * idx + 2];
      const brightness = p5js.brightness(p5js.color(r, g, b));
      const diameter = p5js.map(brightness, 0, 255, 2, 20);

      const x = idx % captureW;
      const y = Math.floor(idx / captureW);
      const scaleX = canvasW / captureW;
      const scaleY = canvasH / captureH;

      p5js.fill(255);
      p5js.circle(x * scaleX + scaleX / 2, y * scaleY + scaleY / 2, diameter);
    }
  }
};

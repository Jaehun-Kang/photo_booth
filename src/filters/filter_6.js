export const templateFilter6 = {
  setup(p5js) {
    p5js.numLines = 150;
    p5js.strokeW = 1;
    p5js.distortion = 20;

    p5js.noFill();
    p5js.pixelDensity(1); // 디바이스에 관계없이 동일 렌더링
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(255);
    offscreen.loadPixels();

    const step = canvasW / p5js.numLines;

    p5js.strokeWeight(p5js.strokeW);

    for (let x = 0; x < canvasW; x += step) {
      p5js.beginShape();
      for (let y = 0; y < canvasH; y++) {
        const ix = Math.floor((x / canvasW) * captureW);
        const iy = Math.floor((y / canvasH) * captureH);
        const index = (iy * captureW + ix) * 4;

        const r = offscreen.pixels[index];
        const g = offscreen.pixels[index + 1];
        const b = offscreen.pixels[index + 2];
        const bright = (r + g + b) / 3;

        const offsetX = p5js.map(
          bright,
          0,
          255,
          -p5js.distortion,
          p5js.distortion
        );

        const posX = x + offsetX;
        const posY = y;

        p5js.stroke(11, 120, 255, 220);
        p5js.vertex(posX, posY);
      }
      p5js.endShape();
    }
  },
};

export const cameraView = {
  setup(p5js) {
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    // 실제 p5 캔버스 크기 사용
    p5js.image(offscreen, 0, 0, p5js.width, p5js.height);
  }
};

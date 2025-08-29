export const cameraView = {
  setup(p5js) {},

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.image(offscreen, 0, 0, canvasW, canvasH);
  },
};

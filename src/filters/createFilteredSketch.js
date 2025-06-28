export function createFilteredSketch({
  video,
  width,
  height,
  captureW = 320,
  captureH = 240,
  filter
}) {

  return function sketch(p5js) {
    let offscreen;

    p5js.setup = () => {
      p5js.createCanvas(width, height);
      offscreen = p5js.createGraphics(captureW, captureH);

      if (filter.setup) filter.setup(p5js);
    };

    p5js.draw = () => {
      const ctx = offscreen.drawingContext;
      if (!ctx || !video) return;

      ctx.save();
      ctx.clearRect(0, 0, captureW, captureH);
      ctx.translate(captureW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, captureW, captureH);
      ctx.restore();

      offscreen.loadPixels();
      if (!offscreen.pixels || offscreen.pixels.length < 4 * captureW * captureH) return;

      const videoAspect = captureW / captureH;
      const canvasAspect = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasAspect > videoAspect) {
        drawHeight = height;
        drawWidth = drawHeight * videoAspect;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = width;
        drawHeight = drawWidth / videoAspect;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      }

      filter.draw(p5js, offscreen, width, height, captureW, captureH);
    };
  };
}

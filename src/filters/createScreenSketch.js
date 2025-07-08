export function createScreenSketch({ 
  video, 
  width, 
  height, 
  captureW = 1280,
  captureH = 720,
  filter, 
  onReady,
}) {
  return function sketch(p5js) {
    let offscreen;
    let readyCalled = false;

    p5js.setup = () => {
      const videoAspect = captureW / captureH;
      const h = window.innerHeight;
      const w = h * videoAspect;
      captureH = Math.round(captureW / videoAspect);

      p5js.pixelDensity(1);
      p5js.createCanvas(w, h);
      offscreen = p5js.createGraphics(captureW, captureH);

      if (filter.setup) filter.setup(p5js);
    };

    p5js.draw = () => {
      if (!video || video.readyState < 2 || !offscreen) return;

      if (!readyCalled) {
        readyCalled = true;
        if (onReady) onReady();
      }

      const ctx = offscreen.drawingContext;
      ctx.save();
      ctx.clearRect(0, 0, captureW, captureH);
      ctx.translate(captureW, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, captureW, captureH);
      ctx.restore();

      offscreen.loadPixels();
      if (!offscreen.pixels || offscreen.pixels.length < 4 * captureW * captureH) return;

      const drawHeight = p5js.height;
      const drawWidth = p5js.width;
      const offsetX = 0;
      const offsetY = 0;

      filter.draw(
        p5js,
        offscreen,
        drawWidth,
        drawHeight,
        captureW,
        captureH
      );
    };

  };
}

// src/filters/filter_stripe_flip.js 등으로 저장
export const templateFilter3 = {
  setup(p5js) {
    p5js.pixelDensity(1);
    p5js.imageMode(p5js.CORNER);
  },

  // offscreen: 비디오 프레임, canvasW/H: 캔버스, captureW/H: 비디오 원본
  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    const numSlices = 20; // 세로 줄 개수
    const dSliceW = canvasW / numSlices; // 캔버스 한 줄 너비
    const sSliceW = captureW / numSlices; // 원본 한 줄 너비

    // 배경 비우기(필요 시 배경색 지정 가능)
    p5js.clear();

    for (let i = 0; i < numSlices; i++) {
      const dx = i * dSliceW; // 목적지 X
      const sx = Math.floor(i * sSliceW); // 소스 X

      if (i % 2 === 0) {
        // 짝수 줄: 그대로
        p5js.image(
          offscreen,
          dx,
          0,
          dSliceW,
          canvasH, // dest
          sx,
          0,
          sSliceW,
          captureH // src
        );
      } else {
        // 홀수 줄: 세로 뒤집기 (캔버스 변환으로 플립)
        p5js.push();
        p5js.translate(0, canvasH);
        p5js.scale(1, -1); // 세로 반전
        p5js.image(
          offscreen,
          dx,
          0,
          dSliceW,
          canvasH, // dest (뒤집힌 좌표계 기준)
          sx,
          0,
          sSliceW,
          captureH // src
        );
        p5js.pop();
      }
    }
  },
};

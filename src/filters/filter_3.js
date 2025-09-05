export const templateFilter3 = {
  setup(p5js) {
    p5js.noStroke();
    p5js.imageMode(p5js.CORNER);
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    p5js.background(255);

    const cols = 9;
    const rows = 7;

    // 각 셀의 캔버스 크기
    const cellW = canvasW / cols;
    const cellH = canvasH / rows;

    // 캡처 크기 설정 (캡처 화면에서 잘라올 부분의 크기)
    const grabW = captureW * 0.2;
    const grabH = captureH * 0.2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // [-1, 1] 범위로 위치 비율 구하기 (중심 기준)
        const normX = (col - cols / 2) / (cols / 2);
        const normY = (row - rows / 2) / (rows / 2);

        // 비율에 따라 실제 오프스크린 좌표 계산
        const sx = p5js.constrain(
          captureW / 2 + normX * (captureW / 2 - grabW / 2),
          0,
          captureW - grabW
        );
        const sy = p5js.constrain(
          captureH / 2 + normY * (captureH / 2 - grabH / 2),
          0,
          captureH - grabH
        );

        // 자른 화면 가져오기
        const cropped = offscreen.get(sx, sy, grabW, grabH);

        // 캔버스에 출력
        const dx = col * cellW;
        const dy = row * cellH;
        p5js.image(cropped, dx, dy, cellW, cellH);
      }
    }
  },
};

export const templateFilter5 = {
  params: {
    verticalDivisions: 3,
    opacity: {
      value: 0.5,
      min: 0.1,
      max: 1.0,
      step: 0.1,
      label: '투명도',
    },
  },

  setup(p5js) {
    this.verticalDivisions = this.params.verticalDivisions;
    this.opacity = this.params.opacity.value;
    p5js.colorMode(p5js.RGB, 255);
  },

  updateParams(params) {
    if (params.verticalDivisions !== undefined)
      this.verticalDivisions = params.verticalDivisions;
    if (params.opacity !== undefined) this.opacity = params.opacity;
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    // 세로로만 n등분
    const segmentHeight = Math.floor(captureH / this.verticalDivisions);

    // 기존 이미지 유지
    p5js.image(offscreen, 0, 0, canvasW, canvasH);

    // 각 분할된 세그먼트에 대해 처리
    for (let i = 0; i < this.verticalDivisions; i++) {
      const sourceY = i * segmentHeight;
      const height =
        i === this.verticalDivisions - 1 ? captureH - sourceY : segmentHeight;

      // 현재 세그먼트 영역 가져오기
      const segment = offscreen.get(0, sourceY, captureW, height);

      // 좌우 반전된 이미지 생성
      offscreen.push();
      offscreen.translate(captureW, 0);
      offscreen.scale(-1, 1);
      offscreen.tint(255, this.opacity * 255);
      offscreen.image(segment, 0, sourceY);
      offscreen.pop();
    }

    // 최종 이미지를 캔버스에 그리기
    p5js.image(offscreen, 0, 0, canvasW, canvasH);
  },
};

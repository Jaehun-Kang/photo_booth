export const templateFilter = { // 필터 이름을 원하는 대로 변경하세요
  setup(p5js) {
    //setup 함수에 넣을 부분
    //p5js 내장함수 앞에 p5js.를 붙여야 함
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    //draw 함수에 넣을 부분
    //p5js 내장함수 앞에 p5js.를 붙여야 함
    //canvasW, canvasH는 캔버스 크기, captureW, captureH는 비디오 캡처 크기
    //원본 비디오 삽입하고 싶으면 p5js.image(offscreen, 0, 0, canvasW, canvasH); 작성
  }
};

// 사용하시기 전 디스코드에 다른 팀이 사용하고 있는지 확인해주시고,
// 사용하실 때 몇번 파일 쓰겠다고 말씀해주세요(디스코드 photo booth 채널에)
export const templateFilter8 = { // 함수 이름을 원하는 대로 변경하세요(파일명 변경X)
  setup(p5js) {
    //setup 함수에 넣을 부분
    //p5js 내장함수 앞에 p5js.를 붙여야 함
  },

  draw(p5js, offscreen, canvasW, canvasH, captureW, captureH) {
    //draw 함수에 넣을 부분
    //p5js 내장함수 앞에 p5js.를 붙여야 함
    //canvasW, canvasH는 캔버스 크기, captureW, captureH는 비디오 캡처 크기
    //원본 비디오 삽입하고 싶으면 p5js.image(offscreen, 0, 0, canvasW, canvasH); 작성
    p5js.fill(50, 50, 50);
    p5js.rect(0, 0, canvasW, canvasH);
  }
};
// 사용하실 때 각주는 지우고 사용하셔도 됩니다
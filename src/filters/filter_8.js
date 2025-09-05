export const templateFilter8 = {
  init() {
    // 한 번만 초기화되는 속성들
    this.capturedImages = new Array(15); // 미리 배열 크기 할당
    this.imageCount = 0; // 실제 이미지 개수 추적
    this.maxImages = 15; // 최대 이미지 개수
  },

  setup(p5js) {
    this.init();
    // 화면 크기에 따라 조정되는 속성들
    this.baseRectSize = p5js.height * 0.5;
    this.lastCaptureTime = 0;
    this.captureInterval = 25; // 50ms 간격으로 캡처

    p5js.rectMode(p5js.CENTER);
    p5js.noStroke();
    p5js.colorMode(p5js.RGB, 255);
  },

  draw(p5js, offscreen) {
    // 배경 및 메인 비디오 표시
    p5js.background(245);
    p5js.imageMode(p5js.CENTER);
    p5js.image(
      offscreen,
      p5js.width / 2,
      p5js.height / 2,
      p5js.width,
      p5js.height
    );

    // 전체 캔버스 좌우반전 (비디오 제외)
    p5js.push();
    p5js.translate(p5js.width, 0);
    p5js.scale(-1, 1);

    this.rectWidth = p5js.random(this.baseRectSize * 0.2, this.baseRectSize);
    this.rectHeight = p5js.random(this.baseRectSize * 0.2, this.baseRectSize);

    // 자동 캡처 타이밍 체크
    const currentTime = p5js.millis();
    if (currentTime - this.lastCaptureTime > this.captureInterval) {
      this.autoCaptureFrames(p5js);
      this.lastCaptureTime = currentTime;
    }

    // 캡처된 이미지 일괄 렌더링
    p5js.imageMode(p5js.CORNER);
    p5js.noFill();
    // p5js.colorMode(p5js.HSB, 360, 100, 100, 1);
    p5js.stroke(255); // 알파값은 0-1 범위 사용
    p5js.strokeWeight(3);
    p5js.rectMode(p5js.CORNER);
    // p5js.colorMode(p5js.RGB, 255); // RGB 모드로 복원

    // 실제 존재하는 이미지만 렌더링
    for (let i = 0; i < this.imageCount; i++) {
      const img = this.capturedImages[i];
      if (img) {
        p5js.image(img.img, img.x, img.y);
        p5js.rect(img.x, img.y, img.w, img.h);
      }
    }

    p5js.pop(); // 반전 상태 해제
  },

  autoCaptureFrames: function (p5js) {
    // 3~5개의 새로운 이미지 캡처
    const numCaptures = 1;

    // 배열이 가득 찼을 때 앞쪽부터 순차적으로 제거
    if (this.imageCount + numCaptures > this.maxImages) {
      // 필요한 공간만큼 앞쪽 이미지 제거
      const removeCount = this.imageCount + numCaptures - this.maxImages;
      // 배열을 앞으로 이동
      for (let i = 0; i < this.imageCount - removeCount; i++) {
        this.capturedImages[i] = this.capturedImages[i + removeCount];
      }
      this.imageCount -= removeCount;
    }

    // 화면 영역 계산 (한 번만)
    const availWidth = p5js.width - this.rectWidth;
    const availHeight = p5js.height - this.rectHeight;

    for (let i = 0; i < numCaptures; i++) {
      // 랜덤 위치 생성 (경계 체크 포함)
      const captureX = Math.random() * availWidth;
      const captureY = Math.random() * availHeight;

      // 이미지 캡처 및 저장 (기존 배열 재사용)
      const capturedImg = p5js.get(
        captureX,
        captureY,
        this.rectWidth,
        this.rectHeight
      );

      this.capturedImages[this.imageCount++] = {
        img: capturedImg,
        x: captureX,
        y: captureY,
        w: this.rectWidth,
        h: this.rectHeight,
        timestamp: p5js.millis(),
      };
    }
  },
};
// 사용하실 때 각주는 지우고 사용하셔도 됩니다

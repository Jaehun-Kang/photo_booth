let cachedResolution = null;

export async function getCameraResolution() {
  if (cachedResolution) return cachedResolution;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement('video');
    video.srcObject = stream;

    // metadata 로딩 기다리기
    await new Promise((resolve) => {
      video.onloadedmetadata = () => resolve();
      video.play(); // play는 videoWidth, videoHeight 접근을 위해 필요
    });

    const width = video.videoWidth;
    const height = video.videoHeight;

    // 기본 fallback
    const safeWidth = width > 0 ? width : 640;
    const safeHeight = height > 0 ? height : 480;

    cachedResolution = {
      width: safeWidth,
      height: safeHeight,
    };

    // 스트림 해제
    stream.getTracks().forEach((track) => track.stop());

    return cachedResolution;
  } catch (err) {
    console.error('카메라 해상도 가져오기 실패:', err);

    // 기본 fallback 해상도 제공
    return {
      width: 640,
      height: 480,
    };
  }
}

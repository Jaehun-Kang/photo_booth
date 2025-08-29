// 카메라 해상도 캐시 시스템
const cameraCapabilitiesCache = new Map();

export async function getCameraCapabilities(deviceId) {
  // 캐시 확인
  if (cameraCapabilitiesCache.has(deviceId)) {
    console.log("📦 캐시된 카메라 정보 사용:", deviceId);
    return cameraCapabilitiesCache.get(deviceId);
  }

  console.log("🔍 카메라 capabilities 조회 중...", deviceId);

  try {
    // 임시 스트림으로 capabilities 확인
    const tempStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } },
    });

    const track = tempStream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();

    const cameraInfo = {
      maxWidth: capabilities.width?.max || 1280,
      maxHeight: capabilities.height?.max || 720,
      minWidth: capabilities.width?.min || 320,
      minHeight: capabilities.height?.min || 240,
      currentWidth: settings.width,
      currentHeight: settings.height,
      capabilities,
      settings,
    };

    // 임시 스트림 정리
    tempStream.getTracks().forEach((track) => track.stop());

    // 캐시에 저장
    cameraCapabilitiesCache.set(deviceId, cameraInfo);

    console.log("📹 카메라 정보 캐시됨:", {
      deviceId,
      maxResolution: `${cameraInfo.maxWidth}x${cameraInfo.maxHeight}`,
      currentResolution: `${cameraInfo.currentWidth}x${cameraInfo.currentHeight}`,
    });

    return cameraInfo;
  } catch (error) {
    console.error("카메라 capabilities 조회 실패:", error);
    // 기본값 반환
    return {
      maxWidth: 1280,
      maxHeight: 720,
      minWidth: 320,
      minHeight: 240,
      currentWidth: 640,
      currentHeight: 480,
    };
  }
}

export function getPreviewResolution(cameraInfo) {
  // 프리뷰용: 최대 해상도의 60% 정도 사용 (성능 최적화)
  const previewWidth = Math.min(
    cameraInfo.maxWidth,
    Math.floor(cameraInfo.maxWidth * 0.6)
  );
  const previewHeight = Math.min(
    cameraInfo.maxHeight,
    Math.floor(cameraInfo.maxHeight * 0.6)
  );

  return { width: previewWidth, height: previewHeight };
}

export function getFullScreenResolution(cameraInfo) {
  // 풀스크린용: 최대 해상도 사용
  return { width: cameraInfo.maxWidth, height: cameraInfo.maxHeight };
}

// 캐시 초기화 (필요시)
export function clearCameraCache() {
  cameraCapabilitiesCache.clear();
  console.log("📦 카메라 캐시 초기화됨");
}

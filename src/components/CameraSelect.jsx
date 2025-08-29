import React, { useEffect, useState } from "react";

function CameraSelect({ onDeviceSelect, selectedDevice }) {
  const [devices, setDevices] = useState([]);

  const getDeviceCapabilities = async (deviceId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
        },
      });

      // 스트림의 첫 번째 비디오 트랙 가져오기
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();

      console.log("Camera Capabilities:", {
        deviceId,
        maxWidth: capabilities.width?.max,
        maxHeight: capabilities.height?.max,
        maxFrameRate: capabilities.frameRate?.max,
        aspectRatio: capabilities.aspectRatio,
      });

      // 스트림 정리
      stream.getTracks().forEach((track) => track.stop());

      return onDeviceSelect(deviceId);
    } catch (err) {
      console.error("카메라 성능 확인 오류:", err);
      onDeviceSelect(deviceId);
    }
  };

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );
        setDevices(videoDevices);

        if (videoDevices.length > 0 && !selectedDevice) {
          await getDeviceCapabilities(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error("카메라 장치 열거 오류:", err);
      }
    };

    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  return (
    <div className="camera-buttons">
      {devices.map((device) => (
        <button
          key={device.deviceId}
          onClick={() => getDeviceCapabilities(device.deviceId)}
          className={`camera-button ${
            selectedDevice === device.deviceId ? "selected" : ""
          }`}
        >
          {device.label || `카메라 ${devices.indexOf(device) + 1}`}
        </button>
      ))}
    </div>
  );
}

export default CameraSelect;

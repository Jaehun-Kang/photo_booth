import { useEffect, useState } from 'react';

export function useCameraInfo() {
  const [videoSize, setVideoSize] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;

    async function fetchCameraInfo() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();

        if (capabilities.width && capabilities.height) {
          stream.getTracks().forEach(t => t.stop());
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: capabilities.width.max },
              height: { ideal: capabilities.height.max },
            }
          });
        }

        const video = document.createElement('video');
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
          video.play();
        });

        const resolution = {
          width: video.videoWidth,
          height: video.videoHeight,
        };

        setVideoSize(resolution);
        setCameraReady(true);

        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.error('Failed to get camera resolution:', err);
        setError(err);
        setCameraReady(true);
      }
    }

    fetchCameraInfo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return { videoSize, cameraReady, error };
}

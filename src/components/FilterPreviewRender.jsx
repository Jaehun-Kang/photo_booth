import React, { useEffect, useState, useMemo, useCallback } from 'react';
import FilterPreview from './FilterPreview.jsx';
import logo from '../assets/logo.svg';
import { createFilteredSketch } from '../filters/createFilteredSketch.js';
import { filters } from '../filters';
import '../styles/FilterPreviewRender.css';
import WebcamErrorHandler from './WebcamErrorHandler.jsx';


function FilterPreviewRender({ onSelectFilter }) {
  const [video, setVideo] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const p5video = document.createElement('video');
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }, // 36 혹은 48
      },
    }).then((stream) => {
      p5video.srcObject = stream;
      p5video.play();
      p5video.width = 64;
      p5video.height = 36;
      p5video.style.display = 'none';
      document.body.appendChild(p5video);

      const onLoadedMetadata = () => {
        setVideo(p5video);
        setVideoSize({
          width: p5video.videoWidth,
          height: p5video.videoHeight,
        });
        setVideoReady(true);
        p5video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };

      if (p5video.readyState >= 2) {
        onLoadedMetadata();
      } else {
        p5video.addEventListener('loadedmetadata', onLoadedMetadata);
      }
    }).catch((err) => {
      console.error('웹캠 접근 오류:', err);
      setWebcamError(err);
    });
  }, []);

  const getSketchFactory = useCallback(
    (filter) => (w, h) => {
      const scaleRatio = videoSize.width / videoSize.height;

      return createFilteredSketch({ video, width: w, height: h, filter, scaleRatio, videoSize });
    },
    [video, videoReady, videoSize]
  );

  const sketchFactories = useMemo(() => {
    if (!videoReady) return [];
    return filters.map(filter => getSketchFactory(filter));
  }, [videoReady, getSketchFactory]);

  return (
    <div className="main">
      <WebcamErrorHandler error={webcamError} />
      <div className="header">
        <img src={logo} alt="Logo" />
        <h1>MAGIC RESEARCH</h1>
      </div>
      <div className="cam_grid--section">
        <div className="cam_grid--section--container">
          {videoReady &&
            sketchFactories.map((sketchFactory, index) => {
              return (
                <div className="cam_grid--section--container--filter" key={index}>
                  <FilterPreview 
                  sketchFactory={sketchFactory} 
                  video={video}
                  onSelectFilter={() => onSelectFilter(index)}
                  />
                </div>
              );
            })}
        </div>
      </div>
      <div className="footer">
        <p>원하는 필터를 선택해주세요!</p>
      </div>
    </div>
  );
}

export default FilterPreviewRender;

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import FilterPreview from './components/FilterPreview';
import logo from './assets/logo.svg';
import { createFilteredSketch } from './filters/createFilteredSketch';
import { templateFilter1 } from './filters/filter_1';
import { templateFilter2 } from './filters/filter_2';
import { templateFilter3 } from './filters/filter_3';
import { templateFilter4 } from './filters/filter_4';
import { templateFilter5 } from './filters/filter_5';
import { templateFilter6 } from './filters/filter_6';
import { templateFilter7 } from './filters/filter_7';
import { templateFilter8 } from './filters/filter_8';
import { circleFilter } from './filters/filter_sample_1';
import { fadeFilter } from './filters/filter_sample_2';
import './App.css';

/* [!중요!] 필터 선택해서 만드실 때 디스코드 포토부스 채널에 몇번 필터 파일 사용하겠다고 말씀해주세요. */
/* 필터 함수 이름은 아래 배열의 templateFilter쪽과 위쪽 해당하는 import {} 안까지 변경해주시면 됩니다. */
const filters = [
  templateFilter1,
  templateFilter2,
  templateFilter3,
  templateFilter4,
  templateFilter5,
  templateFilter6,
  templateFilter7,
  templateFilter8,
  circleFilter,
  fadeFilter,
];

function App() {
  const [video, setVideo] = useState(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const p5video = document.createElement('video');
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 64 },
        height: { ideal: 48 },
      },
    }).then((stream) => {
      p5video.srcObject = stream;
      p5video.play();
      p5video.width = 64;
      p5video.height = 48;
      p5video.style.display = 'none';
      document.body.appendChild(p5video);

      const onLoadedMetadata = () => {
        setVideo(p5video);
        setVideoReady(true);
        p5video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };

      if (p5video.readyState >= 2) {
        onLoadedMetadata();
      } else {
        p5video.addEventListener('loadedmetadata', onLoadedMetadata);
      }
    });

  }, []);

  const getSketchFactory = useCallback(
    (filter) => (w, h) => {
      return createFilteredSketch({ video, width: w, height: h, filter });
    },
    [video, videoReady]
  );

  const sketchFactories = useMemo(() => {
    if (!videoReady) return [];
    return filters.map(filter => getSketchFactory(filter));
  }, [videoReady, getSketchFactory]);

  return (
    <div className="main">
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
                  <FilterPreview sketchFactory={sketchFactory} video={video} />
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

export default App;

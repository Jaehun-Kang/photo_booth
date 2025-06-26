import React, { useEffect, useState } from 'react';
import FilterPreview from './components/FilterPreview';
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

function App() {
  const [video, setVideo] = useState(null);

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
      setVideo(p5video);
    });
  }, []);

  return (
    <div className="main">
      <h1>마법연구회 포토부스</h1>
      <div>
        <div className="cam_grid">
          {/* [!중요!] 필터 선택해서 만드실 때 디스코드 포토부스 채널에 몇번 필터 파일 사용하겠다고 말씀해주세요. */}
          {/* 필터 함수 이름은 templateFilter쪽 변경해주시면 됩니다(circleFilter, fadeFilter 자리) */}
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter1,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter2,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter3,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter4,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter5,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter6,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter7,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: templateFilter8,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
          </div>
          <div className="cam_grid--filter">
            {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: fadeFilter,})(p5js)}/>)}
          </div>
        </div>
      </div>
      <p>원하는 필터를 선택해주세요!</p>
    </div>
  );
}

export default App;
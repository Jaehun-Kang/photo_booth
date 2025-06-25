import React, { useEffect, useState } from 'react';
import FilterPreview from './components/FilterPreview';
import { createFilteredSketch } from './filters/createFilteredSketch';
import { circleFilter } from './filters/circleFilter';
import { fadeFilter } from './filters/fadeFilter';
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
      <div className="cam_grid">
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
        </div>
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: fadeFilter,})(p5js)}/>)}
        </div>
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
        </div>
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
        </div>
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
        </div>
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
        </div>
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
        </div>
        <div className="cam_grid--filter">
          {video && (<FilterPreview sketchFactory={(p5js, w, h) =>createFilteredSketch({video,width: w,height: h,filter: circleFilter,})(p5js)}/>)}
        </div>
      </div>
      <p>원하는 필터를 선택해주세요!</p>
    </div>
  );
}

export default App;
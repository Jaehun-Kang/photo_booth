import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

const FilterPreview = ({ sketchFactory }) => {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [size, setSize] = useState({ width: 640, height: 480 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }

    const sketch = (p5js) => {
      sketchFactory(p5js, size.width, size.height);
    };

    const p5Instance = new p5(sketch, containerRef.current);
    p5InstanceRef.current = p5Instance;

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketchFactory, size]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default FilterPreview;

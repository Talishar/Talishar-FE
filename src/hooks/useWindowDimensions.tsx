import { useState, useEffect } from 'react';

export default function useWindowDimensions(): [number, number] {
  const [dims, setDims] = useState<[number, number]>(() => [
    window.innerWidth,
    window.innerHeight
  ]);

  useEffect(() => {
    let rafId = 0;
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDims((previous) =>
          previous[0] === width && previous[1] === height
            ? previous
            : [width, height]
        );
      });
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return dims;
}

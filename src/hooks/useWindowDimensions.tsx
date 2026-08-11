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
        setDims([window.innerWidth, window.innerHeight]);
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

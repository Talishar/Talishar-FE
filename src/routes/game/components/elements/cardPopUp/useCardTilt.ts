import React, { useCallback, useEffect, useRef } from 'react';

const TILT_MAX_DEGREES = 8;
const TILT_STIFFNESS = 180;
const TILT_DAMPING = 22;
const TILT_MASS = 0.6;
const REST_DEGREES = 0.05;
const REST_VELOCITY = 0.5;
const MAX_STEP_SECONDS = 1 / 60;

type TiltRuntime = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  frame: number;
  lastTime: number;
  transform: string;
  shadow: string;
  rect: DOMRect | null;
  active: boolean;
};

const createRuntime = (): TiltRuntime => ({
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  targetX: 0,
  targetY: 0,
  frame: 0,
  lastTime: 0,
  transform: '',
  shadow: '',
  rect: null,
  active: false
});

const shadowFor = (rotateX: number, rotateY: number): string => {
  const offsetX = Math.round(-rotateY * 1.2);
  const offsetY = Math.round(rotateX * 1.2 + 8);
  const blur = Math.round(
    18 + Math.abs(rotateX) * 0.7 + Math.abs(rotateY) * 0.7
  );
  return `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,0.52)`;
};

/**
 * Pointer-driven card tilt written straight to the DOM, replacing the
 * framer-motion springs every board card allocated whether or not it was hovered.
 */
export function useCardTilt(
  containerRef: React.RefObject<HTMLElement>,
  enabled: boolean,
  disableShadow: boolean | undefined
) {
  const runtimeRef = useRef<TiltRuntime>();
  if (runtimeRef.current === undefined) runtimeRef.current = createRuntime();
  const runtime = runtimeRef.current;

  const disableShadowRef = useRef(disableShadow);
  disableShadowRef.current = disableShadow;

  const settle = useCallback(() => {
    const element = containerRef.current;
    if (!element) return;
    runtime.active = false;
    element.style.transform = '';
    element.style.willChange = '';
    element.style.transition = '';
    if (!disableShadowRef.current) element.style.boxShadow = '';
    runtime.transform = '';
    runtime.shadow = '';
  }, [containerRef, runtime]);

  const step = useCallback(
    (time: number) => {
      const element = containerRef.current;
      if (!element) {
        runtime.frame = 0;
        return;
      }

      const elapsed = (time - runtime.lastTime) / 1000;
      runtime.lastTime = time;

      // Fixed substeps keep the feel identical across frame rates.
      let remaining = Math.min(elapsed, 0.1);
      while (remaining > 0) {
        const dt = Math.min(remaining, MAX_STEP_SECONDS);
        remaining -= dt;
        const ax =
          (-TILT_STIFFNESS * (runtime.x - runtime.targetX) -
            TILT_DAMPING * runtime.vx) /
          TILT_MASS;
        const ay =
          (-TILT_STIFFNESS * (runtime.y - runtime.targetY) -
            TILT_DAMPING * runtime.vy) /
          TILT_MASS;
        runtime.vx += ax * dt;
        runtime.vy += ay * dt;
        runtime.x += runtime.vx * dt;
        runtime.y += runtime.vy * dt;
      }

      const atRest =
        Math.abs(runtime.x - runtime.targetX) < REST_DEGREES &&
        Math.abs(runtime.y - runtime.targetY) < REST_DEGREES &&
        Math.abs(runtime.vx) < REST_VELOCITY &&
        Math.abs(runtime.vy) < REST_VELOCITY;

      if (atRest) {
        runtime.x = runtime.targetX;
        runtime.y = runtime.targetY;
        runtime.vx = 0;
        runtime.vy = 0;
      }

      const transform = `perspective(600px) rotateX(${runtime.x.toFixed(
        2
      )}deg) rotateY(${runtime.y.toFixed(2)}deg)`;
      // Identical strings are skipped so a settled frame triggers no repaint.
      if (transform !== runtime.transform) {
        runtime.transform = transform;
        element.style.transform = transform;
      }

      if (!disableShadowRef.current) {
        const shadow = shadowFor(runtime.x, runtime.y);
        if (shadow !== runtime.shadow) {
          runtime.shadow = shadow;
          element.style.boxShadow = shadow;
        }
      }

      if (!atRest) {
        runtime.frame = requestAnimationFrame(step);
        return;
      }

      runtime.frame = 0;
      if (runtime.targetX === 0 && runtime.targetY === 0) settle();
    },
    [containerRef, runtime, settle]
  );

  const schedule = useCallback(() => {
    if (runtime.frame !== 0) return;
    runtime.lastTime = performance.now();
    runtime.frame = requestAnimationFrame(step);
  }, [runtime, step]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      const element = containerRef.current;
      if (!element) return;

      let rect = runtime.rect;
      if (rect === null) {
        rect = element.getBoundingClientRect();
        runtime.rect = rect;
      }

      if (!runtime.active) {
        runtime.active = true;
        // The stylesheet transitions `transform`, which would fight the spring.
        element.style.transition = 'none';
        element.style.willChange = disableShadowRef.current
          ? 'transform'
          : 'transform, box-shadow';
      }

      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      runtime.targetX =
        -((event.clientY - centerY) / (rect.height / 2)) * TILT_MAX_DEGREES;
      runtime.targetY =
        ((event.clientX - centerX) / (rect.width / 2)) * TILT_MAX_DEGREES;
      schedule();
    },
    [containerRef, runtime, schedule]
  );

  const handleMouseLeave = useCallback(() => {
    runtime.rect = null;
    runtime.targetX = 0;
    runtime.targetY = 0;
    schedule();
  }, [runtime, schedule]);

  useEffect(() => {
    if (enabled) return;
    if (runtime.frame !== 0) {
      cancelAnimationFrame(runtime.frame);
      runtime.frame = 0;
    }
    runtime.x = 0;
    runtime.y = 0;
    runtime.vx = 0;
    runtime.vy = 0;
    runtime.targetX = 0;
    runtime.targetY = 0;
    settle();
  }, [enabled, runtime, settle]);

  useEffect(() => {
    return () => {
      if (runtime.frame !== 0) cancelAnimationFrame(runtime.frame);
      runtime.frame = 0;
    };
  }, [runtime]);

  return { handleMouseMove, handleMouseLeave };
}

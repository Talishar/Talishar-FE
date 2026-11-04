import React, { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import {
  CHAT_TEXT_SIZE_COOKIE,
  PROMPT_TEXT_SIZE_COOKIE,
  TEXT_SCALE_VARS,
  useReducedMotionSetting,
  useTextScale
} from './accessibility';

const AccessibilityVars = ({ children }: { children: React.ReactNode }) => {
  const reducedMotion = useReducedMotionSetting();
  const prompt = useTextScale(PROMPT_TEXT_SIZE_COOKIE);
  const chat = useTextScale(CHAT_TEXT_SIZE_COOKIE);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) root.dataset.reducedMotion = 'true';
    else delete root.dataset.reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const rootStyle = document.documentElement.style;
    const scales = [prompt, chat];
    TEXT_SCALE_VARS.forEach(([, cssVar], index) => {
      if (scales[index] === 1) rootStyle.removeProperty(cssVar);
      else rootStyle.setProperty(cssVar, String(scales[index]));
    });
  }, [prompt, chat]);

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  );
};

export default AccessibilityVars;

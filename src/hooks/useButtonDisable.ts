import { useState, useEffect } from 'react';

export const useButtonDisable = (disableDuration: number = 2000) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const triggerDisable = () => {
    setIsDisabled(true);
  };

  useEffect(() => {
    if (isDisabled) {
      const timer = setTimeout(() => {
        setIsDisabled(false);
      }, disableDuration);
      return () => clearTimeout(timer);
    }
  }, [isDisabled, disableDuration]);

  return { isDisabled, triggerDisable };
};

import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
  borderColorVar,
  CARD_BORDER_COLORS_COOKIE,
  DEFAULT_CARD_BORDER_COLORS,
  parseBorderOverrides
} from './cardBorderColors';

const CardBorderColorVars = () => {
  const [cookies] = useCookies([CARD_BORDER_COLORS_COOKIE]);
  const serialized = JSON.stringify(
    parseBorderOverrides(cookies[CARD_BORDER_COLORS_COOKIE])
  );

  useEffect(() => {
    const overrides = JSON.parse(serialized) as Record<string, string>;
    const rootStyle = document.documentElement.style;
    DEFAULT_CARD_BORDER_COLORS.forEach((_, index) => {
      const id = String(index + 1);
      if (overrides[id]) rootStyle.setProperty(borderColorVar(id), overrides[id]);
      else rootStyle.removeProperty(borderColorVar(id));
    });
  }, [serialized]);

  return null;
};

export default CardBorderColorVars;

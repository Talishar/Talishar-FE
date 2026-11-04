import { useEffect } from 'react';
import { useCookies } from 'react-cookie';
import {
  borderColorVar,
  CARD_BORDER_COLORS_COOKIE,
  DEFAULT_CARD_BORDER_COLORS,
  parseBorderOverrides
} from './cardBorderColors';
import { useColorblindPreset } from './accessibility';
import { presetBorderColors } from './colorblindPresets';

const CardBorderColorVars = () => {
  const [cookies] = useCookies([CARD_BORDER_COLORS_COOKIE]);
  const preset = useColorblindPreset();
  const serialized = JSON.stringify(
    parseBorderOverrides(cookies[CARD_BORDER_COLORS_COOKIE])
  );

  useEffect(() => {
    const overrides = JSON.parse(serialized) as Record<string, string>;
    const presetColors = presetBorderColors(preset);
    const rootStyle = document.documentElement.style;
    DEFAULT_CARD_BORDER_COLORS.forEach((_, index) => {
      const id = String(index + 1);
      const color = overrides[id] ?? presetColors?.[index];
      if (color) rootStyle.setProperty(borderColorVar(id), color);
      else rootStyle.removeProperty(borderColorVar(id));
    });
  }, [serialized, preset]);

  return null;
};

export default CardBorderColorVars;

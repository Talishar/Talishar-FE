import { toast } from 'react-hot-toast';
import { cleanErrorText } from 'utils/cleanErrorText';
import i18n from 'i18next';

export const parseBackendJson = (body: string): unknown => {
  let stringData = body.trim();
  if (stringData.length === 0) {
    return {};
  }

  const indexOfBraces = stringData.indexOf('{');
  if (indexOfBraces !== 0) {
    const errorString =
      indexOfBraces === -1
        ? stringData
        : stringData.substring(0, indexOfBraces);
    const cleanedError = cleanErrorText(errorString);
    console.warn(`BE Response:`, cleanedError);
    toast.error(`BE Response:\n${cleanedError}`);
    stringData =
      indexOfBraces === -1 ? '' : stringData.substring(indexOfBraces);
  }

  // Only try to parse if we have valid JSON-like content
  if (
    stringData.length === 0 ||
    stringData === '{}' ||
    !stringData.startsWith('{')
  ) {
    return {};
  }

  try {
    return JSON.parse(stringData);
  } catch (e) {
    console.error('JSON Parse Error:', e, 'Input:', stringData);
    toast.error(i18n.t('BASE.PARSE_RESPONSE_FAILED'));
    return {};
  }
};

export const parseResponse = async (response: Response): Promise<unknown> =>
  parseBackendJson(await response.text());

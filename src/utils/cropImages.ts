import { CLOUD_IMAGES_URL } from 'appConstants';
import { getCropsSubfolder, loadInitialLanguage } from './multilanguage';

/**
 * Hero / effect crop URLs — must match CardImages .../crops/{english|japanese|french}/ on CDN.
 * @param cardName Hero slug, card id, or set-style id (same rules as {@link getCollectionCardImagePath})
 * @param locale i18n or settings language code (`en`, `ja`, `fr`, …)
 */
export const generateCroppedImageUrl = (
  cardName: string,
  locale: string = loadInitialLanguage()
): string =>
  `${CLOUD_IMAGES_URL}/crops/${getCropsSubfolder(
    locale,
    cardName
  )}/${cardName}_cropped.webp`;

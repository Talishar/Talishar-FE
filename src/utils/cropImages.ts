import { CLOUD_IMAGES_URL } from "appConstants";

export const generateCroppedImageUrl = (cardName: string): string => `${CLOUD_IMAGES_URL}/crops/${cardName}_cropped.png`;
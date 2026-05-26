// Maps numeric format codes from backend (FormatCode in PlayerSettings.php) to string names
const numericFormatCodeMap: { [key: string]: string } = {
  '0': 'cc',
  '1': 'compcc',
  '2': 'blitz',
  '3': 'compblitz',
  '4': 'futurecc',
  '5': 'commoner',
  '6': 'sealed',
  '7': 'draft',
  '8': 'llcc',
  '9': 'llblitz',
  '10': 'openformatblitz',
  '-1': 'clash',
  '11': 'futurell',
  '12': 'openformatllblitz',
  '13': 'compllcc',
  '14': 'sage',
  '15': 'compsage',
  '16': 'futuresage',
  '17': 'open',
  '18': 'gage',
  '-2': 'precon',
};

/**
 * Helper function to convert format codes to readable names
 * Used across multiple components for consistent format display
 */
export const getReadableFormatName = (format: string): string => {
  if (!format) return '';

  const formatMap: { [key: string]: string } = {
    classicconstructed: 'Classic Constructed',
    sage: 'Silver Age',
    silverage: 'Silver Age',
    compsage: 'Competitive Silver Age',
    competitivesage: 'Competitive Silver Age',
    llcc: 'Living Legend',
    commoner: 'Commoner',
    competitivecc: 'Competitive Classic Constructed',
    competitiveblitz: 'Competitive Blitz',
    competitivell: 'Competitive Living Legend',
    blitz: 'Blitz',
    draft: 'Draft / Limited',
    sealed: 'Sealed',
    clash: 'Clash',
    precon: 'Preconstructed Decks',
    openblitz: 'Open Blitz',
    openformatblitz: 'Open Blitz',
    opencc: 'Open CC',
    openformatcc: 'Open CC',
    openllcc: 'Open Living Legend',
    openformatllcc: 'Open Living Legend',
    cc: 'Classic Constructed',
    compcc: 'Competitive Classic Constructed',
    openformatsage: 'Open Silver Age',
    open: 'Open',
    futurell: 'Future Living Legend',
    futurecc: 'Future Classic Constructed',
    futuresage: 'Future Silver Age',
    gage: 'Golden Age',
  };

  const resolvedFormat = numericFormatCodeMap[format] ?? format;
  const key = resolvedFormat.toLowerCase().replace(/[_\s]/g, '');
  return formatMap[key] || resolvedFormat;
};

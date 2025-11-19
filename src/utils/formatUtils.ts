/**
 * Helper function to convert format codes to readable names
 * Used across multiple components for consistent format display
 */
export const getReadableFormatName = (format: string): string => {
  if (!format) return '';
  
  const formatMap: { [key: string]: string } = {
    'classicconstructed': 'Classic Constructed',
    'sage': 'Silver Age',
    'silverage': 'Silver Age',
    'compsage': 'Competitive Silver Age',
    'competitivesage': 'Competitive Silver Age',
    'llcc': 'Living Legend',
    'commoner': 'Commoner',
    'competitivecc': 'Competitive Classic Constructed',
    'competitiveblitz': 'Competitive Blitz',
    'competitivell': 'Competitive Living Legend',
    'blitz': 'Blitz',
    'draft': 'Draft / Limited',
    'clash': 'Clash',
    'precon': 'Preconstructed Decks',
    'openblitz': 'Open Blitz',
    'openformatblitz': 'Open Blitz',
    'opencc': 'Open CC',
    'openformatcc': 'Open CC',
    'openllcc': 'Open Living Legend',
    'openformatllcc': 'Open Living Legend',
    'cc': 'Classic Constructed'
  };
  
  const key = format.toLowerCase().replace(/[_\s]/g, '');
  return formatMap[key] || format;
};

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export const sanitizeHtml = (html: string): string => {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    // Allow specific tags and attributes needed for the game
    ALLOWED_TAGS: [
      'span', 'div', 'p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'img'
    ],
    ALLOWED_ATTR: [
      'style', 'href', 'target', 'src', 'alt', 'class', 'id', 'onmouseover', 'onmouseout'
    ],
    // Allow data attributes for card functionality
    ALLOW_DATA_ATTR: true,
    // Allow style attributes for card colors
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Remove any script tags or event handlers that could be dangerous
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe'],
    FORBID_ATTR: ['onload', 'onerror', 'onclick', 'onfocus', 'onblur']
  });
};

/**
 * Sanitizes text content by escaping HTML characters
 * @param text - The text to escape
 * @returns Escaped text safe for display
 */
export const escapeHtml = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

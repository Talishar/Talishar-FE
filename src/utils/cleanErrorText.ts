/**
 * Extracts clean, readable text from HTML error responses
 * Removes all HTML tags, CSS styling, and extra whitespace
 */
export const cleanErrorText = (htmlText: string): string => {
  if (!htmlText) return '';

  // First, try to extract content from common error tags
  // This handles xdebug errors, PHP errors, etc.
  
  // Extract text content from common error elements
  let text = htmlText;

  // Remove script and style elements completely
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Extract error message from xdebug/PHP error formatting if present
  // Look for common error patterns
  const warningMatch = text.match(/<span[^>]*style='background-color: #cc0000[^>]*>([^<]*(?:<[^>]*>[^<]*)*)<\/span>/i);
  if (warningMatch) {
    text = warningMatch[1];
  }

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean up excessive whitespace
  text = text
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/^\s+|\s+$/g, ''); // Trim

  return text;
};

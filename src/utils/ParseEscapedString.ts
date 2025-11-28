import React, { ReactNode } from 'react';

const CARDRE = /{{(.+?)\|(.+?)(?:\|(.+?))?}}/g;

const COLOR_MAPPING: { [key: string]: string } = {
  '0': '#999999',
  '1': '#af1518',
  '2': '#daa520',
  '3': '#009ddf'
};

// Whitelist of allowed HTML tags
const ALLOWED_TAGS = new Set(['SPAN', 'A', 'IMG', 'B', 'I', 'STRONG', 'EM', 'P', 'BR']);

// Whitelist of allowed attributes
const ALLOWED_ATTRS: { [tag: string]: Set<string> } = {
  'SPAN': new Set(['style']),
  'A': new Set(['style', 'href', 'target', 'rel']),
  'IMG': new Set(['style', 'title', 'src']),
  'B': new Set(['style']),
  'I': new Set(['style']),
  'STRONG': new Set(['style']),
  'EM': new Set(['style']),
  'P': new Set(['style']),
  'BR': new Set([])
};

/**
 * Handler for showing card details on hover
 */
const handleCardMouseOver = (e: React.MouseEvent<HTMLSpanElement>, imgPath: string) => {
  // Call the global ShowDetail function if it exists
  if (typeof (window as any).ShowDetail === 'function') {
    // Pass the native event to ensure clientX/clientY are available
    (window as any).ShowDetail(e.nativeEvent, imgPath);
  }
};

/**
 * Handler for hiding card details on mouse out
 */
const handleCardMouseOut = () => {
  // Call the global HideCardDetail function if it exists
  if (typeof (window as any).HideCardDetail === 'function') {
    (window as any).HideCardDetail();
  }
};

/**
 * Convert CSS string to React style object
 */
const parseStyleString = (styleStr: string): { [key: string]: string } => {
  const style: { [key: string]: string } = {};
  if (!styleStr) return style;

  styleStr.split(';').forEach(rule => {
    const [prop, value] = rule.split(':');
    if (prop && value) {
      const camelProp = prop
        .trim()
        .split('-')
        .map((part, i) => 
          i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join('');
      style[camelProp] = value.trim();
    }
  });

  return style;
};

/**
 * Parse HTML string into React elements, handling both HTML and card references
 * This allows proper event handling without violating CSP
 */
export const parseHtmlToReactElements = (htmlString: string): ReactNode => {
  if (!htmlString) return null;

  // First, replace card references with placeholder markers to preserve them through HTML parsing
  const cardElements: React.ReactElement[] = [];
  let cardIndex = 0;
  
  // Replace {{cardID|cardName|colorCode}} with a unique placeholder
  const processedHtml = htmlString.replace(CARDRE, (match, cardID, cardName, colorCode = '0') => {
    const color = COLOR_MAPPING[colorCode];
    const imgPath = `./WebpImages/${cardID}.webp`;
    const placeholder = `__CARD_${cardIndex}__`;
    
    cardElements.push(
      React.createElement(
        'span',
        {
          key: `card-${cardIndex}`,
          onMouseOver: (e: React.MouseEvent<HTMLSpanElement>) => handleCardMouseOver(e, imgPath),
          onMouseOut: handleCardMouseOut,
          style: { color }
        },
        cardName
      )
    );
    
    cardIndex++;
    return placeholder;
  });

  // Create a temporary container to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = processedHtml;

  let elementIndex = 0;

  const processNode = (node: Node): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      // Check for placeholder markers in text
      const parts: ReactNode[] = [];
      let lastIndex = 0;
      const placeholderRegex = /__CARD_(\d+)__/g;
      let match;

      while ((match = placeholderRegex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }

        // Get the card index from placeholder
        const cardIdx = parseInt(match[1]);
        if (cardIdx < cardElements.length) {
          parts.push(React.cloneElement(cardElements[cardIdx], {
            key: `card-${cardIdx}-${elementIndex++}`
          }));
        }

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts.length > 0 ? parts : text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName;

      // Check if this span has a ShowDetail onmouseover handler (old format)
      if (tagName === 'SPAN' && element.hasAttribute('onmouseover')) {
        const onmouseoverAttr = element.getAttribute('onmouseover') || '';
        const imgPathMatch = onmouseoverAttr.match(/ShowDetail\(event,\s*'([^']+)'/);
        
        if (imgPathMatch) {
          const imgPath = imgPathMatch[1];
          const cardText = element.textContent || '';
          
          // Process children of this span to get styled text
          const children: ReactNode[] = [];
          for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            const processed = processNode(child);
            if (processed !== null) {
              children.push(processed);
            }
          }
          
          // Get the style attribute if it exists
          const styleStr = element.getAttribute('style') || '';
          const style = parseStyleString(styleStr);
          
          return React.createElement(
            'span',
            {
              key: `card-old-${elementIndex++}`,
              onMouseOver: (e: React.MouseEvent<HTMLSpanElement>) => handleCardMouseOver(e, imgPath),
              onMouseOut: handleCardMouseOut,
              style
            },
            children.length > 0 ? children : cardText
          );
        }
      }

      // Skip disallowed tags
      if (!ALLOWED_TAGS.has(tagName)) {
        // Process children but skip the tag itself
        const childResults: ReactNode[] = [];
        for (let i = 0; i < element.childNodes.length; i++) {
          const processed = processNode(element.childNodes[i]);
          if (processed !== null) {
            childResults.push(processed);
          }
        }
        return childResults.length === 1 ? childResults[0] : childResults;
      }

      const children: ReactNode[] = [];

      for (let i = 0; i < element.childNodes.length; i++) {
        const child = element.childNodes[i];
        const processed = processNode(child);
        if (processed !== null) {
          children.push(processed);
        }
      }

      const props: any = {
        key: `elem-${elementIndex++}`
      };

      // Get allowed attributes
      const allowedAttrs = ALLOWED_ATTRS[tagName] || new Set();

      if (allowedAttrs.has('style')) {
        const styleStr = element.getAttribute('style') || '';
        const style = parseStyleString(styleStr);
        if (Object.keys(style).length > 0) {
          props.style = style;
        }
      }

      if (allowedAttrs.has('href')) {
        const href = element.getAttribute('href');
        if (href && (href.startsWith('http') || href.startsWith('/'))) {
          props.href = href;
        }
      }

      if (allowedAttrs.has('target')) {
        const target = element.getAttribute('target');
        if (target && ['_blank', '_self', '_parent', '_top'].includes(target)) {
          props.target = target;
        }
      }

      if (allowedAttrs.has('rel')) {
        const rel = element.getAttribute('rel');
        if (rel) {
          props.rel = rel;
        }
      }

      if (allowedAttrs.has('title')) {
        const title = element.getAttribute('title');
        if (title) {
          props.title = title;
        }
      }

      if (allowedAttrs.has('src')) {
        const src = element.getAttribute('src');
        if (src && (src.startsWith('http') || src.startsWith('./'))) {
          props.src = src;
        }
      }

      const lowerTagName = tagName.toLowerCase();

      return React.createElement(lowerTagName, props, ...children);
    }

    return null;
  };

  const nodeArray: ReactNode[] = [];

  for (let i = 0; i < temp.childNodes.length; i++) {
    const processed = processNode(temp.childNodes[i]);
    if (processed !== null) {
      nodeArray.push(processed);
    }
  }

  return nodeArray.length === 1 ? nodeArray[0] : nodeArray;
};

/**
 * Parse escaped string and return React elements instead of HTML strings
 * This allows proper event handling without violating CSP
 */
export const parseTextToElements = (inputString: string): ReactNode[] => {
  const elements: ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  // Process all matches
  const regex = new RegExp(CARDRE.source, 'g');
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      elements.push(inputString.substring(lastIndex, match.index));
    }

    // Add the card span element
    const [, cardID, cardName, colorCode = '0'] = match;
    const color = COLOR_MAPPING[colorCode];
    const imgPath = `./WebpImages/${cardID}.webp`;

    elements.push(
      React.createElement(
        'span',
        {
          key: `card-${matchIndex}`,
          onMouseOver: (e: React.MouseEvent<HTMLSpanElement>) => handleCardMouseOver(e, imgPath),
          onMouseOut: handleCardMouseOut,
          style: { color }
        },
        cardName
      )
    );

    lastIndex = match.index + match[0].length;
    matchIndex++;
  }

  // Add remaining text
  if (lastIndex < inputString.length) {
    elements.push(inputString.substring(lastIndex));
  }

  return elements.length > 0 ? elements : [inputString];
};

/**
 * Legacy function for backward compatibility with dangerouslySetInnerHTML
 * This is deprecated and should be migrated to parseTextToElements or parseHtmlToReactElements
 */
export const replaceText = (inputString: string): string => {
  return inputString.replace(CARDRE, (match, p1, p2, p3 = '0') => {
    const color = COLOR_MAPPING[p3];
    const imgPath = `./WebpImages/${p1}.webp`;
    return `<span onmouseover="ShowDetail(event, '${imgPath}')" onmouseout="HideCardDetail()" style="color:${color}">${p2}</span>`;
  });
};

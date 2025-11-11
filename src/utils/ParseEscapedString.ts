import React, { ReactNode } from 'react';

const CARDRE = /{{(.+?)\|(.+?)(?:\|(.+?))?}}/g;

const COLOR_MAPPING: { [key: string]: string } = {
  '0': 'gray',
  '1': 'red',
  '2': 'yellow',
  '3': 'blue'
};

// Whitelist of allowed HTML tags
const ALLOWED_TAGS = new Set(['SPAN', 'A', 'IMG', 'B', 'I', 'STRONG', 'EM', 'P']);

// Whitelist of allowed attributes
const ALLOWED_ATTRS: { [tag: string]: Set<string> } = {
  'SPAN': new Set(['style']),
  'A': new Set(['style', 'href', 'target', 'rel']),
  'IMG': new Set(['style', 'title', 'src']),
  'B': new Set(['style']),
  'I': new Set(['style']),
  'STRONG': new Set(['style']),
  'EM': new Set(['style']),
  'P': new Set(['style'])
};

/**
 * Handler for showing card details on hover
 */
const handleCardMouseOver = (e: React.MouseEvent<HTMLSpanElement>, imgPath: string) => {
  // Call the global ShowDetail function if it exists
  if (typeof (window as any).ShowDetail === 'function') {
    (window as any).ShowDetail(e, imgPath);
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

  // Create a temporary container to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = htmlString;

  let cardIndex = 0;

  const processNode = (node: Node): ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      // Check for card references in text
      const parts: ReactNode[] = [];
      let lastIndex = 0;
      const regex = new RegExp(CARDRE.source, 'g');
      let match;

      while ((match = regex.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }

        // Add card element
        const [, cardID, cardName, colorCode = '0'] = match;
        const color = COLOR_MAPPING[colorCode];
        const imgPath = `./WebpImages/${cardID}.webp`;

        parts.push(
          React.createElement(
            'span',
            {
              key: `card-${cardIndex++}`,
              onMouseOver: (e: React.MouseEvent<HTMLSpanElement>) => handleCardMouseOver(e, imgPath),
              onMouseOut: handleCardMouseOut,
              style: { color }
            },
            cardName
          )
        );

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
        key: `elem-${cardIndex++}`
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

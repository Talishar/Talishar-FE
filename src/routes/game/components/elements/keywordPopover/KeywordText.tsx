import React, { ReactNode } from 'react';
import { matchKeywords } from 'data/keywords';
import KeywordPopover from './KeywordPopover';
import styles from './KeywordPopover.module.css';

const wrapString = (text: string, keyPrefix: string): ReactNode => {
  const matches = matchKeywords(text);
  if (!matches.length) return text;
  const nodes: ReactNode[] = []; let cursor = 0;
  matches.forEach((match, index) => {
    if (match.start > cursor) nodes.push(text.slice(cursor, match.start));
    nodes.push(<KeywordPopover key={`${keyPrefix}-${match.start}`} id={match.id}><span className={styles.textTrigger}>{text.slice(match.start, match.end)}</span></KeywordPopover>);
    cursor = match.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
};

export const wrapKeywordsInNodes = (node: ReactNode, keyPrefix = 'keyword'): ReactNode => {
  if (typeof node === 'string') return wrapString(node, keyPrefix);
  if (Array.isArray(node)) return node.map((child, index) => wrapKeywordsInNodes(child, `${keyPrefix}-${index}`));
  if (React.isValidElement(node) && node.type === React.Fragment) return React.cloneElement(node, undefined, wrapKeywordsInNodes(node.props.children, keyPrefix));
  return node;
};

export type KeywordCategory = 'ability' | 'label' | 'type' | 'effect' | 'term';

export interface KeywordEntry {
  id: string;
  name: string;
  short: string;
  category: KeywordCategory;
  aliases?: string[];
  parameterized?: boolean;
  noAutoLink?: boolean;
  crOverrideUrl?: string;
}

export interface CrRule {
  anchor: string;
  text: string;
}

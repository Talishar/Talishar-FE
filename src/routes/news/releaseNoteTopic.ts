// Release notes are plain Discord messages with no title or category, so the
// home page derives a topic tag from the text itself. Keyword rules run first,
// in order, and the note's leading emoji is the fallback.

export type ReleaseNoteTopic =
  | 'FIX'
  | 'ACCESSIBILITY'
  | 'MOBILE'
  | 'CARDS'
  | 'GAMEPLAY'
  | 'INTERFACE'
  | 'UPDATE';

interface TopicRule {
  topic: ReleaseNoteTopic;
  keywords: RegExp;
  emojis: string[];
}

const TOPIC_RULES: TopicRule[] = [
  {
    topic: 'FIX',
    keywords: /\b(fix(ed|es|ing)?|bugs?|crash(es|ed)?|broken|regression)\b/i,
    emojis: ['🐛', '🔧', '🩹', '🛠']
  },
  {
    topic: 'ACCESSIBILITY',
    keywords:
      /\b(accessib\w*|colou?r ?blind\w*|contrast|screen ?reader|font size|dyslexi\w*)\b/i,
    emojis: ['♿', '👁']
  },
  {
    topic: 'MOBILE',
    keywords: /\b(mobile|phones?|tablets?|landscape|portrait|touch)\b/i,
    emojis: ['📱']
  },
  {
    topic: 'CARDS',
    keywords:
      /\b(new sets?|coded|card pool|spoil(er|ers|ed)|new cards?|rotation|ban(ned|list)?)\b/i,
    emojis: ['🃏', '🆕', '📦']
  },
  {
    topic: 'GAMEPLAY',
    keywords:
      /\b(priority|gems?|combat|chain links?|layers?|arsenal|pitch|zones?|piles?|banish\w*|graveyard|turn order)\b/i,
    emojis: ['💎', '⚔', '🗡', '🎲']
  },
  {
    topic: 'INTERFACE',
    keywords:
      /\b(ui|layout|buttons?|menus?|settings?|lobby|profile|replays?|themes?|animations?)\b/i,
    emojis: ['🎨', '✨', '🖥']
  }
];

// Built at runtime: the TS target (es2015) rejects \p{} in regex literals.
// It matches a note's opening emoji, including variation selectors and ZWJ
// sequences.
const LEADING_EMOJI = new RegExp(
  '^\\s*(\\p{Extended_Pictographic}(\\uFE0F|\\u200D|\\p{Extended_Pictographic})*)\\s*',
  'u'
);

// Tags and URLs are dropped so a link like ".../mobile-fix" can't pick the topic.
const toPlainText = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');

export const getReleaseNoteTopic = (html: string): ReleaseNoteTopic => {
  const text = toPlainText(html);
  const byKeyword = TOPIC_RULES.find((rule) => rule.keywords.test(text));
  if (byKeyword) return byKeyword.topic;

  const emoji = text.match(LEADING_EMOJI)?.[1];
  const byEmoji =
    emoji &&
    TOPIC_RULES.find((rule) => rule.emojis.some((e) => emoji.startsWith(e)));
  return byEmoji ? byEmoji.topic : 'UPDATE';
};

// The tag replaces the emoji the note opens with, so drop it from the body.
export const stripLeadingEmoji = (html: string) =>
  html.replace(LEADING_EMOJI, '');

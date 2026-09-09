// Builds a keyword map from the Talishar backend's generated card dictionaries.
//
// The community dataset behind scripts/keyword-map-generator.js lags a set or
// two behind release, so freshly implemented cards have no keywords to show in
// the card preview. The backend already knows them: it keeps one
// `GeneratedHas<Keyword>($cardID)` match table per keyword, plus set-id/card-id
// dictionaries, and those tables are regenerated whenever a set is added.

const fs = require('fs');
const path = require('path');

const DEFAULT_SOURCE = path.join(
  __dirname,
  '..',
  '..',
  'Talishar',
  'GeneratedCode',
  'GeneratedCardDictionaries.php'
);

const outputFile = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'keywords',
  'generated',
  'backendCardKeywordMap.ts'
);

const upstreamMapFile = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'keywords',
  'generated',
  'cardKeywordMap.ts'
);

const glossaryFile = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'keywords',
  'glossary.ts'
);

// Keyword tables whose label cannot be recovered by splitting the PHP function
// name on capitals.
const LABEL_OVERRIDES = {
  GoAgain: 'Go again',
  EssenceofEarth: 'Essence of Earth',
  EssenceofIce: 'Essence of Ice',
  EssenceofLightning: 'Essence of Lightning',
  TheCrowdBoos: 'The Crowd Boos',
  TheCrowdCheers: 'The Crowd Cheers'
};

const sourceArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith('--source='));
const sourceFile = sourceArg
  ? path.resolve(sourceArg.slice('--source='.length))
  : DEFAULT_SOURCE;

if (!fs.existsSync(sourceFile)) {
  console.error(`Backend dictionary not found at ${sourceFile}`);
  console.error(
    'Check out the Talishar backend next to this repo, or pass --source=<path to GeneratedCardDictionaries.php>.'
  );
  process.exitCode = 1;
  return;
}

const source = fs.readFileSync(sourceFile, 'utf8');

// Each generated function is a single `match($cardID)` whose arms are one per
// line, with consecutive card ids sharing the arm that follows them.
function parseMatchTables(php) {
  const tables = new Map();
  const functionHeader = /^function\s+(Generated\w+)\(\$cardID\)\s*\{$/;
  const armWithValue = /^"([^"]+)"\s*=>\s*(.+?),?$/;
  const armWithoutValue = /^"([^"]+)",$/;

  let current = null;
  let pending = [];

  for (const rawLine of php.split(/\r?\n/)) {
    const line = rawLine.trim();
    const header = functionHeader.exec(line);
    if (header) {
      current = new Map();
      tables.set(header[1], current);
      pending = [];
      continue;
    }
    if (current === null) continue;
    if (line === '}') {
      current = null;
      pending = [];
      continue;
    }

    const grouped = armWithoutValue.exec(line);
    if (grouped) {
      pending.push(grouped[1]);
      continue;
    }

    const arm = armWithValue.exec(line);
    if (arm) {
      const value = arm[2].trim();
      current.set(arm[1], value);
      for (const key of pending) current.set(key, value);
      pending = [];
    }
  }

  return tables;
}

function labelFor(tableName) {
  if (LABEL_OVERRIDES[tableName]) return LABEL_OVERRIDES[tableName];
  return tableName
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

function isTruthyArm(value) {
  return value !== 'false' && value !== '0' && value !== 'null';
}

// Mirrors normalizeKeyword() in src/data/keywords/matcher.ts closely enough to
// warn about labels the preview strip would silently drop.
function buildGlossaryLookup() {
  if (!fs.existsSync(glossaryFile)) return null;
  const glossary = fs.readFileSync(glossaryFile, 'utf8');
  const names = new Set();
  for (const block of glossary.split(/\n {2}\{/)) {
    const name = /name:\s*'([^']+)'/.exec(block);
    if (name) names.add(name[1].toLowerCase());
    const aliases = /aliases:\s*\[([^\]]*)\]/.exec(block);
    if (!aliases) continue;
    for (const alias of aliases[1].split(',')) {
      const trimmed = alias.trim().replace(/^'/, '').replace(/'$/, '');
      if (trimmed) names.add(trimmed.toLowerCase());
    }
  }
  return names;
}

function isKnownKeyword(names, label) {
  if (names === null) return true;
  const value = label.toLowerCase();
  if (names.has(value)) return true;
  if (value.endsWith(' specialization')) return true;
  if (value.startsWith('essence of ')) return true;
  if (value.endsWith(' fusion')) return true;
  if (value.startsWith('channel ')) return true;
  if (/^(?:earth|ice|lightning) bond$/.test(value)) return true;
  if (/^(?:earth|ice|lightning) flow$/.test(value)) return true;
  return false;
}

function readUpstreamKeys() {
  if (!fs.existsSync(upstreamMapFile)) return new Set();
  const upstream = fs.readFileSync(upstreamMapFile, 'utf8');
  const body = upstream.slice(upstream.indexOf('CARD_KEYWORD_MAP'));
  const keys = new Set();
  const keyPattern = /(?:^|[{,])\s*'?([A-Za-z0-9_]+)'?:/g;
  let match;
  while ((match = keyPattern.exec(body)) !== null) keys.add(match[1]);
  return keys;
}

const tables = parseMatchTables(source);
console.log(`Parsed ${tables.size} generated tables from ${sourceFile}`);

const setIdToCardId = tables.get('GeneratedSetIDtoCardID') ?? new Map();
const cardIdToSetId = tables.get('GeneratedSetID') ?? new Map();
const unquote = (value) => value.replace(/^"/, '').replace(/"$/, '');

const keywordTables = [];
for (const [name, table] of tables) {
  if (name === 'GeneratedGoAgain') {
    keywordTables.push({ label: labelFor('GoAgain'), table });
    continue;
  }
  if (!name.startsWith('GeneratedHas')) continue;
  keywordTables.push({
    label: labelFor(name.slice('GeneratedHas'.length)),
    table
  });
}
keywordTables.sort((a, b) => a.label.localeCompare(b.label));

const glossaryNames = buildGlossaryLookup();
const unknownLabels = keywordTables
  .filter(({ label }) => !isKnownKeyword(glossaryNames, label))
  .map(({ label }) => label);

const cardKeywords = new Map();
for (const { label, table } of keywordTables) {
  for (const [cardId, value] of table) {
    if (!isTruthyArm(value)) continue;
    const labels = cardKeywords.get(cardId);
    if (labels === undefined) cardKeywords.set(cardId, [label]);
    else if (!labels.includes(label)) labels.push(label);
  }
}

// "Go again" reads last on a printed card, so keep it last in the strip too.
for (const labels of cardKeywords.values()) {
  const goAgain = labels.indexOf('Go again');
  if (goAgain !== -1 && goAgain !== labels.length - 1) {
    labels.splice(goAgain, 1);
    labels.push('Go again');
  }
}

const setIdsByCardId = new Map();
for (const [setId, cardId] of setIdToCardId) {
  const key = unquote(cardId);
  if (!key) continue;
  const existing = setIdsByCardId.get(key);
  if (existing === undefined) setIdsByCardId.set(key, [setId]);
  else existing.push(setId);
}
for (const [cardId, setId] of cardIdToSetId) {
  const printing = unquote(setId);
  if (!printing) continue;
  const existing = setIdsByCardId.get(cardId);
  if (existing === undefined) setIdsByCardId.set(cardId, [printing]);
  else if (!existing.includes(printing)) existing.push(printing);
}

const stringTable = [];
const stringIndex = new Map();
const internKeyword = (label) => {
  const cached = stringIndex.get(label);
  if (cached !== undefined) return cached;
  stringIndex.set(label, stringTable.length);
  stringTable.push(label);
  return stringTable.length - 1;
};

// The community map stays authoritative for everything it covers, so only the
// lookup keys it is missing are emitted here. Regenerate this map whenever
// cardKeywordMap.ts is regenerated; `npm run generate-keywords` does both.
const upstreamKeys = readUpstreamKeys();

const map = {};
const addKey = (key, labels) => {
  if (!key || upstreamKeys.has(key) || map[key] !== undefined) return;
  map[key] = labels.map(internKeyword);
};

for (const [cardId, labels] of cardKeywords) {
  addKey(cardId, labels);
  for (const setId of setIdsByCardId.get(cardId) ?? []) {
    addKey(setId, labels);
  }
}

const exportData =
  '// Generated by scripts/backend-keyword-map-generator.js. Do not edit manually.\n' +
  '// Run `npm run generate-backend-keywords` to regenerate.\n\n' +
  `export const KEYWORD_STRINGS: string[] = ${JSON.stringify(
    stringTable
  )};\n\n` +
  `export const CARD_KEYWORD_MAP: Record<string, number[]> = ${JSON.stringify(
    map
  )};\n`;

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, exportData);

console.log(`Keyword tables: ${keywordTables.length}`);
console.log(`Cards with keywords: ${cardKeywords.size}`);
console.log(
  `Lookup keys the community map is missing: ${Object.keys(map).length}`
);
// A keyword with no glossary entry is silently dropped by CardKeywordStrip, so
// report the ones that actually reach a card in this map.
const affectedKeys = new Map();
for (const [key, indexes] of Object.entries(map)) {
  for (const index of indexes) {
    const label = stringTable[index];
    if (isKnownKeyword(glossaryNames, label)) continue;
    affectedKeys.set(label, (affectedKeys.get(label) ?? 0) + 1);
  }
}
for (const [label, count] of affectedKeys) {
  console.warn(
    `"${label}" has no entry in src/data/keywords/glossary.ts and will not render on ${count} lookup keys`
  );
}
const unusedUnknown = unknownLabels.filter((label) => !affectedKeys.has(label));
if (unusedUnknown.length > 0) {
  console.log(
    `Also missing from the glossary, but unused by this map: ${unusedUnknown.join(
      ', '
    )}`
  );
}
console.log(`Backend keyword map written to ${outputFile}`);

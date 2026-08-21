import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: [
    "en",
    "fr",
    "ja",
    "zh"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "public/locales/{{language}}/{{namespace}}.json",
    // Primary language settings
    primaryLanguage: 'en', // Defaults to the first locale in the `locales` array
    removeUnusedKeys: true,
    // Translation functions to detect. Defaults to ['t', '*.t'].
    // Supports a leading wildcard to match any object (suffix match), e.g.
    // '*.t' matches `i18n.t` / `this._i18n.t`, and a trailing wildcard to match
    // any method on an object (prefix match), e.g. 'tProps.*' matches
    // `tProps.label` / `tProps.title`.
    functions: ['t'],  
    // React components to analyze
    transComponents: ['Trans'],
    // Output formatting
    sort: true, // can be also a sort function => i.e. (a, b) => a.key > b.key ? -1 : a.key < b.key ? 1 : 0, // sort in reverse order
    indentation: 2, // can be also a string
  },
  lint: {
    // Keyboard key labels such as Ctrl, Shift, and Cmd are not translated.
    ignoredTags: ['kbd'],
  },
})

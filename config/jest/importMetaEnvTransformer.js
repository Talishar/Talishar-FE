/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
// config/jest/fileTransform.js
'use strict';

module.exports = {
  process(sourceText, sourcePath, options) {
    return {
      code: sourceText.replaceAll('import.meta.env', '{}')
    };
  }
};

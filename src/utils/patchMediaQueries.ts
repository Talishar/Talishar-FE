export const patchMediaQueries = (patch: (mediaText: string) => string) => {
  const patchRules = (rules: CSSRuleList) => {
    Array.from(rules).forEach((rule) => {
      if (rule instanceof CSSMediaRule) {
        const { media } = rule;
        const patched = patch(media.mediaText);
        if (patched !== media.mediaText) media.mediaText = patched;
      }
      if ('cssRules' in rule) patchRules((rule as CSSGroupingRule).cssRules);
    });
  };

  const patchStyleSheets = () => {
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        patchRules(sheet.cssRules);
      } catch {
        return;
      }
    });
  };

  document.addEventListener(
    'load',
    (event) => {
      if (event.target instanceof HTMLLinkElement) patchStyleSheets();
    },
    true
  );
  new MutationObserver(patchStyleSheets).observe(document.head, {
    childList: true
  });
  patchStyleSheets();
};

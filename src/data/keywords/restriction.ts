export const formatRestriction = (restriction?: string): string =>
  restriction ? restriction.replace(/_/g, ' ') : '';

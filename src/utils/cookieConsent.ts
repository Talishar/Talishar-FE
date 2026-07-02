export type ConsentStatus = 'accepted' | 'declined' | null;

export const CONSENT_STORAGE_KEY = 'cookieConsent';
export const CONSENT_DATE_STORAGE_KEY = 'cookieConsentDate';
export const OPEN_COOKIE_CONSENT_EVENT = 'talishar:openCookieConsent';

const GA_MEASUREMENT_ID = 'G-KGM3BB1R29';

export function getConsentStatus(): ConsentStatus {
  const value = localStorage.getItem(CONSENT_STORAGE_KEY);
  return value === 'accepted' || value === 'declined' ? value : null;
}

export function setConsentStatus(status: 'accepted' | 'declined'): void {
  localStorage.setItem(CONSENT_STORAGE_KEY, status);
  localStorage.setItem(CONSENT_DATE_STORAGE_KEY, new Date().toISOString());
}

export function reopenCookieConsent(): void {
  window.dispatchEvent(new Event(OPEN_COOKIE_CONSENT_EVENT));
}

export function loadGoogleAnalytics(): void {
  if (
    document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
  ) {
    return;
  }

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.gtag =
    w.gtag ||
    function gtag() {
      w.dataLayer.push(arguments);
    };
  w.gtag('js', new Date());
  w.gtag('config', GA_MEASUREMENT_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function clearAnalyticsCookies(): void {
  const cookieNames = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((name) => name === '_ga' || name.startsWith('_ga_'));

  const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT';
  for (const name of cookieNames) {
    document.cookie = `${name}=; ${expiry}; path=/`;
    document.cookie = `${name}=; ${expiry}; path=/; domain=.${window.location.hostname}`;
  }
}

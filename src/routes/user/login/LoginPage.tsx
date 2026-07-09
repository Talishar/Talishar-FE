import { Outlet, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import PageBanner from 'components/PageBanner/PageBanner';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from 'hooks/usePageTitle';

const bannerByPath: Record<string, { title: string; subtitle?: string; pageTitle: string }> = {
  signup: { title: 'SIGNUP.BANNER_TITLE', subtitle: 'SIGNUP.BANNER_SUBTITLE', pageTitle: 'SIGNUP.PAGE_TITLE' },
  'password-recovery': { title: 'PASSWORD.RECOVERY.BANNER_TITLE', subtitle: 'PASSWORD.RECOVERY.BANNER_SUBTITLE', pageTitle: 'PASSWORD.RECOVERY.PAGE_TITLE' },
  'reset-password': { title: 'PASSWORD.RESET.BANNER_TITLE', subtitle: 'PASSWORD.RESET.BANNER_SUBTITLE', pageTitle: 'PASSWORD.RESET.PAGE_TITLE' },
};

export const LoginPage = () => {
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean).pop() ?? '';
  const { t, i18n, ready } = useTranslation();

  const bannerConfig = bannerByPath[segment] ?? { title: "USER.LOGIN.LOGIN", subtitle: "USER.LOGIN.WELCOME_BACK", pageTitle: 'PAGES.LOGIN' };
  const { title: titleKey, subtitle: subtitleKey, pageTitle: pageTitleKey } = bannerConfig;
  const title = t(titleKey);
  const subtitle = subtitleKey ? t(subtitleKey) : undefined;
  const pageTitle = t(pageTitleKey);

  usePageTitle(pageTitle);

  return (
    <main className={styles.LoginPageContainer}>
      <PageBanner title={title} subtitle={subtitle} />
      <div className={styles.formWrapper}>
        <Outlet />
      </div>
    </main>
  );
};

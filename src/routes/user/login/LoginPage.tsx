import { Outlet, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import PageBanner from 'components/PageBanner/PageBanner';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from 'hooks/usePageTitle';

export const LoginPage = () => {
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean).pop() ?? '';
  const { t } = useTranslation();

  let title: string;
  let subtitle: string | undefined;
  let pageTitle: string;
  if (segment === 'signup') {
    title = t('SIGNUP.BANNER_TITLE');
    subtitle = t('SIGNUP.BANNER_SUBTITLE');
    pageTitle = t('SIGNUP.PAGE_TITLE');
  } else if (segment === 'password-recovery') {
    title = t('PASSWORD.RECOVERY.BANNER_TITLE');
    subtitle = t('PASSWORD.RECOVERY.BANNER_SUBTITLE');
    pageTitle = t('PASSWORD.RECOVERY.PAGE_TITLE');
  } else if (segment === 'reset-password') {
    title = t('PASSWORD.RESET.BANNER_TITLE');
    subtitle = t('PASSWORD.RESET.BANNER_SUBTITLE');
    pageTitle = t('PASSWORD.RESET.PAGE_TITLE');
  } else {
    title = t('USER.LOGIN.LOGIN');
    subtitle = t('USER.LOGIN.WELCOME_BACK');
    pageTitle = t('PAGES.LOGIN');
  }

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

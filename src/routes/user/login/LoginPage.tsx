import { Outlet, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import PageBanner from 'components/PageBanner/PageBanner';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from 'hooks/usePageTitle';

const bannerByPath: Record<string, { title: string; subtitle?: string; pageTitle: string }> = {
  signup: { title: 'Create Account', subtitle: 'Join Talishar for free', pageTitle: 'Sign Up - Play FaB Free Online' },
  'password-recovery': { title: 'Reset Password', subtitle: "We'll send you a recovery link", pageTitle: 'Reset Password' },
  'reset-password': { title: 'Reset Password', subtitle: 'Enter your new password', pageTitle: 'Reset Password' },
};

export const LoginPage = () => {
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean).pop() ?? '';
  const { t, i18n, ready } = useTranslation();

  const { title, subtitle, pageTitle } = bannerByPath[segment] ?? { title: t("USER.LOGIN.LOGIN"), subtitle: t("USER.LOGIN.WELCOME_BACK"), pageTitle: 'Login' };

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

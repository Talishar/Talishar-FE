import { Outlet, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import PageBanner from 'components/PageBanner/PageBanner';

const bannerByPath: Record<string, { title: string; subtitle?: string }> = {
  signup: { title: 'Create Account', subtitle: 'Join Talishar for free' },
  'password-recovery': { title: 'Reset Password', subtitle: "We'll send you a recovery link" },
  'reset-password': { title: 'Reset Password', subtitle: 'Enter your new password' },
};

export const LoginPage = () => {
  const location = useLocation();
  const segment = location.pathname.split('/').filter(Boolean).pop() ?? '';
  const { title, subtitle } = bannerByPath[segment] ?? { title: 'Sign In', subtitle: 'Welcome back to Talishar' };

  return (
    <main className={styles.LoginPageContainer}>
      <PageBanner title={title} subtitle={subtitle} />
      <div className={styles.formWrapper}>
        <Outlet />
      </div>
    </main>
  );
};

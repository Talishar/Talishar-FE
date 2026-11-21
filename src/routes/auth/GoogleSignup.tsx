import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSubmitGoogleSignupMutation } from 'features/api/apiSlice';
import { usePageTitle } from 'hooks/usePageTitle';
import SwordLoader from 'components/SwordLoader/SwordLoader';
import styles from 'routes/user/profile/linkmetafy/linkMetafy.module.css';
import { MetafySignupResponse } from 'interface/API/MetafyAPI.php';
import { describeThrownError } from 'utils/serverError';
import { consumeGoogleState, getGoogleRedirectUri } from 'services/googleAuth';

const processedCodes = new Set<string>();

const GoogleSignup = () => {
  const { t } = useTranslation();
  usePageTitle(t('AUTH.GOOGLE_SIGNUP.PAGE_TITLE'));
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitGoogleSignup] = useSubmitGoogleSignupMutation();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    const fail = (message: string) => {
      toast.error(message, { position: 'top-center' });
      navigate('/user/login', { replace: true });
    };

    if (error) {
      if (error === 'access_denied') {
        navigate('/user/login', { replace: true });
      } else {
        fail(t('AUTH.GOOGLE_SIGNUP.ERROR', { error }));
      }
      return;
    }

    if (!code || processedCodes.has(code)) return;
    processedCodes.add(code);
    const state = searchParams.get('state');
    setSearchParams({}, { replace: true });

    if (!consumeGoogleState(state)) {
      fail(
        t('AUTH.GOOGLE_SIGNUP.FAILED', {
          error: t('AUTH.GOOGLE_SIGNUP.STATE_MISMATCH')
        })
      );
      return;
    }

    submitGoogleSignup({ code, redirect_uri: getGoogleRedirectUri() })
      .unwrap()
      .then((data: MetafySignupResponse) => {
        if (data.message === 'ok' && data.isUserLoggedIn) {
          toast.success(t('AUTH.GOOGLE_SIGNUP.REDIRECTING'), {
            position: 'top-center'
          });
          navigate('/');
        } else {
          fail(
            t('AUTH.GOOGLE_SIGNUP.FAILED', {
              error: data.error || t('BASE.UNKNOWN_ERROR')
            })
          );
        }
      })
      .catch((err) => {
        console.error('Google signup error:', err);
        fail(
          t('AUTH.GOOGLE_SIGNUP.ERROR', {
            error: describeThrownError(err, t('BASE.UNKNOWN_ERROR'))
          })
        );
      });
  }, [searchParams, navigate, setSearchParams, submitGoogleSignup, t]);

  return (
    <div className={styles.container}>
      <SwordLoader />
      <h2 className={styles.title}>{t('AUTH.GOOGLE_SIGNUP.PAGE_TITLE')}</h2>
      <p className={styles.subtitle}>{t('AUTH.GOOGLE_SIGNUP.PROCESSING')}</p>
      <div className={styles.dots}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    </div>
  );
};

export default GoogleSignup;

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSubmitMetafySignupMutation } from 'features/api/apiSlice';
import { usePageTitle } from 'hooks/usePageTitle';
import SwordLoader from 'components/SwordLoader/SwordLoader';
import styles from 'routes/user/profile/linkmetafy/linkMetafy.module.css';
import { MetafySignupResponse } from 'interface/API/MetafyAPI.php';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { SerializedError } from '@reduxjs/toolkit';

// Module-level variable to track processed codes - persists across component remounts
const processedCodes = new Set<string>();

const MetafySignup = () => {
  const { t } = useTranslation();
  usePageTitle(t('AUTH.METAFY_SIGNUP.PAGE_TITLE'));
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitMetafySignup] = useSubmitMetafySignupMutation();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`Metafy signup error: ${error}`, {
        position: 'top-center'
      });
      navigate('/user/login', { replace: true });
      return;
    }

    if (!code) {
      // No code and no error means we've already cleared the params
      // or this is a direct navigation - do nothing
      return;
    }

    // Check if this code has already been processed (survives StrictMode remounts)
    if (processedCodes.has(code)) {
      console.log(
        '[MetafySignup] Code already processed, skipping duplicate request'
      );
      return;
    }

    // Mark this code as processed BEFORE making the request
    processedCodes.add(code);

    // Clear the search params immediately using React Router
    // This prevents the component from processing the same code on remount
    setSearchParams({}, { replace: true });

    // Use RTK Query mutation to call the signup endpoint
    submitMetafySignup({
      code: code,
      redirect_uri: window.location.origin + '/auth/metafy-signup'
    })
      .unwrap()
      .then((data: MetafySignupResponse) => {
        if (data.message === 'ok' && data.isUserLoggedIn) {
          toast.success(t('AUTH.METAFY_SIGNUP.REDIRECTING'), {
            position: 'top-center'
          });
          navigate('/');
        } else {
          toast.error(`Signup failed: ${data.error || 'Unknown error'}`, {
            position: 'top-center'
          });
          navigate('/user/login', { replace: true });
        }
      })
      .catch((err: FetchBaseQueryError | SerializedError) => {
        console.error('Metafy signup error:', err);
        toast.error(`Signup error: ${err?.toString() || 'Unknown error'}`, {
          position: 'top-center'
        });
        navigate('/user/login', { replace: true });
      });
  }, [searchParams, navigate, setSearchParams, submitMetafySignup]);

  return (
    <div className={styles.container}>
      <SwordLoader />
      <h2 className={styles.title}>{t('AUTH.METAFY_SIGNUP.PAGE_TITLE')}</h2>
      <p className={styles.subtitle}>{t('AUTH.METAFY_SIGNUP.PROCESSING')}</p>
      <div className={styles.dots}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    </div>
  );
};

export default MetafySignup;

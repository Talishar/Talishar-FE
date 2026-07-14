import { useSubmitMetafyLoginMutation } from 'features/api/apiSlice';
import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePageTitle } from 'hooks/usePageTitle';
import SwordLoader from 'components/SwordLoader/SwordLoader';
import styles from './linkMetafy.module.css';

export interface MetafyLoginResponse {
  message?: string;
  error?: string;
}

const LinkMetafy = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.LINK_METAFY'));
  const [submitMetafyMutation, submitMetafyMutationResponse] =
    useSubmitMetafyLoginMutation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    submitMetafyMutation({
      code: searchParams.get('code') ?? '',
      redirect_uri: searchParams.get('redirect_uri') ?? ''
    })
      .unwrap()
      .then((data: MetafyLoginResponse) => {
        console.log('Metafy login response:', data);
        if (data.message === 'ok') {
          toast.success(t('LINK_METAFY_PAGE.SUCCESS'), {
            position: 'top-center'
          });
          navigate('/user/profile');
        } else {
          toast.error(`Metafy login error:\n${data?.error}`, {
            position: 'top-center'
          });
          navigate('/user/profile');
        }
      })
      .catch((err: any) => {
        console.error('Metafy login error:', err);
        toast.error(`Metafy login error:\n${err?.toString()}`, {
          position: 'top-center'
        });
        navigate('/user/profile');
      });
  }, []);

  return (
    <div className={styles.container}>
      <SwordLoader />
      <h2 className={styles.title}>{t('LINK_METAFY_PAGE.CONNECTING')}</h2>
      <p className={styles.subtitle}>{t('LINK_METAFY_PAGE.BANNER_SUBTITLE')}</p>
      <div className={styles.dots}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    </div>
  );
};

export default LinkMetafy;

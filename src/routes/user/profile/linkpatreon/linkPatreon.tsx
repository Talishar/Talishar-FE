import { useSubmitPatreonLoginMutation } from 'features/api/apiSlice';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export interface PatreonLoginResponse {
  message?: string;
  error?: string;
}

const LinkPatreon = () => {
  const { t } = useTranslation();
  const [submitPatreonMutation, submitPatreonMutationResponse] =
    useSubmitPatreonLoginMutation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    submitPatreonMutation({
      code: searchParams.get('code') ?? '',
      redirect_uri: searchParams.get('redirect_uri') ?? ''
    })
      .unwrap()
      .then((data: PatreonLoginResponse) => {
        if (data.message === 'ok') {
          navigate('/user/profile');
        } else {
          toast.error(t('LINK_PATREON_PAGE.ERROR', { error: data?.error }));
          navigate('/user/profile');
        }
      })
      .catch((err: any) => {
        toast.error(t('LINK_PATREON_PAGE.NETWORK_ERROR', { error: err }));
        navigate('/user/profile');
      });
  }, []);

  return <div>{t('LINK_PATREON_PAGE.CONNECTING')}</div>;
};

export default LinkPatreon;

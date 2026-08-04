import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-hot-toast';
import { FaExclamationCircle, FaCheck, FaTimes } from 'react-icons/fa';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation, Trans } from 'react-i18next';
import { usePageTitle } from 'hooks/usePageTitle';
import useAuth from 'hooks/useAuth';
import {
  useGetAppInfoQuery,
  useGenerateAuthTokenMutation,
  useLoginMutation,
  useGetFavoriteDecksQuery
} from 'features/api/apiSlice';
import {
  loginValidationSchema,
  LoginValidationType
} from 'routes/user/login/components/validation';
import styles from './AuthVerify.module.css';

const AuthVerify = () => {
  const { t } = useTranslation();
  usePageTitle(t('PAGES.AUTH_VERIFY'));
  const [searchParams] = useSearchParams();
  const { isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const appId = searchParams.get('app_id') ?? '';
  const redirectUri = searchParams.get('redirect_uri') ?? '';
  // This state will be sent from external app, Talishar doesn't need to handle it in any way
  // Other then send it back to the external app, this is done to avoid CSRF
  const state = searchParams.get('state') ?? '';

  // Fetch app info from backend to check if it's whitelisted
  const {
    data: appInfo,
    isLoading: isAppInfoLoading,
    error: appInfoError
  } = useGetAppInfoQuery(
    { app_id: appId, redirect_uri: redirectUri },
    { skip: !appId || !redirectUri }
  );

  const [generateAuthToken] = useGenerateAuthTokenMutation();

  const buildRedirectUrl = (params: Record<string, string>) => {
    const url = new URL(redirectUri);
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
    return url.toString();
  };

  const handleAllow = async () => {
    setIsProcessing(true);
    try {
      const result = await generateAuthToken({
        app_id: appId,
        redirect_uri: redirectUri
      }).unwrap();
      if (result.error) {
        toast.error(result.error, { position: 'top-center' });
        setIsProcessing(false);
        return;
      }
      // Redirect with token
      window.location.href = buildRedirectUrl({ token: result.token, state });
    } catch (err) {
      console.error('Failed to generate token:', err);
      toast.error(t('AUTH.VERIFY.AUTHORIZE_FAILED'), {
        position: 'top-center'
      });
      setIsProcessing(false);
    }
  };

  // Handle user denying authorization
  const handleDeny = () => {
    window.location.href = buildRedirectUrl({ error: 'access_denied', state });
  };

  // Show loading while checking auth status or fetching app info
  if (isAuthLoading || isAppInfoLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>{t('AUTH.VERIFY.AUTHORIZING')}</h2>
          <p>{t('AUTH.VERIFY.WAIT_MESSAGE')}</p>
        </div>
      </div>
    );
  }

  // Validate required parameters
  if (!appId || !redirectUri) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>{t('AUTH.VERIFY.INVALID_REQUEST')}</h2>
          <p className={styles.error}>
            <FaExclamationCircle />{' '}
            <Trans
              i18nKey="AUTH.VERIFY.INVALID_REQUEST_MESSAGE"
              components={[<code key="0" />, <code key="1" />]}
            />
          </p>
          <Link to="/" className={styles.homeLink}>
            {t('AUTH.VERIFY.RETURN_HOME')}
          </Link>
        </div>
      </div>
    );
  }

  // Handle app info errors (invalid app_id or redirect_uri not whitelisted, missing, etc)
  if (appInfoError || appInfo?.error) {
    const errorMessage =
      appInfo?.error || t('AUTH.VERIFY.AUTHORIZATION_FAILED_MESSAGE');
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>{t('AUTH.VERIFY.AUTHORIZATION_FAILED')}</h2>
          <p className={styles.error}>
            <FaExclamationCircle /> {errorMessage}
          </p>
          <Link to="/" className={styles.homeLink}>
            {t('AUTH.VERIFY.RETURN_HOME')}
          </Link>
        </div>
      </div>
    );
  }

  // If not logged in, show inline login form, thought it was a better UX then redirecting the user to login page
  if (!isLoggedIn) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2>{t('AUTH.VERIFY.SIGNIN_CONTINUE')}</h2>
          <p className={styles.appRequest}>
            <strong>{appInfo?.name}</strong>{' '}
            {t('AUTH.VERIFY.REQUEST_PERMISSION')}
          </p>
          <InlineLoginForm onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>{t('AUTH.VERIFY.AUTHORIZE_APP')}</h2>

        <div className={styles.appInfo}>
          <h3>{appInfo?.name}</h3>
          {appInfo?.description && <p>{appInfo.description}</p>}
        </div>

        <div className={styles.permissions}>
          <h4>{t('AUTH.VERIFY.PERMISSIONS_TITLE')}</h4>
          <ul>
            <li>{t('AUTH.VERIFY.PERMISSION_USERNAME')}</li>
            <li>{t('AUTH.VERIFY.PERMISSION_EMAIL')}</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <button
            onClick={handleAllow}
            disabled={isProcessing}
            className={styles.allowButton}
            aria-busy={isProcessing}
          >
            <FaCheck /> {t('AUTH.VERIFY.ALLOW')}
          </button>
          <button
            onClick={handleDeny}
            disabled={isProcessing}
            className={styles.denyButton}
          >
            <FaTimes /> {t('AUTH.VERIFY.DENY')}
          </button>
        </div>

        <p className={styles.disclaimer}>
          {t('AUTH.VERIFY.DISCLAIMER', { appName: appInfo?.name })}
        </p>
      </div>
    </div>
  );
};

interface InlineLoginFormProps {
  onSuccess: () => void;
}

const InlineLoginForm = ({}: InlineLoginFormProps) => {
  const { t } = useTranslation();
  const [parent] = useAutoAnimate();
  const [login] = useLoginMutation();
  const { setLoggedIn } = useAuth();
  const { refetch } = useGetFavoriteDecksQuery(undefined);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginValidationType>({
    mode: 'onBlur',
    resolver: yupResolver(loginValidationSchema)
  });

  const onSubmit: SubmitHandler<LoginValidationType> = async (data) => {
    const values = { ...data, rememberMe: data.rememberMe ?? false };
    try {
      const body = values.rememberMe
        ? {
            userID: values.userID,
            password: values.password,
            rememberMe: values.rememberMe
          }
        : { userID: values.userID, password: values.password };

      const resp = await login({ ...body, submit: true }).unwrap();

      if (resp.error) {
        setError('root.serverError', { type: 'custom', message: resp.error });
        toast.error(resp.error, { position: 'top-center' });
        return;
      }

      if (resp?.isUserLoggedIn) {
        toast.success(t('USER.LOGIN.LOGGED_IN'), { position: 'top-center' });
        refetch();
        setLoggedIn(
          resp?.loggedInUserID ?? '0',
          resp?.loggedInUserName,
          '',
          resp?.isPatron,
          false,
          resp?.metafyID ?? resp?.metafyId ?? null,
          resp?.metafyHash ?? null,
          resp?.timestamp ?? null
        );
        // Reload the page to refresh auth state and show consent screen
        window.location.reload();
      } else {
        toast.error(t('USER.LOGIN.INCORRECT_CREDENTIALS'), {
          position: 'top-center'
        });
        setError('root.serverError', {
          type: 'custom',
          message: t('USER.LOGIN.INCORRECT_CREDENTIALS')
        });
      }
    } catch (err) {
      console.warn(err);
      toast.error(
        t('USER.LOGIN.NETWORK_ERROR', { error: JSON.stringify(err) }),
        {
          position: 'top-center'
        }
      );
      setError('root.serverError', {
        type: 'custom',
        message: t('USER.LOGIN.LOGIN_NETWORK_ERROR')
      });
    }
  };

  return (
    <div className={styles.loginForm}>
      <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
        <label htmlFor="userID">{t('USER.LOGIN.USERNAME')}</label>
        <input
          id="userID"
          type="text"
          placeholder="bravo"
          {...register('userID')}
          aria-invalid={errors.userID?.message ? 'true' : undefined}
        />
        {errors.userID?.message && (
          <div className={styles.fieldError}>{errors.userID?.message}</div>
        )}

        <label htmlFor="password">{t('USER.LOGIN.PASSWORD')}</label>
        <input
          id="password"
          type="password"
          placeholder="********"
          {...register('password')}
          aria-invalid={errors.password?.message ? 'true' : undefined}
        />
        {errors.password?.message && (
          <div className={styles.fieldError}>{errors.password?.message}</div>
        )}

        <div className={styles.rememberMe}>
          <input id="rememberMe" type="checkbox" {...register('rememberMe')} />
          <label htmlFor="rememberMe">{t('USER.LOGIN.REMEMBER_ME')}</label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className={styles.submitButton}
        >
          {t('AUTH.VERIFY.SIGN_IN')}
        </button>

        {errors.root?.serverError?.message && (
          <div className={styles.fieldError}>
            <FaExclamationCircle /> {errors.root?.serverError?.message}
          </div>
        )}
      </form>

      <div className={styles.signupLink}>
        <p>
          <Trans
            i18nKey="AUTH.VERIFY.DONT_HAVE_ACCOUNT"
            components={[<Link key="0" to="/user/login/signup" />]}
          />
        </p>
      </div>
    </div>
  );
};

export default AuthVerify;

import { useSignUpMutation } from 'features/api/apiSlice';
import styles from './LoginForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { SignUpType } from './validation';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import useAuth from 'hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

export const SignUpForm = () => {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const [signup] = useSignUpMutation();
  const [parent] = useAutoAnimate();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SignUpType>({ mode: 'onBlur' });

  if (isLoggedIn) {
    navigate('/');
  }

  const onSubmit: SubmitHandler<SignUpType> = async (data) => {
    try {
      const resp = await signup(data).unwrap();
      if (resp.error) {
        setError('root.serverError', {
          type: 'custom',
          message: resp.error
        });
        toast.error(resp.error, { position: 'top-center' });
      }
      if (resp.message === 'Success!') {
        toast.success(t('USER.LOGIN.SIGNUP_SUCCESS'), {
          position: 'top-center'
        });
        navigate('/user/login');
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
        message: t('USER.LOGIN.SIGNUP_NETWORK_ERROR', {
          error: JSON.stringify(err)
        })
      });
    }
  };

  return (
    <div>
      <h2>{t('USER.LOGIN.SIGN_UP')}</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="userId">{t('USER.LOGIN.USERNAME')}</label>
          <input
            id="userId"
            type="text"
            placeholder="bravo"
            autoComplete="username"
            {...register('userId')}
            aria-invalid={errors.userId?.message ? 'true' : undefined}
          />
          {errors.userId?.message && (
            <div className={styles.fieldError}>{errors.userId?.message}</div>
          )}
          <label htmlFor="email">{t('USER.LOGIN.EMAIL')}</label>
          <input
            id="email"
            type="email"
            placeholder="bravo@talishar.net"
            autoComplete="email"
            {...register('email')}
            aria-invalid={errors.email?.message ? 'true' : undefined}
            aria-describedby={errors.email?.message ? 'email-error' : undefined}
          />
          {errors.email?.message && (
            <div id="email-error" className={styles.fieldError} role="alert">
              {errors.email?.message}
            </div>
          )}
          <label htmlFor="password">{t('USER.LOGIN.PASSWORD')}</label>
          <input
            id="password"
            type="password"
            placeholder="********"
            autoComplete="new-password"
            {...register('password')}
            aria-invalid={errors.password?.message ? 'true' : undefined}
            aria-describedby={
              errors.password?.message ? 'password-error' : undefined
            }
          />
          {errors.password?.message && (
            <div id="password-error" className={styles.fieldError} role="alert">
              {errors.password?.message}
            </div>
          )}
          <label htmlFor="passwordRepeat">
            {t('USER.LOGIN.CONFIRM_PASSWORD')}
          </label>
          <input
            id="passwordRepeat"
            type="password"
            placeholder="********"
            autoComplete="new-password"
            {...register('passwordRepeat')}
            aria-invalid={errors.passwordRepeat?.message ? 'true' : undefined}
            aria-describedby={
              errors.passwordRepeat?.message
                ? 'passwordRepeat-error'
                : undefined
            }
          />
          {errors.passwordRepeat?.message && (
            <div
              id="passwordRepeat-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.passwordRepeat?.message}
            </div>
          )}
          <input
            id="agreeToTerms"
            type="checkbox"
            {...register('agreeToTerms')}
            aria-invalid={errors.agreeToTerms?.message ? 'true' : undefined}
            aria-describedby={
              errors.agreeToTerms?.message ? 'agreeToTerms-error' : undefined
            }
          />
          <label htmlFor="agreeToTerms">
            <Trans
              i18nKey="USER.LOGIN.TALISHAR_CONSENT"
              components={[
                <button
                  key="not-judge-s0"
                  type="button"
                  onClick={(e) => {
                    // Keep the click from reaching the surrounding <label>,
                    // which would otherwise toggle the consent checkbox.
                    e.preventDefault();
                    e.stopPropagation();
                    setDisclaimerOpen(true);
                  }}
                  className={styles.link}
                />
              ]}
            ></Trans>
          </label>
          {errors.agreeToTerms?.message && (
            <div
              id="agreeToTerms-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.agreeToTerms?.message}
            </div>
          )}
          <button
            className={styles.submitButton}
            aria-busy={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('GAME_LOBBY.SUBMITTING') : t('USER.LOGIN.SUBMIT')}
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError} role="alert">
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
        <hr className={styles.divider} />
        <p className={styles.linebreak} style={{ marginTop: '18px' }}>
          <Trans
            i18nKey="USER.LOGIN.ALREADY_HAVE_ACCOUNT"
            components={[
              <Link
                key="already-account-l0"
                to={'/user/login'}
                style={{
                  color: 'var(--theme-primary)',
                  textDecoration: 'underline'
                }}
              />
            ]}
          ></Trans>
        </p>
        <small className={styles.privacy}>
          <Link to={'/privacy'}>{t('USER.LOGIN.PRIVACY_POLICY')}</Link>
        </small>
      </article>
      <dialog open={disclaimerOpen}>
        <article className={styles.container}>
          <header>
            <button
              type="button"
              aria-label={t('USER.LOGIN.CLOSE')}
              className="close"
              onClick={() => setDisclaimerOpen(false)}
            />
            {t('USER.LOGIN.DISCLAIMER')}
          </header>
          <p>{t('USER.LOGIN.DISCLAIMER_BODY_1')}</p>
          <p>{t('USER.LOGIN.DISCLAIMER_BODY_2')}</p>
          <p>{t('USER.LOGIN.DISCLAIMER_BODY_3')}</p>
          <p>{t('USER.LOGIN.DISCLAIMER_BODY_4')}</p>
          <p>{t('USER.LOGIN.DISCLAIMER_BODY_5')}</p>
          <hr />
          <button
            onClick={(e) => {
              e.preventDefault();
              setDisclaimerOpen(false);
            }}
          >
            {t('USER.LOGIN.POLICY_DIALOG_BUTTON')}
          </button>
        </article>
      </dialog>
    </div>
  );
};

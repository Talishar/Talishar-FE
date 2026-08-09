import {
  ForgottenPasswordType,
  forgottenPasswordValidationSchema
} from './validation';
import styles from './LoginForm.module.css';
import { FaExclamationCircle } from 'react-icons/fa';
import { useForgottenPasswordMutation } from 'features/api/apiSlice';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-hot-toast';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from 'react-i18next';

export const ForgottenPasswordForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [forgottenPassword] = useForgottenPasswordMutation();
  const [parent] = useAutoAnimate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ForgottenPasswordType>({
    mode: 'onBlur',
    resolver: yupResolver(forgottenPasswordValidationSchema)
  });

  const onSubmit: SubmitHandler<ForgottenPasswordType> = async (values) => {
    try {
      const resp = await forgottenPassword(values).unwrap();

      // TODO change this to check statusCode, but we currently don't return it here
      if (resp.message === 'Password reset email sent.') {
        toast.success(t('USER.LOGIN.PASSWORD_RESET_EMAIL_SENT'), {
          position: 'top-center'
        });
        navigate('/user/login');
      } else if (resp.error) {
        setError('root.serverError', {
          type: 'custom',
          message: resp.error
        });
        toast.error(resp.error, { position: 'top-center' });
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
        message: t('USER.LOGIN.FORGOTTEN_PASSWORD_NETWORK_ERROR', {
          error: JSON.stringify(err)
        })
      });
    }
  };

  return (
    <div>
      <h2>{t('USER.LOGIN.FORGOTTEN_PASSWORD')}</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="email">{t('USER.LOGIN.EMAIL')}</label>
          <input
            id="email"
            type="email"
            placeholder="bravo@talishar.net"
            {...register('email')}
            aria-invalid={errors.email?.message ? 'true' : undefined}
          />
          {errors.email?.message && (
            <div className={styles.fieldError}>{errors.email?.message}</div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting
              ? t('GAME_LOBBY.SUBMITTING')
              : t('USER.LOGIN.SUBMIT')}
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError}>
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
        <p>{t('USER.LOGIN.PASSWORD_RESET_INFO')}</p>
        <hr className={styles.divider} />
        <p className={styles.linebreak}>{t('USER.LOGIN.OR')}</p>
        <Link
          className={classNames(styles.signupButton, 'outline')}
          role="button"
          to={'/user/login'}
        >
          {t('USER.LOGIN.LOGIN')}
        </Link>
        <Link
          className={classNames(styles.signupButton, 'outline')}
          style={{ marginTop: '1rem' }}
          role="button"
          to={'/user/login/signup'}
        >
          {t('USER.LOGIN.SIGN_UP')}
        </Link>
      </article>
    </div>
  );
};

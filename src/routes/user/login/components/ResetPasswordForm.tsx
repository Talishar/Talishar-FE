import { resetPasswordValidationSchema } from './validation';
import { ResetPassword } from 'interface/API/ResetPassword.php';
import styles from './LoginForm.module.css';
import { FaExclamationCircle } from 'react-icons/fa';
import { useResetPasswordMutation } from 'features/api/apiSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-hot-toast';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useTranslation } from 'react-i18next';

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [resetPassword] = useResetPasswordMutation();
  const [parent] = useAutoAnimate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ResetPassword>({
    mode: 'onBlur',
    resolver: yupResolver(resetPasswordValidationSchema)
  });

  const { t } = useTranslation();

  const onSubmit: SubmitHandler<ResetPassword> = async (values) => {
    try {
      const payload = {
        ...values,
        selector: params.get('selector') ?? '',
        validator: params.get('validator') ?? ''
      };
      const resp = await resetPassword(payload).unwrap();
      if (resp.error) {
        setError('root.serverError', {
          type: 'custom',
          message: resp.error
        });
        toast.error(resp.error, { position: 'top-center' });
      }
      if (resp.message === 'Success!') {
        toast.success(t('USER.LOGIN.PASSWORD_RESET_SUCCESS'), {
          position: 'top-center'
        });
        navigate('/user/login');
      }
    } catch (err) {
      console.warn(err);
      setError('root.serverError', {
        type: 'custom',
        message: `There has been a network error submitting the password reset. Please try again. If you still get an error, please report it on our Discord and include the following: ${JSON.stringify(
          err
        )}`
      });
    }
  };

  return (
    <div>
      <h2>{t('USER.LOGIN.RESET_PASSWORD_TITLE')}</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="password">{t('USER.LOGIN.PASSWORD')}</label>
          <input
            id="password"
            type="password"
            placeholder="********"
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
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? t('GAME_LOBBY.SUBMITTING') : t('USER.LOGIN.SUBMIT')}
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError} role="alert">
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
      </article>
    </div>
  );
};

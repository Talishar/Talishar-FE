import { resetPasswordValidationSchema } from './validation';
import { ResetPassword } from 'interface/API/ResetPassword.php';
import styles from './LoginForm.module.css';
import { FaExclamationCircle } from 'react-icons/fa';
import { useResetPasswordMutation } from 'features/api/apiSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-hot-toast';
import autoAnimate from '@formkit/auto-animate';
import { useRef, useEffect } from 'react';

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [resetPassword] = useResetPasswordMutation();
  const parent = useRef(null);
  
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ResetPassword>({
    mode: 'onBlur',
    resolver: yupResolver(resetPasswordValidationSchema)
  });

  const onSubmit: SubmitHandler<ResetPassword> = async (values) => {
    try {
      values.selector = params.get('selector') ?? '';
      values.validator = params.get('validator') ?? '';
      const resp = await resetPassword(values).unwrap();
      if (resp.error) {
        setError('root.serverError', {
          type: 'custom',
          message: resp.error
        });
        toast.error(resp.error, { position: 'top-center' });
      }
      if (resp.message === 'Success!') {
        toast.success(
          'Password reset successfully! Login with your new password.',
          {
            position: 'top-center'
          }
        );
        navigate('/user/login');
      }
    } catch (err) {
      console.warn(err);
      setError('root.serverError', {
        type: 'custom',
        message: `There has been a network error submitting the password reset. Please try again. If you still get an error please report on our discord and let us know the following: ${JSON.stringify(
          err
        )}`
      });
    } finally {
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('password')}
            aria-invalid={errors.password?.message ? 'true' : undefined}
          />
          {errors.password?.message && (
            <div className={styles.fieldError}>{errors.password?.message}</div>
          )}
          <label htmlFor="passwordRepeat">Confirm Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('passwordRepeat')}
            aria-invalid={errors.passwordRepeat?.message ? 'true' : undefined}
          />
          {errors.passwordRepeat?.message && (
            <div className={styles.fieldError}>
              {errors.passwordRepeat?.message}
            </div>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className={styles.submitButton}
          >
            Submit
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError}>
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
      </article>
    </div>
  );
};

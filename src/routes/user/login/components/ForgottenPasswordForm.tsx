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

export const ForgottenPasswordForm = () => {
  const navigate = useNavigate();
  const [forgottenPassword, forgottenPasswordResult] =
    useForgottenPasswordMutation();
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
      if (resp.error) {
        setError('root.serverError', {
          type: 'custom',
          message: resp.error
        });
        toast.error(resp.error, { position: 'top-center' });
      }

      // TODO change this to check statusCode, but we currently don't return it here
      if (resp.message === 'Password reset email sent.') {
        toast.success('Password reset email sent. Please check your email.', {
          position: 'top-center'
        });
        navigate('/user/login');
      }
    } catch (err) {
      console.warn(err);
      toast.error(`Network error: ${JSON.stringify(err)}`, {
        position: 'top-center'
      });
      setError('root.serverError', {
        type: 'custom',
        message: `There has been a network error while submitting your forgotten password request. Please try again. If you still get an error please report on our discord and let them know the following: ${JSON.stringify(
          err
        )}`
      });
    } finally {
    }
  };

  return (
    <div>
      <h2>Forgotten Password</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="email">Email</label>
          <input
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
            Submit
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError}>
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
        <p>
          An e-mail will be sent with instructions on how to reset your
          password.
        </p>
        <hr className={styles.divider} />
        <p className={styles.linebreak}>or</p>
        <Link
          className={classNames(styles.signupButton, 'outline')}
          role="button"
          to={'/user/login'}
        >
          Log in
        </Link>
        <Link
          className={classNames(styles.signupButton, 'outline')}
          style={{ marginTop: '1rem' }}
          role="button"
          to={'/user/login/signup'}
        >
          Register
        </Link>
      </article>
    </div>
  );
};

import { useSignUpMutation } from 'features/api/apiSlice';
import styles from './LoginForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { signUpValidationSchema } from './validation';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from 'hooks/useAuth';
import { toast } from 'react-hot-toast';

export interface ISignUpForm {
  userId: string;
  password: string;
  passwordRepeat: string;
  email: string;
}

export const SignUpForm = () => {
  const { isLoggedIn } = useAuth();
  const [signup, signupResult] = useSignUpMutation();
  const [parent] = useAutoAnimate();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<ISignUpForm>({
    mode: 'onBlur',
    resolver: yupResolver(signUpValidationSchema)
  });

  if (isLoggedIn) {
    navigate('/');
  }

  const onSubmit: SubmitHandler<ISignUpForm> = async (data) => {
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
        toast.success('You have signed up! Please now login to continue.', {
          position: 'top-center'
        });
        navigate('/user/login');
      }
    } catch (err) {
      console.warn(err);
    } finally {
      console.log('finally');
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="userId">Username</label>
          <input
            type="text"
            placeholder="bravo"
            {...register('userId')}
            aria-invalid={errors.userId?.message ? 'true' : undefined}
          />
          {errors.userId?.message && (
            <div className={styles.fieldError}>{errors.userId?.message}</div>
          )}
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
          <button className={styles.submitButton} aria-busy={isSubmitting}>
            Submit
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError}>
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
        <hr className={styles.divider} />
        <p className={styles.linebreak}>or</p>
        <Link
          className={classNames(styles.signupButton, 'outline')}
          role="button"
          to={'/user/login'}
        >
          Log in
        </Link>
      </article>
    </div>
  );
};

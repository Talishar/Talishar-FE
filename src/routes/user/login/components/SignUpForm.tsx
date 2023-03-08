import { useSignUpMutation } from 'features/api/apiSlice';
import styles from './LoginForm.module.css';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { signUpValidationSchema } from './validation';
import { FaExclamationCircle } from 'react-icons/fa';
import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

export interface ISignUpForm {
  userID: string;
  password: string;
  passwordConfirm: string;
  email: string;
}

export const SignUpForm = () => {
  const [signup, signupResult] = useSignUpMutation();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [parent] = useAutoAnimate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ISignUpForm>({
    mode: 'onBlur',
    resolver: yupResolver(signUpValidationSchema)
  });

  const onSubmit: SubmitHandler<ISignUpForm> = (data) => console.log(data);

  return (
    <div>
      <h2>Sign Up</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="userID">Username</label>
          <input
            type="text"
            placeholder="bravo"
            {...register('userID')}
            aria-invalid={errors.userID?.message ? 'true' : undefined}
          />
          {errors.userID?.message && (
            <div className={styles.fieldError}>{errors.userID?.message}</div>
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
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('passwordConfirm')}
            aria-invalid={errors.passwordConfirm?.message ? 'true' : undefined}
          />
          {errors.passwordConfirm?.message && (
            <div className={styles.fieldError}>
              {errors.passwordConfirm?.message}
            </div>
          )}
          <button className={styles.submitButton}>Submit</button>
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

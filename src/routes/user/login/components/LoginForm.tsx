import { ErrorMessage, FormikProvider, useFormik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import classnames from 'classnames';
import {
  useGetFavoriteDecksQuery,
  useLoginMutation
} from 'features/api/apiSlice';
import { QueryStatus } from '@reduxjs/toolkit/dist/query';
import useAuth from 'hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppDispatch } from 'app/Hooks';
import { setCredentialsReducer } from 'features/auth/authSlice';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { loginValidationSchema, LoginValidationType } from './validation';
import { FaExclamationCircle } from 'react-icons/fa';

const getLoginBody = ({
  userID,
  password,
  ...rest
}: {
  userID: string;
  password: string;
  rememberMe: boolean;
}) => {
  if (rest.rememberMe) {
    return { userID, password, rememberMe: rest.rememberMe };
  }
  return { userID, password };
};

export const LoginForm = () => {
  const [parent] = useAutoAnimate();
  const [login, loginResult] = useLoginMutation();
  const { setLoggedIn } = useAuth();
  const navigate = useNavigate();
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
      const resp = await login(getLoginBody(values)).unwrap();
      if (resp.error) {
        setError('root.serverError', {
          type: 'custom',
          message: resp.error
        });
        toast.error(resp.error, { position: 'top-center' });
      }
      if (resp?.isUserLoggedIn) {
        toast.success('Logged In!', { position: 'top-center' });
        refetch();
        setLoggedIn(
          resp?.loggedInUserID ?? '0',
          resp?.loggedInUserName,
          '',
          resp?.isPatron
        );
        // TODO: Have this go back in router history to the previous page or protected route.
        navigate(-1);
      }
      if (resp?.isUserLoggedIn === false) {
        toast.error('Incorrect username or password.', {
          position: 'top-center'
        });
        setError('root.serverError', {
          type: 'custom',
          message: 'Incorrect username or password.'
        });
      }
    } catch (err) {
      console.warn(err);
      toast.error(`Network error: ${JSON.stringify(err)}`, {
        position: 'top-center'
      });
      setError('root.serverError', {
        type: 'custom',
        message: `There has been a network error while logging in. Please try again. If you still get an error please report on our discord and let us know the following: ${JSON.stringify(
          err
        )}`
      });
    }
  };

  return (
    <div>
      <h2>Log In</h2>
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
          <input
            id="rememberMe"
            type="checkbox"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe">Remember me</label>
          {errors.rememberMe?.message && (
            <div className={styles.fieldError}>
              {errors.rememberMe?.message}
            </div>
          )}
          <Link to={'./password-recovery'}>
            <p className={styles.forgottenPassword}>
              <small>Forgotten Password?</small>
            </p>
          </Link>
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
        <hr className={styles.divider} />
        <p className={styles.linebreak}>or</p>
        <Link
          className={classnames(styles.signupButton, 'outline')}
          role="button"
          to={'./signup'}
        >
          Sign Up
        </Link>
        <hr className={styles.divider} />
        <small>
          <em>
            By using the Remember Me function, you consent to a cookie being
            stored in your browser for purpose of identifying your account on
            future visits.
          </em>
        </small>
        &nbsp;
        <small>
          <Link to={'/privacy'}>Privacy Policy</Link>
        </small>
      </article>
    </div>
  );
};

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
        // Force a hard refresh to clear all cached state and show updated UI
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
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
            autoComplete="off"
            {...register('rememberMe')}
          />
          <label htmlFor="rememberMe">Remember me</label>
          {errors.rememberMe?.message && (
            <div className={styles.fieldError}>
              {errors.rememberMe?.message}
            </div>
          )}
{/*           <Link to={'./password-recovery'}>
            <p className={styles.forgottenPassword}>
              <small>Forgotten Password?</small>
            </p>
          </Link> */}
{/*           <p className={styles.fieldError}>
            <br />
              <small>⚠️ Due to some recent issues on the website, your account might have been deleted. If you cannot login, try signing up again. Thank you for your comprehension</small>
            </p> */}
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
<button
  onClick={() => {
    window.location.href = `https://metafy.gg/auth/authorize?client_id=${(import.meta as any).env?.VITE_METAFY_LOGIN_CLIENT_ID || ''}&redirect_uri=${encodeURIComponent('https://talishar.net/auth/metafy-signup')}&response_type=code&scope=profile`;
  }}
  className={styles.submitButton}
  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5em' }}
>
  <svg width="24" height="18" viewBox="0 0 278 212" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '1.6em', height: 'auto' }}>
    <g clipPath="url(#clip0_54_538)">
      <path d="M238.266 173.097C238.249 173.257 238.198 173.411 238.116 173.549C238.035 173.687 237.924 173.806 237.792 173.898C237.66 173.989 237.511 174.051 237.353 174.08C237.195 174.108 237.032 174.103 236.877 174.063C214.85 168.081 179.064 164.184 138.602 164.184C98.1399 164.184 62.3542 168.065 40.3271 174.063C40.1716 174.103 40.0092 174.108 39.8512 174.08C39.6932 174.051 39.5433 173.989 39.4115 173.898C39.2796 173.806 39.1691 173.687 39.0873 173.549C39.0056 173.411 38.9545 173.257 38.9376 173.097L27.6022 76.059C27.5813 75.9263 27.5975 75.7904 27.6489 75.6663C27.7004 75.5423 27.7852 75.4349 27.8939 75.356C28.0026 75.2771 28.131 75.2299 28.2649 75.2194C28.3988 75.2089 28.533 75.2355 28.6527 75.2965L90.4303 105.694C90.8938 105.937 91.4292 106.006 91.9391 105.888C92.4491 105.77 92.8998 105.472 93.2091 105.05L137.958 40.1717C138.027 40.0738 138.118 39.994 138.224 39.9388C138.33 39.8836 138.448 39.8548 138.568 39.8548C138.688 39.8548 138.806 39.8836 138.912 39.9388C139.018 39.994 139.109 40.0738 139.178 40.1717L183.978 105.05C184.275 105.491 184.724 105.808 185.238 105.942C185.753 106.076 186.299 106.018 186.773 105.779L248.551 75.3812C248.671 75.3202 248.805 75.2936 248.939 75.3041C249.073 75.3146 249.201 75.3619 249.31 75.4408C249.419 75.5197 249.503 75.6271 249.555 75.7511C249.606 75.8752 249.623 76.011 249.602 76.1437L238.266 173.097ZM192.145 75.9234L140.449 0.963439C140.245 0.66639 139.972 0.423447 139.653 0.255597C139.334 0.0877466 138.979 0 138.619 0C138.259 0 137.904 0.0877466 137.585 0.255597C137.266 0.423447 136.993 0.66639 136.789 0.963439L85.0929 75.9234C84.9415 76.1431 84.7166 76.3014 84.4587 76.3698C84.2008 76.4381 83.9269 76.4121 83.6866 76.2962L3.21984 36.6812C2.85759 36.504 2.45408 36.4279 2.05215 36.4612C1.65021 36.4944 1.26477 36.6357 0.936583 36.8701C0.608398 37.1046 0.349757 37.4234 0.187943 37.7928C0.0261297 38.1622 -0.0328184 38.5685 0.0174076 38.9687L17.4527 188.465C18.7404 201.393 72.4867 211.797 138.602 211.797C204.717 211.797 258.463 201.393 259.751 188.465L277.203 38.9687C277.256 38.5715 277.199 38.1675 277.041 37.7996C276.882 37.4317 276.627 37.1136 276.302 36.8791C275.977 36.6446 275.595 36.5024 275.196 36.4675C274.797 36.4327 274.395 36.5065 274.035 36.6812L193.551 76.2454C193.316 76.3664 193.046 76.4005 192.789 76.3415C192.532 76.2826 192.303 76.1345 192.145 75.9234Z" fill="black"/>
      <path d="M167.949 131.567C169.389 120.876 165.492 111.506 159.273 110.642C153.055 109.777 146.82 117.741 145.379 128.433C143.939 139.124 147.819 148.494 154.055 149.359C160.29 150.223 166.508 142.327 167.949 131.567Z" fill="black"/>
      <path d="M215.205 137.243C216.391 128.517 213.24 120.876 208.191 120.181C203.141 119.486 198.024 125.976 196.906 134.702C195.788 143.428 198.888 151.07 203.938 151.781C208.987 152.493 214.07 146.02 215.205 137.243Z" fill="black"/>
    </g>
    <defs>
      <clipPath id="clip0_54_538">
        <rect width="278" height="212" fill="white"/>
      </clipPath>
    </defs>
  </svg>
  Login with Metafy
</button>
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

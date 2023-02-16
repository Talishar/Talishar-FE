import { useSignUpMutation } from 'features/api/apiSlice';
import { useFormik } from 'formik';
import styles from './LoginForm.module.css';
import { QueryStatus } from '@reduxjs/toolkit/dist/query';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

export const SignUpForm = () => {
  const [signup, signupResult] = useSignUpMutation();

  const formik = useFormik({
    initialValues: {
      userID: '',
      password: '',
      passwordConfirm: '',
      email: ''
    },
    onSubmit: async (values) => {
      try {
        // const resp = await login(getLoginBody(values)).unwrap();
        // if (resp?.isUserLoggedIn) {
        //   toast.success('logged in!', { position: 'top-center' });
        //   setLoggedIn(resp?.loggedInUserID ?? '0', resp?.loggedInUserName, '');
        //   // TODO: Have this go back in router history to the previous page or protected route.
        //   navigate('/');
        // }
      } catch (err) {
        console.warn(err);
      }
    }
  });

  const thing = QueryStatus;
  return (
    <div>
      <h2>Sign Up</h2>
      <article className={styles.formContainer}>
        <form onSubmit={formik.handleSubmit}>
          <label htmlFor="userID">Username</label>
          <input
            type="text"
            name="userID"
            id="userID"
            placeholder="bravo"
            onChange={formik.handleChange}
            value={formik.values.userID}
          />
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="bravo@talishar.net"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="********"
            onChange={formik.handleChange}
            value={formik.values.password}
          />
          <label htmlFor="passwordConfirm">Confirm Password</label>
          <input
            type="passwordConfirm"
            name="passwordConfirm"
            id="passwordConfirm"
            placeholder="********"
            onChange={formik.handleChange}
            value={formik.values.passwordConfirm}
          />
          <button
            type="submit"
            disabled={signupResult.status === QueryStatus.pending}
            aria-busy={signupResult.status === QueryStatus.pending}
            className={styles.submitButton}
          >
            Submit
          </button>
          <hr className={styles.divider} />
          <p className={styles.linebreak}>or</p>
          <Link
            className={classNames(styles.signupButton, 'outline')}
            role="button"
            to={'/user/login'}
          >
            Log in
          </Link>
        </form>
      </article>
    </div>
  );
};

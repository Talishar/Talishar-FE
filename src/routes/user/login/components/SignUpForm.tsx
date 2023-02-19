import { useSignUpMutation } from 'features/api/apiSlice';
import { FormikProvider, useFormik } from 'formik';
import styles from './LoginForm.module.css';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { signUpValidationSchema } from './validation';
import { FaExclamationCircle } from 'react-icons/fa';

export const SignUpForm = () => {
  const [signup, signupResult] = useSignUpMutation();

  const formik = useFormik({
    initialValues: {
      userID: '',
      password: '',
      passwordConfirm: '',
      email: ''
    },
    validationSchema: signUpValidationSchema,
    onSubmit: async (values) => {
      try {
        console.log('values', values);
      } catch (err) {
        console.warn(err);
      }
    }
  });
  let errorArray = [] as string[];
  for (const [key, value] of Object.entries(formik.errors)) {
    errorArray.push(String(value));
  }
  return (
    <div>
      <h2>Sign Up</h2>
      <FormikProvider value={formik}>
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
              aria-invalid={
                (formik.errors.userID && formik.touched.userID) as
                  | boolean
                  | undefined
              }
            />

            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="bravo@talishar.net"
              onChange={formik.handleChange}
              value={formik.values.email}
              aria-invalid={
                (formik.errors.email && formik.touched.email) as
                  | boolean
                  | undefined
              }
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="********"
              onChange={formik.handleChange}
              value={formik.values.password}
              aria-invalid={
                (formik.errors.password && formik.touched.password) as
                  | boolean
                  | undefined
              }
            />
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              name="passwordConfirm"
              id="passwordConfirm"
              placeholder="********"
              onChange={formik.handleChange}
              value={formik.values.passwordConfirm}
              aria-invalid={
                (formik.errors.passwordConfirm &&
                  formik.touched.passwordConfirm) as boolean | undefined
              }
            />
            <button
              type="submit"
              disabled={formik.isSubmitting}
              aria-busy={formik.isSubmitting}
              className={styles.submitButton}
            >
              Submit
            </button>
            {!formik.isValid && (
              <div className={styles.formError}>
                <FaExclamationCircle /> {errorArray[0]}
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
      </FormikProvider>
    </div>
  );
};

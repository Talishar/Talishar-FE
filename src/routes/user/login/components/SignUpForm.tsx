import { useSignUpMutation } from 'features/api/apiSlice';
import { ErrorMessage, FormikProvider, getIn, useFormik } from 'formik';
import styles from './LoginForm.module.css';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { signUpValidationSchema } from './validation';
import { FaExclamationCircle } from 'react-icons/fa';
import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const SignUpForm = () => {
  const [signup, signupResult] = useSignUpMutation();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [parent] = useAutoAnimate();

  const formik = useFormik({
    initialValues: {
      userID: '',
      password: '',
      passwordConfirm: '',
      email: ''
    },
    validationSchema: signUpValidationSchema,
    onSubmit: async (values) => {
      setHasSubmitted(true);
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
              onBlur={formik.handleBlur}
              value={formik.values.userID}
              aria-invalid={
                (formik.errors.userID && formik.touched.userID) as
                  | boolean
                  | undefined
              }
            />
            <div className={styles.fieldError}>
              <ErrorMessage name="userID" />
            </div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="bravo@talishar.net"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              aria-invalid={
                (formik.errors.email && formik.touched.email) as
                  | boolean
                  | undefined
              }
            />
            <div className={styles.fieldError}>
              <ErrorMessage name="email" />
            </div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="********"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              aria-invalid={
                (formik.errors.password && formik.touched.password) as
                  | boolean
                  | undefined
              }
            />
            <div className={styles.fieldError}>
              <ErrorMessage name="password" />
            </div>
            <label htmlFor="passwordConfirm">Confirm Password</label>
            <input
              type="password"
              name="passwordConfirm"
              id="passwordConfirm"
              placeholder="********"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.passwordConfirm}
              aria-invalid={
                (formik.errors.passwordConfirm &&
                  formik.touched.passwordConfirm) as boolean | undefined
              }
            />
            <div className={styles.fieldError}>
              <ErrorMessage name="passwordConfirm" />
            </div>
            <button
              disabled={formik.isSubmitting}
              aria-busy={formik.isSubmitting}
              className={styles.submitButton}
              onClick={() => {
                setHasSubmitted(true);
                formik.handleSubmit();
              }}
            >
              Submit
            </button>
            {!formik.isValid && hasSubmitted && (
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

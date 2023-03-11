import { Form, FormikProvider, useFormik } from 'formik';
import { forgottenPasswordValidationSchema } from './validation';
import styles from './LoginForm.module.css';
import { FaExclamationCircle } from 'react-icons/fa';
import { useForgottenPasswordMutation } from 'features/api/apiSlice';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

export const ForgottenPasswordForm = () => {
  const [forgottenPassword, forgottenPasswordResult] =
    useForgottenPasswordMutation();

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: forgottenPasswordValidationSchema,
    onSubmit: async (values) => {
      try {
        console.log('values', values);
        const data = await forgottenPassword(values).unwrap();
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
      <h2>Forgotten Password</h2>
      <FormikProvider value={formik}>
        <article className={styles.formContainer}>
          <Form>
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
          </Form>
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
            to={'/user/login'}
          >
            Register
          </Link>
        </article>
      </FormikProvider>
    </div>
  );
};

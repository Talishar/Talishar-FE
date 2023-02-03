import { useFormik } from "formik";
import { Link } from "react-router-dom";
import styles from "./LoginForm.module.css";
import classnames from 'classnames';

export const LoginForm = () => {
    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        onSubmit: (values) => {
            console.log(values);
            // Todo: Make API call
        }
    });

    return (
        <article className={styles.formContainer}>
            <form onSubmit={formik.handleSubmit}>
                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    placeholder="bravo@talishar.net"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    name="password"
                    placeholder="********"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                />
                <Link to={'./password-recovery'}><small>Forgotten Password?</small></Link>
                <button
                    type="submit"
                    className={styles.submitButton}
                >Submit</button>
            </form>
            <hr className={styles.divider} />
            <p className={styles.linebreak}>or</p>
            <Link className={classnames(styles.signupButton, 'outline')} role="button" to={"./signup"}>Sign Up</Link>
        </article>
    );
}
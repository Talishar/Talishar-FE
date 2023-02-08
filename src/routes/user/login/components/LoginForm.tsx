import { useFormik } from 'formik';
import { Link } from 'react-router-dom';
import styles from './LoginForm.module.css';
import classnames from 'classnames';
import { useLoginMutation } from "features/api/apiSlice";
import { QueryStatus } from "@reduxjs/toolkit/dist/query";

const getLoginBody = ({ userID, password, ...rest}: { userID: string, password: string, rememberMe: boolean }) => {
    if (rest.rememberMe) {
        return { userID, password, rememberMe: rest.rememberMe };
    }
    return { userID, password };
}

export const LoginForm = () => {
    const [login, loginResult] = useLoginMutation();
    const formik = useFormik({
        initialValues: {
            userID: '',
            password: '',
            rememberMe: false
        },
        onSubmit: async (values) => {
            try {
                await login(getLoginBody(values));
            } catch (err) {
                console.log(err);
            }
        }
    });

    return (
        <article className={styles.formContainer}>
            <form onSubmit={formik.handleSubmit}>
                <label htmlFor="userID">Username</label>
                <input
                    type="text"
                    name="userID"
                    placeholder="bravo"
                    onChange={formik.handleChange}
                    value={formik.values.userID}
                />
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    name="password"
                    placeholder="********"
                    onChange={formik.handleChange}
                    value={formik.values.password}
                />
                <input
                    type="checkbox"
                    role="checkbox"
                    name="rememberMe"
                    id="rememberMe"
                    onChange={formik.handleChange}
                    value="rememberMe"
                    checked={formik.values.rememberMe}
                />
                <label htmlFor="rememberMe">
                    Remember me
                </label>
                <Link to={'./password-recovery'}><p className={styles.forgottenPassword}><small>Forgotten Password?</small></p></Link>
                <button
                    type="submit"
                    disabled={loginResult.status === QueryStatus.pending}
                    aria-busy={loginResult.status === QueryStatus.pending}
                    className={styles.submitButton}
                >Submit</button>
                {loginResult.error != null && <p className={styles.formError}>There was an issue logging in.</p>}
            </form>
            <hr className={styles.divider} />
            <p className={styles.linebreak}>or</p>
            <Link className={classnames(styles.signupButton, 'outline')} role="button" to={"./signup"}>Sign Up</Link>
        </article>
    );
}

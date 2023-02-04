import { Outlet } from "react-router-dom";
import styles from './LoginPage.module.css';

export const LoginPage = () => {
    return (
        <main className={styles.LoginPageContainer}>
            <Outlet />
        </main>
    );
}
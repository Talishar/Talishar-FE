import useAuth from 'hooks/useAuth';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const { isLoggedIn, logOut } = useAuth();

  const handleLogOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    logOut();
  };

  return (
    <div>
      <nav className={styles.navBar}>
        <ul>
          <li>
            <Link to="/">
              <strong>Talishar</strong>
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <Link to="/">Limited</Link>
          </li>
          <li>
            <Link to="/">RogueLike</Link>
          </li>
          <li>
            {isLoggedIn ? (
              <Link to="/user">Profile</Link>
            ) : (
              <Link to="/user/login">Log In</Link>
            )}
          </li>
          {isLoggedIn && (
            <li>
              <button onClick={handleLogOut} className="secondary outline">
                Log out
              </button>
            </li>
          )}
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Header;

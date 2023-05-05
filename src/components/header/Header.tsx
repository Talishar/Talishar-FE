import useAuth from 'hooks/useAuth';
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import styles from './Header.module.scss';
import TalisharLogo from '../../img/TalisharLogo.webp';
import {
  BsPersonFill,
  FaDiscord,
  FaTwitter,
  GiCardRandom,
  GiTreasureMap,
  RiLogoutBoxRLine
} from "react-icons/all";

const Header = () => {
  const { isLoggedIn, logOut } = useAuth();

  const handleLogOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logOut();
  };

  return (
    <div>
      <nav className={styles.navBar}>
        <ul>
          <li>
            <Link to="/" className={styles.logo}>
              <img src={TalisharLogo} alt={"Logo Talishar - link to homepage"} />
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <a href="https://discord.gg/JykuRkdd5S" target={"_blank"} className={styles.social}>
              <FaDiscord></FaDiscord>
            </a>
          </li>
          <li>
            <a href="https://twitter.com/talishar_online" target={"_blank"} className={styles.social}>
              <FaTwitter></FaTwitter>
            </a>
          </li>
          <li>
            <a href="https://www.draftfab.com/">
              <GiCardRandom></GiCardRandom> <span>Limited</span>
            </a>
          </li>
          <li>
            <a href="https://beta.talishar.net/game/Roguelike/CreateGame.php">
              <GiTreasureMap></GiTreasureMap> <span>RogueLike</span>
            </a>
          </li>
          <li>
            {isLoggedIn ? (
              <Link to="/user"><BsPersonFill></BsPersonFill> <span>Profile</span></Link>
            ) : (
              <Link to="/user/login" className={styles.login}><button>Log In</button></Link>
            )}
          </li>
          {isLoggedIn && (
            <li>
              <a href="" onClick={handleLogOut}>
                <RiLogoutBoxRLine></RiLogoutBoxRLine> <span>Log out</span>
              </a>
            </li>
          )}
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default Header;

import React, { useState, useRef, useEffect } from 'react';
import { BsGithub } from 'react-icons/bs';
import { FaDiscord, FaTwitter, FaYoutube } from 'react-icons/fa';
import styles from './SocialDropdown.module.scss';

const SocialDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <li className={styles.socialDropdown} ref={dropdownRef}>
      <button
        className={styles.dropdownToggle}
        onClick={() => setIsOpen(!isOpen)}
        title="Social Links"
      >
        <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
        </svg>
        <span className={styles.label}>Socials</span>
      </button>
      {isOpen && (
        <div className={styles.dropdownMenu}>
          <a
            href="https://metafy.gg/@talishar"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Metafy Link"
          >
            <svg width="1em" height="1em" viewBox="0 0 278 212" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M238.266 173.097C238.249 173.257 238.198 173.411 238.116 173.549C238.035 173.687 237.924 173.806 237.792 173.898C237.66 173.989 237.511 174.051 237.353 174.08C237.195 174.108 237.032 174.103 236.877 174.063C214.85 168.081 179.064 164.184 138.602 164.184C98.1399 164.184 62.3542 168.065 40.3271 174.063C40.1716 174.103 40.0092 174.108 39.8512 174.08C39.6932 174.051 39.5433 173.989 39.4115 173.898C39.2796 173.806 39.1691 173.687 39.0873 173.549C39.0056 173.411 38.9545 173.257 38.9376 173.097L27.6022 76.059C27.5813 75.9263 27.5975 75.7904 27.6489 75.6663C27.7004 75.5423 27.7852 75.4349 27.8939 75.356C28.0026 75.2771 28.131 75.2299 28.2649 75.2194C28.3988 75.2089 28.533 75.2355 28.6527 75.2965L90.4303 105.694C90.8938 105.937 91.4292 106.006 91.9391 105.888C92.4491 105.77 92.8998 105.472 93.2091 105.05L137.958 40.1717C138.027 40.0738 138.118 39.994 138.224 39.9388C138.33 39.8836 138.448 39.8548 138.568 39.8548C138.688 39.8548 138.806 39.8836 138.912 39.9388C139.018 39.994 139.109 40.0738 139.178 40.1717L183.978 105.05C184.275 105.491 184.724 105.808 185.238 105.942C185.753 106.076 186.299 106.018 186.773 105.779L248.551 75.3812C248.671 75.3202 248.805 75.2936 248.939 75.3041C249.073 75.3146 249.201 75.3619 249.31 75.4408C249.419 75.5197 249.503 75.6271 249.555 75.7511C249.606 75.8752 249.623 76.011 249.602 76.1437L238.266 173.097ZM192.145 75.9234L140.449 0.963439C140.245 0.66639 139.972 0.423447 139.653 0.255597C139.334 0.0877466 138.979 0 138.619 0C138.259 0 137.904 0.0877466 137.585 0.255597C137.266 0.423447 136.993 0.66639 136.789 0.963439L85.0929 75.9234C84.9415 76.1431 84.7166 76.3014 84.4587 76.3698C84.2008 76.4381 83.9269 76.4121 83.6866 76.2962L3.21984 36.6812C2.85759 36.504 2.45408 36.4279 2.05215 36.4612C1.65021 36.4944 1.26477 36.6357 0.936583 36.8701C0.608398 37.1046 0.349757 37.4234 0.187943 37.7928C0.0261297 38.1622 -0.0328184 38.5685 0.0174076 38.9687L17.4527 188.465C18.7404 201.393 72.4867 211.797 138.602 211.797C204.717 211.797 258.463 201.393 259.751 188.465L277.203 38.9687C277.256 38.5715 277.199 38.1675 277.041 37.7996C276.882 37.4317 276.627 37.1136 276.302 36.8791C275.977 36.6446 275.595 36.5024 275.196 36.4675C274.797 36.4327 274.395 36.5065 274.035 36.6812L193.551 76.2454C193.316 76.3664 193.046 76.4005 192.789 76.3415C192.532 76.2826 192.303 76.1345 192.145 75.9234Z"/>
              <path d="M167.949 131.567C169.389 120.876 165.492 111.506 159.273 110.642C153.055 109.777 146.82 117.741 145.379 128.433C143.939 139.124 147.819 148.494 154.055 149.359C160.29 150.223 166.508 142.327 167.949 131.567Z"/>
              <path d="M215.205 137.243C216.391 128.517 213.24 120.876 208.191 120.181C203.141 119.486 198.024 125.976 196.906 134.702C195.788 143.428 198.888 151.07 203.938 151.781C208.987 152.493 214.07 146.02 215.205 137.243Z"/>
            </svg>
            <span>Metafy</span>
          </a>
          <a
            href="https://github.com/Talishar/Talishar"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Github Link"
          >
            <BsGithub /> <span>GitHub</span>
          </a>
          <a
            href="https://discord.gg/JykuRkdd5S"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Discord Link"
          >
            <FaDiscord /> <span>Discord</span>
          </a>
          <a
            href="https://bsky.app/profile/talishar.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Bluesky Link"
          >
            <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
            </svg>
            <span>Bluesky</span>
          </a>
          <a
            href="https://twitter.com/talishar_online"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="Twitter Link"
          >
            <FaTwitter /> <span>Twitter</span>
          </a>
          <a
            href="https://www.youtube.com/@pvtvoid"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
            title="YouTube Channel"
          >
            <FaYoutube /> <span>YouTube</span>
          </a>
        </div>
      )}
    </li>
  );
};

export default SocialDropdown;

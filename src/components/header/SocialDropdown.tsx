import React, { useState, useRef, useEffect } from 'react';
import { BsGithub } from 'react-icons/bs';
import { FaDiscord, FaTwitter } from 'react-icons/fa';
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
        </div>
      )}
    </li>
  );
};

export default SocialDropdown;

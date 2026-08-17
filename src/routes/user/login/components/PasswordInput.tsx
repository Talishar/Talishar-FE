import { useState } from 'react';
import styles from './PasswordInput.module.css';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  register: UseFormRegister<any>;
  autoComplete?: string;
  errorMessage?: string;
}

export const PasswordInput = (props: Props) => {
  const [maskPassword, setMaskPassword] = useState(true);
  const { t } = useTranslation();

  return (
    <>
      <div className={styles.passwordContainer}>
        <input
          id="password"
          type={maskPassword ? 'password' : 'text'}
          placeholder="********"
          {...props.register('password')}
          autoComplete={props.autoComplete}
          aria-invalid={props.errorMessage ? 'true' : undefined}
          aria-describedby={props.errorMessage ? 'password-error' : undefined}
          className={styles.passwordInput}
        />
        <button
          type="button"
          className={styles.toggleButton}
          onClick={() => setMaskPassword((masked) => !masked)}
          aria-label={
            maskPassword
              ? t('USER.LOGIN.SHOW_PASSWORD')
              : t('USER.LOGIN.HIDE_PASSWORD')
          }
          aria-pressed={!maskPassword}
        >
          {maskPassword ? <FaRegEye /> : <FaRegEyeSlash />}
        </button>
      </div>
      {props.errorMessage && (
        <div id="password-error" className={styles.fieldError} role="alert">
          {props.errorMessage}
        </div>
      )}
    </>
  );
};

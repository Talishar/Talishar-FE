import { useState } from 'react';
import styles from './PasswordInput.module.css';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { UseFormRegister } from 'react-hook-form';

interface Props {
  register: UseFormRegister<any>;
  autoComplete?: string;
  errorMessage?: string;
}

export const PasswordInput = (props: Props) => {
  const [maskPassword, setMaskPassword] = useState(true);

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
          className={styles.passwordInput}
        />
        {maskPassword ? (
          <FaRegEye onClick={() => setMaskPassword(false)} />
        ) : (
          <FaRegEyeSlash onClick={() => setMaskPassword(true)} />
        )}
      </div>
      {props.errorMessage && (
        <div className={styles.fieldError}>{props.errorMessage}</div>
      )}
    </>
  );
};

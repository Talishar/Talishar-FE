import { useSignUpMutation } from 'features/api/apiSlice';
import styles from './LoginForm.module.css';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { SignUpType, signUpValidationSchema } from './validation';
import { FaExclamationCircle } from 'react-icons/fa';
import autoAnimate from '@formkit/auto-animate';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import useAuth from 'hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';

export const SignUpForm = () => {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const [signup, signupResult] = useSignUpMutation();
  const parent = useRef(null);
  
  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<SignUpType>({
    mode: 'onBlur',
    resolver: yupResolver(signUpValidationSchema)
  });

  if (isLoggedIn) {
    navigate('/');
  }

  const onSubmit: SubmitHandler<SignUpType> = async (data) => {
    try {
      const resp = await signup(data).unwrap();
      if (resp.error) {
        setError('root.serverError', {
          type: 'custom',
          message: resp.error
        });
        toast.error(resp.error, { position: 'top-center' });
      }
      if (resp.message === 'Success!') {
        toast.success('You have signed up! Please now login to continue.', {
          position: 'top-center'
        });
        navigate('/user/login');
      }
    } catch (err) {
      console.warn(err);
      toast.error(`Network error: ${JSON.stringify(err)}`, {
        position: 'top-center'
      });
      setError('root.serverError', {
        type: 'custom',
        message: `There has been a network error while signing up. Please try again. If you still get an error please report on our discord and let us know the following: ${JSON.stringify(
          err
        )}`
      });
    } finally {
    }
  };

  return (
    <div>
      <h2>Sign Up</h2>
      <article className={styles.formContainer}>
        <form onSubmit={handleSubmit(onSubmit)} ref={parent}>
          <label htmlFor="userId">Username</label>
          <input
            type="text"
            placeholder="bravo"
            {...register('userId')}
            aria-invalid={errors.userId?.message ? 'true' : undefined}
          />
          {errors.userId?.message && (
            <div className={styles.fieldError}>{errors.userId?.message}</div>
          )}
          <label htmlFor="email">Email</label>
          <input
            type="email"
            placeholder="bravo@talishar.net"
            {...register('email')}
            aria-invalid={errors.email?.message ? 'true' : undefined}
          />
          {errors.email?.message && (
            <div className={styles.fieldError}>{errors.email?.message}</div>
          )}
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('password')}
            aria-invalid={errors.password?.message ? 'true' : undefined}
          />
          {errors.password?.message && (
            <div className={styles.fieldError}>{errors.password?.message}</div>
          )}
          <label htmlFor="passwordRepeat">Confirm Password</label>
          <input
            type="password"
            placeholder="********"
            {...register('passwordRepeat')}
            aria-invalid={errors.passwordRepeat?.message ? 'true' : undefined}
          />
          {errors.passwordRepeat?.message && (
            <div className={styles.fieldError}>
              {errors.passwordRepeat?.message}
            </div>
          )}
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            aria-invalid={errors.agreeToTerms?.message ? 'true' : undefined}
          />
          <label htmlFor="agreeToTerms">
            I agree that{' '}
            <span
              onClick={() => setDisclaimerOpen(true)}
              className={styles.link}
            >
              Talishar is not a judge.
            </span>
          </label>
          {errors.agreeToTerms?.message && (
            <div className={styles.fieldError}>
              {errors.agreeToTerms?.message}
            </div>
          )}
          <button
            className={styles.submitButton}
            aria-busy={isSubmitting}
            disabled={isSubmitting}
          >
            Submit
          </button>
          {errors.root?.serverError?.message && (
            <div className={styles.fieldError}>
              <FaExclamationCircle /> {errors.root?.serverError?.message}
            </div>
          )}
        </form>
        <hr className={styles.divider} />
        <p className={styles.linebreak}>or</p>
        <Link
          className={classNames(styles.signupButton, 'outline')}
          role="button"
          to={'/user/login'}
        >
          Log in
        </Link>
        <small className={styles.privacy}>
          <Link to={'/privacy'}>Privacy Policy</Link>
        </small>
      </article>
      <dialog open={disclaimerOpen}>
        <article className={styles.container}>
          <header>
            <span
              aria-label="Close"
              className="close"
              onClick={() => setDisclaimerOpen(false)}
            ></span>
            Disclaimer
          </header>
          <p>
            Welcome to Talishar, a fan-made website where you can play the
            trading card game Flesh & Blood by Legend Story Studios in your
            browser! We want to ensure you have a fun and enjoyable
            experience playing the game online.
          </p>
          <p>
            Please be aware that, while we strive to provide an accurate and
            enjoyable gaming experience, there may be bugs or errors in the
            software that could impact the game's accuracy and functionality.
            Therefore, it's important to note that Talishar has no
            responsibility or warranty for the accuracy of the game rules on
            our website. It's always a good idea to familiarize yourself with
            the official rules and regulations of Flesh & Blood before playing
            on Talishar.
          </p>
          <p>
            It's also important to note that, if you're playing in a paper
            event, you should not use "it works that way on Talishar" as an
            excuse if you're caught performing an illegal move, missing
            triggers, or doing something out of order. The ultimate
            responsibility for knowing the game's rules lies with the
            players themselves, not the software. The ultimate authority on the
            rules of Flesh & Blood is Legend Story Studios.
          </p>
          <p>
            At Talishar, we're open-source, which means we welcome contributions
            and bug reports to help us improve the website. If you're interested
            in contributing, please visit our GitHub page. We appreciate all
            feedback and suggestions for improvement.
          </p>
          <p>
            By accessing and using our website, you agree to this disclaimer and
            assume all risks associated with using Talishar. We reserve the
            right to modify or terminate our services at any time without prior
            notice. If you have any questions or concerns, feel free to reach
            out to us on our discord. Thanks for playing on Talishar!
          </p>
          <hr />
          <button
            onClick={(e) => {
              e.preventDefault;
              setDisclaimerOpen(false);
            }}
          >
            I agree, let me play already!
          </button>
        </article>
      </dialog>
    </div>
  );
};

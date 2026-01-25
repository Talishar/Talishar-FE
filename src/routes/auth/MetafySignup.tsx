import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSubmitMetafySignupMutation } from 'features/api/apiSlice';

// Module-level variable to track processed codes - persists across component remounts
const processedCodes = new Set<string>();

const MetafySignup = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [submitMetafySignup] = useSubmitMetafySignupMutation();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      toast.error(`Metafy signup error: ${error}`, {
        position: 'top-center'
      });
      navigate('/user/login', { replace: true });
      return;
    }

    if (!code) {
      // No code and no error means we've already cleared the params
      // or this is a direct navigation - do nothing
      return;
    }

    // Check if this code has already been processed (survives StrictMode remounts)
    if (processedCodes.has(code)) {
      console.log('[MetafySignup] Code already processed, skipping duplicate request');
      return;
    }

    // Mark this code as processed BEFORE making the request
    processedCodes.add(code);

    // Clear the search params immediately using React Router
    // This prevents the component from processing the same code on remount
    setSearchParams({}, { replace: true });

    // Use RTK Query mutation to call the signup endpoint
    submitMetafySignup({
      code: code,
      redirect_uri: window.location.origin + '/auth/metafy-signup'
    })
      .unwrap()
      .then((data) => {
        if (data.message === 'ok' && data.isUserLoggedIn) {
          toast.success('Signup successful! Redirecting...', {
            position: 'top-center'
          });
          // Force a hard refresh to ensure all auth state is synced
          // The backend has set the session cookie and RTK Query will invalidate/refetch
          setTimeout(() => {
            window.location.href = data.redirect || '/';
          }, 500);
        } else {
          toast.error(`Signup failed: ${data.error || 'Unknown error'}`, {
            position: 'top-center'
          });
          navigate('/user/login', { replace: true });
        }
      })
      .catch((err) => {
        console.error('Metafy signup error:', err);
        toast.error(`Signup error: ${err?.toString() || 'Unknown error'}`, {
          position: 'top-center'
        });
        navigate('/user/login', { replace: true });
      });
  }, [searchParams, navigate, setSearchParams, submitMetafySignup]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Signing up with Metafy...</h2>
      <p>Please wait while we create your account.</p>
    </div>
  );
};

export default MetafySignup;

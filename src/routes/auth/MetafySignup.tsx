import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BACKEND_URL } from 'appConstants';
import { useAppDispatch } from 'app/Hooks';
import { setCredentialsReducer } from 'features/auth/authSlice';

// Module-level variable to track processed codes - persists across component remounts
const processedCodes = new Set<string>();

const MetafySignup = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

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

    const processMetafySignup = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/AccountFiles/MetafySignupAPI.php?code=${encodeURIComponent(code)}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.message === 'ok') {
          // Update Redux auth state with the logged-in user info
          if (data.loggedInUserID && data.loggedInUserName) {
            dispatch(
              setCredentialsReducer({
                user: data.loggedInUserID,
                userName: data.loggedInUserName,
                accessToken: '', // Token is in httpOnly cookie, not returned
                isPatron: data.isPatron || null,
                isMod: data.isMod || false
              })
            );
          }
          
          toast.success('Signup successful! Redirecting...', {
            position: 'top-center'
          });
          
          // Give time for the cookie to be set and Redux to update before redirecting
          setTimeout(() => {
            // Force a hard refresh to ensure all auth state is synced
            window.location.href = '/';
          }, 500);
        } else {
          toast.error(`Signup failed: ${data.error || 'Unknown error'}`, {
            position: 'top-center'
          });
          navigate('/user/login', { replace: true });
        }
      } catch (err) {
        console.error('Metafy signup error:', err);
        toast.error(`Signup error: ${err instanceof Error ? err.message : 'Unknown error'}`, {
          position: 'top-center'
        });
        navigate('/user/login', { replace: true });
      }
    };

    processMetafySignup();
  }, [searchParams, navigate, setSearchParams]); // Re-run when searchParams change

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Signing up with Metafy...</h2>
      <p>Please wait while we create your account.</p>
    </div>
  );
};

export default MetafySignup;

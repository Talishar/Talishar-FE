import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BACKEND_URL } from 'appConstants';

const MetafySignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Prevent double-processing (React StrictMode or other causes)
    if (hasProcessedRef.current) {
      return;
    }

    if (error) {
      toast.error(`Metafy signup error: ${error}`, {
        position: 'top-center'
      });
      navigate('/user/login', { replace: true });
      return;
    }

    if (!code) {
      toast.error('No authorization code received from Metafy', {
        position: 'top-center'
      });
      navigate('/user/login', { replace: true });
      return;
    }

    hasProcessedRef.current = true;
    // Call backend API to process the Metafy signup
    processMetafySignup(code);
  }, [searchParams, navigate]);

  const processMetafySignup = async (code: string) => {
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
        toast.success('Signup successful! Redirecting...', {
          position: 'top-center'
        });
        // Redirect to home after successful signup
        setTimeout(() => {
          navigate('/', { replace: true });
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

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Signing up with Metafy...</h2>
      <p>Please wait while we create your account.</p>
    </div>
  );
};

export default MetafySignup;

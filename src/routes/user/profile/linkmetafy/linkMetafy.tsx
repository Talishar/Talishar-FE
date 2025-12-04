import { useSubmitMetafyLoginMutation } from 'features/api/apiSlice';
import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export interface MetafyLoginResponse {
  message?: string;
  error?: string;
}

const LinkMetafy = () => {
  const [submitMetafyMutation, submitMetafyMutationResponse] =
    useSubmitMetafyLoginMutation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    submitMetafyMutation({
      code: searchParams.get('code') ?? '',
      redirect_uri: searchParams.get('redirect_uri') ?? ''
    })
      .unwrap()
      .then((data: MetafyLoginResponse) => {
        console.log('Metafy login response:', data);
        if (data.message === 'ok') {
          toast.success('Metafy connection successful!', {
            position: 'top-center'
          });
          navigate('/user/profile');
        } else {
          toast.error(`Metafy login error:\n${data?.error}`, {
            position: 'top-center'
          });
          navigate('/user/profile');
        }
      })
      .catch((err) => {
        console.error('Metafy login error:', err);
        toast.error(`Metafy login error:\n${err?.toString()}`, {
          position: 'top-center'
        });
        navigate('/user/profile');
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Connecting to Metafy...</h2>
      <p>Please wait while we connect your account.</p>
    </div>
  );
};

export default LinkMetafy;

import { useSubmitPatreonLoginMutation } from 'features/api/apiSlice';
import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

export interface PatreonLoginResponse {
  message?: string;
  error?: string;
}

const LinkPatreon = () => {
  const [submitPatreonMutation, submitPatreonMutationResponse] =
    useSubmitPatreonLoginMutation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    submitPatreonMutation({
      code: searchParams.get('code') ?? '',
      redirect_uri: searchParams.get('redirect_uri') ?? ''
    })
      .unwrap()
      .then((data: PatreonLoginResponse) => {
        if (data.message === 'ok') {
          navigate('/user/profile');
        } else {
          toast.error(`Patreon login error:\n${data?.error}`);
          navigate('/user/profile');
        }
      })
      .catch((err) => {
        toast.error(`Patreon login network error:\n${err}`);
        navigate('/user/profile');
      });
  }, []);

  return <div>linkPatreon</div>;
};

export default LinkPatreon;

/*
BE Response:
<br />
<b>Warning</b>: include_once(MenuBar.php): Failed to open stream: No such file or directory in <b>/var/www/html/game/AccountFiles/PatreonLoginAPI.php</b> on line <b>2</b><br />
<br />
<b>Warning</b>: include_once(): Failed opening 'MenuBar.php' for inclusion (include_path='.:/usr/local/lib/php') in <b>/var/www/html/game/AccountFiles/PatreonLoginAPI.php</b> on line <b>2</b><br />
<br />
<b>Fatal error</b>: Uncaught Error: Call to undefined function SetHeaders() in /var/www/html/game/AccountFiles/PatreonLoginAPI.php:16
Stack trace:
#0
*/

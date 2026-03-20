import { useEffect } from 'react';

let injected = false;

export default function useAdScript(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || injected) return;
    injected = true;

    const script = document.createElement('script');
    script.src = '//js.rev.iq/talishar.net';
    script.async = true;
    document.head.appendChild(script);
  }, [enabled]);
}

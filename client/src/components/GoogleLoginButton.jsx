import { useEffect, useRef, useState } from 'react';
import { useAuth, GOOGLE_CLIENT_ID, dashboardPath } from '../context/AuthContext.jsx';

// GSI is a page-level singleton: initialize once even if the component
// remounts (React StrictMode double-mounts in dev).
let gsiInitialized = false;

/**
 * Renders the official Google Identity Services button and runs the
 * sign-in through the shared auth context (same token/user storage as
 * the email login form). `loginType` ('candidate' | 'company') tells the
 * backend which workspace the user is entering; it is kept in a ref so
 * the one-time GSI callback always uses the currently selected tab.
 */
export default function GoogleLoginButton({ loginType = 'candidate' }) {
  const btnRef = useRef(null);
  const loginTypeRef = useRef(loginType);
  loginTypeRef.current = loginType;
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !btnRef.current) return undefined;

    let cancelled = false;
    let interval;

    const handleCredential = async (response) => {
      if (!response?.credential) return;
      setError('');
      try {
        const user = await loginWithGoogle(response.credential, loginTypeRef.current);
        window.location.assign(dashboardPath(user.role));
      } catch (err) {
        setError(err.message || 'Google sign-in failed');
      }
    };

    const init = () => {
      if (cancelled || !window.google?.accounts?.id) return;
      if (!gsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredential,
          auto_select: false,
          cancel_on_tap_outside: true
        });
        gsiInitialized = true;
      }
      if (btnRef.current && btnRef.current.childElementCount === 0) {
        window.google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 340,
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
      }
      clearInterval(interval);
    };

    interval = setInterval(init, 150);
    init();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [loginWithGoogle]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="google-login">
      <div ref={btnRef} className="google-btn-slot" />
      {error && <div className="alert alert-error mt-1">{error}</div>}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface SocialAuthButtonsProps {
  googleClientId?: string;
  onGoogleLogin: (token: string) => void;
  onFacebookLogin: (token: string) => void;
  onAppleLogin: () => void;
  loading: boolean;
}

type GoogleCredentialResponse = {
  credential?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (container: HTMLElement, options: any) => void;
        };
      };
    };
    FB?: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (callback: (response: any) => void, options?: { scope?: string }) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function SocialAuthButtons({
  googleClientId,
  onGoogleLogin,
  onFacebookLogin,
  onAppleLogin,
  loading,
}: SocialAuthButtonsProps) {
  const [googleReady, setGoogleReady] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  // Initialize Google
  useEffect(() => {
    if (!googleClientId || googleReady) {
      return;
    }

    const initializeGoogle = () => {
      if (!window.google?.accounts?.id) {
        return;
      }

      // Initialize for credential-based sign-in
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (credentialResponse: GoogleCredentialResponse) => {
          if (credentialResponse?.credential) {
            onGoogleLogin(credentialResponse.credential);
          }
        },
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
      return;
    }

    const existingScript = document.getElementById('google-client-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeGoogle);
      return () => {
        existingScript.removeEventListener('load', initializeGoogle);
      };
    }

    const script = document.createElement('script');
    script.id = 'google-client-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.body.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [googleClientId, googleReady, onGoogleLogin]);

  const handleGoogleLoginClick = () => {
    if (!googleClientId || !window.google?.accounts?.id) {
      return;
    }

    // Create a temporary invisible button and render Google's button, then click it
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '50%';
    tempDiv.style.top = '50%';
    tempDiv.style.transform = 'translate(-50%, -50%)';
    tempDiv.style.opacity = '0';
    tempDiv.style.pointerEvents = 'none';
    tempDiv.style.zIndex = '-1';
    document.body.appendChild(tempDiv);

    try {
      window.google.accounts.id.renderButton(tempDiv, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
      });

      // Wait for button to render, then click it
      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          // Create a synthetic click event
          const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
          });
          googleButton.dispatchEvent(clickEvent);
        }
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(tempDiv)) {
            document.body.removeChild(tempDiv);
          }
        }, 500);
      }, 200);
    } catch (error) {
      console.error('Google login error:', error);
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }
  };

  // Initialize Facebook
  useEffect(() => {
    if (!facebookAppId || facebookReady) {
      return;
    }

    if (window.FB) {
      setFacebookReady(true);
      return;
    }

    window.fbAsyncInit = () => {
      window.FB?.init({
        appId: facebookAppId,
        cookie: true,
        xfbml: false,
        version: 'v18.0',
      });
      setFacebookReady(true);
    };

    if (document.getElementById('facebook-jssdk')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      delete window.fbAsyncInit;
    };
  }, [facebookAppId, facebookReady]);

  const handleFacebookLogin = () => {
    if (!facebookAppId) {
      return;
    }

    if (!window.FB || typeof window.FB.login !== 'function') {
      return;
    }

    window.FB.login(
      (response: any) => {
        if (response.authResponse?.accessToken) {
          onFacebookLogin(response.authResponse.accessToken);
        }
      },
      { scope: 'email' }
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="space-y-2 flex flex-col items-center">
      <button
          type="button"
          onClick={onAppleLogin}
          disabled={loading}
          className="w-4/5 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="currentColor"
          >
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span>Continue with Apple</span>
        </button>
        {googleClientId && (
          <button
            type="button"
            onClick={handleGoogleLoginClick}
            disabled={loading || !googleReady}
            className="w-4/5 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        )}

        {facebookAppId && (
          <button
            type="button"
            onClick={handleFacebookLogin}
            disabled={loading || !facebookReady}
            className="w-4/5 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
            >
              <path
                d="M22.675 0h-21.35C.596 0 0 .596 0 1.326v21.348C0 23.404.596 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.403 24 24 23.404 24 22.674V1.326C24 .596 23.403 0 22.675 0z"
                fill="#1877f2"
              />
            </svg>
            <span>Continue with Facebook</span>
          </button>
        )}
      </div>
    </div>
  );
}


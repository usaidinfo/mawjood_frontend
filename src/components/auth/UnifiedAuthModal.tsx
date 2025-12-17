'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import PhoneAuthForm from './PhoneAuthForm';
import EmailAuthForm from './EmailAuthForm';
import OTPVerificationForm from './OTPVerificationForm';
import SocialAuthButtons from './SocialAuthButtons';

interface UnifiedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMethod = 'phone' | 'email';

export default function UnifiedAuthModal({ isOpen, onClose }: UnifiedAuthModalProps) {
  const { login } = useAuthStore();

  // Auth method selection
  const [authMethod, setAuthMethod] = useState<AuthMethod>('phone');
  
  // Phone state (fixed +966)
  const [phone, setPhone] = useState('');
  const formattedPhone = phone.trim() ? `+966${phone.replace(/^0+/, '')}` : '';
  
  // Email state
  const [email, setEmail] = useState('');
  
  // Name fields (for new users)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showNameFields, setShowNameFields] = useState(false);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasSentOTPWithName, setHasSentOTPWithName] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAuthMethod('phone');
      setPhone('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setOtp('');
      setOtpSent(false);
      setIsNewUser(false);
      setShowNameFields(false);
      setHasSentOTPWithName(false);
      setError('');
    }
  }, [isOpen]);

  const handleGoogleLogin = useCallback(
    async (token: string) => {
      try {
        setLoading(true);
        setError('');
        
        const response = await authService.socialLogin({ provider: 'google', token });
        
        if (response.data.needsPhoneUpdate) {
          setError('Please provide your phone number to complete registration.');
          setPhone('');
          setAuthMethod('phone');
          setShowNameFields(true);
          setLoading(false);
          return;
        }
        
        await login(response.data.user, response.data.token, response.data.refreshToken);
        onClose();
      } catch (err: any) {
        setError(err?.message || 'Unable to authenticate with Google. Please try again.');
        setLoading(false);
      }
    },
    [login, onClose]
  );

  const handleFacebookLogin = useCallback(
    async (token: string) => {
      try {
        setLoading(true);
        setError('');
        const response = await authService.socialLogin({ provider: 'facebook', token });
        await login(response.data.user, response.data.token, response.data.refreshToken);
        onClose();
      } catch (err: any) {
        setError(err?.message || 'Unable to authenticate with Facebook. Please try again.');
        setLoading(false);
      }
    },
    [login, onClose]
  );

  const handleAppleLogin = useCallback(() => {
    // Placeholder - not implemented yet
    setError('Apple Sign-In is coming soon!');
  }, []);

  const handleSendOTP = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (authMethod === 'phone') {
        if (!phone.trim()) {
          setError('Phone number is required');
          setLoading(false);
          return;
        }

        // If name fields are shown, we need names
        if (showNameFields && (!firstName.trim() || !lastName.trim())) {
          setError('First name and last name are required');
          setLoading(false);
          return;
        }

        // For new users, check if they exist first (without sending OTP)
        // We'll send OTP only after names are provided
        if (!showNameFields) {
          // First check - try to send OTP to see if user exists (without name)
          const response = await authService.sendPhoneOTP({
            phone: formattedPhone,
          });

          setIsNewUser(response.data.isNewUser);
          
          if (response.data.isNewUser) {
            // New user - show name fields, OTP was NOT sent (backend requires name)
            setShowNameFields(true);
            setError('Please enter your name to complete registration.');
            setLoading(false);
            return;
          } else {
            // Existing user - OTP sent, proceed to verification
            setOtpSent(true);
            setError('');
            setLoading(false);
            return;
          }
        } else {
          // Name fields are shown - send OTP with name (this is the only time OTP is sent for new users)
          const response = await authService.sendPhoneOTP({
            phone: formattedPhone,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          });

          // OTP sent successfully with name
          setOtpSent(true);
          setHasSentOTPWithName(true);
          setError('');
        }
      } else if (authMethod === 'email') {
        if (!email.trim()) {
          setError('Email is required');
          setLoading(false);
          return;
        }

        // If name fields are shown, we need names
        if (showNameFields && (!firstName.trim() || !lastName.trim())) {
          setError('First name and last name are required');
          setLoading(false);
          return;
        }

        // For new users, check if they exist first (without sending OTP)
        // We'll send OTP only after names are provided
        if (!showNameFields) {
          // First check - try to send OTP to see if user exists (without name)
          const response = await authService.sendEmailOTP({
            email: email.trim(),
          });

          setIsNewUser(response.data.isNewUser);
          
          if (response.data.isNewUser) {
            // New user - show name fields, OTP was NOT sent (backend requires name)
            setShowNameFields(true);
            setError('Please enter your name to complete registration.');
            setLoading(false);
            return;
          } else {
            // Existing user - OTP sent, proceed to verification
            setOtpSent(true);
            setError('');
            setLoading(false);
            return;
          }
        } else {
          // Name fields are shown - send OTP with name (this is the only time OTP is sent for new users)
          const response = await authService.sendEmailOTP({
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          });

          // OTP sent successfully with name
          setOtpSent(true);
          setHasSentOTPWithName(true);
          setError('');
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authMethod, phone, email, formattedPhone, firstName, lastName, showNameFields]);

  const handleVerifyOTP = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (authMethod === 'phone') {
        if (!otp.trim()) {
          setError('OTP is required');
          setLoading(false);
          return;
        }

        if (isNewUser && (!firstName.trim() || !lastName.trim())) {
          setError('First name and last name are required for new users');
          setLoading(false);
          return;
        }

        // For new users, we should have already sent OTP with name in handleSendOTP
        // So we don't need to resend here

        const response = await authService.verifyPhoneOTP({
          phone: formattedPhone,
          otp: otp.trim(),
        });

        await login(response.data.user, response.data.token, response.data.refreshToken);
        onClose();
      } else if (authMethod === 'email') {
        if (!otp.trim()) {
          setError('OTP is required');
          setLoading(false);
          return;
        }

        if (isNewUser && (!firstName.trim() || !lastName.trim())) {
          setError('First name and last name are required for new users');
          setLoading(false);
          return;
        }

        // For new users, we should have already sent OTP with name in handleSendOTP
        // So we don't need to resend here

        const response = await authService.verifyEmailOTP({
          email: email.trim(),
          otp: otp.trim(),
        });

        await login(response.data.user, response.data.token, response.data.refreshToken);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [authMethod, phone, email, formattedPhone, otp, firstName, lastName, isNewUser, hasSentOTPWithName, login, onClose]);

  const handleBackFromOTP = useCallback(() => {
    setOtpSent(false);
    setOtp('');
    setError('');
  }, []);

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Login / Sign Up</DialogTitle>
          <DialogDescription>
            Enter your phone number or email to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Phone Input - shown by default */}
          {authMethod === 'phone' && !otpSent && (
            <>
              <PhoneAuthForm
                phone={phone}
                setPhone={setPhone}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                showNameFields={showNameFields}
                loading={loading}
                onSendOTP={handleSendOTP}
              />
              {/* Login with email link */}
              <div className="">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setError('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Login with email
                </button>
              </div>
            </>
          )}

          {/* Email Input */}
          {authMethod === 'email' && !otpSent && (
            <>
              <EmailAuthForm
                email={email}
                setEmail={setEmail}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                showNameFields={showNameFields}
                loading={loading}
                onSendOTP={handleSendOTP}
              />
              {/* Login with phone link */}
              <div className="">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setError('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Login with phone
                </button>
              </div>
            </>
          )}

          {/* OTP Verification */}
          {otpSent && (
            <OTPVerificationForm
              otp={otp}
              setOtp={setOtp}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              isNewUser={isNewUser}
              showNameFields={showNameFields}
              authMethod={authMethod}
              loading={loading}
              onVerify={handleVerifyOTP}
              onBack={handleBackFromOTP}
            />
          )}

          {/* Social Sign-In */}
          {!otpSent && (
            <SocialAuthButtons
              googleClientId={googleClientId}
              onGoogleLogin={handleGoogleLogin}
              onFacebookLogin={handleFacebookLogin}
              onAppleLogin={handleAppleLogin}
              loading={loading}
            />
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

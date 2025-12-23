'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OTPVerificationFormProps {
  otp: string;
  setOtp: (otp: string) => void;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  isNewUser: boolean;
  showNameFields: boolean;
  authMethod: 'phone' | 'email';
  loading: boolean;
  onVerify: () => void;
  onBack: () => void;
}

export default function OTPVerificationForm({
  otp,
  setOtp,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  isNewUser,
  showNameFields,
  authMethod,
  loading,
  onVerify,
  onBack,
}: OTPVerificationFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Enter OTP {authMethod === 'phone' && '(Static: 12345)'}
        </label>
        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength={6}
        />
      </div>

      {isNewUser && showNameFields && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">First Name</label>
            <Input
              type="text"
              placeholder="Enter first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Last Name</label>
            <Input
              type="text"
              placeholder="Enter last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onVerify}
          disabled={loading || !otp.trim()}
          className="flex-1 cursor-pointer"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
      </div>
    </div>
  );
}


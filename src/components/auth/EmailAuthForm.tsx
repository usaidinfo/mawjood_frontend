'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EmailAuthFormProps {
  email: string;
  setEmail: (email: string) => void;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  showNameFields: boolean;
  loading: boolean;
  onSendOTP: () => void;
}

export default function EmailAuthForm({
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  showNameFields,
  loading,
  onSendOTP,
}: EmailAuthFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {showNameFields && (
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

      <Button
        type="button"
        onClick={onSendOTP}
        disabled={loading || !email.trim()}
        className="w-full cursor-pointer"
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </Button>
    </div>
  );
}


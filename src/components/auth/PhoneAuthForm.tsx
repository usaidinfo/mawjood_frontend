'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SaudiFlagIcon from './SaudiFlagIcon';

interface PhoneAuthFormProps {
  phone: string;
  setPhone: (phone: string) => void;
  firstName: string;
  setFirstName: (name: string) => void;
  lastName: string;
  setLastName: (name: string) => void;
  showNameFields: boolean;
  loading: boolean;
  onSendOTP: () => void;
}

export default function PhoneAuthForm({
  phone,
  setPhone,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  showNameFields,
  loading,
  onSendOTP,
}: PhoneAuthFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Phone Number</label>
        <div className="flex gap-2">
          <div className="flex items-center justify-center gap-1.5 px-2 py-2 border border-gray-300 rounded-md bg-gray-50 min-w-[85px]">
            <SaudiFlagIcon className="w-5 h-3.5 flex-shrink-0" />
            <span className="text-sm font-medium">+966</span>
          </div>
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            className="flex-1"
          />
        </div>
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
        disabled={loading || !phone.trim()}
        className="w-full"
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </Button>
    </div>
  );
}


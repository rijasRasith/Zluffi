'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Loader2, Phone, Mail } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard',
      });
      
      if (result?.error) {
        setError('Failed to sign in with Google');
        setIsLoading(false);
        return;
      }
      
      router.push('/dashboard');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleSendOTP = async () => {
    if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
      setError('Please enter a valid phone number in international format (e.g., +1234567890)');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Failed to send OTP');
        setIsLoading(false);
        return;
      }
      
      setOtpSent(true);
      setIsLoading(false);
      
      // For development, auto-fill OTP if provided
      if (data.otp) {
        setOtp(data.otp);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  
  const handleVerifyOTP = async () => {
    if (!otp) {
      setError('Please enter the OTP sent to your phone');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/otp', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, otp }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || 'Failed to verify OTP');
        setIsLoading(false);
        return;
      }
      
      // Create a custom session
      const result = await signIn('credentials', {
        redirect: false,
        userId: data.userId,
        phoneNumber,
        callbackUrl: '/dashboard',
      });
      
      if (result?.error) {
        setError('Failed to sign in after OTP verification');
        setIsLoading(false);
        return;
      }
      
      router.push('/dashboard');
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-zluffi-dark-brown">Login to Your Account</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="flex space-x-2 mb-6">
        <button
          type="button"
          onClick={() => setAuthMethod('google')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
            authMethod === 'google' 
              ? 'bg-zluffi-medium-brown text-white' 
              : 'bg-zluffi-clay/10 text-zluffi-slate'
          }`}
        >
          <Mail className="w-4 h-4 mr-2" />
          Google
        </button>
        <button
          type="button"
          onClick={() => setAuthMethod('phone')}
          className={`flex-1 py-2 px-4 rounded-md flex items-center justify-center ${
            authMethod === 'phone' 
              ? 'bg-zluffi-medium-brown text-white' 
              : 'bg-zluffi-clay/10 text-zluffi-slate'
          }`}
        >
          <Phone className="w-4 h-4 mr-2" />
          Phone
        </button>
      </div>
      
      {authMethod === 'google' ? (
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white border border-gray-300 text-zluffi-slate py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-zluffi-medium-brown focus:ring-offset-2 transition disabled:opacity-50 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
          ) : (
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
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
          )}
          Continue with Google
        </button>
      ) : (
        <div className="space-y-4">
          {!otpSent ? (
            <>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-zluffi-slate mb-1">
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zluffi-medium-brown"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={isLoading}
                className="w-full bg-zluffi-medium-brown text-white py-2 px-4 rounded-md hover:bg-zluffi-dark-brown focus:outline-none focus:ring-2 focus:ring-zluffi-medium-brown focus:ring-offset-2 transition disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Sending OTP...
                  </span>
                ) : (
                  'Send OTP'
                )}
              </button>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-zluffi-slate mb-1">
                  Enter OTP sent to {phoneNumber}
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zluffi-medium-brown"
                  disabled={isLoading}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                  className="flex-1 bg-zluffi-clay/10 text-zluffi-slate py-2 px-4 rounded-md hover:bg-zluffi-clay/20 focus:outline-none focus:ring-2 focus:ring-zluffi-medium-brown focus:ring-offset-2 transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={isLoading}
                  className="flex-1 bg-zluffi-medium-brown text-white py-2 px-4 rounded-md hover:bg-zluffi-dark-brown focus:outline-none focus:ring-2 focus:ring-zluffi-medium-brown focus:ring-offset-2 transition disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

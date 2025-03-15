import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Send OTP via Phone.Email
const sendOTP = async (phoneNumber: string, otp: string) => {
  try {
    const response = await fetch('https://api.phone.email/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PHONE_EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        phone: phoneNumber,
        message: `Your Zluffi verification code is: ${otp}`,
      }) ,
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Phone.Email error:', error);
    return false;
  }
};

// Request OTP
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;
    
    if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
      return NextResponse.json(
        { message: 'Invalid phone number format. Use international format (e.g., +1234567890)' },
        { status: 400 }
      );
    }
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set OTP expiration (10 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', phoneNumber)
      .single();
    
    if (!existingUser) {
      // Create new user with OTP
      await supabaseAdmin
        .from('users')
        .insert({
          phone: phoneNumber,
          otp: otp,
          otp_expires_at: expiresAt.toISOString(),
        });
    } else {
      // Update existing user's OTP
      await supabaseAdmin
        .from('users')
        .update({
          otp: otp,
          otp_expires_at: expiresAt.toISOString(),
        })
        .eq('phone', phoneNumber);
    }
    
    // Send OTP via SMS
    const sent = await sendOTP(phoneNumber, otp);
    
    if (!sent) {
      return NextResponse.json(
        { message: 'Failed to send OTP via SMS' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      message: 'OTP sent successfully',
      // In development, return OTP for testing
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('OTP request error:', error);
    return NextResponse.json(
      { message: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

// Verify OTP
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, otp } = body;
    
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { message: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }
    
    // Get current time
    const now = new Date().toISOString();
    
    // Verify OTP
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, otp, otp_expires_at')
      .eq('phone', phoneNumber)
      .single();
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    if (user.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP' },
        { status: 400 }
      );
    }
    
    if (user.otp_expires_at < now) {
      return NextResponse.json(
        { message: 'OTP has expired' },
        { status: 400 }
      );
    }
    
    // Generate a random name if this is first login
    if (!user.name) {
      const name = `User${Math.floor(Math.random() * 10000)}`;
      await supabaseAdmin
        .from('users')
        .update({ name: name })
        .eq('id', user.id);
    }
    
    // Clear OTP after successful verification
    await supabaseAdmin
      .from('users')
      .update({ otp: null, otp_expires_at: null })
      .eq('id', user.id);
    
    return NextResponse.json({ 
      message: 'OTP verified successfully',
      userId: user.id
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { AdminAuthService } from '@/src/services/admin-auth.service';
import { z } from 'zod';

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

/**
 * POST /api/admin/auth/verify-otp
 * 
 * Step 2: Verify the OTP sent during Step 1.
 * If successful, returns the admin user data and JWT token.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = VerifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, code } = validation.data;

    // Call Step 2: Verify OTP
    const result = await AdminAuthService.verifyOtp(email, code);

    return NextResponse.json({
      message: 'OTP verified successfully',
      ...result
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Admin Auth API] OTP verification error:', error);

    if (error.message === 'Invalid or expired verification code' || error.message === 'Invalid session') {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}


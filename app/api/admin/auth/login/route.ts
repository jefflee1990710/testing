import { NextResponse } from 'next/server';
import { AdminLoginSchema } from '@/src/models/admin-user';
import { AdminAuthService } from '@/src/services/admin-auth.service';

/**
 * POST /api/admin/auth/login
 * 
 * Step 1: Admin login with email and password.
 * If successful, sends an OTP and returns mfaRequired: true.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = AdminLoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.format() },
        { status: 400 }
      );
    }

    // Call Step 1: Login with password
    const result = await AdminAuthService.login(validation.data);

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error('[Admin Auth API] Login error:', error);

    if (error.message === 'Invalid credentials') {
      return NextResponse.json({ message: error.message }, { status: 401 });
    }

    if (error.message === 'Admin account is deactivated') {
      return NextResponse.json({ message: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

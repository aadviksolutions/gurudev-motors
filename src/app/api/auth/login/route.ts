import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { FALLBACK_USERS } from '@/lib/fallbackData';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user: any = null;
    let isFallback = false;

    // 1. Try querying the database
    try {
      user = await prisma.user.findUnique({
        where: { email: cleanEmail },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
          department: true,
        },
      });
    } catch (dbErr) {
      console.warn('Database connection warning during login:', dbErr);
      // Database is unavailable or unmigrated; continue to fallback check
    }

    // 2. If not found in DB or DB is offline, check fallback staff credentials
    if (!user) {
      const fallback = FALLBACK_USERS.find((u) => u.email.toLowerCase() === cleanEmail);
      if (fallback) {
        // Verify against raw password or hashed password
        const matches =
          password === fallback.rawPassword ||
          (fallback.passwordHash ? await verifyPassword(password, fallback.passwordHash) : false);

        if (!matches) {
          return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        user = fallback;
        isFallback = true;
      } else {
        return NextResponse.json({ error: 'Invalid email or inactive account' }, { status: 401 });
      }
    } else {
      // User found in DB
      if (!user.active) {
        return NextResponse.json({ error: 'Invalid email or inactive account' }, { status: 401 });
      }

      const passwordMatch = await verifyPassword(password, user.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
      }
    }

    // 3. Generate JWT Token
    const roleCode = user.roleCode || user.role?.code || 'MAIN_ADMIN';
    const token = signToken({
      userId: user.id,
      email: user.email,
      roleCode,
    });

    // 4. Build user response permissions
    let permissions: Record<string, any> = {};
    if (isFallback) {
      permissions = user.permissions;
    } else if (user.role?.permissions) {
      for (const p of user.role.permissions) {
        permissions[p.module] = {
          view: p.view,
          create: p.create,
          edit: p.edit,
          delete: p.delete,
          assign: p.assign,
          approve: p.approve,
          export: p.export,
        };
      }
    }

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      roleName: user.roleName || user.role?.name || 'Staff',
      roleCode,
      departmentId: user.departmentId,
      departmentName: user.departmentName || user.department?.name,
      permissions,
    };

    // 5. Audit Log (Non-blocking / resilient)
    try {
      await logAudit({
        user: authUser,
        action: 'LOGIN',
        module: 'USERS',
        recordId: user.id,
        newValue: `Logged in from IP: ${req.headers.get('x-forwarded-for') || '127.0.0.1'}`,
      });
    } catch (auditErr) {
      console.warn('Non-fatal: Audit log could not be written:', auditErr);
    }

    const response = NextResponse.json({
      success: true,
      user: authUser,
      message: 'Login successful',
    });

    // 6. Set HTTP-only secure cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}

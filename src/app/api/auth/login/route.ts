import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signToken, COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
        department: true,
      },
    });

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Invalid email or inactive account' }, { status: 401 });
    }

    const passwordMatch = await verifyPassword(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      roleCode: user.role.code,
    });

    // Form user response
    const permissions: Record<string, any> = {};
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

    const authUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      roleName: user.role.name,
      roleCode: user.role.code,
      departmentId: user.departmentId,
      departmentName: user.department?.name,
      permissions,
    };

    // Log audit
    await logAudit({
      user: authUser,
      action: 'LOGIN',
      module: 'USERS',
      recordId: user.id,
      newValue: `Logged in from IP: ${req.headers.get('x-forwarded-for') || '127.0.0.1'}`,
    });

    const response = NextResponse.json({
      success: true,
      user: authUser,
      message: 'Login successful',
    });

    // Set HTTP-only secure cookie
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

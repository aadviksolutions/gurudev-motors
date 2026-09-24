import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'gurudev_motors_fallback_secret_key_2026';
const COOKIE_NAME = 'gm_auth_token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  roleId: string;
  roleName: string;
  roleCode: string;
  departmentId?: string | null;
  departmentName?: string | null;
  permissions: Record<string, {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    assign: boolean;
    approve: boolean;
    export: boolean;
  }>;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; roleCode: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string; roleCode: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; roleCode: string };
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload?.userId && !payload?.email) return null;

    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId, active: true },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
          department: true,
        },
      });

      if (user) {
        const permissions: AuthUser['permissions'] = {};
        for (const perm of user.role.permissions) {
          permissions[perm.module] = {
            view: perm.view,
            create: perm.create,
            edit: perm.edit,
            delete: perm.delete,
            assign: perm.assign,
            approve: perm.approve,
            export: perm.export,
          };
        }

        return {
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
      }
    } catch (dbErr) {
      console.warn('Prisma getSessionUser database query failed, using resilient fallback:', dbErr);
    }

    // Resilient fallback for demo users when DB is unmigrated/unreachable
    const { FALLBACK_USERS } = await import('./fallbackData');
    const fallback = FALLBACK_USERS.find(
      (u) => u.id === payload.userId || u.email.toLowerCase() === payload.email.toLowerCase()
    );
    if (fallback) {
      const { rawPassword: _, passwordHash: __, ...safeUser } = fallback;
      return safeUser as AuthUser;
    }

    return null;
  } catch {
    return null;
  }
}

export async function hasPermission(
  module: string,
  action: 'view' | 'create' | 'edit' | 'delete' | 'assign' | 'approve' | 'export',
  user?: AuthUser | null
): Promise<boolean> {
  const current = user ?? (await getSessionUser());
  if (!current) return false;
  if (current.roleCode === 'MAIN_ADMIN') return true;

  const modPerms = current.permissions[module];
  if (!modPerms) return false;
  return !!modPerms[action];
}

export { COOKIE_NAME };

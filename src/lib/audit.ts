import { prisma } from './prisma';
import { AuthUser } from './auth';

interface AuditParams {
  user: AuthUser;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ASSIGN' | 'APPROVE' | 'STATUS_CHANGE' | 'LOGIN' | 'EXPORT';
  module: 'LEADS' | 'CUSTOMERS' | 'VEHICLES' | 'SALES' | 'BOOKINGS' | 'TEST_DRIVES' | 'SERVICE' | 'ACCOUNTS' | 'EMPLOYEES' | 'ROLES' | 'CONTENT' | 'SETTINGS' | 'USERS' | 'AUTH';
  recordId?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export async function logAudit({
  user,
  action,
  module,
  recordId,
  oldValue,
  newValue,
  ipAddress = '127.0.0.1',
}: AuditParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action,
        module,
        recordId,
        oldValue,
        newValue,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
    return null;
  }
}

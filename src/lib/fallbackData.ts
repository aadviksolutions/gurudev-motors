import { AuthUser } from './auth';

const allModules = [
  'dashboard', 'leads', 'customers', 'vehicles', 'sales', 'bookings',
  'test_drives', 'service', 'accounts', 'reports', 'employees', 'roles',
  'content', 'settings', 'audit_logs'
];

function buildPermissions(config: {
  viewAll?: boolean;
  viewList?: string[];
  createList?: string[];
  editList?: string[];
  deleteList?: string[];
  assignList?: string[];
  approveList?: string[];
  exportList?: string[];
}) {
  const perms: AuthUser['permissions'] = {};
  for (const m of allModules) {
    perms[m] = {
      view: config.viewAll || (config.viewList?.includes(m) ?? false),
      create: config.createList?.includes(m) ?? false,
      edit: config.editList?.includes(m) ?? false,
      delete: config.deleteList?.includes(m) ?? false,
      assign: config.assignList?.includes(m) ?? false,
      approve: config.approveList?.includes(m) ?? false,
      export: config.exportList?.includes(m) ?? false,
    };
  }
  return perms;
}

export const FALLBACK_USERS: Array<AuthUser & { passwordHash?: string; rawPassword?: string }> = [
  {
    id: 'user_admin',
    name: 'Rajesh Sharma (Director)',
    email: 'admin@gurudevmotors.com',
    rawPassword: 'Admin@123',
    phone: '+919300670006',
    roleId: 'role_admin',
    roleName: 'Main Admin',
    roleCode: 'MAIN_ADMIN',
    departmentId: 'dept_admin',
    departmentName: 'Executive Management',
    permissions: buildPermissions({
      viewAll: true,
      createList: allModules,
      editList: allModules,
      deleteList: allModules,
      assignList: allModules,
      approveList: allModules,
      exportList: allModules,
    }),
  },
  {
    id: 'user_sales_mgr',
    name: 'Vikram Sharma (Sales Head)',
    email: 'sales.manager@gurudevmotors.com',
    rawPassword: 'Sales@123',
    phone: '+919826100001',
    roleId: 'role_sales_mgr',
    roleName: 'Sales Manager',
    roleCode: 'SALES_MANAGER',
    departmentId: 'dept_sales',
    departmentName: 'Sales & Enquiry',
    permissions: buildPermissions({
      viewList: ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard', 'reports', 'service', 'accounts'],
      createList: ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard', 'reports'],
      editList: ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard', 'reports'],
      deleteList: ['leads', 'bookings'],
      assignList: ['leads', 'test_drives'],
      approveList: ['sales', 'bookings'],
      exportList: ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard', 'reports'],
    }),
  },
  {
    id: 'user_sales_rahul',
    name: 'Rahul Verma',
    email: 'rahul.sales@gurudevmotors.com',
    rawPassword: 'Sales@123',
    phone: '+919826100002',
    roleId: 'role_sales_exec',
    roleName: 'Sales Executive',
    roleCode: 'SALES_EXECUTIVE',
    departmentId: 'dept_sales',
    departmentName: 'Sales & Enquiry',
    permissions: buildPermissions({
      viewList: ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard'],
      createList: ['leads', 'customers', 'bookings', 'test_drives'],
      editList: ['leads', 'customers', 'test_drives'],
    }),
  },
  {
    id: 'user_sales_priya',
    name: 'Priya Sahu',
    email: 'priya.sales@gurudevmotors.com',
    rawPassword: 'Sales@123',
    phone: '+919826100003',
    roleId: 'role_sales_exec',
    roleName: 'Sales Executive',
    roleCode: 'SALES_EXECUTIVE',
    departmentId: 'dept_sales',
    departmentName: 'Sales & Enquiry',
    permissions: buildPermissions({
      viewList: ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard'],
      createList: ['leads', 'customers', 'bookings', 'test_drives'],
      editList: ['leads', 'customers', 'test_drives'],
    }),
  },
  {
    id: 'user_accounts',
    name: 'Amit Gupta (Accounts Manager)',
    email: 'accounts@gurudevmotors.com',
    rawPassword: 'Accounts@123',
    phone: '+919826100004',
    roleId: 'role_accounts',
    roleName: 'Accounts User',
    roleCode: 'ACCOUNTS',
    departmentId: 'dept_accounts',
    departmentName: 'Accounts & Finance',
    permissions: buildPermissions({
      viewList: ['accounts', 'dashboard', 'reports', 'customers', 'sales', 'service'],
      createList: ['accounts', 'dashboard', 'reports'],
      editList: ['accounts', 'dashboard', 'reports'],
      deleteList: ['accounts'],
      approveList: ['accounts'],
      exportList: ['accounts', 'sales'],
    }),
  },
  {
    id: 'user_service_mgr',
    name: 'Sunil Dewangan (Workshop Head)',
    email: 'service.manager@gurudevmotors.com',
    rawPassword: 'Service@123',
    phone: '+919826100005',
    roleId: 'role_service_mgr',
    roleName: 'Service Manager',
    roleCode: 'SERVICE_MANAGER',
    departmentId: 'dept_service',
    departmentName: 'Workshop & Service',
    permissions: buildPermissions({
      viewList: ['service', 'dashboard', 'reports', 'customers', 'vehicles', 'accounts'],
      createList: ['service', 'customers'],
      editList: ['service'],
      deleteList: ['service'],
      assignList: ['service'],
      approveList: ['service'],
      exportList: ['service'],
    }),
  },
  {
    id: 'user_service_manoj',
    name: 'Manoj Kumar (Service Advisor)',
    email: 'manoj.service@gurudevmotors.com',
    rawPassword: 'Service@123',
    phone: '+919826100006',
    roleId: 'role_service_exec',
    roleName: 'Service Executive',
    roleCode: 'SERVICE_EXECUTIVE',
    departmentId: 'dept_service',
    departmentName: 'Workshop & Service',
    permissions: buildPermissions({
      viewList: ['service', 'dashboard', 'customers', 'vehicles'],
      createList: ['service', 'customers'],
      editList: ['service'],
    }),
  },
  {
    id: 'user_service_rakesh',
    name: 'Rakesh Patel (Service Advisor)',
    email: 'rakesh.service@gurudevmotors.com',
    rawPassword: 'Service@123',
    phone: '+919826100007',
    roleId: 'role_service_exec',
    roleName: 'Service Executive',
    roleCode: 'SERVICE_EXECUTIVE',
    departmentId: 'dept_service',
    departmentName: 'Workshop & Service',
    permissions: buildPermissions({
      viewList: ['service', 'dashboard', 'customers', 'vehicles'],
      createList: ['service', 'customers'],
      editList: ['service'],
    }),
  },
  {
    id: 'user_service_amit',
    name: 'Amit Kumar (Service Advisor)',
    email: 'amit.service@gurudevmotors.com',
    rawPassword: 'Service@123',
    phone: '+919826100008',
    roleId: 'role_service_exec',
    roleName: 'Service Executive',
    roleCode: 'SERVICE_EXECUTIVE',
    departmentId: 'dept_service',
    departmentName: 'Workshop & Service',
    permissions: buildPermissions({
      viewList: ['service', 'dashboard', 'customers', 'vehicles'],
      createList: ['service', 'customers'],
      editList: ['service'],
    }),
  },
  {
    id: 'user_service_vikas',
    name: 'Vikas Nishad (Floor Supervisor)',
    email: 'vikas.service@gurudevmotors.com',
    rawPassword: 'Service@123',
    phone: '+919826100009',
    roleId: 'role_service_exec',
    roleName: 'Service Executive',
    roleCode: 'SERVICE_EXECUTIVE',
    departmentId: 'dept_service',
    departmentName: 'Workshop & Service',
    permissions: buildPermissions({
      viewList: ['service', 'dashboard', 'customers', 'vehicles'],
      createList: ['service', 'customers'],
      editList: ['service'],
    }),
  },
];

export const FALLBACK_DASHBOARD = {
  kpis: {
    todaysLeads: 8,
    pendingFollowups: 5,
    vehiclesInStock: 24,
    todaysSales: 215000,
    todaysCollections: 185000,
    activeServiceJobs: 12,
    outstandingPayments: 45000,
  },
  pipeline: {
    NEW: 14,
    CONTACTED: 8,
    INTERESTED: 11,
    TEST_DRIVE: 6,
    NEGOTIATION: 4,
    BOOKED: 5,
    DELIVERED: 22,
    LOST: 3,
  },
  vehicleCategories: [
    { category: 'NEW', count: 14 },
    { category: 'PRE_OWNED', count: 6 },
    { category: 'ELECTRIC', count: 4 },
  ],
  recentLeads: [
    {
      id: 'lead_1',
      leadNumber: 'GM-LD-1001',
      customerName: 'Suresh Patel',
      mobile: '+91 98271 22334',
      vehicleModel: 'Hero Splendor Plus XTEC',
      source: 'WEBSITE',
      status: 'NEW',
      priority: 'HIGH',
      assignedTo: { name: 'Rahul Verma' },
      createdAt: new Date().toISOString(),
    },
    {
      id: 'lead_2',
      leadNumber: 'GM-LD-1002',
      customerName: 'Anil Agrawal',
      mobile: '+91 94252 55667',
      vehicleModel: 'Hero HF Deluxe',
      source: 'WALK_IN',
      status: 'INTERESTED',
      priority: 'MEDIUM',
      assignedTo: { name: 'Priya Sahu' },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'lead_3',
      leadNumber: 'GM-LD-1003',
      customerName: 'Ravi Dewangan',
      mobile: '+91 98263 77889',
      vehicleModel: 'Kinetic Green Zing',
      source: 'WHATSAPP',
      status: 'TEST_DRIVE',
      priority: 'HIGH',
      assignedTo: { name: 'Rahul Verma' },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ],
  recentBookings: [
    {
      id: 'bk_1',
      bookingNumber: 'GM-BK-2026-001',
      bookingAmount: 5000,
      paymentMode: 'UPI',
      status: 'CONFIRMED',
      customer: { name: 'Mahesh Verma', mobile: '+91 98261 44556' },
      vehicle: { brand: 'Hero', model: 'Splendor Plus XTEC' },
      salesperson: { name: 'Rahul Verma' },
      createdAt: new Date().toISOString(),
    },
  ],
  recentSales: [
    {
      id: 'sale_1',
      invoiceNumber: 'GM-INV-2026-001',
      totalAmount: 89500,
      paymentStatus: 'COMPLETED',
      customer: { name: 'Kavita Sahu', mobile: '+91 98270 33445' },
      vehicle: { brand: 'Hero', model: 'Glamour XTEC' },
      salesperson: { name: 'Priya Sahu' },
      createdAt: new Date().toISOString(),
    },
  ],
  pendingInvoices: [
    {
      id: 'inv_1',
      invoiceNumber: 'GM-INV-2026-002',
      totalAmount: 94000,
      status: 'PARTIAL',
      customer: { name: 'Deepak Nishad', mobile: '+91 94255 66778' },
      createdAt: new Date().toISOString(),
    },
  ],
  recentServiceJobs: [
    {
      id: 'job_1',
      jobCardNumber: 'GM-JC-2026-001',
      vehicleModel: 'Hero Splendor Plus',
      vehicleRegNumber: 'CG 04 MH 2341',
      status: 'WORK_IN_PROGRESS',
      finalTotal: 1850,
      customer: { name: 'Vikash Netam', mobile: '+91 98265 11223' },
      createdAt: new Date().toISOString(),
    },
  ],
};

export const FALLBACK_DEPARTMENTS = [
  { id: 'dept_admin', name: 'Executive Management', code: 'ADMIN', description: 'Dealership directors and general administration', _count: { users: 1 } },
  { id: 'dept_sales', name: 'Sales & Enquiry', code: 'SALES', description: 'Vehicle sales, enquiries, test drives and exchange', _count: { users: 3 } },
  { id: 'dept_accounts', name: 'Accounts & Finance', code: 'ACCOUNTS', description: 'Invoices, payments, expenses, GST and finance tie-ups', _count: { users: 1 } },
  { id: 'dept_service', name: 'Workshop & Service', code: 'SERVICE', description: 'Technicians, service advisors, repairs and spare parts', _count: { users: 5 } },
];

export const FALLBACK_ROLES = [
  {
    id: 'role_admin',
    name: 'Main Admin',
    code: 'MAIN_ADMIN',
    description: 'Full access to all dealership modules, users and configurations',
    isSystem: true,
    _count: { users: 1 },
    permissions: allModules.map((m) => ({ module: m, view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true })),
  },
  {
    id: 'role_sales_mgr',
    name: 'Sales Manager',
    code: 'SALES_MANAGER',
    description: 'Manages sales team, leads pipeline, pricing approvals and reports',
    isSystem: true,
    _count: { users: 1 },
    permissions: allModules.map((m) => {
      const isSales = ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard', 'reports'].includes(m);
      return {
        module: m,
        view: isSales || m === 'service' || m === 'accounts',
        create: isSales,
        edit: isSales,
        delete: m === 'leads' || m === 'bookings',
        assign: m === 'leads' || m === 'test_drives',
        approve: m === 'sales' || m === 'bookings',
        export: isSales,
      };
    }),
  },
  {
    id: 'role_sales_exec',
    name: 'Sales Executive',
    code: 'SALES_EXECUTIVE',
    description: 'Handles customer walk-ins, test drives, leads and quotation generation',
    isSystem: true,
    _count: { users: 2 },
    permissions: allModules.map((m) => {
      const isSales = ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard'].includes(m);
      return {
        module: m,
        view: isSales,
        create: ['leads', 'customers', 'bookings', 'test_drives'].includes(m),
        edit: ['leads', 'customers', 'test_drives'].includes(m),
        delete: false,
        assign: false,
        approve: false,
        export: false,
      };
    }),
  },
  {
    id: 'role_accounts',
    name: 'Accounts User',
    code: 'ACCOUNTS',
    description: 'Handles billing, collections, vendor payments and financial reports',
    isSystem: true,
    _count: { users: 1 },
    permissions: allModules.map((m) => {
      const isAcct = ['accounts', 'dashboard', 'reports'].includes(m);
      return {
        module: m,
        view: isAcct || ['customers', 'sales', 'service'].includes(m),
        create: isAcct,
        edit: isAcct,
        delete: m === 'accounts',
        assign: false,
        approve: m === 'accounts',
        export: isAcct || m === 'sales',
      };
    }),
  },
  {
    id: 'role_service_mgr',
    name: 'Service Manager',
    code: 'SERVICE_MANAGER',
    description: 'Manages workshop floor, job cards, parts inventory and service quality',
    isSystem: true,
    _count: { users: 1 },
    permissions: allModules.map((m) => {
      const isSvc = ['service', 'dashboard', 'reports'].includes(m);
      return {
        module: m,
        view: isSvc || ['customers', 'vehicles', 'accounts'].includes(m),
        create: isSvc || m === 'customers',
        edit: isSvc,
        delete: m === 'service',
        assign: m === 'service',
        approve: m === 'service',
        export: isSvc,
      };
    }),
  },
  {
    id: 'role_service_exec',
    name: 'Service Executive',
    code: 'SERVICE_EXECUTIVE',
    description: 'Service advisor who creates job cards, registers complaints and updates status',
    isSystem: true,
    _count: { users: 4 },
    permissions: allModules.map((m) => {
      const isSvc = ['service', 'dashboard'].includes(m);
      return {
        module: m,
        view: isSvc || ['customers', 'vehicles'].includes(m),
        create: m === 'service' || m === 'customers',
        edit: m === 'service',
        delete: false,
        assign: false,
        approve: false,
        export: false,
      };
    }),
  },
];


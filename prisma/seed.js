const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Gurudev Motors database...');

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.servicePart.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.serviceJobCard.deleteMany({});
  await prisma.serviceBooking.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.testDrive.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.vehicleImage.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.websiteContent.deleteMany({});
  await prisma.gallery.deleteMany({});
  await prisma.offer.deleteMany({});

  // 2. Create Departments
  const deptAdmin = await prisma.department.create({
    data: { name: 'Executive Management', code: 'ADMIN', description: 'Dealership directors and general administration' },
  });
  const deptSales = await prisma.department.create({
    data: { name: 'Sales & Enquiry', code: 'SALES', description: 'Vehicle sales, enquiries, test drives and exchange' },
  });
  const deptAccounts = await prisma.department.create({
    data: { name: 'Accounts & Finance', code: 'ACCOUNTS', description: 'Invoices, payments, expenses, GST and finance tie-ups' },
  });
  const deptService = await prisma.department.create({
    data: { name: 'Workshop & Service', code: 'SERVICE', description: 'Technicians, service advisors, repairs and spare parts' },
  });

  // 3. Create Roles
  const roleAdmin = await prisma.role.create({
    data: { name: 'Main Admin', code: 'MAIN_ADMIN', description: 'Full access to all dealership modules, users and configurations', isSystem: true },
  });
  const roleSalesMgr = await prisma.role.create({
    data: { name: 'Sales Manager', code: 'SALES_MANAGER', description: 'Manages sales team, leads pipeline, pricing approvals and reports', isSystem: true },
  });
  const roleSalesExec = await prisma.role.create({
    data: { name: 'Sales Executive', code: 'SALES_EXECUTIVE', description: 'Handles customer walk-ins, test drives, leads and quotation generation', isSystem: true },
  });
  const roleAccounts = await prisma.role.create({
    data: { name: 'Accounts User', code: 'ACCOUNTS', description: 'Handles billing, collections, vendor payments and financial reports', isSystem: true },
  });
  const roleServiceMgr = await prisma.role.create({
    data: { name: 'Service Manager', code: 'SERVICE_MANAGER', description: 'Manages workshop floor, job cards, parts inventory and service quality', isSystem: true },
  });
  const roleServiceExec = await prisma.role.create({
    data: { name: 'Service Executive', code: 'SERVICE_EXECUTIVE', description: 'Service advisor who creates job cards, registers complaints and updates status', isSystem: true },
  });

  // 4. Create Granular Permissions
  const modules = [
    'dashboard', 'leads', 'customers', 'vehicles', 'sales', 'bookings',
    'test_drives', 'service', 'accounts', 'reports', 'employees', 'roles',
    'content', 'settings', 'audit_logs'
  ];

  // Main Admin gets ALL permissions
  for (const mod of modules) {
    await prisma.permission.create({
      data: {
        roleId: roleAdmin.id,
        module: mod,
        view: true, create: true, edit: true, delete: true, assign: true, approve: true, export: true
      }
    });
  }

  // Sales Manager
  for (const mod of modules) {
    const isSales = ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard', 'reports'].includes(mod);
    await prisma.permission.create({
      data: {
        roleId: roleSalesMgr.id,
        module: mod,
        view: isSales || mod === 'service' || mod === 'accounts',
        create: isSales,
        edit: isSales,
        delete: mod === 'leads' || mod === 'bookings',
        assign: mod === 'leads' || mod === 'test_drives',
        approve: mod === 'sales' || mod === 'bookings',
        export: isSales
      }
    });
  }

  // Sales Executive
  for (const mod of modules) {
    const isSales = ['leads', 'customers', 'vehicles', 'sales', 'bookings', 'test_drives', 'dashboard'].includes(mod);
    await prisma.permission.create({
      data: {
        roleId: roleSalesExec.id,
        module: mod,
        view: isSales,
        create: ['leads', 'customers', 'bookings', 'test_drives'].includes(mod),
        edit: ['leads', 'customers', 'test_drives'].includes(mod),
        delete: false,
        assign: false,
        approve: false,
        export: false
      }
    });
  }

  // Accounts User
  for (const mod of modules) {
    const isAcct = ['accounts', 'dashboard', 'reports'].includes(mod);
    await prisma.permission.create({
      data: {
        roleId: roleAccounts.id,
        module: mod,
        view: isAcct || ['customers', 'sales', 'service'].includes(mod),
        create: isAcct,
        edit: isAcct,
        delete: mod === 'accounts',
        assign: false,
        approve: mod === 'accounts',
        export: isAcct || mod === 'sales'
      }
    });
  }

  // Service Manager
  for (const mod of modules) {
    const isSvc = ['service', 'dashboard', 'reports'].includes(mod);
    await prisma.permission.create({
      data: {
        roleId: roleServiceMgr.id,
        module: mod,
        view: isSvc || ['customers', 'vehicles', 'accounts'].includes(mod),
        create: isSvc || mod === 'customers',
        edit: isSvc,
        delete: mod === 'service',
        assign: mod === 'service',
        approve: mod === 'service',
        export: isSvc
      }
    });
  }

  // Service Executive
  for (const mod of modules) {
    const isSvc = ['service', 'dashboard'].includes(mod);
    await prisma.permission.create({
      data: {
        roleId: roleServiceExec.id,
        module: mod,
        view: isSvc || ['customers', 'vehicles'].includes(mod),
        create: mod === 'service' || mod === 'customers',
        edit: mod === 'service',
        delete: false,
        assign: false,
        approve: false,
        export: false
      }
    });
  }

  // 5. Create Users (Password: Gurudev@2026 for all or specific)
  const passwordHashAdmin = await bcrypt.hash('Admin@123', 10);
  const passwordHashSales = await bcrypt.hash('Sales@123', 10);
  const passwordHashAccounts = await bcrypt.hash('Accounts@123', 10);
  const passwordHashService = await bcrypt.hash('Service@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma (Director)',
      email: 'admin@gurudevmotors.com',
      passwordHash: passwordHashAdmin,
      phone: '+919300670006',
      roleId: roleAdmin.id,
      departmentId: deptAdmin.id,
    },
  });

  const salesManager = await prisma.user.create({
    data: {
      name: 'Vikas Tiwari (Sales Head)',
      email: 'sales.manager@gurudevmotors.com',
      passwordHash: passwordHashSales,
      phone: '+919826100001',
      roleId: roleSalesMgr.id,
      departmentId: deptSales.id,
    },
  });

  const salesExec1 = await prisma.user.create({
    data: {
      name: 'Rahul Verma',
      email: 'rahul.sales@gurudevmotors.com',
      passwordHash: passwordHashSales,
      phone: '+919826100002',
      roleId: roleSalesExec.id,
      departmentId: deptSales.id,
    },
  });

  const salesExec2 = await prisma.user.create({
    data: {
      name: 'Priya Sahu',
      email: 'priya.sales@gurudevmotors.com',
      passwordHash: passwordHashSales,
      phone: '+919826100003',
      roleId: roleSalesExec.id,
      departmentId: deptSales.id,
    },
  });

  const accountsUser = await prisma.user.create({
    data: {
      name: 'Sunil Agrawal (Accounts)',
      email: 'accounts@gurudevmotors.com',
      passwordHash: passwordHashAccounts,
      phone: '+919826100004',
      roleId: roleAccounts.id,
      departmentId: deptAccounts.id,
    },
  });

  const serviceManager = await prisma.user.create({
    data: {
      name: 'Dinesh Dewangan (Workshop Head)',
      email: 'service.manager@gurudevmotors.com',
      passwordHash: passwordHashService,
      phone: '+919826100005',
      roleId: roleServiceMgr.id,
      departmentId: deptService.id,
    },
  });

  const serviceAdvisorManoj = await prisma.user.create({
    data: {
      name: 'Manoj Kumar (Service Advisor)',
      email: 'manoj.service@gurudevmotors.com',
      passwordHash: passwordHashService,
      phone: '+919826100006',
      roleId: roleServiceExec.id,
      departmentId: deptService.id,
    },
  });

  const serviceAdvisorRakesh = await prisma.user.create({
    data: {
      name: 'Rakesh Patel (Service Advisor)',
      email: 'rakesh.service@gurudevmotors.com',
      passwordHash: passwordHashService,
      phone: '+919826100007',
      roleId: roleServiceExec.id,
      departmentId: deptService.id,
    },
  });

  const serviceExec1 = await prisma.user.create({
    data: {
      name: 'Amit Kumar (Service Advisor)',
      email: 'amit.service@gurudevmotors.com',
      passwordHash: passwordHashService,
      phone: '+919826100008',
      roleId: roleServiceExec.id,
      departmentId: deptService.id,
    },
  });

  const serviceExec2 = await prisma.user.create({
    data: {
      name: 'Vikas Nishad (Floor Supervisor)',
      email: 'vikas.service@gurudevmotors.com',
      passwordHash: passwordHashService,
      phone: '+919826100009',
      roleId: roleServiceExec.id,
      departmentId: deptService.id,
    },
  });

  console.log('Created staff members across 4 departments.');

  // 6. Create Vehicles
  const vehiclesData = [
    {
      brand: 'Hero',
      model: 'Splendor Plus XTEC',
      variant: 'Self Start Drum Alloy',
      category: 'NEW',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 0,
      colour: 'Black with Silver Graphics',
      price: 79800,
      offerPrice: 77500,
      emi: 2200,
      description: "India's highest selling commuter motorcycle with legendary mileage, i3S technology, Bluetooth digital console, and unmatched durability.",
      features: 'i3S Technology, Digital Meter with Bluetooth, USB Mobile Charger, Tubeless Tyres, 60+ kmpl Mileage',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Honda',
      model: 'Activa 6G',
      variant: 'Deluxe Alloy',
      category: 'NEW',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Automatic',
      km: 0,
      colour: 'Pearl Siren Blue',
      price: 82500,
      offerPrice: 80900,
      emi: 2350,
      description: "Raipur's favorite unisex city scooter. Enhanced Smart Power (eSP) technology, silent start with ACG, external fuel filling and metal body durability.",
      features: 'eSP Engine, Silent Start ACG, Telescopic Suspension, External Fuel Lid, Combi Brake System (CBS)',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Suzuki',
      model: 'Access 125',
      variant: 'Special Edition Disc',
      category: 'NEW',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Automatic',
      km: 0,
      colour: 'Matte Blue with Beige Seat',
      price: 88900,
      offerPrice: 86500,
      emi: 2500,
      description: 'Sophisticated 125cc scooter with retro-modern chrome mirrors, Bluetooth digital cluster, easy start system and cavernous 21.8L underseat storage.',
      features: 'Bluetooth Navigation, Chrome Headlamp, Side Stand Interlock, Front Pocket with USB, 125cc SEP Engine',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Bajaj',
      model: 'Pulsar 150',
      variant: 'Twin Disc ABS',
      category: 'NEW',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 0,
      colour: 'Sparkle Black Red',
      price: 114500,
      offerPrice: 111900,
      emi: 3200,
      description: 'The definitive Indian sports commuter. DTS-i twin spark engine, wolf-eyed headlamp, clip-on handlebars and legendary exhaust note.',
      features: '150cc DTS-i Engine, Twin Disc ABS, Nitrox Rear Suspension, Tubeless Tyres, Backlit Switches',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Kinetic Green',
      model: 'E-Luna Prime',
      variant: 'Dual Battery High Speed',
      category: 'ELECTRIC',
      year: 2026,
      fuel: 'Electric',
      transmission: 'EV Direct',
      km: 0,
      colour: 'Ocean Blue',
      price: 76990,
      offerPrice: 74490,
      emi: 2100,
      description: 'The electric revolution of an Indian legend. 110 km range per charge, heavy 150 kg payload capacity, removable battery and steel chassis for rugged city hauling.',
      features: '110 km Certified Range, Portable Fast Charging, 150 kg Payload, Digital Meter, USB Port, Zero Fuel Cost',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Kinetic Green',
      model: 'Zulu',
      variant: 'Smart Disc Edition',
      category: 'ELECTRIC',
      year: 2026,
      fuel: 'Electric',
      transmission: 'EV Direct',
      km: 0,
      colour: 'Crimson Red Matte',
      price: 94990,
      offerPrice: 91990,
      emi: 2650,
      description: 'Ultra-modern high-speed electric scooter with instantaneous torque, CBS braking, anti-theft tracking, keyless entry and water-resistant IP67 motor.',
      features: '105 km Range, Fast Charge 0-80% in 30 mins, Smart App Connectivity, IP67 Waterproofing, Regenerative Braking',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/hero.jpeg',
    },
    {
      brand: 'Honda',
      model: 'SP 125',
      variant: 'Disc Smart Edition',
      category: 'NEW',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 0,
      colour: 'Imperial Red Metallic',
      price: 89500,
      offerPrice: 87900,
      emi: 2550,
      description: 'Style meets class-leading fuel efficiency. 5-speed transmission, real-time mileage indicator, full LED headlight and sporty tank shrouds.',
      features: '5 Speed Gearbox, Full Digital Console, LED Headlamp, Silent ACG Starter, Gear Position Indicator',
      stockStatus: 'IN_STOCK',
      featured: false,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Hero',
      model: 'Xtreme 160R 4V',
      variant: 'Pro Dual ABS',
      category: 'NEW',
      year: 2026,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 0,
      colour: 'Neon Shooting Star',
      price: 129000,
      offerPrice: 125500,
      emi: 3600,
      description: '0 to 60 km/h in 4.4 seconds. Inverted KYB forks, 4-valve oil-cooled engine, robotic streetfighter design and razor-sharp handling.',
      features: 'USD Forks, 4V Engine, Dual Channel ABS, Drag Race Timer, Hazard Lights',
      stockStatus: 'IN_STOCK',
      featured: false,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Hero',
      model: 'Glamour 125',
      variant: 'Drum Alloy (Certified Pre-Owned)',
      category: 'PRE_OWNED',
      year: 2022,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 14850,
      colour: 'Tornado Grey',
      price: 48500,
      offerPrice: 46000,
      emi: 1550,
      description: 'Single owner, pristine showroom condition, certified 40-point vehicle inspection with 6 months Gurudev Motors dealer warranty and clean RTO Raipur paperwork.',
      features: 'Single Owner, 40-Point Inspection Passed, 6-Month Engine Warranty, Valid Insurance, Spot RTO Transfer',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
    {
      brand: 'Honda',
      model: 'Activa 5G',
      variant: 'Deluxe (Certified Pre-Owned)',
      category: 'PRE_OWNED',
      year: 2021,
      fuel: 'Petrol',
      transmission: 'Automatic',
      km: 21300,
      colour: 'Matte Axis Grey',
      price: 43500,
      offerPrice: 41500,
      emi: 1400,
      description: 'Regularly serviced at authorized workshop. Complete service record available, brand new CEAT tyres, tested battery and smooth engine vibration-free.',
      features: 'New CEAT Tyres, Fresh Engine Oil Service, Tested Exide Battery, Clean Raipur Registration CG-04',
      stockStatus: 'IN_STOCK',
      featured: false,
      published: true,
      imageUrl: '/images/scooters-1.jpeg',
    },
    {
      brand: 'Bajaj',
      model: 'Pulsar 125 Carbon Edition',
      variant: 'Split Seat (Certified Pre-Owned)',
      category: 'PRE_OWNED',
      year: 2023,
      fuel: 'Petrol',
      transmission: 'Manual',
      km: 9200,
      colour: 'Solar Red Carbon',
      price: 64000,
      offerPrice: 61500,
      emi: 1900,
      description: 'Almost like-new commuter sports bike with zero scratches. Showroom maintained with 1 year free service vouchers at Gurudev Motors workshop.',
      features: 'Only 9,200 KM Run, First Owner Doctor Driven, Free 1 Year Gurudev Service Vouchers, Zero Dep Insurance',
      stockStatus: 'IN_STOCK',
      featured: true,
      published: true,
      imageUrl: '/images/bikes-1.jpeg',
    },
  ];

  const createdVehicles = [];
  for (const vData of vehiclesData) {
    const v = await prisma.vehicle.create({ data: vData });
    createdVehicles.push(v);
  }
  console.log(`Created ${createdVehicles.length} vehicles across New, Pre-Owned, and Electric.`);

  // 7. Create Customers
  const customersData = [
    {
      customerNo: 'CUST-2026-001',
      name: 'Anand Dewangan',
      mobile: '9827101122',
      email: 'anand.dewangan@gmail.com',
      address: 'Near Kali Mandir, Raipura',
      city: 'Raipur',
      notes: 'Interested in Hero Splendor Plus or exchange with old Passion Pro.',
    },
    {
      customerNo: 'CUST-2026-002',
      name: 'Sunita Kashyap',
      mobile: '9752103344',
      email: 'sunita.kashyap@yahoo.com',
      address: 'Santoshi Nagar, Ring Road 1',
      city: 'Raipur',
      notes: 'Looking for electric scooter for daily hospital commute.',
    },
    {
      customerNo: 'CUST-2026-003',
      name: 'Maheshwari Sahu',
      mobile: '9926105566',
      email: 'maheshwari.sahu@outlook.com',
      address: 'Sunder Nagar, Behind AIIMS Road',
      city: 'Raipur',
      notes: 'Purchased Activa 6G; coming for 1st routine free service.',
    },
    {
      customerNo: 'CUST-2026-004',
      name: 'Devendra Chandrakar',
      mobile: '9425107788',
      email: 'devendra.c@gmail.com',
      address: 'Mahadev Ghat Road, Changorabhatha',
      city: 'Raipur',
      notes: 'Interested in Bajaj Pulsar 150 Twin Disc on bank finance.',
    },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }

  // 8. Create Leads
  await prisma.lead.create({
    data: {
      leadNumber: 'LD-2026-101',
      customerName: 'Anand Dewangan',
      mobile: '9827101122',
      email: 'anand.dewangan@gmail.com',
      vehicleModel: 'Hero Splendor Plus XTEC',
      budget: 'Rs 80,000',
      source: 'WEBSITE',
      status: 'INTERESTED',
      priority: 'HIGH',
      followUpDate: new Date(Date.now() + 24 * 3600 * 1000),
      notes: 'Customer asked for exchange quote on his 2017 Passion Pro.',
      assignedToId: salesExec1.id,
      customerId: createdCustomers[0].id,
    },
  });

  await prisma.lead.create({
    data: {
      leadNumber: 'LD-2026-102',
      customerName: 'Sunita Kashyap',
      mobile: '9752103344',
      email: 'sunita.kashyap@yahoo.com',
      vehicleModel: 'Kinetic Green E-Luna Prime',
      budget: 'Rs 75,000',
      source: 'WHATSAPP',
      status: 'TEST_DRIVE',
      priority: 'URGENT',
      followUpDate: new Date(Date.now() + 48 * 3600 * 1000),
      notes: 'Requested doorstep test drive near Santoshi Nagar.',
      assignedToId: salesExec2.id,
      customerId: createdCustomers[1].id,
    },
  });

  await prisma.lead.create({
    data: {
      leadNumber: 'LD-2026-103',
      customerName: 'Devendra Chandrakar',
      mobile: '9425107788',
      email: 'devendra.c@gmail.com',
      vehicleModel: 'Bajaj Pulsar 150',
      budget: 'Rs 1,15,000',
      source: 'WALK_IN',
      status: 'NEGOTIATION',
      priority: 'HIGH',
      followUpDate: new Date(Date.now() + 12 * 3600 * 1000),
      notes: 'Submitted Aadhaar and PAN for HDFC bank two-wheeler loan.',
      assignedToId: salesExec1.id,
      customerId: createdCustomers[3].id,
    },
  });

  await prisma.lead.create({
    data: {
      leadNumber: 'LD-2026-104',
      customerName: 'Kishore Sonwani',
      mobile: '9827199887',
      vehicleModel: 'Honda Activa 6G',
      budget: 'Rs 85,000',
      source: 'WEBSITE',
      status: 'NEW',
      priority: 'MEDIUM',
      followUpDate: new Date(Date.now() + 6 * 3600 * 1000),
      notes: 'Enquired via website modal for on-road price Raipur.',
      assignedToId: salesExec2.id,
    },
  });

  // 9. Create Test Drives
  await prisma.testDrive.create({
    data: {
      customerName: 'Sunita Kashyap',
      mobile: '9752103344',
      email: 'sunita.kashyap@yahoo.com',
      vehicleId: createdVehicles[4].id, // E-Luna Prime
      preferredDate: new Date(Date.now() + 24 * 3600 * 1000),
      preferredTime: '11:30 AM',
      status: 'CONFIRMED',
      notes: 'Doorstep demo confirmed at Santoshi Nagar.',
      assignedToId: salesExec2.id,
      customerId: createdCustomers[1].id,
    },
  });

  // 10. Create Bookings & Sales
  const sampleBooking = await prisma.booking.create({
    data: {
      bookingNumber: 'BK-2026-088',
      customerId: createdCustomers[2].id,
      vehicleId: createdVehicles[1].id, // Activa 6G
      bookingAmount: 5000,
      paymentMode: 'UPI',
      status: 'CONVERTED_TO_SALE',
      notes: 'Full payment cleared via Bank finance + Cash.',
      salespersonId: salesExec1.id,
    },
  });

  const sampleSale = await prisma.sale.create({
    data: {
      invoiceNumber: 'INV-2026-0042',
      customerId: createdCustomers[2].id,
      vehicleId: createdVehicles[1].id,
      vehiclePrice: 82500,
      discount: 1600,
      exchangeValue: 0,
      financeAmount: 60000,
      bookingAmount: 5000,
      balanceAmount: 0,
      totalAmount: 80900,
      paymentStatus: 'COMPLETED',
      salespersonId: salesExec1.id,
      deliveryDate: new Date(),
      notes: 'Delivered with helmet, floor mat, and 5-year insurance package.',
    },
  });

  // 11. Create Invoices and Payments
  const saleInvoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0042',
      customerId: createdCustomers[2].id,
      saleId: sampleSale.id,
      type: 'VEHICLE_SALE',
      subtotal: 68559,
      taxAmount: 12341, // 18% GST
      totalAmount: 80900,
      gstin: '22AAAAA0000A1Z5',
      status: 'PAID',
      notes: 'New vehicle tax invoice with standard 5-year TP + 1-year OD.',
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-0101',
      invoiceId: saleInvoice.id,
      customerId: createdCustomers[2].id,
      amount: 5000,
      paymentMethod: 'UPI',
      transactionRef: 'UPI/20260924/88921',
      recordedById: accountsUser.id,
      notes: 'Advance booking amount.',
    },
  });

  await prisma.payment.create({
    data: {
      paymentNumber: 'PAY-2026-0102',
      invoiceId: saleInvoice.id,
      customerId: createdCustomers[2].id,
      amount: 75900,
      paymentMethod: 'BANK',
      transactionRef: 'NEFT/HDFC/9928172',
      recordedById: accountsUser.id,
      notes: 'Finance disbursement from HDFC Bank Ltd.',
    },
  });

  // 12. Create Service Job Cards
  const jobCard1 = await prisma.serviceJobCard.create({
    data: {
      jobCardNumber: 'JC-2026-0312',
      customerId: createdCustomers[2].id,
      vehicleId: createdVehicles[1].id,
      vehicleRegNumber: 'CG 04 NZ 4492',
      vehicleModel: 'Honda Activa 6G',
      kmReading: 1250,
      complaints: 'First free service due. Minor squeak from rear brake drum, check tyre pressure and wash.',
      inspectionNotes: 'All electricals working. Engine oil changed, brake shoes cleaned and adjusted.',
      estimateAmount: 450,
      partsTotal: 380,
      labourTotal: 0, // Free service labour
      discount: 0,
      tax: 68,
      finalTotal: 448,
      status: 'READY',
      advisorId: serviceExec1.id,
      technicianName: 'Suresh Kumar',
      deliveryDate: new Date(Date.now() + 2 * 3600 * 1000),
    },
  });

  await prisma.servicePart.create({
    data: {
      jobCardId: jobCard1.id,
      partName: 'Engine Oil 10W-30 (800ml Genuine)',
      partNumber: 'HO-ENG-10W30',
      quantity: 1,
      unitPrice: 380,
      totalPrice: 380,
    },
  });

  const jobCard2 = await prisma.serviceJobCard.create({
    data: {
      jobCardNumber: 'JC-2026-0313',
      customerId: createdCustomers[0].id,
      vehicleRegNumber: 'CG 04 MB 7819',
      vehicleModel: 'Hero Passion Pro',
      kmReading: 34200,
      complaints: 'Chain loose, front fork oil seal leak, carburetor tuning, general periodic service.',
      inspectionNotes: 'Front suspension dismantled. Chain sprocket set needs replacement.',
      estimateAmount: 2600,
      partsTotal: 1750,
      labourTotal: 650,
      discount: 100,
      tax: 414,
      finalTotal: 2714,
      status: 'WORK_IN_PROGRESS',
      advisorId: serviceExec2.id,
      technicianName: 'Ramesh Patel',
      deliveryDate: new Date(Date.now() + 24 * 3600 * 1000),
    },
  });

  await prisma.servicePart.create({
    data: {
      jobCardId: jobCard2.id,
      partName: 'Drive Chain & Sprocket Kit',
      partNumber: 'HE-CS-0992',
      quantity: 1,
      unitPrice: 1250,
      totalPrice: 1250,
    },
  });
  await prisma.servicePart.create({
    data: {
      jobCardId: jobCard2.id,
      partName: 'Fork Oil & Seal Pair',
      partNumber: 'HE-FS-0112',
      quantity: 1,
      unitPrice: 500,
      totalPrice: 500,
    },
  });

  // 13. Create Expenses
  await prisma.expense.create({
    data: {
      expenseNumber: 'EXP-2026-0044',
      category: 'WORKSHOP',
      description: 'Monthly workshop bulk lubricant drum supply from Gulf Oil',
      amount: 18500,
      paymentMethod: 'BANK',
      vendorName: 'Gulf Oil Lubricants Chhattisgarh Depot',
      recordedById: accountsUser.id,
      expenseDate: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  });

  await prisma.expense.create({
    data: {
      expenseNumber: 'EXP-2026-0045',
      category: 'UTILITIES',
      description: 'Electricity bill for Raipura Showroom & Workshop (CSPDCL)',
      amount: 7850,
      paymentMethod: 'UPI',
      vendorName: 'CSPDCL Raipur',
      recordedById: accountsUser.id,
      expenseDate: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
  });

  // 14. Create Notifications
  await prisma.notification.create({
    data: {
      title: 'New Online Lead Received',
      message: 'Kishore Sonwani submitted enquiry for Honda Activa 6G via website.',
      type: 'LEAD',
      userId: salesManager.id,
      link: '/admin/leads',
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Vehicle Ready For Delivery',
      message: 'Service Job #JC-2026-0312 for Honda Activa 6G is completed and ready for pickup.',
      type: 'SERVICE',
      userId: serviceManager.id,
      link: '/admin/service-jobs',
    },
  });

  await prisma.notification.create({
    data: {
      title: 'Follow-up Due Today',
      message: 'Follow-up with Anand Dewangan regarding Hero Splendor exchange valuation.',
      type: 'LEAD',
      userId: salesExec1.id,
      link: '/admin/leads',
    },
  });

  // 15. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userName: 'Rajesh Sharma',
      userEmail: 'admin@gurudevmotors.com',
      action: 'LOGIN',
      module: 'USERS',
      recordId: adminUser.id,
      newValue: 'Admin signed in successfully',
      ipAddress: '127.0.0.1',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: salesExec1.id,
      userName: 'Rahul Verma',
      userEmail: 'rahul.sales@gurudevmotors.com',
      action: 'UPDATE',
      module: 'LEADS',
      recordId: 'LD-2026-101',
      oldValue: 'Status: NEW',
      newValue: 'Status: INTERESTED (Exchange requested)',
      ipAddress: '192.168.1.15',
    },
  });

  // 16. Create Website CMS Content
  await prisma.websiteContent.create({
    data: {
      sectionKey: 'hero',
      title: 'RIDE YOUR DREAM.',
      subtitle: "Raipur's multi-brand mobility destination",
      content: 'New motorcycles, scooters, electric mobility and carefully selected pre-owned vehicles — with finance, exchange and workshop support in Raipur.',
      metadata: JSON.stringify({
        primaryCtaText: 'Explore Vehicles',
        primaryCtaLink: '/vehicles',
        secondaryCtaText: 'Visit Showroom',
        secondaryCtaLink: '/contact',
      }),
    },
  });

  await prisma.websiteContent.create({
    data: {
      sectionKey: 'about',
      title: 'Built around the ride.',
      subtitle: '01 / Who we are',
      content: 'Gurudev Motors brings multiple motorcycle and scooter choices together with pre-owned buying, selling and exchange support in Raipur, Chhattisgarh.',
      metadata: JSON.stringify({
        brandsCount: '05+ Major Brands',
        modelsCount: '30+ Listed Models',
        options: 'NEW + USED Vehicles',
        ev: 'EV Electric Mobility',
      }),
    },
  });

  await prisma.websiteContent.create({
    data: {
      sectionKey: 'showroom',
      title: 'Gurudev Motors Showroom',
      subtitle: 'Mahadev Ghat Chowk',
      content: 'Mahadev Ghat Chowk, Raipura, Raipur, Chhattisgarh 492013.',
      metadata: JSON.stringify({
        phone: '+91 93006 70006',
        whatsapp: '919300670006',
        timings: 'Monday to Sunday: 9:30 AM - 8:30 PM',
      }),
    },
  });

  await prisma.websiteContent.create({
    data: {
      sectionKey: 'serviceCenter',
      title: 'New Service Centre & Lounge',
      subtitle: 'Workshop Support',
      content: 'In front of New Raipura Hospital & Shri Ganesh Mandir lane, Raipura, Raipur, Chhattisgarh.',
      metadata: JSON.stringify({
        facilities: ['Dedicated Customer Lounge', 'Doorstep Service', 'Genuine Parts', 'Computerized Tuning'],
        timings: 'Monday to Saturday: 9:00 AM - 7:00 PM',
      }),
    },
  });

  // 17. Create Gallery Items
  const galleryItems = [
    { title: 'Gurudev Motors Main Showroom', category: 'SHOWROOM', imageUrl: '/images/showroom-1.jpeg', description: 'Multi-brand showroom at Mahadev Ghat Chowk, Raipur' },
    { title: 'Motorcycles Display Section', category: 'VEHICLES', imageUrl: '/images/bikes-1.jpeg', description: 'Hero, Honda, Bajaj 100cc to 200cc motorcycles line-up' },
    { title: 'Scooters & Electric Pavilion', category: 'VEHICLES', imageUrl: '/images/scooters-1.jpeg', description: 'Activa, Access and Kinetic Green electric scooters' },
    { title: 'Customer Consultation Desk', category: 'SHOWROOM', imageUrl: '/images/desk.jpeg', description: 'Comfortable documentation and loan assistance counter' },
    { title: 'Modern Two-Wheeler Workshop', category: 'WORKSHOP', imageUrl: '/images/workshop.jpeg', description: 'Skilled technicians, pneumatic lifts, and genuine spare parts' },
  ];
  for (let i = 0; i < galleryItems.length; i++) {
    await prisma.gallery.create({ data: { ...galleryItems[i], order: i + 1 } });
  }

  // 18. Create Special Offers
  await prisma.offer.create({
    data: {
      title: 'Festive Mobility Dhamaka',
      badge: 'LIMITED TIME',
      discountText: 'Save up to ₹5,500 + Free Helmet',
      description: 'Zero down payment schemes and exchange bonus on your old two-wheeler across Hero & Honda models.',
      validTill: new Date(Date.now() + 30 * 24 * 3600 * 1000),
      terms: 'Subject to bank approval. Offer valid on select models till stocks last at Raipur showroom.',
      active: true,
    },
  });

  await prisma.offer.create({
    data: {
      title: 'Kinetic Green EV Switch Bonus',
      badge: 'GO GREEN',
      discountText: '₹3,000 Direct Subsidy + 3 Free Services',
      description: 'Switch to zero fuel bills with E-Luna or Zulu. Low EMI starting from just ₹2,100 per month.',
      validTill: new Date(Date.now() + 45 * 24 * 3600 * 1000),
      terms: 'Valid on on-road purchases at Gurudev Motors Raipura showroom.',
      active: true,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

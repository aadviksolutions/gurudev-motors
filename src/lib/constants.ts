export const BRAND_NAME = "Gurudev Motors";
export const BRAND_TAGLINE = "Ride Your Dream";
export const BRAND_SUBTITLE = "Raipur's multi-brand mobility destination";

export const CONTACT_INFO = {
  phone: "+91 93006 70006",
  phoneRaw: "+919300670006",
  whatsapp: "919300670006",
  email: "contact@gurudevmotors.com",
  showroomAddress: "Mahadev Ghat Chowk, Raipura, Raipur, Chhattisgarh 492013",
  serviceCenterAddress: "In front of New Raipura Hospital & Shri Ganesh Mandir lane, Raipura, Raipur, Chhattisgarh 492013",
  timings: "Mon - Sun: 9:30 AM - 8:30 PM",
  serviceTimings: "Mon - Sat: 9:00 AM - 7:00 PM (Sunday Closed)",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Gurudev+Motors+Mahadev+Ghat+Tiraha+Chowk+Raipur",
};

export const VEHICLE_BRANDS = [
  "Hero",
  "Honda",
  "Suzuki",
  "Bajaj",
  "Kinetic Green",
  "TVS",
  "Yamaha",
];

export const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "leads", label: "Leads (CRM)" },
  { key: "customers", label: "Customers" },
  { key: "vehicles", label: "Vehicles" },
  { key: "sales", label: "Sales & Quotes" },
  { key: "bookings", label: "Bookings & Test Drives" },
  { key: "service", label: "Workshop & Job Cards" },
  { key: "accounts", label: "Accounts & Invoices" },
  { key: "reports", label: "Business Reports" },
  { key: "employees", label: "Staff & Employees" },
  { key: "roles", label: "Roles & Permissions" },
  { key: "content", label: "Website CMS" },
  { key: "gallery", label: "Gallery Management" },
  { key: "offers", label: "Offers & Promos" },
  { key: "audit_logs", label: "Audit Logs" },
  { key: "settings", label: "Settings" },
] as const;

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
  "assign",
  "approve",
  "export",
] as const;

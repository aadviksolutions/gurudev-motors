export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case "NEW":
    case "REQUESTED":
    case "BOOKED":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "CONTACTED":
    case "RECEIVED":
    case "INSPECTION":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "INTERESTED":
    case "CONFIRMED":
    case "APPROVED":
    case "WORK_IN_PROGRESS":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "TEST_DRIVE":
    case "QUALITY_CHECK":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "READY":
    case "COMPLETED":
    case "DELIVERED":
    case "PAID":
    case "IN_STOCK":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "LOST":
    case "CANCELLED":
    case "UNPAID":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function formatTime(time: string | Date): string {
  // Handle ISO datetime strings or Date objects
  if (typeof time === 'string' && (time.includes('T') || time.includes('Z')) || time instanceof Date) {
    const date = new Date(time)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const formattedHour = hours % 12 || 12
    return `${formattedHour}:${String(minutes).padStart(2, "0")} ${ampm}`
  }
  
  // Handle time string format "HH:MM:SS" or "HH:MM"
  const [hours, minutes] = (time as string).split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12
  return `${formattedHour}:${minutes} ${ampm}`
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function calculateWorkHours(checkIn: string, checkOut: string): number {
  const [inHours, inMinutes] = checkIn.split(":").map(Number)
  const [outHours, outMinutes] = checkOut.split(":").map(Number)

  const inTime = inHours * 60 + inMinutes
  const outTime = outHours * 60 + outMinutes

  return Math.round(((outTime - inTime) / 60) * 100) / 100
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    inactive: "bg-gray-100 text-gray-800",
    suspended: "bg-red-100 text-red-800",
    present: "bg-emerald-100 text-emerald-800",
    absent: "bg-red-100 text-red-800",
    late: "bg-amber-100 text-amber-800",
    half_day: "bg-orange-100 text-orange-800",
    on_leave: "bg-blue-100 text-blue-800",
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-gray-100 text-gray-800",
    paid: "bg-emerald-100 text-emerald-800",
    hold: "bg-amber-100 text-amber-800",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

export function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-800",
    hr: "bg-blue-100 text-blue-800",
    employee: "bg-gray-100 text-gray-800",
  }
  return colors[role] || "bg-gray-100 text-gray-800"
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-blue-100 text-blue-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  }
  return colors[priority] || "bg-gray-100 text-gray-800"
}

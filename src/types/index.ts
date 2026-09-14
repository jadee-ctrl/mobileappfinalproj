export type Role = "customer" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  address?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string; // e.g. "per kg", "per load"
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "picked_up"
  | "washing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface ProgressEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceUnit: string;
  estimatedWeightKg: number;
  instructions?: string;
  pickupDate: string; // ISO date
  pickupSlot: string; // e.g. "9:00 AM - 11:00 AM"
  deliverySlot: string;
  status: OrderStatus;
  staffId?: string;
  staffName?: string;
  paymentMethod: "COD";
  paymentStatus: "unpaid" | "paid";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  progress: ProgressEvent[];
}

export type NotificationType =
  | "order_update"
  | "assignment"
  | "system"
  | "payment";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

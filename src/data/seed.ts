import { Order, Service, User } from "../types";

export const SERVICES: Service[] = [
  {
    id: "svc-wash-fold",
    name: "Wash & Fold",
    description: "Everyday laundry washed, dried, and neatly folded.",
    price: 60,
    unit: "per kg",
  },
  {
    id: "svc-dry-clean",
    name: "Dry Cleaning",
    description: "Gentle cleaning for delicate and formal garments.",
    price: 150,
    unit: "per item",
  },
  {
    id: "svc-iron",
    name: "Iron & Press",
    description: "Crisp, wrinkle-free pressing for your clothes.",
    price: 40,
    unit: "per kg",
  },
  {
    id: "svc-express",
    name: "Express Wash",
    description: "Same-day turnaround for urgent laundry needs.",
    price: 90,
    unit: "per kg",
  },
];

export const PICKUP_SLOTS = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
];

export const DELIVERY_SLOTS = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

export const SEED_USERS: User[] = [];

export const SEED_ORDERS: Order[] = [];
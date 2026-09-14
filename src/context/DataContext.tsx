import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AppNotification, Order, OrderStatus, Service, User } from "../types";
import { SEED_ORDERS, SERVICES } from "../data/seed";
import { genId, loadJSON, saveJSON } from "../utils/storage";
import { ORDER_STEPS, statusColors } from "../constants/theme";

interface NewOrderInput {
  customer: User;
  serviceId: string;
  estimatedWeightKg: number;
  instructions?: string;
  address: string;
  pickupDate: string;
  pickupSlot: string;
  deliverySlot: string;
}

interface DataContextValue {
  orders: Order[];
  services: Service[];
  notifications: AppNotification[];
  loading: boolean;
  createOrder: (input: NewOrderInput) => Promise<Order>;
  advanceStatus: (orderId: string, staff: User) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  claimOrder: (orderId: string, staff: User) => Promise<void>;
  markPaid: (orderId: string) => Promise<void>;
  notificationsFor: (userId: string) => AppNotification[];
  unreadCountFor: (userId: string) => number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: (userId: string) => Promise<void>;
  ordersForCustomer: (customerId: string) => Order[];
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const ORDERS_KEY = "orders";
const NOTIFS_KEY = "notifications";

function nextStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STEPS.indexOf(current);
  if (idx === -1 || idx === ORDER_STEPS.length - 1) return null;
  return ORDER_STEPS[idx + 1] as OrderStatus;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loadedOrders = await loadJSON<Order[]>(ORDERS_KEY, SEED_ORDERS);
      const loadedNotifs = await loadJSON<AppNotification[]>(NOTIFS_KEY, []);
      setOrders(loadedOrders);
      setNotifications(loadedNotifs);
      setLoading(false);
    })();
  }, []);

  const persistOrders = useCallback(async (next: Order[]) => {
    setOrders(next);
    await saveJSON(ORDERS_KEY, next);
  }, []);

  const persistNotifs = useCallback(async (next: AppNotification[]) => {
    setNotifications(next);
    await saveJSON(NOTIFS_KEY, next);
  }, []);

  const pushNotification = useCallback(
    async (
      current: AppNotification[],
      notif: Omit<AppNotification, "id" | "createdAt" | "read">
    ) => {
      const full: AppNotification = {
        ...notif,
        id: genId("notif"),
        read: false,
        createdAt: new Date().toISOString(),
      };
      const next = [full, ...current];
      await persistNotifs(next);
      return next;
    },
    [persistNotifs]
  );

  const createOrder = useCallback<DataContextValue["createOrder"]>(
    async (input) => {
      const service = SERVICES.find((s) => s.id === input.serviceId)!;
      const total =
        service.unit === "per item"
          ? service.price * Math.max(1, Math.round(input.estimatedWeightKg))
          : service.price * input.estimatedWeightKg;
      const order: Order = {
        id: genId("ORD").toUpperCase(),
        customerId: input.customer.id,
        customerName: input.customer.name,
        customerPhone: input.customer.phone,
        address: input.address,
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        serviceUnit: service.unit,
        estimatedWeightKg: input.estimatedWeightKg,
        instructions: input.instructions,
        pickupDate: input.pickupDate,
        pickupSlot: input.pickupSlot,
        deliverySlot: input.deliverySlot,
        status: "pending",
        paymentMethod: "COD",
        paymentStatus: "unpaid",
        totalAmount: Math.round(total),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progress: [{ status: "pending", timestamp: new Date().toISOString() }],
      };
      const next = [order, ...orders];
      await persistOrders(next);
      await pushNotification(notifications, {
        userId: input.customer.id,
        title: "Booking confirmed",
        message: `Your ${service.name} order ${order.id} has been booked. We'll notify you once it's confirmed.`,
        type: "order_update",
        orderId: order.id,
      });
      return order;
    },
    [orders, notifications, persistOrders, pushNotification]
  );

  const updateOrder = useCallback(
    async (
      orderId: string,
      mutate: (o: Order) => Order,
      notify?: (o: Order) => Omit<AppNotification, "id" | "createdAt" | "read">
    ) => {
      let updatedOrder: Order | null = null;
      const next = orders.map((o) => {
        if (o.id !== orderId) return o;
        updatedOrder = mutate(o);
        return updatedOrder;
      });
      await persistOrders(next);
      if (updatedOrder && notify) {
        await pushNotification(notifications, notify(updatedOrder));
      }
    },
    [orders, notifications, persistOrders, pushNotification]
  );

  const claimOrder = useCallback<DataContextValue["claimOrder"]>(
    async (orderId, staff) => {
      await updateOrder(
        orderId,
        (o) => ({
          ...o,
          staffId: staff.id,
          staffName: staff.name,
          status: o.status === "pending" ? "confirmed" : o.status,
          updatedAt: new Date().toISOString(),
          progress:
            o.status === "pending"
              ? [
                  ...o.progress,
                  { status: "confirmed", timestamp: new Date().toISOString() },
                ]
              : o.progress,
        }),
        (o) => ({
          userId: o.customerId,
          title: "Staff assigned",
          message: `${staff.name} has been assigned to your order ${o.id} and confirmed it.`,
          type: "assignment",
          orderId: o.id,
        })
      );
    },
    [updateOrder]
  );

  const advanceStatus = useCallback<DataContextValue["advanceStatus"]>(
    async (orderId, staff) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;
      const next = nextStatus(order.status);
      if (!next) return;
      await updateOrder(
        orderId,
        (o) => ({
          ...o,
          status: next,
          staffId: o.staffId ?? staff.id,
          staffName: o.staffName ?? staff.name,
          updatedAt: new Date().toISOString(),
          progress: [
            ...o.progress,
            { status: next, timestamp: new Date().toISOString() },
          ],
        }),
        (o) => ({
          userId: o.customerId,
          title: `Order ${statusColors[next]?.label ?? next}`,
          message: `Your order ${o.id} is now ${
            statusColors[next]?.label?.toLowerCase() ?? next
          }.`,
          type: "order_update",
          orderId: o.id,
        })
      );
    },
    [orders, updateOrder]
  );

  const cancelOrder = useCallback<DataContextValue["cancelOrder"]>(
    async (orderId) => {
      await updateOrder(
        orderId,
        (o) => ({
          ...o,
          status: "cancelled",
          updatedAt: new Date().toISOString(),
          progress: [
            ...o.progress,
            { status: "cancelled", timestamp: new Date().toISOString() },
          ],
        }),
        (o) => ({
          userId: o.customerId,
          title: "Order cancelled",
          message: `Order ${o.id} has been cancelled.`,
          type: "order_update",
          orderId: o.id,
        })
      );
    },
    [updateOrder]
  );

  const markPaid = useCallback<DataContextValue["markPaid"]>(
    async (orderId) => {
      await updateOrder(orderId, (o) => ({
        ...o,
        paymentStatus: "paid",
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateOrder]
  );

  const notificationsFor = useCallback(
    (userId: string) =>
      notifications
        .filter((n) => n.userId === userId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications]
  );

  const unreadCountFor = useCallback(
    (userId: string) =>
      notifications.filter((n) => n.userId === userId && !n.read).length,
    [notifications]
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      const next = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      await persistNotifs(next);
    },
    [notifications, persistNotifs]
  );

  const markAllNotificationsRead = useCallback(
    async (userId: string) => {
      const next = notifications.map((n) =>
        n.userId === userId ? { ...n, read: true } : n
      );
      await persistNotifs(next);
    },
    [notifications, persistNotifs]
  );

  const ordersForCustomer = useCallback(
    (customerId: string) =>
      orders
        .filter((o) => o.customerId === customerId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders]
  );

  return (
    <DataContext.Provider
      value={{
        orders,
        services: SERVICES,
        notifications,
        loading,
        createOrder,
        advanceStatus,
        cancelOrder,
        claimOrder,
        markPaid,
        notificationsFor,
        unreadCountFor,
        markNotificationRead,
        markAllNotificationsRead,
        ordersForCustomer,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export { nextStatus };

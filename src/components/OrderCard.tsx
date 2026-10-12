
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Order } from "../types";
import {
  colors,
  fontSize,
  radius,
  shadow,
  spacing,
  statusColors,
} from "../constants/theme";
import { StatusBadge } from "./Basics";
import { formatDate } from "../utils/format";

export function OrderCard({
  order,
  onPress,
  showCustomer,
}: {
  order: Order;
  onPress: () => void;
  showCustomer?: boolean;
}) {
  const displayStatus =
    order.status === "delivered" ? "Completed" : undefined;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Text style={styles.orderId}>{order.id}</Text>

        {displayStatus ? (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: colors.successLight,
              },
            ]}
          >
            <Text
              style={[
                styles.statusBadgeText,
                { color: colors.success },
              ]}
            >
              Completed
            </Text>
          </View>
        ) : (
          <StatusBadge status={order.status} />
        )}
      </View>

      <Text style={styles.serviceName}>{order.serviceName}</Text>

      {showCustomer ? (
        <Text style={styles.meta}>{order.customerName}</Text>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.metaLabel}>Pickup</Text>
          <Text style={styles.metaValue}>
            {formatDate(order.pickupDate)}
          </Text>
        </View>

        <View>
          <Text style={styles.metaLabel}>Amount</Text>
          <Text style={styles.metaValue}>₱{order.totalAmount}</Text>
        </View>

        <View>
          <Text style={styles.metaLabel}>Payment</Text>
          <Text
            style={[
              styles.metaValue,
              {
                color:
                  order.paymentStatus === "paid"
                    ? colors.success
                    : colors.warning,
              },
            ]}
          >
            {order.paymentStatus === "paid"
              ? "Paid"
              : "COD - Unpaid"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  orderId: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: fontSize.xs,
    color: colors.textFaint,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.text,
  },
});

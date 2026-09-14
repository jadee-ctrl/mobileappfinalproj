import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../../../context/DataContext";
import { ScreenContainer, Card, StatusBadge, SectionHeader, Divider } from "../../../components/Basics";
import { ProgressTimeline } from "../../../components/ProgressTimeline";
import { Button } from "../../../components/Button";
import { colors, fontSize, spacing } from "../../../constants/theme";
import { formatDate } from "../../../utils/format";

export default function CustomerOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, cancelOrder } = useData();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <ScreenContainer>
        <Text>Order not found.</Text>
      </ScreenContainer>
    );
  }

  const canCancel = order.status === "pending" || order.status === "confirmed";

  const handleCancel = () => {
    Alert.alert("Cancel order", `Cancel order ${order.id}? This can't be undone.`, [
      { text: "Keep order", style: "cancel" },
      {
        text: "Cancel order",
        style: "destructive",
        onPress: async () => {
          await cancelOrder(order.id);
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: order.id,
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.background },
          headerLeft: () => (
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.text}
              onPress={() => router.back()}
            />
          ),
        }}
      />
      <ScreenContainer edges={["left", "right"]}>
        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.serviceName}>{order.serviceName}</Text>
              <Text style={styles.meta}>Order {order.id}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>

          <Divider />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pickup date</Text>
            <Text style={styles.infoValue}>{formatDate(order.pickupDate)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pickup time</Text>
            <Text style={styles.infoValue}>{order.pickupSlot}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery time</Text>
            <Text style={styles.infoValue}>{order.deliverySlot}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={[styles.infoValue, { flex: 1, textAlign: "right" }]}>
              {order.address}
            </Text>
          </View>
          {order.instructions ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Instructions</Text>
              <Text style={[styles.infoValue, { flex: 1, textAlign: "right" }]}>
                {order.instructions}
              </Text>
            </View>
          ) : null}
          {order.staffName ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned staff</Text>
              <Text style={styles.infoValue}>{order.staffName}</Text>
            </View>
          ) : null}
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated load</Text>
            <Text style={styles.infoValue}>
              {order.estimatedWeightKg} {order.serviceUnit === "per item" ? "item(s)" : "kg"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rate</Text>
            <Text style={styles.infoValue}>
              ₱{order.servicePrice} {order.serviceUnit}
            </Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Total (COD)</Text>
            <Text style={styles.totalValue}>₱{order.totalAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment status</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    order.paymentStatus === "paid"
                      ? colors.success
                      : colors.warning,
                  fontWeight: "700",
                },
              ]}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid (pay on delivery)"}
            </Text>
          </View>
        </Card>

        <SectionHeader title="Order progress" />
        <Card style={{ marginBottom: spacing.lg }}>
          <ProgressTimeline order={order} />
        </Card>

        {canCancel && (
          <Button
            label="Cancel order"
            variant="outline"
            onPress={handleCancel}
          />
        )}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceName: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text,
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.primary,
  },
});

import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../context/AuthContext";
import { useData, nextStatus } from "../../../context/DataContext";
import { ScreenContainer, Card, StatusBadge, SectionHeader, Divider } from "../../../components/Basics";
import { ProgressTimeline } from "../../../components/ProgressTimeline";
import { Button } from "../../../components/Button";
import { colors, fontSize, spacing, statusColors } from "../../../constants/theme";
import { formatDate } from "../../../utils/format";

export default function StaffOrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { orders, advanceStatus, claimOrder, markPaid, cancelOrder } = useData();
  const order = orders.find((o) => o.id === id);

  if (!order || !user) {
    return (
      <ScreenContainer>
        <Text>Order not found.</Text>
      </ScreenContainer>
    );
  }

  const upcoming = nextStatus(order.status);
  const isFinished = order.status === "delivered" || order.status === "cancelled";
  const isMine = order.staffId === user.id;

  const handleAdvance = () => {
    if (!upcoming) return;
    Alert.alert(
      "Update status",
      `Mark order ${order.id} as "${statusColors[upcoming]?.label ?? upcoming}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            await advanceStatus(order.id, user);
          },
        },
      ]
    );
  };

  const handleClaim = () => {
    Alert.alert("Accept order", `Assign this order to yourself?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: async () => {
          await claimOrder(order.id, user);
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
              <Text style={styles.meta}>{order.customerName}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>

          <Divider />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer phone</Text>
            <Text style={styles.infoValue}>{order.customerPhone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pickup</Text>
            <Text style={styles.infoValue}>
              {formatDate(order.pickupDate)} · {order.pickupSlot}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery window</Text>
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
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned staff</Text>
            <Text style={styles.infoValue}>{order.staffName ?? "Unassigned"}</Text>
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.lg }}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Load</Text>
            <Text style={styles.infoValue}>
              {order.estimatedWeightKg} {order.serviceUnit === "per item" ? "item(s)" : "kg"}
            </Text>
          </View>
          <Divider />
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Total (COD)</Text>
            <Text style={styles.totalValue}>₱{order.totalAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text
              style={[
                styles.infoValue,
                {
                  color:
                    order.paymentStatus === "paid" ? colors.success : colors.warning,
                  fontWeight: "700",
                },
              ]}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Unpaid"}
            </Text>
          </View>
          {order.status === "delivered" && order.paymentStatus === "unpaid" && (
            <Button
              label="Mark cash received"
              variant="secondary"
              onPress={() => markPaid(order.id)}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </Card>

        <SectionHeader title="Order progress" />
        <Card style={{ marginBottom: spacing.lg }}>
          <ProgressTimeline order={order} />
        </Card>

        {!order.staffId && !isFinished && (
          <Button label="Accept this order" onPress={handleClaim} />
        )}

        {order.staffId && isMine && !isFinished && upcoming && (
          <Button
            label={`Mark as ${statusColors[upcoming]?.label ?? upcoming}`}
            onPress={handleAdvance}
          />
        )}

        {order.staffId && !isMine && !isFinished && (
          <Text style={styles.notMineText}>
            This order is assigned to {order.staffName}.
          </Text>
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
  notMineText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});

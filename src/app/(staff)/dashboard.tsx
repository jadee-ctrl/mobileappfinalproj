import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { ScreenContainer, Card, SectionHeader, EmptyState } from "../../components/Basics";
import { OrderCard } from "../../components/OrderCard";
import { Button } from "../../components/Button";
import { colors, fontSize, radius, shadow, spacing } from "../../constants/theme";

export default function StaffDashboard() {
  const { user } = useAuth();
  const { orders, claimOrder } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const unassigned = useMemo(
    () => orders.filter((o) => !o.staffId && o.status === "pending"),
    [orders]
  );

  const myActive = useMemo(
    () =>
      user
        ? orders.filter(
            (o) =>
              o.staffId === user.id &&
              o.status !== "delivered" &&
              o.status !== "cancelled"
          )
        : [],
    [orders, user?.id]
  );

  const completedToday = useMemo(() => {
    if (!user) return 0;

    const todayStr = new Date().toDateString();

    return orders.filter(
      (o) =>
        o.staffId === user.id &&
        o.status === "delivered" &&
        new Date(o.updatedAt).toDateString() === todayStr
    ).length;
  }, [orders, user?.id]);

  if (!user) return null;

  const handleClaim = (orderId: string) => {
    Alert.alert("Accept order", `Assign order ${orderId} to yourself?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: async () => {
          await claimOrder(orderId, user);
        },
      },
    ]);
  };

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
      }}
    >
      <Text style={styles.greeting}>Hi, {user.name.split(" ")[0]} 👋</Text>
      <Text style={styles.subGreeting}>Here's what's happening today.</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{unassigned.length}</Text>
          <Text style={styles.statLabel}>Unassigned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myActive.length}</Text>
          <Text style={styles.statLabel}>My active jobs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedToday}</Text>
          <Text style={styles.statLabel}>Done today</Text>
        </View>
      </View>

      <SectionHeader
        title="Unassigned orders"
        subtitle="Accept an order to start working on it"
      />
      {unassigned.length === 0 ? (
        <Card style={{ marginBottom: spacing.xl }}>
          <EmptyState
            title="Nothing waiting"
            subtitle="All incoming orders have been assigned."
          />
        </Card>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          {unassigned.map((order) => (
            <Card key={order.id} style={{ marginBottom: spacing.md }}>
              <View style={styles.claimRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.claimId}>{order.id}</Text>
                  <Text style={styles.claimService}>{order.serviceName}</Text>
                  <Text style={styles.claimMeta}>
                    {order.customerName} · {order.pickupSlot}
                  </Text>
                </View>
                <Button
                  label="Accept"
                  onPress={() => handleClaim(order.id)}
                  fullWidth={false}
                  style={styles.acceptBtn}
                />
              </View>
            </Card>
          ))}
        </View>
      )}

      <SectionHeader title="My active jobs" />
      {myActive.length === 0 ? (
        <Card>
          <EmptyState
            title="No active jobs"
            subtitle="Accept an order above to get started."
          />
        </Card>
      ) : (
        myActive.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            showCustomer
            onPress={() =>
              router.push({
                pathname: "/(staff)/orders/order-dets",
                params: {
                  id: order.id,
                },
              })
            }
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
  },
  subGreeting: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    ...shadow.card,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: "800",
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
  claimRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  claimId: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.textMuted,
  },
  claimService: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    marginTop: 2,
  },
  claimMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  acceptBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
});

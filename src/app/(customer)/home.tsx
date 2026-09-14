import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { ScreenContainer, Card, SectionHeader, EmptyState } from "../../components/Basics";
import { OrderCard } from "../../components/OrderCard";
import { colors, fontSize, radius, shadow, spacing } from "../../constants/theme";

export default function CustomerHome() {
  const { user } = useAuth();
  const { ordersForCustomer, services, loading } = useData();
  const [refreshing, setRefreshing] = useState(false);

  if (!user) return null;
  const myOrders = ordersForCustomer(user.id);
  const activeOrders = myOrders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  );

  return (
    <ScreenContainer
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
      }}
    >
      <Text style={styles.greeting}>Hi, {user.name.split(" ")[0]} 👋</Text>
      <Text style={styles.subGreeting}>What laundry needs a wash today?</Text>

      <Pressable
        onPress={() => router.push("/(customer)/booking")}
        style={styles.ctaCard}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Book a pickup</Text>
          <Text style={styles.ctaSubtitle}>
            Schedule pickup & delivery in a few taps
          </Text>
        </View>
        <View style={styles.ctaArrow}>
          <Text style={styles.ctaArrowText}>›</Text>
        </View>
      </Pressable>

      <SectionHeader
        title="Active orders"
        subtitle={`${activeOrders.length} in progress`}
      />
      {activeOrders.length === 0 ? (
        <Card style={{ marginBottom: spacing.xl }}>
          <EmptyState
            title="No active orders"
            subtitle="Book a pickup to get your laundry rolling."
          />
        </Card>
      ) : (
        <View style={{ marginBottom: spacing.lg }}>
          {activeOrders.slice(0, 3).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                router.push({
                  pathname: "/orders/order-dets",
                  params: {
                    id: order.id,
                  },
                })
              }
            />
          ))}
        </View>
      )}

      <SectionHeader title="Our services" />
      <View style={styles.servicesGrid}>
        {services.map((s) => (
          <View key={s.id} style={styles.serviceCard}>
            <Text style={styles.serviceName}>{s.name}</Text>
            <Text style={styles.serviceDesc}>{s.description}</Text>
            <Text style={styles.servicePrice}>
              ₱{s.price} <Text style={styles.serviceUnit}>{s.unit}</Text>
            </Text>
          </View>
        ))}
      </View>
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
  ctaCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xl,
    ...shadow.card,
  },
  ctaTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: "#fff",
  },
  ctaSubtitle: {
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  ctaArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaArrowText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: -2,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  serviceCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow.card,
  },
  serviceName: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    minHeight: 30,
  },
  servicePrice: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.primary,
  },
  serviceUnit: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    color: colors.textMuted,
  },
});

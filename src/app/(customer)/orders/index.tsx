
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { useData } from "../../../context/DataContext";
import { ScreenContainer, EmptyState, Card } from "../../../components/Basics";
import { OrderCard } from "../../../components/OrderCard";
import { ChipGroup } from "../../../components/ChipGroup";
import { colors, fontSize, spacing } from "../../../constants/theme";

const FILTERS = ["All", "Active", "Completed", "Cancelled"];

export default function CustomerOrdersScreen() {
  const { user } = useAuth();
  const { ordersForCustomer } = useData();
  const [filter, setFilter] = useState("All");

  const orders = user ? ordersForCustomer(user.id) : [];

  const filtered = useMemo(() => {
    if (filter === "All") return orders;

    if (filter === "Completed") {
      return orders.filter((o) => o.status === "delivered");
    }

    if (filter === "Cancelled") {
      return orders.filter((o) => o.status === "cancelled");
    }

    return orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    );
  }, [orders, filter]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>My Orders</Text>

      <View style={{ marginBottom: spacing.lg }}>
        <ChipGroup
          label=""
          options={FILTERS}
          value={filter}
          onChange={setFilter}
        />
      </View>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No orders here"
            subtitle="Orders you place will show up in this list."
          />
        </Card>
      ) : (
        filtered.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() =>
              router.push({
                pathname: "/orders/order-dets",
                params: { id: order.id },
              })
            }
          />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.lg,
  },
});

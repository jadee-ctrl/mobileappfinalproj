import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useData } from "../../../context/DataContext";
import { ScreenContainer, EmptyState, Card } from "../../../components/Basics";
import { OrderCard } from "../../../components/OrderCard";
import { ChipGroup } from "../../../components/ChipGroup";
import { colors, fontSize, spacing } from "../../../constants/theme";

const FILTERS = ["All", "Unassigned", "In progress", "Delivered"];

export default function StaffOrdersScreen() {
  const { orders } = useData();
  const [filter, setFilter] = useState("All");

  const sorted = useMemo(
    () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders]
  );

  const filtered = useMemo(() => {
    if (filter === "Unassigned")
      return sorted.filter((o) => !o.staffId && o.status !== "cancelled");
    if (filter === "In progress")
      return sorted.filter(
        (o) => o.status !== "delivered" && o.status !== "cancelled"
      );
    if (filter === "Delivered")
      return sorted.filter((o) => o.status === "delivered");
    return sorted;
  }, [sorted, filter]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>All Orders</Text>

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
            title="No orders"
            subtitle="Nothing matches this filter yet."
          />
        </Card>
      ) : (
        filtered.map((order) => (
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.lg,
  },
});

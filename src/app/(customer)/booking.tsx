import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { ScreenContainer, Card, SectionHeader, Divider } from "../../components/Basics";
import { Input } from "../../components/Input";
import { ChipGroup } from "../../components/ChipGroup";
import { Button } from "../../components/Button";
import { DELIVERY_SLOTS, PICKUP_SLOTS } from "../../data/seed";
import { colors, fontSize, radius, spacing } from "../../constants/theme";

function nextNDays(n: number) {
  const days: { label: string; iso: string }[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      label: d.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" }),
      iso: d.toISOString(),
    });
  }
  return days;
}

export default function BookingScreen() {
  const { user } = useAuth();
  const { services, createOrder } = useData();
  const dateOptions = useMemo(() => nextNDays(6), []);

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [weight, setWeight] = useState("3");
  const [address, setAddress] = useState(user?.address ?? "");
  const [instructions, setInstructions] = useState("");
  const [dateIso, setDateIso] = useState(dateOptions[0]?.iso ?? "");
  const [pickupSlot, setPickupSlot] = useState<string | null>(null);
  const [deliverySlot, setDeliverySlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);
  const weightNum = parseFloat(weight) || 0;
  const estimatedTotal = selectedService
    ? selectedService.unit === "per item"
      ? Math.round(selectedService.price * Math.max(1, Math.round(weightNum)))
      : Math.round(selectedService.price * weightNum)
    : 0;

  const handleSubmit = async () => {
    if (!user) return;
    if (!address.trim()) {
      Alert.alert("Missing address", "Please enter a pickup address.");
      return;
    }
    if (!pickupSlot || !deliverySlot) {
      Alert.alert("Missing schedule", "Please choose a pickup and delivery time.");
      return;
    }
    if (weightNum <= 0) {
      Alert.alert("Invalid quantity", "Please enter a valid weight or item count.");
      return;
    }
    setSubmitting(true);
    const order = await createOrder({
      customer: user,
      serviceId,
      estimatedWeightKg: weightNum,
      instructions: instructions.trim() || undefined,
      address: address.trim(),
      pickupDate: dateIso,
      pickupSlot,
      deliverySlot,
    });
    setSubmitting(false);
    setInstructions("");
    setPickupSlot(null);
    setDeliverySlot(null);
    Alert.alert("Booking confirmed", `Order ${order.id} has been placed.`, [
      {
        text: "View order",
        onPress: () => router.push(`/(customer)/orders/${order.id}`),
      },
      { text: "OK", onPress: () => router.push("/(customer)/orders") },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Book a pickup</Text>
      <Text style={styles.subtitle}>
        Fill in the details and we'll schedule your laundry pickup.
      </Text>

      <SectionHeader title="1. Choose a service" />
      <View style={styles.serviceList}>
        {services.map((s) => {
          const selected = s.id === serviceId;
          return (
            <Pressable
              key={s.id}
              onPress={() => setServiceId(s.id)}
              style={[styles.serviceRow, selected && styles.serviceRowSelected]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceRowName}>{s.name}</Text>
                <Text style={styles.serviceRowDesc}>{s.description}</Text>
              </View>
              <Text style={styles.serviceRowPrice}>
                ₱{s.price}{"\n"}
                <Text style={styles.serviceRowUnit}>{s.unit}</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="2. Load details" />
      <Card style={{ marginBottom: spacing.xl }}>
        <Input
          label={
            selectedService?.unit === "per item"
              ? "Number of items"
              : "Estimated weight (kg)"
          }
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 3"
        />
        <View style={{ marginTop: -spacing.md }}>
          <Input
            label="Special instructions (optional)"
            value={instructions}
            onChangeText={setInstructions}
            placeholder="e.g. Use fabric softener, handle with care"
            multiline
            style={{ minHeight: 70, textAlignVertical: "top" }}
          />
        </View>
      </Card>

      <SectionHeader title="3. Pickup address" />
      <Card style={{ marginBottom: spacing.xl }}>
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="House no., street, barangay, city"
          multiline
        />
      </Card>

      <SectionHeader title="4. Schedule" />
      <Card style={{ marginBottom: spacing.xl }}>
        <ChipGroup
          label="Pickup date"
          options={dateOptions.map((d) => d.label)}
          value={dateOptions.find((d) => d.iso === dateIso)?.label ?? null}
          onChange={(label) => {
            const found = dateOptions.find((d) => d.label === label);
            if (found) setDateIso(found.iso);
          }}
        />
        <ChipGroup
          label="Pickup time"
          options={PICKUP_SLOTS}
          value={pickupSlot}
          onChange={setPickupSlot}
        />
        <View style={{ marginBottom: -spacing.lg }}>
          <ChipGroup
            label="Delivery time"
            options={DELIVERY_SLOTS}
            value={deliverySlot}
            onChange={setDeliverySlot}
          />
        </View>
      </Card>

      <SectionHeader title="Payment" />
      <Card style={{ marginBottom: spacing.xl }}>
        <View style={styles.paymentRow}>
          <View style={styles.codBadge}>
            <Text style={styles.codBadgeText}>COD</Text>
          </View>
          <Text style={styles.paymentText}>
            Cash on Delivery — pay when your laundry is delivered
          </Text>
        </View>
        <Divider />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Estimated total</Text>
          <Text style={styles.totalValue}>₱{estimatedTotal}</Text>
        </View>
      </Card>

      <Button
        label={submitting ? "Booking..." : "Confirm booking"}
        onPress={handleSubmit}
        loading={submitting}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: spacing.xl,
  },
  serviceList: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  serviceRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  serviceRowName: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  serviceRowDesc: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  serviceRowPrice: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "right",
  },
  serviceRowUnit: {
    fontSize: fontSize.xs,
    fontWeight: "500",
    color: colors.textMuted,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  codBadge: {
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: spacing.md,
  },
  codBadgeText: {
    color: colors.success,
    fontWeight: "800",
    fontSize: fontSize.xs,
  },
  paymentText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: fontSize.xl,
    color: colors.primary,
    fontWeight: "800",
  },
});

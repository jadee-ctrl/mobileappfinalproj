
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
      label: d.toLocaleDateString("en-PH", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      iso: d.toISOString(),
    });
  }

  return days;
}

type BookingMethod = "store" | "delivery";

export default function BookingScreen() {
  const { user } = useAuth();
  const { services, createOrder } = useData();

  const dateOptions = useMemo(() => nextNDays(6), []);

  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [weight, setWeight] = useState("3");
  const [address, setAddress] = useState(user?.address ?? "");
  const [instructions, setInstructions] = useState("");
  const [dateIso, setDateIso] = useState(dateOptions[0]?.iso ?? "");
  const [bookingMethod, setBookingMethod] = useState<BookingMethod>("store");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);
  const weightNum = parseFloat(weight) || 0;

  const estimatedTotal = selectedService
    ? selectedService.unit === "per item"
      ? Math.round(selectedService.price * Math.max(1, Math.round(weightNum)))
      : Math.round(selectedService.price * weightNum)
    : 0;

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Login required", "Please log in to book a laundry service.");
      return;
    }

    if (!selectedService) {
      Alert.alert("Missing service", "Please select a laundry service.");
      return;
    }

    if (bookingMethod === "delivery" && !address.trim()) {
      Alert.alert("Missing address", "Please enter your delivery address.");
      return;
    }

    if (!selectedSlot) {
      Alert.alert(
        "Missing schedule",
        `Please choose your ${
          bookingMethod === "store" ? "store pickup" : "delivery"
        } time.`
      );
      return;
    }

    if (weightNum <= 0) {
      Alert.alert(
        "Invalid quantity",
        "Please enter a valid weight or item count."
      );
      return;
    }

    setSubmitting(true);

    try {
      const order = await createOrder({
        customer: user,
        serviceId,
        estimatedWeightKg: weightNum,
        instructions: instructions.trim() || undefined,
        address:
          bookingMethod === "delivery" ? address.trim() : "Store pickup",
        pickupDate: dateIso,
        pickupSlot: bookingMethod === "store" ? selectedSlot : "",
        deliverySlot: bookingMethod === "delivery" ? selectedSlot : "",
      });

      setInstructions("");
      setSelectedSlot(null);

      Alert.alert(
        "Booking confirmed",
        `Order ${order.id} has been placed.`,
        [
          {
            text: "View order",
            onPress: () =>
              router.push(`/(customer)/orders/${order.id}`),
          },
          {
            text: "OK",
            onPress: () => router.push("/(customer)/orders"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Booking failed",
        "Unable to place your booking. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Book a Laundry Service</Text>
      <Text style={styles.subtitle}>
        Choose your laundry service and preferred collection method.
      </Text>

      <SectionHeader title="1. Choose a service" />

      <View style={styles.serviceList}>
        {services.map((s) => {
          const selected = s.id === serviceId;

          return (
            <Pressable
              key={s.id}
              onPress={() => setServiceId(s.id)}
              style={[
                styles.serviceRow,
                selected && styles.serviceRowSelected,
              ]}
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

      {bookingMethod === "delivery" && (
        <>
          <SectionHeader title="3. Delivery address" />

          <Card style={{ marginBottom: spacing.xl }}>
            <Input
              label="Delivery address"
              value={address}
              onChangeText={setAddress}
              placeholder="House no., street, barangay, city"
              multiline
            />
          </Card>
        </>
      )}

      <SectionHeader
        title={`${bookingMethod === "store" ? "3" : "4"}. Schedule`}
      />

      <Card style={{ marginBottom: spacing.xl }}>
        <Text style={styles.scheduleLabel}>
          How would you like to receive your laundry?
        </Text>

        <View style={styles.methodContainer}>
          <Pressable
            onPress={() => {
              if (bookingMethod !== "store") {
                setBookingMethod("store");
                setSelectedSlot(null);
              }
            }}
            style={[
              styles.methodOption,
              bookingMethod === "store" && styles.methodOptionSelected,
            ]}
          >
            <Text
              style={[
                styles.methodTitle,
                bookingMethod === "store" && styles.methodTitleSelected,
              ]}
            >
              Pickup at Store
            </Text>

            <Text style={styles.methodDescription}>
              Collect your laundry at the store.
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              if (bookingMethod !== "delivery") {
                setBookingMethod("delivery");
                setSelectedSlot(null);
              }
            }}
            style={[
              styles.methodOption,
              bookingMethod === "delivery" && styles.methodOptionSelected,
            ]}
          >
            <Text
              style={[
                styles.methodTitle,
                bookingMethod === "delivery" && styles.methodTitleSelected,
              ]}
            >
              Delivery
            </Text>

            <Text style={styles.methodDescription}>
              Have your laundry delivered.
            </Text>
          </Pressable>
        </View>

        <Divider />

        <ChipGroup
          label={
            bookingMethod === "store"
              ? "Preferred pickup date"
              : "Preferred delivery date"
          }
          options={dateOptions.map((d) => d.label)}
          value={
            dateOptions.find((d) => d.iso === dateIso)?.label ?? null
          }
          onChange={(label) => {
            const found = dateOptions.find((d) => d.label === label);

            if (found) {
              setDateIso(found.iso);
              setSelectedSlot(null);
            }
          }}
        />

        <View style={{ marginBottom: -spacing.lg }}>
          <ChipGroup
            label={
              bookingMethod === "store"
                ? "Preferred pickup time"
                : "Preferred delivery time"
            }
            options={
              bookingMethod === "store" ? PICKUP_SLOTS : DELIVERY_SLOTS
            }
            value={selectedSlot}
            onChange={setSelectedSlot}
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
            {bookingMethod === "store"
              ? "Cash payment — pay when you collect your laundry at the store."
              : "Cash on Delivery — pay when your laundry is delivered."}
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
  scheduleLabel: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  methodContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  methodOption: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  methodOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  methodTitleSelected: {
    color: colors.primary,
  },
  methodDescription: {
    fontSize: fontSize.xs,
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


import React from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  colors,
  fontSize,
  spacing,
  statusColors,
  ORDER_STEPS,
} from "../constants/theme";
import { Order } from "../types";
import { formatDateTime } from "../utils/format";

export function ProgressTimeline({ order }: { order: Order }) {
  const progress = order.progress ?? [];

  if (order.status === "cancelled") {
    const lastProgress = progress[progress.length - 1];

    return (
      <View>
        <Text style={styles.cancelledText}>
          {lastProgress
            ? `This order was cancelled on ${formatDateTime(
                lastProgress.timestamp
              )}.`
            : "This order has been cancelled."}
        </Text>
      </View>
    );
  }

  // Identify the customer's booking method using the existing order fields.
  const isStorePickup =
    order.address?.trim().toLowerCase() === "store pickup" ||
    (!order.deliverySlot && Boolean(order.pickupSlot));

  // Store pickup orders do not need the Out for Delivery step.
  const steps = ORDER_STEPS.filter(
    (step) => !(isStorePickup && step === "out_for_delivery")
  );

  const currentIndex = steps.indexOf(order.status);

  const eventByStatus = new Map<string, string>(
    progress.map((item) => [String(item.status), String(item.timestamp)])
  );

  const getStepLabel = (step: string): string => {
    if (step === "ready") {
      return isStorePickup
        ? "Ready to Pick Up at Store"
        : "Ready to Pick Up for Delivery";
    }

    if (step === "delivered") {
      return "Completed";
    }

    return statusColors[String(step)]?.label ?? String(step);
  };

  const getStepColor = (step: string): string => {
    const status = String(step);

    switch (status) {
      case "pending":
      case "confirmed":
      case "picked_up":
      case "washing":
        return "#2E9E5B"; // Green

      case "ready":
        return "#F59E0B"; // Orange

      case "out_for_delivery":
      case "delivered":
        return "#9CA3AF"; // Gray

      default:
        return colors.border;
    }
  };

  return (
    <View>
      {steps.map((step, idx) => {
        const done = currentIndex >= 0 && idx <= currentIndex;
        const isLast = idx === steps.length - 1;
        const timestamp = eventByStatus.get(String(step));

        const stepColor = getStepColor(step);

        return (
          <View key={step} style={styles.row}>
            <View style={styles.railCol}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done
                      ? stepColor
                      : colors.border,
                  },
                ]}
              />

              {!isLast && (
                <View
                  style={[
                    styles.line,
                    {
                      backgroundColor:
                        currentIndex >= 0 && idx < currentIndex
                          ? stepColor
                          : colors.border,
                    },
                  ]}
                />
              )}
            </View>

            <View style={styles.textCol}>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: done ? stepColor : colors.textFaint,
                  },
                ]}
              >
                {getStepLabel(step)}
              </Text>

              {timestamp ? (
                <Text style={styles.stepTime}>
                  {formatDateTime(timestamp)}
                </Text>
              ) : (
                <Text style={styles.stepTimePending}>
                  {done ? "Completed" : "Pending"}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  railCol: {
    width: 24,
    alignItems: "center",
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 28,
  },
  textCol: {
    flex: 1,
    paddingBottom: spacing.lg,
    paddingLeft: spacing.md,
  },
  stepLabel: {
    fontSize: fontSize.md,
    fontWeight: "700",
  },
  stepTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  stepTimePending: {
    fontSize: fontSize.xs,
    color: colors.textFaint,
    marginTop: 2,
  },
  cancelledText: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: "600",
  },
});

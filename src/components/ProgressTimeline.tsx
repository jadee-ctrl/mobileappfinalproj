import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, fontSize, spacing, statusColors, ORDER_STEPS } from "../constants/theme";
import { Order } from "../types";
import { formatDateTime } from "../utils/format";

export function ProgressTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return (
      <View>
        <Text style={styles.cancelledText}>
          This order was cancelled on{" "}
          {formatDateTime(order.progress[order.progress.length - 1].timestamp)}.
        </Text>
      </View>
    );
  }

  const currentIndex = ORDER_STEPS.indexOf(order.status);
  const eventByStatus = new Map(
    order.progress.map((p) => [p.status, p.timestamp])
  );

  return (
    <View>
      {ORDER_STEPS.map((step, idx) => {
        const done = idx <= currentIndex;
        const isLast = idx === ORDER_STEPS.length - 1;
        const timestamp = eventByStatus.get(step as any);
        const meta = statusColors[step];

        return (
          <View key={step} style={styles.row}>
            <View style={styles.railCol}>
              <View
                style={[
                  styles.dot,
                  done
                    ? { backgroundColor: colors.primary }
                    : { backgroundColor: colors.border },
                ]}
              />
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    idx < currentIndex
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: colors.border },
                  ]}
                />
              )}
            </View>
            <View style={styles.textCol}>
              <Text
                style={[
                  styles.stepLabel,
                  done ? { color: colors.text } : { color: colors.textFaint },
                ]}
              >
                {meta?.label ?? step}
              </Text>
              {timestamp ? (
                <Text style={styles.stepTime}>{formatDateTime(timestamp)}</Text>
              ) : (
                <Text style={styles.stepTimePending}>Pending</Text>
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

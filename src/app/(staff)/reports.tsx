import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useData } from "../../context/DataContext";
import { ScreenContainer, Card, SectionHeader, Divider } from "../../components/Basics";
import { colors, fontSize, radius, shadow, spacing, statusColors } from "../../constants/theme";
import { Service } from "../../types";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Bar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max === 0 ? 0 : Math.max(6, Math.round((count / max) * 100));
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.barValue}>{count}</Text>
    </View>
  );
}

export default function StaffReports() {
  const { orders, services } = useData();

  const stats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === "delivered");
    const cancelled = orders.filter((o) => o.status === "cancelled");
    const active = orders.filter(
      (o) => o.status !== "delivered" && o.status !== "cancelled"
    );
    const revenue = delivered
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingCash = delivered
      .filter((o) => o.paymentStatus === "unpaid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const byService: Record<string, number> = {};
    services.forEach((s) => (byService[s.id] = 0));
    orders.forEach((o) => {
      byService[o.serviceId] = (byService[o.serviceId] ?? 0) + 1;
    });

    const byStatus: Record<string, number> = {};
    orders.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    });

    return {
      total: orders.length,
      delivered: delivered.length,
      cancelled: cancelled.length,
      active: active.length,
      revenue,
      pendingCash,
      byService,
      byStatus,
    };
  }, [orders, services]);

  const maxServiceCount = Math.max(1, ...Object.values(stats.byService));
  const maxStatusCount = Math.max(1, ...Object.values(stats.byStatus));

  return (
    <ScreenContainer>
      <Text style={styles.title}>Reports</Text>
      <Text style={styles.subtitle}>Overview of shop performance</Text>

      <View style={styles.statsGrid}>
        <StatCard label="Total orders" value={String(stats.total)} />
        <StatCard label="Delivered" value={String(stats.delivered)} />
        <StatCard label="Active" value={String(stats.active)} />
        <StatCard label="Cancelled" value={String(stats.cancelled)} />
      </View>

      <SectionHeader title="Cash collected" />
      <Card style={{ marginBottom: spacing.xl }}>
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Collected (COD)</Text>
          <Text style={styles.revenueValue}>₱{stats.revenue}</Text>
        </View>
        <Divider />
        <View style={styles.revenueRow}>
          <Text style={styles.revenueLabel}>Pending collection</Text>
          <Text style={[styles.revenueValue, { color: colors.warning }]}>
            ₱{stats.pendingCash}
          </Text>
        </View>
      </Card>

      <SectionHeader title="Orders by service" />
      <Card style={{ marginBottom: spacing.xl }}>
        {services.map((s: Service) => (
          <Bar
            key={s.id}
            label={s.name}
            count={stats.byService[s.id] ?? 0}
            max={maxServiceCount}
          />
        ))}
      </Card>

      <SectionHeader title="Orders by status" />
      <Card>
        {Object.keys(statusColors).map((status) => (
          <Bar
            key={status}
            label={statusColors[status].label}
            count={stats.byStatus[status] ?? 0}
            max={maxStatusCount}
          />
        ))}
      </Card>
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    ...shadow.card,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  revenueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  revenueLabel: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: "600",
  },
  revenueValue: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.success,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  barLabel: {
    width: 110,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginHorizontal: spacing.sm,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
  },
  barValue: {
    width: 24,
    textAlign: "right",
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.text,
  },
});

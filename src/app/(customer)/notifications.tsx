import React, { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { ScreenContainer, Card, EmptyState } from "../../components/Basics";
import { colors, fontSize, radius, spacing } from "../../constants/theme";
import { timeAgo } from "../../utils/format";
import { AppNotification } from "../../types";

const ICON_BG: Record<string, string> = {
  order_update: colors.infoLight,
  assignment: colors.primaryLight,
  payment: colors.successLight,
  system: colors.border,
};

function NotificationRow({
  notif,
  onPress,
}: {
  notif: AppNotification;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !notif.read && styles.rowUnread,
        pressed && { opacity: 0.85 },
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: ICON_BG[notif.type] ?? colors.border },
        ]}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{notif.title}</Text>
        <Text style={styles.rowMessage}>{notif.message}</Text>
        <Text style={styles.rowTime}>{timeAgo(notif.createdAt)}</Text>
      </View>
      {!notif.read && <View style={styles.unreadDot} />}
    </Pressable>
  );
}

export default function CustomerNotifications() {
  const { user } = useAuth();
  const { notificationsFor, markNotificationRead, markAllNotificationsRead } =
    useData();

  const notifs = user ? notificationsFor(user.id) : [];

  useEffect(() => {
    if (user && notifs.some((n) => !n.read)) {
      const t = setTimeout(() => markAllNotificationsRead(user.id), 1200);
      return () => clearTimeout(t);
    }
  }, [user, notifs.length]);

  return (
    <ScreenContainer>
      <Text style={styles.title}>Notifications</Text>
      {notifs.length === 0 ? (
        <Card>
          <EmptyState
            title="You're all caught up"
            subtitle="Updates about your orders will appear here."
          />
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          {notifs.map((n, idx) => (
            <View key={n.id}>
              <NotificationRow
                notif={n}
                onPress={() => {
                  markNotificationRead(n.id);
                  if (n.orderId) router.push(`/(customer)/orders/${n.orderId}`);
                }}
              />
              {idx < notifs.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
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
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.lg,
  },
  rowUnread: {
    backgroundColor: colors.primaryLight,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: spacing.md,
  },
  rowTitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
  },
  rowMessage: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  rowTime: {
    fontSize: fontSize.xs,
    color: colors.textFaint,
    marginTop: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginLeft: spacing.sm,
    marginTop: 6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.lg + 18,
  },
});

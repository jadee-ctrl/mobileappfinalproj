import React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { ScreenContainer, Card, Divider } from "../../components/Basics";
import { Button } from "../../components/Button";
import { colors, fontSize, radius, spacing } from "../../constants/theme";

export default function CustomerProfile() {
  const { user, logout } = useAuth();
  const { ordersForCustomer } = useData();

  if (!user) return null;
  const orders = ordersForCustomer(user.id);
  const delivered = orders.filter((o) => o.status === "delivered").length;

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Profile</Text>

      <Card style={{ marginBottom: spacing.lg }}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.role}>Customer account</Text>
          </View>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total orders</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{delivered}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </Card>
      </View>

      <Card style={{ marginBottom: spacing.lg, marginTop: spacing.lg }}>
        <InfoRow icon="mail-outline" label="Email" value={user.email} />
        <Divider />
        <InfoRow icon="call-outline" label="Phone" value={user.phone} />
        <Divider />
        <InfoRow
          icon="location-outline"
          label="Default address"
          value={user.address || "Not set"}
        />
      </Card>

      <Button label="Log out" variant="outline" onPress={handleLogout} />
    </ScreenContainer>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <View style={{ marginLeft: spacing.md, flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.lg,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarInitial: {
    color: "#fff",
    fontSize: fontSize.xl,
    fontWeight: "800",
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textFaint,
  },
  infoValue: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.text,
    marginTop: 1,
  },
});

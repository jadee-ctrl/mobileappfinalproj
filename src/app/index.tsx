import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { colors, fontSize, spacing } from "../constants/theme";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splash}>
        <View style={styles.logoDot} />
        <Text style={styles.logoText}>LabaHub</Text>
        <ActivityIndicator
          color="#fff"
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role === "staff") return <Redirect href="/(staff)/dashboard" />;
  return <Redirect href="/(customer)/home" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoDot: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
});

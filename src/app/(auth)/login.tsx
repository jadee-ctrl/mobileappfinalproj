import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Role } from "../../types";
import { colors, fontSize, radius, spacing } from "../../constants/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [role, setRole] = useState<Role>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setSubmitting(true);

    const result = await login(email, password, role);

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }

    router.replace(
      role === "staff"
        ? "/(staff)/dashboard"
        : "/(customer)/home"
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.brand}>
            <Image
              source={require("../../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brandTitle}>LabaHub</Text>

            <Text style={styles.brandSubtitle}>
              Laundry booking & order tracking
            </Text>
          </View>

          <View style={styles.roleSwitch}>
            {(["customer", "staff"] as Role[]).map((r) => {
              const selected = r === role;

              return (
                <Pressable
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.roleTab,
                    selected && styles.roleTabSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      selected && styles.roleTabTextSelected,
                    ]}
                  >
                    {r === "customer" ? "Customer" : "Staff"}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Email"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error}
          />

          <Button
            label={submitting ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            loading={submitting}
            style={{ marginTop: spacing.md }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Don't have an account?
            </Text>

            <Pressable
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.footerLink}> Register</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 180,
    height: 120,
    marginBottom: 10,
  },
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  brand: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  brandTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  brandSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  roleSwitch: {
    flexDirection: "row",
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  roleTabSelected: {
    backgroundColor: colors.surface,
  },
  roleTabText: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    color: colors.primaryDark,
    opacity: 0.6,
  },
  roleTabTextSelected: {
    opacity: 1,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  footerLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: "700",
  },
});

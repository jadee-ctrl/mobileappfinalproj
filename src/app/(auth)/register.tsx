import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Role } from "../../types";
import { colors, fontSize, radius, spacing } from "../../constants/theme";

export default function RegisterScreen() {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    const result = await register({
      name,
      email,
      phone,
      address,
      password,
      role,
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Unable to register.");
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
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Create account</Text>

          <Text style={styles.subtitle}>
            Join LabaHub as a customer or staff member.
          </Text>

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
            label="Full name"
            placeholder="Juan Dela Cruz"
            value={name}
            onChangeText={setName}
          />

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
          />

          <Input
            label="Phone number"
            placeholder="0917 000 0000"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {role === "customer" && (
            <Input
              label="Default address"
              placeholder="House no., street, barangay, city"
              value={address}
              onChangeText={setAddress}
            />
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label={submitting ? "Creating account..." : "Create account"}
            onPress={handleRegister}
            loading={submitting}
            style={{ marginTop: spacing.sm }}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              Already have an account?
            </Text>

            <Pressable onPress={() => router.back()}>
              <Text style={styles.footerLink}> Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.lg,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
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
  error: {
    color: colors.danger,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
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

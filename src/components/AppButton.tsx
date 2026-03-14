import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, spacing } from "@/constants/theme";

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
}

export const AppButton = ({ label, onPress, variant = "primary", disabled = false, loading = false }: AppButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [styles.button, styles[variant], pressed && !isDisabled && styles.pressed, isDisabled && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "ghost" ? colors.primary : colors.white} />
      ) : (
        <Text style={[styles.text, (variant === "primary" || variant === "danger") && styles.inverseText]}>{label}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surfaceMuted },
  danger: { backgroundColor: colors.danger },
  ghost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: { color: colors.text, fontWeight: "600" },
  inverseText: { color: colors.surface },
  disabled: { opacity: 0.6 },
  pressed: { transform: [{ scale: 0.99 }] },
});

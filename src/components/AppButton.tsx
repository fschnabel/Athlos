import { Pressable, StyleSheet, Text } from "react-native";

import { colors, spacing } from "@/constants/theme";

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger";
}

export const AppButton = ({ label, onPress, variant = "primary" }: AppButtonProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.button, styles[variant]]}>
      <Text style={[styles.text, variant !== "secondary" && styles.inverseText]}>{label}</Text>
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
  text: { color: colors.text, fontWeight: "600" },
  inverseText: { color: colors.surface },
});

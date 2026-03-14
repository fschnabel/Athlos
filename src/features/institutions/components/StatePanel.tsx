import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/constants/theme";

interface StatePanelProps {
  title: string;
  message: string;
  loading?: boolean;
}

export const StatePanel = ({ title, message, loading = false }: StatePanelProps) => (
  <View style={styles.container}>
    {loading ? <ActivityIndicator size="small" color={colors.accent} /> : null}
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: "center",
  },
});

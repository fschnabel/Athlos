import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { colors, spacing } from "@/constants/theme";

export const AppCard = ({ children }: PropsWithChildren) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
});

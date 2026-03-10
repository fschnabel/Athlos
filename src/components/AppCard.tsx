import { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";

import { colors, spacing } from "@/constants/theme";

export const AppCard = ({ children }: PropsWithChildren) => {
  return <View style={styles.card}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
});

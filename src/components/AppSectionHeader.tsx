import { StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/constants/theme";

interface AppSectionHeaderProps {
  title: string;
  subtitle?: string;
}

export const AppSectionHeader = ({ title, subtitle }: AppSectionHeaderProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { gap: 6 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { color: colors.textMuted, lineHeight: 20, marginBottom: spacing.sm },
});

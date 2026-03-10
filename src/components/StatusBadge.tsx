import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/constants/theme";

interface StatusBadgeProps {
  label: string;
  tone?: "default" | "success" | "danger";
}

export const StatusBadge = ({ label, tone = "default" }: StatusBadgeProps) => (
  <View style={[styles.badge, tone === "success" && styles.success, tone === "danger" && styles.danger]}>
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  success: { backgroundColor: "#D8F0DE" },
  danger: { backgroundColor: "#F8DEDA" },
  text: { color: colors.text, fontSize: 12, fontWeight: "600" },
});

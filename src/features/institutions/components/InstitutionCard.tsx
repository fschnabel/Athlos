import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/AppCard";
import { colors, spacing } from "@/constants/theme";
import { Institution, institutionTypeOptions } from "@/types/institutions";

interface InstitutionCardProps {
  institution: Institution;
  onPress?: () => void;
}

const getInstitutionTypeLabel = (type: Institution["type"]) =>
  institutionTypeOptions.find((option) => option.value === type)?.label ?? type;

export const InstitutionCard = ({ institution, onPress }: InstitutionCardProps) => {
  const initials = institution.name
    .split(" ")
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <AppCard>
        <View style={styles.row}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>{initials}</Text>
          </View>
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{institution.name}</Text>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{getInstitutionTypeLabel(institution.type)}</Text>
              </View>
            </View>
            <Text style={styles.location}>
              {institution.city}, {institution.province}
            </Text>
            <Text style={styles.contact}>Main contact: {institution.mainContactName}</Text>
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pressed: { opacity: 0.96 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 18,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  typePill: {
    backgroundColor: colors.accentMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typePillText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "700",
  },
  location: {
    color: colors.textMuted,
  },
  contact: {
    color: colors.text,
    fontSize: 12,
  },
});

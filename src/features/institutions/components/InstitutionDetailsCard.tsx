import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/AppCard";
import { colors, spacing } from "@/constants/theme";
import { Institution, institutionTypeOptions } from "@/types/institutions";

interface InstitutionDetailsCardProps {
  institution: Institution;
}

const getTypeLabel = (type: Institution["type"]) =>
  institutionTypeOptions.find((option) => option.value === type)?.label ?? type;

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export const InstitutionDetailsCard = ({ institution }: InstitutionDetailsCardProps) => (
  <AppCard>
    <DetailRow label="Institution" value={institution.name} />
    <DetailRow label="Type" value={getTypeLabel(institution.type)} />
    <DetailRow label="Location" value={`${institution.city}, ${institution.province}`} />
    <DetailRow label="Email" value={institution.email} />
    <DetailRow label="Phone" value={institution.phone} />
    <DetailRow label="Main contact" value={institution.mainContactName} />
    <DetailRow label="Logo URL" value={institution.logoUrl || "Not provided"} />
  </AppCard>
);

const styles = StyleSheet.create({
  row: {
    gap: 4,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});

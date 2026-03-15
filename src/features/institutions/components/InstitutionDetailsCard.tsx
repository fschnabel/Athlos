import { StyleSheet, Text, View } from "react-native";

import { AppCard } from "@/components/AppCard";
import { colors, spacing } from "@/constants/theme";
import { useI18n } from "@/i18n";
import { Institution } from "@/types/institutions";

interface InstitutionDetailsCardProps {
  institution: Institution;
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export const InstitutionDetailsCard = ({ institution }: InstitutionDetailsCardProps) => {
  const { t } = useI18n();

  return (
    <AppCard>
      <DetailRow label={t("institutions.details.institution")} value={institution.name} />
      <DetailRow label={t("institutions.details.type")} value={t(`institutions.types.${institution.type}`)} />
      <DetailRow label={t("institutions.details.location")} value={`${institution.city}, ${institution.province}`} />
      <DetailRow label={t("institutions.details.email")} value={institution.email} />
      <DetailRow label={t("institutions.details.phone")} value={institution.phone} />
      <DetailRow label={t("institutions.details.mainContact")} value={institution.mainContactName} />
      <DetailRow label={t("institutions.details.logoUrl")} value={institution.logoUrl || t("common.notProvided")} />
    </AppCard>
  );
};

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

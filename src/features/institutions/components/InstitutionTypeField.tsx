import { Controller, Control } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/constants/theme";
import { InstitutionFormValues } from "@/features/institutions/schemas/institutionSchema";
import { useI18n } from "@/i18n";
import { institutionTypeOptions } from "@/types/institutions";

interface InstitutionTypeFieldProps {
  control: Control<InstitutionFormValues>;
}

export const InstitutionTypeField = ({ control }: InstitutionTypeFieldProps) => {
  const { t } = useI18n();

  return (
    <Controller
      control={control}
      name="type"
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{t("institutions.form.type")}</Text>
          <View style={styles.options}>
            {institutionTypeOptions.map((option) => {
              const selected = option.value === value;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => onChange(option.value)}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {t(`institutions.types.${option.value}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {error ? <Text style={styles.error}>{error.message}</Text> : null}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: colors.text, fontWeight: "600" },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  option: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    fontWeight: "600",
  },
  optionTextSelected: {
    color: colors.white,
  },
  error: { color: colors.danger, fontSize: 12 },
});

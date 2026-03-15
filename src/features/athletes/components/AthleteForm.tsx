import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { colors, spacing } from "@/constants/theme";
import { getAgeLabelFromBirthDate } from "@/features/athletes/categoryResolver";
import { AthleteFormValues, athleteSchema } from "@/features/athletes/validation";
import { useI18n } from "@/i18n";

interface AthleteFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  defaultValues: AthleteFormValues;
  onSubmit: (values: AthleteFormValues) => Promise<void>;
  onScanIdPress?: () => void;
  isSubmitting?: boolean;
}

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const fromInputDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date("2013-01-01T00:00:00") : parsed;
};

export const AthleteForm = ({ title, subtitle, submitLabel, defaultValues, onSubmit, onScanIdPress, isSubmitting = false }: AthleteFormProps) => {
  const { t } = useI18n();
  const [showBirthDatePicker, setShowBirthDatePicker] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteSchema),
    defaultValues,
  });

  const selectedGender = watch("gender");
  const birthDate = watch("birthDate");

  const handleBirthDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowBirthDatePicker(false);
    }

    if (event.type === "dismissed" || !selectedDate) {
      return;
    }

    setValue("birthDate", toInputDate(selectedDate), { shouldValidate: true, shouldDirty: true });
  };

  return (
    <View style={styles.container}>
      <AppSectionHeader title={title} subtitle={subtitle} />
      <AppCard>
        {onScanIdPress ? <AppButton label={t("athletes.scanButton")} variant="secondary" onPress={onScanIdPress} /> : null}

        <AppTextField control={control} name="firstName" label={t("athletes.fields.firstName")} placeholder="Mateo" />
        <AppTextField control={control} name="lastName" label={t("athletes.fields.lastName")} placeholder="Diaz" />

        <View style={styles.field}>
          <Text style={styles.label}>{t("athletes.fields.gender")}</Text>
          <View style={styles.optionsRow}>
            {[
              { label: t("athletes.gender.male"), value: "male" as const },
              { label: t("athletes.gender.female"), value: "female" as const },
            ].map((option) => {
              const selected = option.value === selectedGender;
              return (
                <Pressable key={option.value} onPress={() => setValue("gender", option.value, { shouldValidate: true })} style={[styles.option, selected && styles.optionSelected]}>
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.gender ? <Text style={styles.error}>{errors.gender.message}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t("athletes.fields.birthDate")}</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowBirthDatePicker(true)}>
            <Text style={styles.dateButtonText}>{birthDate || "2013-01-01"}</Text>
          </Pressable>
          {errors.birthDate ? <Text style={styles.error}>{errors.birthDate.message}</Text> : null}
          {showBirthDatePicker ? (
            <DateTimePicker
              value={fromInputDate(birthDate)}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleBirthDateChange}
            />
          ) : null}
          {Platform.OS === "ios" && showBirthDatePicker ? (
            <AppButton label={t("common.done")} variant="ghost" onPress={() => setShowBirthDatePicker(false)} />
          ) : null}
        </View>

        <View style={styles.autoPanel}>
          <Text style={styles.autoLabel}>{t("athletes.calculated")}</Text>
          <Text style={styles.autoValue}>{birthDate ? getAgeLabelFromBirthDate(birthDate) : "-"}</Text>
          <Text style={styles.autoHint}>{t("athletes.categoryHint")}</Text>
        </View>

        <AppTextField control={control} name="emergencyContactName" label={t("athletes.fields.emergencyContactName")} placeholder="Parent or guardian" />
        <AppTextField control={control} name="emergencyContactPhone" label={t("athletes.fields.emergencyContactPhone")} placeholder="+593 99 000 0000" keyboardType="phone-pad" />

        <AppButton label={submitLabel} onPress={handleSubmit((values) => void onSubmit(values))} loading={isSubmitting} />
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  field: { gap: 8 },
  label: { color: colors.text, fontWeight: "600" },
  optionsRow: { flexDirection: "row", gap: spacing.sm },
  option: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, paddingVertical: 10 },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { color: colors.text, fontWeight: "600" },
  optionTextSelected: { color: colors.white },
  dateButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  dateButtonText: { color: colors.text, fontSize: 16 },
  autoPanel: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceMuted, padding: spacing.md, gap: 4 },
  autoLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  autoValue: { color: colors.text, fontSize: 16, fontWeight: "700" },
  autoHint: { color: colors.textMuted },
  error: { color: colors.danger, fontSize: 12 },
});

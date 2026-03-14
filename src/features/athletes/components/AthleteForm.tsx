import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { colors, spacing } from "@/constants/theme";
import { getAgeLabelFromBirthDate } from "@/features/athletes/categoryResolver";
import { AthleteFormValues, athleteSchema } from "@/features/athletes/validation";

interface AthleteFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  defaultValues: AthleteFormValues;
  onSubmit: (values: AthleteFormValues) => Promise<void>;
  onScanIdPress?: () => void;
  isSubmitting?: boolean;
}

const genderOptions: Array<{ label: string; value: AthleteFormValues["gender"] }> = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

export const AthleteForm = ({
  title,
  subtitle,
  submitLabel,
  defaultValues,
  onSubmit,
  onScanIdPress,
  isSubmitting = false,
}: AthleteFormProps) => {
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

  return (
    <View style={styles.container}>
      <AppSectionHeader title={title} subtitle={subtitle} />
      <AppCard>
        {onScanIdPress ? <AppButton label="Read identification with OCR" variant="secondary" onPress={onScanIdPress} /> : null}

        <AppTextField control={control} name="firstName" label="First name" placeholder="Mateo" />
        <AppTextField control={control} name="lastName" label="Last name" placeholder="Diaz" />

        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.optionsRow}>
            {genderOptions.map((option) => {
              const selected = option.value === selectedGender;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => setValue("gender", option.value, { shouldValidate: true })}
                  style={[styles.option, selected && styles.optionSelected]}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.gender ? <Text style={styles.error}>{errors.gender.message}</Text> : null}
        </View>

        <AppTextField control={control} name="birthDate" label="Birth date" placeholder="2013-01-01" autoCapitalize="none" />

        <View style={styles.autoPanel}>
          <Text style={styles.autoLabel}>Calculated from birth date</Text>
          <Text style={styles.autoValue}>{birthDate ? getAgeLabelFromBirthDate(birthDate) : "Enter a birth date"}</Text>
          <Text style={styles.autoHint}>Competition category will be assigned later from age during the event flow.</Text>
        </View>

        <AppTextField control={control} name="emergencyContactName" label="Emergency contact name" placeholder="Parent or guardian" />
        <AppTextField control={control} name="emergencyContactPhone" label="Emergency contact phone" placeholder="+593 99 000 0000" keyboardType="phone-pad" />

        <AppButton label={submitLabel} onPress={handleSubmit((values) => void onSubmit(values))} loading={isSubmitting} />
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  field: {
    gap: 8,
  },
  label: {
    color: colors.text,
    fontWeight: "600",
  },
  optionsRow: {
    flexDirection: "row",
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
  autoPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  autoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  autoValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  autoHint: {
    color: colors.textMuted,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
  },
});

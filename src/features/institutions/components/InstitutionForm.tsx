import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { spacing } from "@/constants/theme";
import { InstitutionFormValues, institutionFormSchema } from "@/features/institutions/schemas/institutionSchema";

import { InstitutionTypeField } from "./InstitutionTypeField";

interface InstitutionFormProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  defaultValues: InstitutionFormValues;
  onSubmit: (values: InstitutionFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export const InstitutionForm = ({
  title,
  subtitle,
  submitLabel,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: InstitutionFormProps) => {
  const { control, handleSubmit } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionFormSchema),
    defaultValues,
  });

  return (
    <View style={styles.container}>
      <AppSectionHeader title={title} subtitle={subtitle} />
      <AppCard>
        <AppTextField control={control} name="name" label="Institution name" placeholder="Athlos Performance Club" />
        <InstitutionTypeField control={control} />
        <AppTextField control={control} name="city" label="City" placeholder="Guayaquil" />
        <AppTextField control={control} name="province" label="Province" placeholder="Guayas" />
        <AppTextField
          control={control}
          name="email"
          label="Email"
          placeholder="admin@institution.org"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AppTextField control={control} name="phone" label="Phone" placeholder="+593 99 000 0000" keyboardType="phone-pad" />
        <AppTextField control={control} name="mainContactName" label="Main contact name" placeholder="Full name" />
        <AppTextField
          control={control}
          name="logoUrl"
          label="Logo URL"
          placeholder="https://example.com/logo.png"
          keyboardType="url"
          autoCapitalize="none"
          description="Optional for this MVP."
        />
        <AppButton label={submitLabel} onPress={handleSubmit((values) => void onSubmit(values))} loading={isSubmitting} />
      </AppCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
});

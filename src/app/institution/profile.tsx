import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import { mockInstitution } from "@/features/mockData";
import { institutionProfileSchema, InstitutionProfileFormValues } from "@/features/institutions/validation";

export default function InstitutionProfileScreen() {
  const { control, handleSubmit } = useForm<InstitutionProfileFormValues>({
    resolver: zodResolver(institutionProfileSchema),
    defaultValues: {
      name: mockInstitution.name,
      shortName: mockInstitution.shortName,
      city: mockInstitution.city,
      country: mockInstitution.country,
      contactEmail: mockInstitution.contactEmail,
    },
  });

  return (
    <Screen>
      <AppSectionHeader title="Institution Profile" subtitle="Manage profile data used in invitations, registration, and event hosting." />
      <AppCard>
        <AppTextField control={control} name="name" label="Institution name" />
        <AppTextField control={control} name="shortName" label="Short name" />
        <AppTextField control={control} name="city" label="City" />
        <AppTextField control={control} name="country" label="Country" />
        <AppTextField control={control} name="contactEmail" label="Contact email" />
        <AppButton label="Save profile" onPress={handleSubmit((values) => Alert.alert("Profile saved", JSON.stringify(values, null, 2)))} />
      </AppCard>
    </Screen>
  );
}

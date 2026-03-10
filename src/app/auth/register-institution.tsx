import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import {
  InstitutionRegistrationFormValues,
  institutionRegistrationSchema,
} from "@/features/auth/validation";

export default function RegisterInstitutionScreen() {
  const { control, handleSubmit } = useForm<InstitutionRegistrationFormValues>({
    resolver: zodResolver(institutionRegistrationSchema),
    defaultValues: {
      institutionName: "",
      shortName: "",
      city: "",
      country: "",
      contactEmail: "",
      adminName: "",
      adminEmail: "",
      password: "",
    },
  });

  return (
    <Screen>
      <AppSectionHeader title="Register Institution" subtitle="Create the institution profile and the first administrator account." />
      <AppCard>
        <AppTextField control={control} name="institutionName" label="Institution name" />
        <AppTextField control={control} name="shortName" label="Short name" />
        <AppTextField control={control} name="city" label="City" />
        <AppTextField control={control} name="country" label="Country" />
        <AppTextField control={control} name="contactEmail" label="Contact email" />
        <AppTextField control={control} name="adminName" label="Administrator name" />
        <AppTextField control={control} name="adminEmail" label="Administrator email" />
        <AppTextField control={control} name="password" label="Password" secureTextEntry />
        <AppButton
          label="Create account"
          onPress={handleSubmit((values) => Alert.alert("Institution registration", JSON.stringify(values, null, 2)))}
        />
      </AppCard>
    </Screen>
  );
}

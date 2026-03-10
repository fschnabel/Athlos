import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import { CoachFormValues, coachSchema } from "@/features/coaches/validation";

export default function CreateCoachScreen() {
  const { control, handleSubmit } = useForm<CoachFormValues>({
    resolver: zodResolver(coachSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "" },
  });

  return (
    <Screen>
      <AppSectionHeader title="Create Coach" subtitle="Register a coach under your institution." />
      <AppCard>
        <AppTextField control={control} name="firstName" label="First name" />
        <AppTextField control={control} name="lastName" label="Last name" />
        <AppTextField control={control} name="email" label="Email" />
        <AppTextField control={control} name="phone" label="Phone" />
        <AppButton label="Save coach" onPress={handleSubmit((values) => Alert.alert("Coach created", JSON.stringify(values, null, 2)))} />
      </AppCard>
    </Screen>
  );
}

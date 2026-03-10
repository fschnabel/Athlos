import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import { AthleteFormValues, athleteSchema } from "@/features/athletes/validation";

export default function CreateAthleteScreen() {
  const { control, handleSubmit } = useForm<AthleteFormValues>({
    resolver: zodResolver(athleteSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "male",
      birthDate: "2013-01-01",
      categoryId: "cat-a",
    },
  });

  return (
    <Screen>
      <AppSectionHeader title="Create Athlete" subtitle="Add an athlete to your institution roster." />
      <AppCard>
        <AppTextField control={control} name="firstName" label="First name" />
        <AppTextField control={control} name="lastName" label="Last name" />
        <AppTextField control={control} name="gender" label="Gender" placeholder="male | female | other" />
        <AppTextField control={control} name="birthDate" label="Birth date" placeholder="YYYY-MM-DD" />
        <AppTextField control={control} name="categoryId" label="Category id" placeholder="cat-a" />
        <AppButton label="Save athlete" onPress={handleSubmit((values) => Alert.alert("Athlete created", JSON.stringify(values, null, 2)))} />
      </AppCard>
    </Screen>
  );
}

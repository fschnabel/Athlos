import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import { CategoryFormValues, categorySchema } from "@/features/categories/validation";

export default function CreateCategoryScreen() {
  const { control, handleSubmit } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", code: "", minAge: 6, maxAge: 8 },
  });

  return (
    <Screen>
      <AppSectionHeader title="Create Category" subtitle="Define a category range used to validate athlete eligibility." />
      <AppCard>
        <AppTextField control={control} name="name" label="Category name" />
        <AppTextField control={control} name="code" label="Code" />
        <AppTextField control={control} name="minAge" label="Minimum age" />
        <AppTextField control={control} name="maxAge" label="Maximum age" />
        <AppButton label="Save category" onPress={handleSubmit((values) => Alert.alert("Category created", JSON.stringify(values, null, 2)))} />
      </AppCard>
    </Screen>
  );
}

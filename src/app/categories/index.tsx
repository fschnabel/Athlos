import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";
import { mockCategories } from "@/features/mockData";

export default function CategoriesListScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Categories" subtitle="Manage age groups used for athlete validation and event registration." />
      {mockCategories.map((category) => (
        <AppCard key={category.id}>
          <Text>{category.name}</Text>
          <Text>{category.minAge} - {category.maxAge} years</Text>
        </AppCard>
      ))}
      <Link href="/categories/create" asChild>
        <AppButton label="Create category" />
      </Link>
      <Link href="/categories/edit" asChild>
        <AppButton label="Edit category" variant="secondary" />
      </Link>
    </Screen>
  );
}

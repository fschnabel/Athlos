import { Link } from "expo-router";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

export default function NotFoundScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Screen Not Found" subtitle="The requested route does not exist in this MVP scaffold." />
      <Link href="/(tabs)/dashboard" asChild>
        <AppButton label="Return to dashboard" />
      </Link>
    </Screen>
  );
}

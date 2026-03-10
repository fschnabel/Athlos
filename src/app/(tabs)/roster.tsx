import { Link } from "expo-router";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

export default function RosterTabScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Roster Management" subtitle="Maintain coaches, athletes, and age categories for your institution." />
      <Link href="/coaches" asChild>
        <AppButton label="Manage coaches" />
      </Link>
      <Link href="/athletes" asChild>
        <AppButton label="Manage athletes" />
      </Link>
      <Link href="/categories" asChild>
        <AppButton label="Manage categories" variant="secondary" />
      </Link>
    </Screen>
  );
}

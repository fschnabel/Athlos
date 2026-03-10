import { Link } from "expo-router";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

export default function CheckinTabScreen() {
  return (
    <Screen>
      <AppSectionHeader title="Event Day" subtitle="Open disciplines, record athlete presence, generate balanced heats, and adjust assignments." />
      <Link href="/checkin/select-discipline" asChild>
        <AppButton label="Select discipline" />
      </Link>
      <Link href="/checkin/generate-heats" asChild>
        <AppButton label="Generate heats" variant="secondary" />
      </Link>
    </Screen>
  );
}

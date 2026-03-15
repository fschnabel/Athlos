import { Link } from "expo-router";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Screen } from "@/components/Screen";
import { useI18n } from "@/i18n";

export default function RosterTabScreen() {
  const { t } = useI18n();

  return (
    <Screen>
      <AppSectionHeader title={t("roster.title")} subtitle={t("roster.subtitle")} />
      <LanguageSwitcher />
      <Link href="/coaches" asChild>
        <AppButton label={t("roster.coaches")} />
      </Link>
      <Link href="/athletes" asChild>
        <AppButton label={t("roster.athletes")} />
      </Link>
      <Link href="/categories" asChild>
        <AppButton label={t("roster.categories")} variant="secondary" />
      </Link>
    </Screen>
  );
}

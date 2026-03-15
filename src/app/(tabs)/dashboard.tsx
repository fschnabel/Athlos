import { Link } from "expo-router";
import { Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Screen } from "@/components/Screen";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";

export default function DashboardScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { t } = useI18n();

  return (
    <Screen>
      <AppSectionHeader
        title={activeInstitution?.name ?? "Athlos"}
        subtitle={t("dashboard.subtitle")}
      />
      <LanguageSwitcher />
      <AppCard>
        <Link href="/institution/profile" asChild>
          <AppButton label={t("dashboard.profile")} />
        </Link>
        <Link href="/institutions/select" asChild>
          <AppButton label={t("dashboard.switchInstitution")} variant="secondary" />
        </Link>
      </AppCard>
    </Screen>
  );
}

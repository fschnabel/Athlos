import { Link } from "expo-router";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { Screen } from "@/components/Screen";

export default function CheckinTabScreen() {
  return (
    <Screen>
      <AppSectionHeader
        title="Check-in"
        subtitle="Selecciona institucion participante y habilita atletas registrados para la competencia."
      />
      <Link href="/checkin/athletes" asChild>
        <AppButton label="Abrir check-in de atletas" />
      </Link>
      <Link href="/checkin/generate-heats" asChild>
        <AppButton label="Generar series" variant="secondary" />
      </Link>
    </Screen>
  );
}

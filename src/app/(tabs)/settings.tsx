import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";

const copy = {
  es: {
    title: "Opciones",
    subtitle: "Configura la aplicacion y define desde aqui la institucion activa.",
    institution: "Institucion activa",
    noInstitution: "Todavia no has seleccionado una institucion.",
    switchInstitution: "Seleccionar institucion",
    createInstitution: "Crear institucion",
    viewProfile: "Ver perfil",
    clearInstitution: "Quitar seleccion",
    language: "Idioma",
    workspace: "Espacio de trabajo",
    workspaceNote: "La seleccion de institucion vivira aqui para futuras versiones.",
  },
  en: {
    title: "Settings",
    subtitle: "Configure the app and define the active institution here.",
    institution: "Active institution",
    noInstitution: "No institution selected yet.",
    switchInstitution: "Select institution",
    createInstitution: "Create institution",
    viewProfile: "View profile",
    clearInstitution: "Clear selection",
    language: "Language",
    workspace: "Workspace",
    workspaceNote: "Institution selection now lives here for future versions.",
  },
  de: {
    title: "Optionen",
    subtitle: "Konfiguriere die App und lege hier die aktive Institution fest.",
    institution: "Aktive Institution",
    noInstitution: "Noch keine Institution ausgewahlt.",
    switchInstitution: "Institution auswahlen",
    createInstitution: "Institution erstellen",
    viewProfile: "Profil ansehen",
    clearInstitution: "Auswahl entfernen",
    language: "Sprache",
    workspace: "Arbeitsbereich",
    workspaceNote: "Die Institutionsauswahl liegt kunftig hier.",
  },
} as const;

export default function SettingsTabScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const clearActiveInstitution = useInstitutionStore((state) => state.clearActiveInstitution);
  const { language } = useI18n();
  const text = copy[language];

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{text.title}</Text>
        <Text style={styles.heroSubtitle}>{text.subtitle}</Text>
      </View>

      <AppCard>
        <Text style={styles.sectionKicker}>{text.workspace}</Text>
        <Text style={styles.sectionTitle}>{text.institution}</Text>
        <Text style={styles.sectionSubtitle}>{text.workspaceNote}</Text>
        <View style={styles.institutionBlock}>
          <Text style={styles.institutionName}>{activeInstitution?.name ?? text.noInstitution}</Text>
          {activeInstitution ? (
            <Text style={styles.institutionMeta}>{activeInstitution.city} • {activeInstitution.type}</Text>
          ) : null}
        </View>
        <View style={styles.actionStack}>
          <Link href="/institutions/select" asChild>
            <AppButton label={text.switchInstitution} />
          </Link>
          {!activeInstitution ? (
            <Link href="/institutions/create" asChild>
              <AppButton label={text.createInstitution} variant="secondary" />
            </Link>
          ) : null}
          {activeInstitution ? (
            <Link href="/institution/profile" asChild>
              <AppButton label={text.viewProfile} variant="secondary" />
            </Link>
          ) : null}
          {activeInstitution ? <AppButton label={text.clearInstitution} variant="ghost" onPress={() => void clearActiveInstitution()} /> : null}
        </View>
      </AppCard>

      <AppCard>
        <Text style={styles.sectionKicker}>{text.language}</Text>
        <Text style={styles.sectionTitle}>{text.language}</Text>
        <Text style={styles.sectionSubtitle}>Athlos puede cambiar de idioma desde este espacio.</Text>
        <LanguageSwitcher />
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    gap: 8,
    borderRadius: 30,
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: "#D7E3F7",
    lineHeight: 20,
  },
  sectionKicker: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionSubtitle: {
    color: colors.textMuted,
    lineHeight: 20,
  },
  institutionBlock: {
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    gap: 4,
  },
  institutionName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  institutionMeta: {
    color: colors.textMuted,
  },
  actionStack: {
    gap: spacing.sm,
  },
});

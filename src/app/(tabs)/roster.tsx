import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { listAthletesByInstitution } from "@/features/athletes/service";
import { mockCoaches } from "@/features/mockData";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { Athlete } from "@/types/domain";

const copy = {
  es: {
    title: "Atletas y coaches",
    subtitleWithInstitution: "Administra la plantilla competitiva de {{institution}} y prepara su participacion.",
    subtitleWithoutInstitution: "Centraliza atletas, coaches y categorias en una sola vista.",
    athletes: "Atletas",
    coaches: "Coaches",
    categories: "Categorias",
    manageAthletes: "Gestionar atletas",
    manageCoaches: "Gestionar coaches",
    manageCategories: "Ver categorias",
    selectInstitution: "Selecciona una institucion para activar el equipo.",
    openSettings: "Abrir opciones",
    loading: "Preparando el equipo de trabajo.",
    rosterResume: "Resumen del equipo",
    rosterNote: "Desde aqui puedes entrar rapido a los modulos de atletas y coaches.",
  },
  en: {
    title: "Athletes and coaches",
    subtitleWithInstitution: "Manage the competition roster for {{institution}} and prepare participation.",
    subtitleWithoutInstitution: "Keep athletes, coaches, and categories in one place.",
    athletes: "Athletes",
    coaches: "Coaches",
    categories: "Categories",
    manageAthletes: "Manage athletes",
    manageCoaches: "Manage coaches",
    manageCategories: "View categories",
    selectInstitution: "Select an institution to activate the team workspace.",
    openSettings: "Open settings",
    loading: "Preparing the team workspace.",
    rosterResume: "Team overview",
    rosterNote: "Use this screen as the entry point to athletes and coaches.",
  },
  de: {
    title: "Athleten und Coaches",
    subtitleWithInstitution: "Verwalte den Wettkampfkader von {{institution}} und bereite Teilnahmen vor.",
    subtitleWithoutInstitution: "Athleten, Coaches und Kategorien an einem Ort.",
    athletes: "Athleten",
    coaches: "Coaches",
    categories: "Kategorien",
    manageAthletes: "Athleten verwalten",
    manageCoaches: "Coaches verwalten",
    manageCategories: "Kategorien",
    selectInstitution: "Wahle zuerst eine Institution aus.",
    openSettings: "Optionen offnen",
    loading: "Team-Bereich wird vorbereitet.",
    rosterResume: "Team-Ubersicht",
    rosterNote: "Von hier aus gelangst du schnell zu Athleten und Coaches.",
  },
} as const;

const interpolate = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((current, [key, value]) => current.replace(`{{${key}}}`, String(value)), template);

export default function RosterTabScreen() {
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { language } = useI18n();
  const text = copy[language];
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoster = useCallback(async () => {
    if (!activeInstitution) {
      setAthletes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setAthletes(await listAthletesByInstitution(activeInstitution.id));
    } finally {
      setLoading(false);
    }
  }, [activeInstitution]);

  useFocusEffect(
    useCallback(() => {
      void loadRoster();
    }, [loadRoster]),
  );

  const coachCount = useMemo(
    () => (activeInstitution ? mockCoaches.filter((coach) => coach.institutionId === activeInstitution.id).length : 0),
    [activeInstitution],
  );

  return (
    <Screen contentContainerStyle={styles.screenContent}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{text.title}</Text>
        <Text style={styles.heroSubtitle}>
          {activeInstitution
            ? interpolate(text.subtitleWithInstitution, { institution: activeInstitution.name })
            : text.subtitleWithoutInstitution}
        </Text>
      </View>

      {!activeInstitution ? (
        <AppCard>
          <Text style={styles.sectionTitle}>{text.selectInstitution}</Text>
          <Link href="./settings" asChild>
            <AppButton label={text.openSettings} />
          </Link>
        </AppCard>
      ) : null}

      {loading ? <StatePanel title={text.title} message={text.loading} loading /> : null}

      {!loading ? (
        <>
          <AppCard>
            <Text style={styles.sectionTitle}>{text.rosterResume}</Text>
            <Text style={styles.sectionSubtitle}>{text.rosterNote}</Text>
            <View style={styles.metricRow}>
              <View style={styles.metricTile}>
                <Ionicons name="walk-outline" size={22} color={colors.primary} />
                <Text style={styles.metricValue}>{athletes.length}</Text>
                <Text style={styles.metricLabel}>{text.athletes}</Text>
              </View>
              <View style={styles.metricTile}>
                <Ionicons name="people-circle-outline" size={22} color={colors.primary} />
                <Text style={styles.metricValue}>{coachCount}</Text>
                <Text style={styles.metricLabel}>{text.coaches}</Text>
              </View>
              <View style={styles.metricTile}>
                <Ionicons name="albums-outline" size={22} color={colors.primary} />
                <Text style={styles.metricValue}>4</Text>
                <Text style={styles.metricLabel}>{text.categories}</Text>
              </View>
            </View>
          </AppCard>

          <View style={styles.stack}>
            <AppCard>
              <Text style={styles.cardTitle}>{text.athletes}</Text>
              <Text style={styles.cardSubtitle}>{athletes.length} registros en la institucion activa.</Text>
              <Link href="/athletes" asChild>
                <AppButton label={text.manageAthletes} />
              </Link>
            </AppCard>

            <AppCard>
              <Text style={styles.cardTitle}>{text.coaches}</Text>
              <Text style={styles.cardSubtitle}>{coachCount} perfiles listos para acompanamiento tecnico.</Text>
              <Link href="/coaches" asChild>
                <AppButton label={text.manageCoaches} variant="secondary" />
              </Link>
            </AppCard>

            <AppCard>
              <Text style={styles.cardTitle}>{text.categories}</Text>
              <Text style={styles.cardSubtitle}>Mantiene ordenadas las edades y disciplinas disponibles para competir.</Text>
              <Link href="/categories" asChild>
                <AppButton label={text.manageCategories} variant="ghost" />
              </Link>
            </AppCard>
          </View>
        </>
      ) : null}
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  heroSubtitle: {
    color: colors.textMuted,
    lineHeight: 20,
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
  metricRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  metricTile: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    alignItems: "flex-start",
    gap: 6,
  },
  metricValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  metricLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  stack: {
    gap: spacing.md,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
  cardSubtitle: {
    color: colors.textMuted,
    lineHeight: 20,
  },
});

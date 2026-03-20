import { useCallback, useState } from "react";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { InstitutionCard } from "@/features/institutions/components/InstitutionCard";
import { StatePanel } from "@/features/institutions/components/StatePanel";
import { institutionService } from "@/features/institutions/services/institutionService";
import { useI18n } from "@/i18n";
import { useInstitutionStore } from "@/store/institution-store";
import { Institution } from "@/types/institutions";

const createRoute = "/institutions/create" as Href;
const appHomeRoute = "/(tabs)/events" as Href;

export default function SelectInstitutionScreen() {
  const router = useRouter();
  const setActiveInstitution = useInstitutionStore((state) => state.setActiveInstitution);
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInstitutions = useCallback(async (query: string) => {
    try {
      setError(null);
      const items = query.trim()
        ? await institutionService.searchInstitutionsByName(query)
        : await institutionService.getInstitutions();
      setInstitutions(items);
    } catch {
      setError("We could not load institutions right now.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadInstitutions(searchQuery);
    }, [loadInstitutions, searchQuery]),
  );

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    setLoading(true);
    await loadInstitutions(value);
  };

  const handleSelectInstitution = async (institution: Institution) => {
    await setActiveInstitution(institution);
    router.replace(appHomeRoute);
  };

  return (
    <Screen contentContainerStyle={styles.screenContent} scrollable={!loading && !error && institutions.length > 0}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Athlos MVP</Text>
        <AppSectionHeader title={t("institutions.selectTitle")} subtitle={t("institutions.selectSubtitle")} />
        <LanguageSwitcher />
      </View>

      <View style={styles.searchBlock}>
        <Text style={styles.searchLabel}>{t("institutions.searchLabel")}</Text>
        <TextInput
          value={searchQuery}
          onChangeText={(value) => void handleSearch(value)}
          placeholder={t("institutions.searchPlaceholder")}
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCorrect={false}
        />
      </View>

      <AppButton label={t("institutions.createButton")} onPress={() => router.push(createRoute)} />

      {loading ? <StatePanel title={t("institutions.loadingTitle")} message={t("institutions.loadingMessage")} loading /> : null}
      {!loading && error ? <StatePanel title="Error" message={error} /> : null}
      {!loading && !error && institutions.length === 0 ? <StatePanel title={t("institutions.emptyTitle")} message={t("institutions.emptyMessage")} /> : null}

      {!loading && !error && institutions.length > 0 ? (
        <View style={styles.list}>
          {institutions.map((institution) => (
            <InstitutionCard key={institution.id} institution={institution} onPress={() => void handleSelectInstitution(institution)} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { gap: spacing.lg },
  hero: { gap: spacing.sm, padding: spacing.lg, borderRadius: 28, backgroundColor: colors.primary },
  kicker: { color: colors.accent, fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1.1 },
  searchBlock: { gap: 8 },
  searchLabel: { color: colors.text, fontWeight: "700" },
  searchInput: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
  },
  list: { gap: spacing.md },
});

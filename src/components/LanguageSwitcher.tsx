import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, spacing } from "@/constants/theme";
import { useI18n } from "@/i18n";
import { SupportedLanguage } from "@/store/language-store";

const languages: SupportedLanguage[] = ["es", "en", "de"];

export const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{t("language.title")}</Text>
      <View style={styles.row}>
        {languages.map((item) => {
          const selected = item === language;

          return (
            <Pressable key={item} onPress={() => setLanguage(item)} style={[styles.chip, selected && styles.chipSelected]}>
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{t(`language.${item}`)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: { color: colors.text, fontWeight: "600" },
  chipTextSelected: { color: colors.white },
});

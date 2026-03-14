import { PropsWithChildren } from "react";
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, spacing } from "@/constants/theme";

interface ScreenProps extends PropsWithChildren {
  scrollable?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export const Screen = ({ children, scrollable = true, contentContainerStyle }: ScreenProps) => {
  const content = <View style={[styles.content, contentContainerStyle]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      {scrollable ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  content: { flex: 1, padding: spacing.lg, gap: spacing.md },
});

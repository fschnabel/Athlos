import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/theme";
import { useI18n } from "@/i18n";

const tabLabels = {
  es: {
    events: "Eventos",
    team: "Equipo",
    live: "En curso",
    settings: "Opciones",
  },
  en: {
    events: "Events",
    team: "Team",
    live: "Live",
    settings: "Settings",
  },
  de: {
    events: "Events",
    team: "Team",
    live: "Live",
    settings: "Optionen",
  },
} as const;

export default function TabsLayout() {
  const { language } = useI18n();
  const labels = tabLabels[language];
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: labels.events,
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="roster"
        options={{
          title: labels.team,
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: labels.live,
          tabBarIcon: ({ color, size }) => <Ionicons name="stopwatch-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: labels.settings,
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="invitations"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

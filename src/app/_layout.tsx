import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useInstitutionBootstrap } from "@/features/institutions/hooks/useInstitutionBootstrap";

export default function RootLayout() {
  useInstitutionBootstrap();

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useInstitutionBootstrap } from "@/features/institutions/hooks/useInstitutionBootstrap";
import { useInstitutionStore } from "@/store/institution-store";

const INSTITUTION_ROUTES = ["/institutions/select", "/institutions/create", "/institutions/dashboard", "/institutions/profile", "/institutions/edit"];

export default function RootLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const activeInstitution = useInstitutionStore((state) => state.activeInstitution);
  const { hasBootstrapped, isBootstrapping } = useInstitutionBootstrap();

  useEffect(() => {
    if (!hasBootstrapped || isBootstrapping) {
      return;
    }

    const isInstitutionRoute = INSTITUTION_ROUTES.some((route) => pathname === route);

    if (!activeInstitution && pathname !== "/" && !isInstitutionRoute) {
      router.replace("/institutions/select");
    }
  }, [activeInstitution, hasBootstrapped, isBootstrapping, pathname, router]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

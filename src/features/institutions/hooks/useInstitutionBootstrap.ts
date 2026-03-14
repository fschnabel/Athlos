import { useEffect } from "react";

import { useInstitutionStore } from "@/store/institution-store";

export const useInstitutionBootstrap = () => {
  const bootstrap = useInstitutionStore((state) => state.bootstrap);
  const hasBootstrapped = useInstitutionStore((state) => state.hasBootstrapped);
  const isBootstrapping = useInstitutionStore((state) => state.isBootstrapping);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return { hasBootstrapped, isBootstrapping };
};

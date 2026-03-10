import { useAuthStore } from "@/features/auth/store";

export const useAuth = () => {
  const { user, institution, hydrated, setSession, clearSession } = useAuthStore();
  return { user, institution, hydrated, setSession, clearSession };
};

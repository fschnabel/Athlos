import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, Text } from "react-native";

import { AppButton } from "@/components/AppButton";
import { AppCard } from "@/components/AppCard";
import { AppSectionHeader } from "@/components/AppSectionHeader";
import { AppTextField } from "@/components/AppTextField";
import { Screen } from "@/components/Screen";
import { LoginFormValues, loginSchema } from "@/features/auth/validation";

export default function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@athlos.app", password: "secret123" },
  });

  return (
    <Screen>
      <AppSectionHeader title="Login" subtitle="Sign in with your institution account to manage events and participants." />
      <AppCard>
        <AppTextField control={control} name="email" label="Email" placeholder="admin@institution.com" />
        <AppTextField control={control} name="password" label="Password" placeholder="Enter password" secureTextEntry />
        <AppButton label="Sign in" onPress={handleSubmit((values) => Alert.alert("Login payload", JSON.stringify(values, null, 2)))} />
      </AppCard>
      <Text>Firebase auth service is wired in `src/services/firebase/auth.ts` for production integration.</Text>
    </Screen>
  );
}

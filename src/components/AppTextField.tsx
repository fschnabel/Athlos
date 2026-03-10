import { Controller, Control, FieldPath, FieldValues } from "react-hook-form";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors, spacing } from "@/constants/theme";

interface AppTextFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  secureTextEntry?: boolean;
}

export const AppTextField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  secureTextEntry,
}: AppTextFieldProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          value={String(value ?? "")}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          style={[styles.input, error && styles.inputError]}
        />
        {error ? <Text style={styles.error}>{error.message}</Text> : null}
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { color: colors.text, fontWeight: "600" },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
});

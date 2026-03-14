import { CameraView, useCameraPermissions } from "expo-camera";
import { NativeModulesProxy } from "expo-modules-core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { parseIdentificationScan } from "@/features/athletes/identificationParser";

type TextExtractorModule = {
  isSupported: boolean;
  extractTextFromImage: (uri: string) => Promise<string[]>;
};

const getTextExtractor = (): TextExtractorModule | null => {
  const moduleRef = NativeModulesProxy.ExpoTextExtractor as TextExtractorModule | undefined;
  return moduleRef ?? null;
};

export default function AthleteScanIdScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ returnTo?: string; id?: string }>();
  const cameraRef = useRef<CameraView | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleContinue = (rawText: string) => {
    const parsed = parseIdentificationScan(rawText);

    if (!parsed.firstName && !parsed.lastName && !parsed.birthDate && !parsed.gender) {
      Alert.alert(
        "OCR completed",
        "We captured the document, but could not identify enough athlete data automatically. You can try again or complete the form manually.",
        [
          { text: "Try again", onPress: () => setIsProcessing(false) },
          { text: "Back", onPress: () => router.back() },
        ],
      );
      return;
    }

    router.replace({
      pathname: (params.returnTo ?? "/athletes/create") as never,
      params: {
        ...(params.id ? { id: params.id } : {}),
        ...(parsed.firstName ? { firstName: parsed.firstName } : {}),
        ...(parsed.lastName ? { lastName: parsed.lastName } : {}),
        ...(parsed.birthDate ? { birthDate: parsed.birthDate } : {}),
        ...(parsed.gender ? { gender: parsed.gender } : {}),
      },
    } as never);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) {
      return;
    }

    const textExtractor = getTextExtractor();

    if (!textExtractor) {
      Alert.alert(
        "OCR unavailable in Expo Go",
        "This OCR feature needs a development build because the native text extractor module is not present in Expo Go.",
      );
      return;
    }

    if (!textExtractor.isSupported) {
      Alert.alert("OCR unavailable", "Text recognition is not supported on this device.");
      return;
    }

    setIsProcessing(true);

    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: false });

      if (!picture.uri) {
        throw new Error("No image URI returned by camera.");
      }

      const detectedLines = await textExtractor.extractTextFromImage(picture.uri);
      const rawText = detectedLines.join("\n");

      Alert.alert(
        "Identification captured",
        "We extracted text from the document and will prefill the athlete form so you can review it.",
        [
          { text: "Retake", onPress: () => setIsProcessing(false) },
          { text: "Use data", onPress: () => handleContinue(rawText) },
        ],
      );
    } catch {
      setIsProcessing(false);
      Alert.alert("Capture failed", "We could not read text from the identification. Please try again with better lighting and framing.");
    }
  };

  if (!permission) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Text style={styles.title}>Preparing camera</Text>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen contentContainerStyle={styles.permissionLayout}>
        <View style={styles.permissionCard}>
          <Text style={styles.title}>Camera permission required</Text>
          <Text style={styles.subtitle}>Allow camera access to photograph the identification and run OCR over the document text.</Text>
          <AppButton label="Allow camera" onPress={() => void requestPermission()} />
          <AppButton label="Back" variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
      <View style={styles.overlay}>
        <View style={styles.headerBlock}>
          <Text style={styles.overlayTitle}>OCR identification</Text>
          <Text style={styles.overlayText}>Center the full document inside the frame, then take the photo so we can read the text.</Text>
        </View>
        <View style={styles.frame} />
        <View style={styles.actions}>
          <AppButton label={isProcessing ? "Processing..." : "Capture document"} onPress={() => void handleCapture()} loading={isProcessing} />
          <AppButton label="Cancel" variant="ghost" onPress={() => router.back()} disabled={isProcessing} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  permissionLayout: {
    justifyContent: "center",
  },
  permissionCard: {
    gap: spacing.md,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: "center",
  },
  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: spacing.xl,
    backgroundColor: "rgba(11,31,58,0.28)",
  },
  headerBlock: {
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  overlayTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  overlayText: {
    color: colors.white,
    textAlign: "center",
    lineHeight: 22,
  },
  frame: {
    alignSelf: "center",
    width: "88%",
    height: 280,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  actions: {
    gap: spacing.sm,
  },
});

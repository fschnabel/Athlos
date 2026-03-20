import { CameraView, useCameraPermissions } from "expo-camera";
import { requireOptionalNativeModule } from "expo-modules-core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { AppButton } from "@/components/AppButton";
import { Screen } from "@/components/Screen";
import { colors, spacing } from "@/constants/theme";
import { parseIdentificationScan } from "@/features/athletes/identificationParser";
import { useI18n } from "@/i18n";

type TextExtractorModule = {
  isSupported: boolean;
};

type TextExtractorApi = {
  isSupported: boolean;
  extractTextFromImage: (uri: string) => Promise<string[]>;
};

type ParsedScan = ReturnType<typeof parseIdentificationScan>;

type ConfirmedScan = {
  rawText: string;
  parsed: ParsedScan;
  signature: string;
};

const AUTO_CAPTURE_DELAY_MS = 1400;
const INITIAL_REQUIRED_CONFIRMATIONS = 2;
const MAX_CONFIRMATION_CAPTURES = 8;
const INITIAL_STATUS_MESSAGE = "Alinea la cedula dentro del marco. La app intentara leerla automaticamente.";

const getTextExtractorModule = (): TextExtractorModule | null =>
  requireOptionalNativeModule<TextExtractorModule>("ExpoTextExtractor");

const getTextExtractorApi = (): TextExtractorApi | null => {
  try {
    return require("expo-text-extractor") as TextExtractorApi;
  } catch {
    return null;
  }
};

const hasCompleteParsedData = (parsed: ParsedScan) => Boolean(parsed.firstName && parsed.lastName && parsed.birthDate && parsed.gender);

const buildScanSignature = (parsed: ParsedScan) =>
  [parsed.firstName ?? "", parsed.lastName ?? "", parsed.birthDate ?? "", parsed.gender ?? ""]
    .join("|")
    .toLowerCase();

const rankConfirmedScans = (samples: ConfirmedScan[]) => {
  const ranked = new Map<string, { count: number; sample: ConfirmedScan }>();

  samples.forEach((sample) => {
    const existing = ranked.get(sample.signature);
    if (existing) {
      existing.count += 1;
      existing.sample = sample;
      return;
    }

    ranked.set(sample.signature, { count: 1, sample });
  });

  return [...ranked.values()].sort((left, right) => right.count - left.count);
};

const selectBestConfirmedScan = (samples: ConfirmedScan[]) => rankConfirmedScans(samples).at(0);

export default function AthleteScanIdScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const params = useLocalSearchParams<{ returnTo?: string; id?: string }>();
  const cameraRef = useRef<CameraView | null>(null);
  const confirmationSamplesRef = useRef<ConfirmedScan[]>([]);
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [rawText, setRawText] = useState("");
  const [debugVisible, setDebugVisible] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState(INITIAL_STATUS_MESSAGE);
  const [confirmedReads, setConfirmedReads] = useState(0);
  const [verificationTarget, setVerificationTarget] = useState(INITIAL_REQUIRED_CONFIRMATIONS);

  const parsed = rawText ? parseIdentificationScan(rawText) : null;

  const resetVerification = () => {
    confirmationSamplesRef.current = [];
    setConfirmedReads(0);
    setVerificationTarget(INITIAL_REQUIRED_CONFIRMATIONS);
  };

  const handleContinue = (nextRawText: string) => {
    const nextParsed = parseIdentificationScan(nextRawText);

    router.replace({
      pathname: (params.returnTo ?? "/athletes/create") as never,
      params: {
        ...(params.id ? { id: params.id } : {}),
        ...(nextParsed.firstName ? { firstName: nextParsed.firstName } : {}),
        ...(nextParsed.lastName ? { lastName: nextParsed.lastName } : {}),
        ...(nextParsed.birthDate ? { birthDate: nextParsed.birthDate } : {}),
        ...(nextParsed.gender ? { gender: nextParsed.gender } : {}),
      },
    } as never);
  };

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) {
      return;
    }

    const textExtractorModule = getTextExtractorModule();
    const textExtractorApi = getTextExtractorApi();
    setLastError(null);

    if (!textExtractorModule || !textExtractorApi) {
      const message = t("athletes.scan.unavailableMessage");
      setLastError(message);
      setStatusMessage(message);
      setDebugVisible(true);
      return;
    }

    if (!textExtractorModule.isSupported || !textExtractorApi.isSupported) {
      const message = t("athletes.scan.unsupportedMessage");
      setLastError(message);
      setStatusMessage(message);
      setDebugVisible(true);
      return;
    }

    setIsProcessing(true);
    setStatusMessage("Analizando la cedula...");

    try {
      const picture = await cameraRef.current.takePictureAsync({ quality: 0.8, skipProcessing: false, shutterSound: false });

      if (!picture.uri) {
        throw new Error("No image URI returned by camera.");
      }

      const detectedLines = await textExtractorApi.extractTextFromImage(picture.uri);
      const nextRawText = detectedLines.join("\n");
      const nextParsed = parseIdentificationScan(nextRawText);
      setRawText(nextRawText);

      if (hasCompleteParsedData(nextParsed)) {
        const nextSample: ConfirmedScan = {
          rawText: nextRawText,
          parsed: nextParsed,
          signature: buildScanSignature(nextParsed),
        };

        const nextSamples = [...confirmationSamplesRef.current, nextSample].slice(-MAX_CONFIRMATION_CAPTURES);
        confirmationSamplesRef.current = nextSamples;
        setConfirmedReads(nextSamples.length);

        const bestMatch = selectBestConfirmedScan(nextSamples);
        const matchingCount = bestMatch?.count ?? 0;

        if (matchingCount >= 2 && bestMatch) {
          setRawText(bestMatch.sample.rawText);
          handleContinue(bestMatch.sample.rawText);
          return;
        }

        if (nextSamples.length >= MAX_CONFIRMATION_CAPTURES && bestMatch) {
          setRawText(bestMatch.sample.rawText);
          handleContinue(bestMatch.sample.rawText);
          return;
        }

        const nextTarget = Math.min(Math.max(INITIAL_REQUIRED_CONFIRMATIONS, nextSamples.length + 1), MAX_CONFIRMATION_CAPTURES);
        setVerificationTarget(nextTarget);
        const remainingChecks = nextTarget - nextSamples.length;
        setStatusMessage(`Datos detectados. Aun no coinciden las lecturas. Verificando ${remainingChecks} lectura${remainingChecks === 1 ? "" : "s"} adicional${remainingChecks === 1 ? "" : "es"}.`);
        setIsProcessing(false);
        return;
      }

      setStatusMessage("Aun no tenemos todos los datos. Ajusta el encuadre para ver nombres, fecha y sexo.");
      setIsProcessing(false);
    } catch (error) {
      const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
      setLastError(message);
      setStatusMessage("Ocurrio un error al leer la cedula. Revisa el diagnostico.");
      setDebugVisible(true);
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!permission?.granted || !cameraReady || debugVisible || isProcessing) {
      return;
    }

    const timeout = setTimeout(() => {
      void handleCapture();
    }, AUTO_CAPTURE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [cameraReady, debugVisible, isProcessing, permission?.granted, rawText]);

  if (!permission) {
    return (
      <Screen contentContainerStyle={styles.centered}>
        <Text style={styles.title}>{t("athletes.scan.preparing")}</Text>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <Screen contentContainerStyle={styles.permissionLayout}>
        <View style={styles.permissionCard}>
          <Text style={styles.title}>{t("athletes.scan.permissionTitle")}</Text>
          <Text style={styles.subtitle}>{t("athletes.scan.permissionSubtitle")}</Text>
          <AppButton label={t("athletes.scan.allow")} onPress={() => void requestPermission()} />
          <AppButton label={t("common.back")} variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (debugVisible) {
    return (
      <Screen>
        <View style={styles.debugHeader}>
          <Text style={styles.title}>Diagnostico OCR</Text>
          <Text style={styles.subtitle}>Aqui puedes ver el error real, el texto detectado y los campos interpretados.</Text>
        </View>

        {lastError ? (
          <View style={styles.debugCard}>
            <Text style={styles.debugTitle}>Ultimo error</Text>
            <Text style={styles.debugText}>{lastError}</Text>
          </View>
        ) : null}

        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Campos detectados</Text>
          <Text style={styles.debugText}>Nombres: {parsed?.firstName ?? "-"}</Text>
          <Text style={styles.debugText}>Apellidos: {parsed?.lastName ?? "-"}</Text>
          <Text style={styles.debugText}>Fecha de nacimiento: {parsed?.birthDate ?? "-"}</Text>
          <Text style={styles.debugText}>Genero: {parsed?.gender ?? "-"}</Text>
          <Text style={styles.debugText}>Lecturas completas: {confirmedReads}/{verificationTarget}</Text>
        </View>

        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Texto OCR crudo</Text>
          <ScrollView style={styles.debugScroll} contentContainerStyle={styles.debugScrollContent}>
            <Text style={styles.rawText}>{rawText || "No hay texto OCR capturado todavia."}</Text>
          </ScrollView>
        </View>

        <View style={styles.actions}>
          {rawText ? <AppButton label={t("common.useData")} onPress={() => handleContinue(rawText)} /> : null}
          <AppButton
            label={t("common.tryAgain")}
            variant="secondary"
            onPress={() => {
              resetVerification();
              setDebugVisible(false);
              setIsProcessing(false);
              setLastError(null);
              setRawText("");
              setStatusMessage(INITIAL_STATUS_MESSAGE);
            }}
          />
          <AppButton label={t("common.back")} variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" onCameraReady={() => setCameraReady(true)} />
      <View style={styles.overlay}>
        <View style={styles.headerBlock}>
          <Text style={styles.overlayTitle}>{t("athletes.scan.title")}</Text>
          <Text style={styles.overlayText}>{t("athletes.scan.subtitle")}</Text>
          <Text style={styles.overlayStatus}>{isProcessing ? "Procesando imagen..." : statusMessage}</Text>
          {confirmedReads > 0 ? <Text style={styles.overlayProgress}>Lecturas confirmadas: {confirmedReads}/{verificationTarget}</Text> : null}
        </View>
        <View style={styles.frame} />
        <View style={styles.actions}>
          <AppButton label="Ver diagnostico" variant="secondary" onPress={() => setDebugVisible(true)} disabled={!lastError && !rawText} />
          <AppButton
            label={t("common.cancel")}
            variant="ghost"
            onPress={() => {
              resetVerification();
              router.back();
            }}
            disabled={isProcessing}
          />
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
  overlayStatus: {
    color: colors.accentMuted,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "600",
  },
  overlayProgress: {
    color: colors.white,
    textAlign: "center",
    fontWeight: "700",
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
  debugHeader: {
    gap: spacing.sm,
  },
  debugCard: {
    gap: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  debugTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  debugText: {
    color: colors.text,
  },
  debugScroll: {
    maxHeight: 280,
  },
  debugScrollContent: {
    paddingBottom: spacing.sm,
  },
  rawText: {
    color: colors.text,
    fontFamily: "monospace",
    lineHeight: 20,
  },
});

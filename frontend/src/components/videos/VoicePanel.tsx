"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VOICE_OPTIONS, defaultVoiceForLanguage } from "@/lib/voices";
import type { ScriptJson } from "@/types/script";
import styles from "./VoicePanel.module.css";

type CustomInputMode = "record" | "upload";

export function VoicePanel({
  videoId,
  script,
  initialAudioPath,
  initialVoiceId,
  initialProvider,
  nicheDefaultVoice,
  initialStatus,
  onAudioChange,
}: {
  videoId: string;
  script: ScriptJson;
  initialAudioPath: string | null;
  initialVoiceId: string | null;
  initialProvider: string | null;
  nicheDefaultVoice: string;
  initialStatus: string;
  onAudioChange?: (audioPath: string | null) => void;
}) {
  const defaultTab = initialVoiceId === "custom" ? "custom" : "ai";
  const [customInputMode, setCustomInputMode] = useState<CustomInputMode>("record");

  // AI Voice state
  const [selectedVoice, setSelectedVoice] = useState(
    initialVoiceId && initialVoiceId !== "custom"
      ? initialVoiceId
      : defaultVoiceForLanguage(script.language, nicheDefaultVoice),
  );
  const [audioPath, setAudioPath] = useState(initialAudioPath);
  const [provider, setProvider] = useState(initialProvider);
  const [generating, setGenerating] = useState(initialStatus === "VOICING");
  const [aiError, setAiError] = useState("");

  // Custom Voice state
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState<Blob | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [customError, setCustomError] = useState("");
  const [customSuccess, setCustomSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const pollStatus = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}/status`);
    const data = await res.json();
    if (!res.ok) return;
    const v = data.video;
    if (v.audioPath) { setAudioPath(v.audioPath); onAudioChange?.(v.audioPath); }
    if (v.voiceProvider) setProvider(v.voiceProvider);
    if (v.voiceId) setSelectedVoice(v.voiceId);
    if (v.errorMessage) setAiError(v.errorMessage);
    return v.status as string;
  }, [videoId, onAudioChange]);

  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(async () => {
      const s = await pollStatus();
      if (s && s !== "VOICING") setGenerating(false);
    }, 2000);
    return () => clearInterval(interval);
  }, [generating, pollStatus]);

  async function handleGenerate() {
    setGenerating(true);
    setAiError("");
    try {
      const res = await fetch(`/api/videos/${videoId}/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId: selectedVoice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Voice generation failed");
      const newPath = data.audioUrl ?? `/api/videos/${videoId}/audio`;
      setAudioPath(newPath);
      onAudioChange?.(newPath);
      setProvider(data.provider);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Voice generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function downloadScript() {
    const blob = new Blob([script.full_script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.title ?? "script"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function startRecording() {
    setCustomError("");
    setRecorded(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        setRecorded(new Blob(chunksRef.current, { type: mimeType }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRecording(true);
    } catch {
      setCustomError("Microphone access denied. Allow mic access in browser settings.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function uploadAudio(blob: Blob, filename: string) {
    setUploading(true);
    setCustomError("");
    setCustomSuccess(false);
    try {
      const form = new FormData();
      form.append("audio", blob, filename);
      const res = await fetch(`/api/videos/${videoId}/audio`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      const path = `/api/videos/${videoId}/audio`;
      setAudioPath(path);
      onAudioChange?.(path);
      setCustomSuccess(true);
    } catch (err) {
      setCustomError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const relevantVoices = VOICE_OPTIONS.filter((v) =>
    v.language === script.language,
  );
  const voices = relevantVoices.length > 0 ? relevantVoices : VOICE_OPTIONS;

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.panelEyebrow}>Step 1</p>
          <h2 className={styles.panelTitle}>Voice</h2>
        </div>
        {provider && (
          <Badge variant={provider === "custom" ? "secondary" : "info"}>
            {provider === "custom" ? "Custom upload" : provider === "google" ? "Google Cloud TTS" : "edge-tts"}
          </Badge>
        )}
      </div>

      {/* Mode tabs — shadcn Tabs component */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full mb-5">
          <TabsTrigger value="ai" className="flex-1">🤖 AI Voice</TabsTrigger>
          <TabsTrigger value="custom" className="flex-1">🎙️ Custom Voice</TabsTrigger>
        </TabsList>

        {/* ── AI Voice ───────────────────────────────── */}
        <TabsContent value="ai">
          <div className={styles.voiceGrid}>
            {voices.map((voice) => (
              <button
                key={voice.id}
                type="button"
                className={`${styles.voiceCard} ${selectedVoice === voice.id ? styles.voiceCardActive : ""}`}
                onClick={() => setSelectedVoice(voice.id)}
                disabled={generating}
              >
                <span className={styles.voiceLabel}>{voice.label}</span>
                <span className={styles.voiceDesc}>{voice.description}</span>
                <span className={styles.voiceId}>{voice.id}</span>
              </button>
            ))}
          </div>

          {aiError && <p className={styles.errorMsg}>{aiError}</p>}

          <Button
            className="w-full"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating…" : audioPath ? "↻ Regenerate Voice" : "Generate Voice →"}
          </Button>

          {generating && <p className={styles.statusHint}>Converting script to speech…</p>}
        </TabsContent>

        {/* ── Custom Voice ────────────────────────────── */}
        <TabsContent value="custom">
          <div className={styles.customSection}>
            {/* Script display */}
            <div className={styles.scriptBox}>
              <div className={styles.scriptBoxTop}>
                <span className={styles.scriptBoxLabel}>Script to record</span>
                <Button variant="outline" size="sm" onClick={downloadScript}>
                  ↓ Download .txt
                </Button>
              </div>
              <pre className={styles.scriptText}>{script.full_script}</pre>
            </div>

            {/* Input mode toggle — shadcn Tabs */}
            <div>
              <p className={styles.inputModeLabel}>How would you like to add audio?</p>
              <Tabs
                value={customInputMode}
                onValueChange={(v) => {
                  setCustomInputMode(v as CustomInputMode);
                  setCustomError("");
                  setCustomSuccess(false);
                  if (v === "upload") stopRecording();
                }}
                className="w-full"
              >
                <TabsList className="w-full mt-2">
                  <TabsTrigger value="record" className="flex-1">🎙️ Record Live</TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1">📁 Upload File</TabsTrigger>
                </TabsList>

                {/* Record */}
                <TabsContent value="record" className={styles.inputArea}>
                  <p className={styles.modeHint}>
                    Read the script above aloud — record directly in your browser.
                  </p>
                  {!recording ? (
                    <Button
                      variant="danger"
                      onClick={startRecording}
                      disabled={uploading}
                    >
                      <span className={styles.recordDot} /> Start Recording
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={stopRecording}>
                      ■ Stop Recording
                    </Button>
                  )}

                  {recorded && !recording && (
                    <div className={styles.recordedPreview}>
                      <audio controls src={URL.createObjectURL(recorded)} className={styles.previewAudio} />
                      <Button
                        className="w-full"
                        onClick={() => uploadAudio(recorded, "recording.webm")}
                        disabled={uploading}
                      >
                        {uploading ? "Uploading…" : "Use This Recording →"}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Upload */}
                <TabsContent value="upload" className={styles.inputArea}>
                  <p className={styles.modeHint}>
                    Supported formats: .mp3 · .wav · .m4a · .webm · .ogg
                  </p>
                  <label className={styles.fileDropZone}>
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,.webm,.ogg,audio/*"
                      className={styles.fileInput}
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setUploadFile(f);
                        setCustomSuccess(false);
                        setCustomError("");
                      }}
                    />
                    <span className={styles.fileDropIcon}>📂</span>
                    <span className={styles.fileDropText}>
                      {uploadFile ? uploadFile.name : "Click to choose audio file"}
                    </span>
                    <span className={styles.fileDropSub}>
                      {uploadFile
                        ? `${(uploadFile.size / 1024 / 1024).toFixed(1)} MB`
                        : "mp3 · wav · m4a · webm · ogg"}
                    </span>
                  </label>
                  {uploadFile && (
                    <Button
                      className="w-full"
                      onClick={() => uploadAudio(uploadFile, uploadFile.name)}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading…" : "Upload & Use →"}
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {customError && <p className={styles.errorMsg}>{customError}</p>}
            {customSuccess && <p className={styles.successMsg}>✓ Audio saved and ready.</p>}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview player */}
      {audioPath && !generating && (
        <div className={styles.player}>
          <span className={styles.playerLabel}>Preview</span>
          <audio controls src={audioPath} className={styles.audio} />
        </div>
      )}
    </div>
  );
}

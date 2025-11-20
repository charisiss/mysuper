"use client";

import React from "react";
import MicIcon from "@mui/icons-material/Mic";

export interface VoiceControls {
  isVoiceSupported: boolean;
  isListening: boolean;
  speechLang: "el-GR" | "en-US";
  onMicClick: () => void;
}

interface VoiceToggleButtonProps extends VoiceControls {}

const VoiceToggleButton: React.FC<VoiceToggleButtonProps> = ({
  isVoiceSupported,
  isListening,
  speechLang,
  onMicClick,
}) => {
  return (
    <button
      type="button"
      onClick={onMicClick}
      disabled={!isVoiceSupported}
      aria-pressed={isListening}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        !isVoiceSupported
          ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
          : !isListening
            ? "border-gray-300 bg-white text-gray-700"
            : speechLang === "el-GR"
              ? "border-blue-400 bg-blue-50 text-blue-700"
              : "border-green-400 bg-green-50 text-green-700"
      }`}
      title={
        !isVoiceSupported
          ? "Voice input not supported"
          : !isListening
            ? "Click to listen in Greek"
            : speechLang === "el-GR"
              ? "Click to switch to English"
              : "Click to stop listening"
      }
    >
      <MicIcon fontSize="small" />
      {!isVoiceSupported
        ? "Voice unavailable"
        : !isListening
          ? "Speak in Greek"
          : speechLang === "el-GR"
            ? "Switch to English"
            : "Stop voice"}
    </button>
  );
};

export default VoiceToggleButton;


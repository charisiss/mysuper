"use client";

import React from "react";
import MicIcon from "@mui/icons-material/Mic";
import { VoiceControls } from "./VoiceToggleButton";

interface VoiceMicButtonProps {
  voiceControls?: VoiceControls;
}

const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({ voiceControls }) => {
  if (!voiceControls) return null;

  return (
    <button
      onClick={voiceControls.onMicClick}
      disabled={!voiceControls.isVoiceSupported}
      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 p-0 font-semibold shadow-lg transition hover:-translate-y-0.5 ${
        !voiceControls.isVoiceSupported
          ? "border-gray-200 text-gray-300 shadow-gray-200/30"
          : voiceControls.isListening
            ? voiceControls.speechLang === "el-GR"
              ? "border-blue-600 text-blue-600 shadow-blue-300/30 hover:shadow-blue-400/50"
              : "border-green-600 text-green-600 shadow-green-300/30 hover:shadow-green-400/50"
            : "border-gray-600 text-gray-600 shadow-gray-300/30 hover:border-gray-800 hover:text-gray-800 hover:shadow-gray-400/50"
      }`}
      title={
        !voiceControls.isVoiceSupported
          ? "Voice input not supported"
          : !voiceControls.isListening
            ? "Click to listen"
            : voiceControls.speechLang === "el-GR"
              ? "Listening in Greek - Click to switch to English"
              : "Listening in English - Click to stop"
      }
    >
      <MicIcon className="h-5 w-5" />
    </button>
  );
};

export default VoiceMicButton;


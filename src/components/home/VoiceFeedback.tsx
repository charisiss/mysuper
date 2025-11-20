"use client";

import React from "react";

interface VoiceFeedbackProps {
  message: string | null;
}

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="pointer-events-none fixed bottom-16 left-0 right-0 z-20 flex justify-center px-4">
      <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow">
        {message}
      </div>
    </div>
  );
};

export default VoiceFeedback;



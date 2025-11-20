"use client";

import React, { useEffect, useState } from "react";

interface VoiceFeedbackProps {
  message: string | null;
}

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({ message }) => {
  const [displayMessage, setDisplayMessage] = useState<string | null>(message);

  useEffect(() => {
    // Update display message when message prop changes
    if (message) {
      setDisplayMessage(message);
      // Clear message after 3 seconds
      const timer = setTimeout(() => {
        setDisplayMessage(null);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setDisplayMessage(null);
    }
  }, [message]);

  if (!displayMessage) return null;

  return (
    <div className="pointer-events-none fixed bottom-28 left-0 right-0 z-20 flex justify-center px-4">
      <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow">
        {displayMessage}
      </div>
    </div>
  );
};

export default VoiceFeedback;



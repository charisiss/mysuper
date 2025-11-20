"use client";

import React from "react";
import { CircularProgress } from "@mui/material";

const LoadingState: React.FC = () => {
  return (
    <div className="flex h-svh flex-col items-center justify-center">
      <CircularProgress />
    </div>
  );
};

export default LoadingState;



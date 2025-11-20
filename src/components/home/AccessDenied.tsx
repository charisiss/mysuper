"use client";

import React from "react";

const AccessDenied: React.FC = () => {
  return (
    <div className="flex h-svh flex-col justify-center">
      <p className="text-center text-2xl font-bold">ACCESS DENIED</p>
      <p className="text-center">
        You do not have permission to view this page.
      </p>
    </div>
  );
};

export default AccessDenied;



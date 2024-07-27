// layout.tsx
import React from "react";
import { AuthProvider } from "./AuthContext";
import "./globals.css";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/images/mysuper.png" />
        </head>
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
};

export default Layout;

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
          <title>My Super App</title>
          <meta
            name="description"
            content="This is a supermarket managment app."
          />
          <meta name="author" content="Charisis Samaras" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </head>
        <body>{children}</body>
      </html>
    </AuthProvider>
  );
};

export default Layout;

// layout.tsx
import React from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "./AuthContext";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <link rel="icon" href="/images/mysuper.png" />
        <title>My Super App</title>
        <meta
          name="description"
          content="This is a supermarket managment app."
        />
        <meta name="author" content="Charisis Samaras" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
};

export default Layout;

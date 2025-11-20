"use client";

import React from "react";

import { useAuth } from "@/app/AuthContext";
import Login from "@/components/Login";
import AccessDenied from "@/components/home/AccessDenied";
import HomeContent from "@/components/home/HomeContent";
import LoadingState from "@/components/home/LoadingState";
import { HomeProvider } from "@/contexts/HomeContext";

const allowedEmails = ["charisissam@gmail.com", "panos9409@gmail.com"];

const Home: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Login />;
  }

  if (!allowedEmails.includes(user.email ?? "")) {
    return <AccessDenied />;
  }

  return (
    <HomeProvider>
      <HomeContent />
    </HomeProvider>
  );
};

export default Home;



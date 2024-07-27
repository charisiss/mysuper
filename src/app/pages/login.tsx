// /pages/login.tsx
import React from "react";
import Login from "@/components/Login"; // Adjust the path as needed
import { useRouter } from "next/router";
import { useAuth } from "@/app/AuthContext";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useAuth();

  // Redirect to the main page if the user is already logged in
  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <Login
        onLogin={(user) => {
          setUser(user);
          router.push("/"); // Redirect to the home page or another protected page
        }}
      />
    </div>
  );
};

export default LoginPage;

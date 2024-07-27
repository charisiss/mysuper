import React from "react";
import Login from "@/components/Login";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/AuthContext";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { user, setUser } = useAuth();

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
          router.push("/");
        }}
      />
    </div>
  );
};

export default LoginPage;

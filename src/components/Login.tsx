// components/Login.tsx
import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, googleProvider } from "@/app/firebaseConfig";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Login: React.FC = () => {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      // The signed-in user info.
      const user = result.user;
      console.log(user); // For debugging

      // Redirect to home or other page after successful login
      router.push("/");
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };

  return (
    <div className="login-container flex h-svh flex-col items-center justify-center">
      <Image
        src={"/images/mysuper.png"}
        alt="My Super Image"
        width={100}
        height={100}
      />

      <h1 className="text-center text-2xl font-black">My Super App</h1>
      <h6 className="text-center text-sm">Created By Charisiss</h6>
      <button
        onClick={handleGoogleSignIn}
        className="google-login-button mt-4 rounded-lg bg-primary px-4 py-2 font-bold uppercase text-white"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;

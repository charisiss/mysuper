import React from "react";
import { signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { auth, googleProvider } from "@/app/firebaseConfig";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/app/AuthContext"; // Adjust the path to where your authContext is located

interface LoginProps {
  onLogin?: (user: User | null) => void; // Define the prop type
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log(user); // For debugging

      // Update the user state
      setUser(user);

      // Call the onLogin function if it is provided
      if (onLogin) {
        onLogin(user);
      }

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

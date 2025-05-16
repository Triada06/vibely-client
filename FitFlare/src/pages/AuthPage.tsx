import { useState } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Authentication() {
  const [emailOrUserName, setEmailOrUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await fetch("https://localhost:7014/api/appuser/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrUserName, passWord }),
      });

      if (!res.ok) throw new Error(await res.text());
      
      const data = await res.text();
      useAuthStore.getState().setToken(data);
      console.log(data);

      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    }
  };

  console.log(passWord);
  console.log(emailOrUserName);
  
  
  const backgroundImage = useMotionTemplate`radial-gradient(100% 100% at 50% 0%, 
    var(--gradient-start) 0%, var(--gradient-middle) 50%, var(--gradient-end) 100%)`;

  return (
    <motion.section
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundImage }}
      animate={{ backgroundPosition: "50% 100%" }}
      transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
    >
      <div className="absolute inset-0 bg-[var(--bg-light)] bg-opacity-80 backdrop-blur-md z-0" />

      <form className="relative z-10 max-w-md w-full space-y-6 p-8 rounded-2xl shadow-lg border border-[var(--primary-light)] bg-white/5 backdrop-blur-xl text-[var(--text-light)]">
        <h2 className="text-center text-2xl font-bold text-[var(--primary-light)]">
          Sign in to your account
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={emailOrUserName}
              onChange={(e) => setEmailOrUserName(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] bg-transparent text-[var(--text-light)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={passWord}
              onChange={(e) => setPassWord(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] bg-transparent text-[var(--text-light)]"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
          )}

          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-2 px-4 rounded-xl bg-[var(--primary-light)] text-white font-semibold hover:opacity-90 transition-all"
          >
            Sign in
          </button>
        </div>
      </form>
    </motion.section>
  );
}

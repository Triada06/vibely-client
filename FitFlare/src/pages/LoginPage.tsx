import { useState } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Authentication() {
  const [emailOrUserName, setEmailOrUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isEmail = emailOrUserName.includes("@");
  const isFormValid =
    emailOrUserName &&
    passWord &&
    (!isEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUserName));

  const handleLogin = async () => {
    if (!isFormValid) {
      setError("Please fill in all fields with valid data.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("https://localhost:7014/api/appuser/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailOrUserName, passWord }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);

        const message =
          typeof errorBody === "string"
            ? errorBody
            : errorBody?.detail || errorBody?.title || "Something went wrong.";

        throw new Error(message);
      }

      const data = await res.text();
      useAuthStore.getState().setToken(data);
      console.log(data);

      navigate("/");
    } catch (err: any) {
      console.log(err.message);
      setError(err.message || "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const backgroundImage = useMotionTemplate`radial-gradient(100% 100% at 50% 0%, 
    var(--gradient-start) 0%, var(--gradient-middle) 50%, var(--gradient-end) 100%)`;

  return (
    <motion.section
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage,
        backgroundSize: "100% 200%",
        backgroundRepeat: "no-repeat",
      }}
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
              Email address or Username
            </label>
            <input
              id="email"
              type="text"
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={passWord}
                onChange={(e) => setPassWord(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] bg-transparent text-[var(--text-light)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-light)]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
          )}

          <p>
            Don't have an account yet?{" "}
            <Link to="/signup" className="text-[#4B3F72] ">
              Sign up now
            </Link>
          </p>

          <button
            type="button"
            onClick={handleLogin}
            disabled={!isFormValid || loading}
            className={`w-full py-2 px-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition-all ${
              isFormValid && !loading
                ? "bg-[var(--primary-light)] text-white hover:opacity-90"
                : "bg-gray-400 cursor-not-allowed text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>
      </form>
    </motion.section>
  );
}

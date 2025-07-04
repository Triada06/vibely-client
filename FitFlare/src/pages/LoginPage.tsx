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
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "sent">("email");
  const [forgotError, setForgotError] = useState("");
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
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/appuser/signin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailOrUserName, passWord }),
        }
      );

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

  // Send forgot password API request
  const handleSendResetEmail = async () => {
    setForgotError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/account/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail }),
        }
      );
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const message =
          errorBody?.detail || errorBody?.title || "Something went wrong.";
        throw new Error(message);
      }
      setForgotStep("sent");
    } catch (err: any) {
      setForgotError(err.message || "Something went wrong. Try again later.");
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
      <div className="absolute inset-0 bg-[var(--bg-light)] bg-opacity-30 backdrop-blur-md z-0" />

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
            <button
              type="button"
              className="mt-2 text-xs text-[var(--primary-light)] hover:underline focus:outline-none"
              onClick={() => {
                setShowForgotModal(true);
                setForgotStep("email");
                setForgotEmail("");
                setForgotError("");
              }}
            >
              Forgot password?
            </button>
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

      {/* Forgot Password Modal Flow */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
            {forgotStep === "email" && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-[var(--primary-light)]">
                  Reset Password
                </h3>
                <p className="mb-4 text-gray-700">
                  Enter your email address to receive a password reset link.
                </p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full px-4 py-2 mb-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
                />
                {forgotError && (
                  <div className="text-red-500 text-sm mb-2">{forgotError}</div>
                )}
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-xl font-semibold text-white bg-[var(--primary-light)] hover:opacity-90 transition"
                    onClick={handleSendResetEmail}
                  >
                    Send Reset Link
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
            {forgotStep === "sent" && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-[var(--primary-light)]">
                  Check Your Email
                </h3>
                <p className="mb-6 text-gray-700">
                  A password reset link has been sent to{" "}
                  <span className="font-semibold">{forgotEmail}</span>.<br />
                  Please check your inbox and follow the instructions.
                </p>
                <button
                  className="w-full py-2 px-4 rounded-xl font-semibold text-white bg-[var(--primary-light)] hover:opacity-90 transition"
                  onClick={() => setShowForgotModal(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </motion.section>
  );
}

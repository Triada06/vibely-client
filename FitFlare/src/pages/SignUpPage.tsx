import { useState } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [passWord, setPassWord] = useState("");
  const [confirmPassWord, setConfirmPassWord] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [passWordErrors, setPassWordErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError("Email is required.");
    } else if (!emailRegex.test(value)) {
      setEmailError("Invalid email format.");
    } else {
      setEmailError(null);
    }
  };

  const validatePassword = (value: string) => {
    const errors: string[] = [];

    if (value.trim().length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }

    if (!/[A-Z]/.test(value)) {
      errors.push("At least one uppercase letter needed.");
    }

    if (!/[a-z]/.test(value)) {
      errors.push("At least one lowercase letter needed.");
    }

    if (!/[0-9]/.test(value)) {
      errors.push("At least one number needed.");
    }

    setPassWordErrors(errors);
  };

  const checkPasswordMatch = () => {
    if (passWord === confirmPassWord) {
      setPasswordsMatch(true);
      setPassWordErrors((errs) =>
        errs.filter((err) => err !== "Passwords don't match")
      );
    } else {
      setPasswordsMatch(false);
      setPassWordErrors((errs) => [
        ...errs.filter((err) => err !== "Passwords don't match"),
        "Passwords don't match",
      ]);
    }
  };

  const isFormValid =
    email &&
    userName &&
    passWord &&
    confirmPassWord &&
    passwordsMatch &&
    passWordErrors.length === 0 &&
    !emailError;

  const backgroundImage = useMotionTemplate`radial-gradient(100% 100% at 50% 0%, 
    var(--gradient-start) 0%, var(--gradient-middle) 50%, var(--gradient-end) 100%)`;

  const handleSignUp = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("https://localhost:7014/api/appuser/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userName, email, passWord }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Something went wrong.");
      }

      const data = await res.json();
      useAuthStore.getState().setToken(data.token); // Store the token
      console.log("Token stored:", data.token);

      navigate("/"); // Redirect to the home page
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

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
          Create a new account
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] bg-transparent text-[var(--text-light)]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              onBlur={(e) => validateEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] bg-transparent text-[var(--text-light)]"
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
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
                onChange={(e) => {
                  setPassWord(e.target.value);
                  validatePassword(e.target.value);
                }}
                onBlur={(e) => validatePassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] bg-transparent text-[var(--text-light)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform hover:cursor-pointer text-[var(--primary-light)]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassWord"
              className="block text-sm font-medium"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassWord"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassWord}
                onChange={(e) => {
                  setConfirmPassWord(e.target.value);
                  checkPasswordMatch();
                }}
                onBlur={() => checkPasswordMatch()}
                autoComplete="new-password"
                className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)] bg-transparent text-[var(--text-light)]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transform hover:cursor-pointer text-[var(--primary-light)]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
          )}
          {passWordErrors.length > 0 && (
            <ul className="text-red-500 text-sm mt-1">
              {passWordErrors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          )}

          <p>
            Already registered?{" "}
            <Link to="/login" className="text-[#4B3F72]">
              Sign in
            </Link>
          </p>

          <button
            type="button"
            onClick={() => {
              checkPasswordMatch();
              handleSignUp();
            }}
            disabled={!isFormValid || loading}
            className={`w-full py-2 px-4 rounded-xl font-semibold text-white transition ${
              isFormValid && !loading
                ? "bg-[var(--primary-light)] hover:opacity-90"
                : "bg-gray-400 cursor-not-allowed"
            } flex items-center justify-center gap-2`}
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            Sign Up
          </button>
        </div>
      </form>
    </motion.section>
  );
}

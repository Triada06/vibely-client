import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/account/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            token,
            newPassword,
            confirmPassword,
          }),
        }
      );
      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const message =
          errorBody?.detail || errorBody?.title || "Something went wrong.";
        throw new Error(message);
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
          <h2 className="text-xl font-semibold mb-4 text-[var(--primary-light)]">
            Invalid Link
          </h2>
          <p className="text-gray-700 mb-4">
            The reset password link is invalid or missing required information.
          </p>
          <button
            className="w-full py-2 px-4 rounded-xl font-semibold text-white bg-[var(--primary-light)] hover:opacity-90 transition"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)] bg-opacity-30">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-sm w-full text-center">
        {success ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-[var(--primary-light)]">
              Password Reset Successful
            </h2>
            <p className="text-gray-700 mb-6">
              Your password has been reset. You can now log in with your new
              password.
            </p>
            <button
              className="w-full py-2 px-4 rounded-xl font-semibold text-white bg-[var(--primary-light)] hover:opacity-90 transition"
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-[var(--primary-light)]">
              Set New Password
            </h2>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]"
            />
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-xl font-semibold text-white bg-[var(--primary-light)] hover:opacity-90 transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

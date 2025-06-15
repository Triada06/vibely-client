import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function EmailConfirmedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const userId = searchParams.get("userId");
        const token = searchParams.get("token");
        if (!userId || !token) {
          setStatus("error");
          setErrorMessage("Invalid confirmation link");
          return;
        }
        const encodedToken = encodeURIComponent(token ?? "");

        const response = await fetch(
          `https://localhost:7014/api/appuser/${userId}/confirmemail?token=${encodedToken}`
        );
        console.log(token);

        if (!response.ok) {
          throw new Error("Failed to confirm email");
        }

        setStatus("success");

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setErrorMessage("Failed to confirm email. Please try again later.");
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1a1a] px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-[#2a2a2a] rounded-xl shadow-lg">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#893168] dark:border-[#b794f4] mx-auto"></div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-[#eaeaea]">
              Confirming your email...
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#a0a0a0]">
              Please wait while we verify your email address.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#f0e6f0] dark:bg-[#2a2a2a]">
              <svg
                className="h-6 w-6 text-[#893168] dark:text-[#b794f4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-[#eaeaea]">
              Email Confirmed!
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#a0a0a0]">
              Your email has been successfully confirmed. Redirecting to
              login...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#f0e6e6] dark:bg-[#2a2a2a]">
              <svg
                className="h-6 w-6 text-[#893168] dark:text-[#b794f4]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-[#eaeaea]">
              Confirmation Failed
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-[#a0a0a0]">
              {errorMessage}
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#893168] hover:bg-[#7a2e5a] dark:bg-[#b794f4] dark:hover:bg-[#a67ef0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#893168] dark:focus:ring-[#b794f4]"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

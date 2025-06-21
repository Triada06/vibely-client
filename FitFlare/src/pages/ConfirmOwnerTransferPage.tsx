import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function ConfirmOwnerTransferPage() {
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState(
    "Verifying your request, please wait..."
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transferToken = searchParams.get("token");

    if (!transferToken) {
      setStatus("error");
      setMessage("Error: No transfer token found in the URL.");
      return;
    }

    const confirmTransfer = async () => {
      try {
        const response = await fetch(
          `https://localhost:7014/api/admin/admins/confirm-owner-transfer?token=${transferToken}`,
          {
            method: "GET",
          }
        );

        if (response.ok) {
          setStatus("success");
          setMessage(
            "Ownership transfer successful! You will be redirected shortly."
          );
          setTimeout(() => {
            navigate("/admin/admins");
          }, 3000);
        } else {
          const errorText = await response.text();
          setStatus("error");
          setMessage(
            `Error: ${errorText || "Failed to confirm ownership transfer."}`
          );
        }
      } catch (err) {
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
        console.error(err);
      }
    };

    confirmTransfer();
  }, [location, navigate]);

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl text-center max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Ownership Transfer Confirmation
        </h1>
        <p className={`text-lg ${getStatusColor()}`}>{message}</p>
        {status === "verifying" && (
          <div className="mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}

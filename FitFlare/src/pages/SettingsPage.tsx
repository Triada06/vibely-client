import {
  faSun,
  faMoon,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useProfileStore } from "../store/profileStore";
import { useSecurityStore } from "../store/securityStore";
import { useNavigate } from "react-router-dom";

const getToken = () => {
  return localStorage.getItem("token") || "";
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  const [theme, setTheme] = useState("light");
  const { profile, fetchUser } = useProfileStore();
  const [isProfilePrivate, setIsProfilePrivate] = useState(
    profile?.isPrivate || false
  );
  const [isConfirmingPassword, setIsConfirmingPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVerificationError, setPasswordVerificationError] = useState<
    string | null
  >(null);
  const [newPasswordErrors, setNewPasswordErrors] = useState<string[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const navigate = useNavigate();

  const {
    verifiedPasswordData,
    setVerifiedPasswordData,
    clearVerifiedPasswordData,
  } = useSecurityStore();

  useEffect(() => {
    if (profile) {
      setIsProfilePrivate(profile.isPrivate);
    }
  }, [profile]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");

    // Check cache on mount
    console.log("SettingsPage: Checking password verification cache on mount.");
    const tenMinutesAgo = Date.now() - 600000; // 10 minutes in milliseconds
    console.log(
      "SettingsPage: verifiedPasswordData from store:",
      verifiedPasswordData
    );

    if (
      verifiedPasswordData &&
      verifiedPasswordData.timestamp > tenMinutesAgo
    ) {
      console.log(
        "SettingsPage: Cache is valid. Setting showPasswordChange(true)."
      );
      setShowPasswordChange(true);
    } else {
      console.log(
        "SettingsPage: Cache is invalid or expired. Clearing cache and setting showPasswordChange(false)."
      );
      clearVerifiedPasswordData(); // Clear expired cache
      setShowPasswordChange(false); // Ensure confirmation is shown if cache is invalid
    }
  }, [verifiedPasswordData, clearVerifiedPasswordData]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const validateNewPassword = (value: string) => {
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

    setNewPasswordErrors(errors);
  };

  const checkNewPasswordMatch = (newPass: string, confirmPass: string) => {
    if (newPass === confirmPass) {
      setConfirmPasswordError(null);
    } else {
      setConfirmPasswordError("Passwords don't match.");
    }
  };

  const handleProfilePrivacyChange = async () => {
    const newPrivacyState = !isProfilePrivate;
    setIsProfilePrivate(newPrivacyState);
    try {
      const response = await fetch(
        "https://localhost:7014/api/appuser/me/changeprivacy",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ isPrivate: newPrivacyState }),
        }
      );
      if (!response.ok) {
        setIsProfilePrivate(!newPrivacyState);
        console.error("Failed to change profile privacy");
      } else {
        fetchUser();
      }
    } catch (error: any) {
      setIsProfilePrivate(!newPrivacyState);
      console.error("Error changing profile privacy:", error);
    }
  };

  const handlePasswordConfirmation = async () => {
    setIsConfirmingPassword(true);
    setPasswordVerificationError(null);
    const token = getToken();
    if (!token) {
      setIsConfirmingPassword(false);
      return;
    }

    try {
      const response = await fetch(
        "https://localhost:7014/api/appuser/me/verifypassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: currentPassword }),
        }
      );

      if (response.ok) {
        setVerifiedPasswordData(currentPassword);
        setShowPasswordChange(true);
        setCurrentPassword("");
        setPasswordVerificationError(null);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Password verification failed" }));
        const errorMsg = errorData.message || "Password verification failed";
        console.error("Password verification failed:", errorMsg);
        setPasswordVerificationError(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Error during password verification.";
      console.error(errorMsg);
      setPasswordVerificationError(errorMsg);
    } finally {
      setIsConfirmingPassword(false);
    }
  };

  const handlePasswordChange = async () => {
    validateNewPassword(newPassword);
    checkNewPasswordMatch(newPassword, confirmPassword);

    if (newPasswordErrors.length > 0 || confirmPasswordError) {
      return;
    }

    const tenMinutesAgo = Date.now() - 600000;
    const oldPasswordToUse =
      verifiedPasswordData && verifiedPasswordData.timestamp > tenMinutesAgo
        ? verifiedPasswordData.password
        : currentPassword;

    if (!oldPasswordToUse) {
      alert("Current password not available. Please verify.");
      return;
    }

    setIsChangingPassword(true);
    const token = getToken();
    if (!token) {
      console.error("Authentication token not found.");
      setIsChangingPassword(false);
      return;
    }

    try {
      const response = await fetch(
        "https://localhost:7014/api/appuser/me/security/changepassword",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: oldPasswordToUse,
            newPassword: newPassword,
          }),
        }
      );

      if (response.ok) {
        console.log("Password changed successfully!");
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setNewPasswordErrors([]);
        setConfirmPasswordError(null);
        clearVerifiedPasswordData();
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
        }, 2000);
        navigate("/profile");
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Password change failed" }));
        const errorMsg = errorData.message || "Password change failed";
        console.error("Password change failed:", errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Error during password change.";
      console.error(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccountConfirmation = async () => {
    setIsDeletingAccount(true);

    const tenMinutesAgo = Date.now() - 600000;
    const passwordToVerify =
      verifiedPasswordData && verifiedPasswordData.timestamp > tenMinutesAgo
        ? verifiedPasswordData.password
        : deletePassword;

    const token = getToken();
    if (!token) {
      console.error("Authentication token not found.");
      setIsDeletingAccount(false);
      return;
    }

    try {
      const response = await fetch("/api/appuser/me/verifypassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: passwordToVerify }),
      });

      if (response.ok) {
        console.log("Password confirmed. Proceeding with account deletion.");
        setShowDeleteConfirmation(false);
        setDeletePassword("");
        clearVerifiedPasswordData();
      } else {
        const errorData = await response.json().catch(() => ({
          message: "Password confirmation for deletion failed.",
        }));
        const errorMsg =
          errorData.message || "Password confirmation for deletion failed.";
        console.error("Password confirmation for deletion failed:", errorMsg);
      }
    } catch (error: any) {
      const errorMsg =
        error.message || "Error during delete account confirmation.";
      console.error(errorMsg);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const tenMinutesAgo = Date.now() - 600000;
  const isCacheValid =
    verifiedPasswordData && verifiedPasswordData.timestamp > tenMinutesAgo;

  return (
    <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 pb-20 h-full min-h-screen">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-[#232323] rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 animate-fade-in">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-4xl text-green-500"
            />
            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
              Password changed successfully!
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center gap-8 py-8">
          <h2 className="text-2xl font-semibold dark:text-[#EAEAEA]">
            Settings
          </h2>

          <div className="flex gap-4 border-b border-gray-300 dark:border-gray-700 w-full max-w-md">
            <button
              onClick={() => setActiveTab("general")}
              className={`pb-2 px-4 text-sm font-medium ${
                activeTab === "general"
                  ? "border-b-2 border-[#4B3F72] dark:border-[#B794F4] text-[#4B3F72] dark:text-[#B794F4]"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              General Settings
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`pb-2 px-4 text-sm font-medium ${
                activeTab === "security"
                  ? "border-b-2 border-[#4B3F72] dark:border-[#B794F4] text-[#4B3F72] dark:text-[#B794F4]"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Security Settings
            </button>
          </div>

          <div className="flex flex-col gap-6 w-full max-w-md">
            {activeTab === "general" && (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex md:hidden justify-between items-center">
                    <span className="text-sm font-medium dark:text-[#EAEAEA]">
                      Switch appearance
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="bg-gray-200 dark:bg-gray-700 rounded-full w-12 h-6 flex items-center transition-colors duration-300 relative"
                    >
                      <span
                        className={`bg-white dark:bg-gray-300 w-4 h-4 rounded-full transform transition-transform duration-300 ${
                          theme === "dark" ? "translate-x-6" : "translate-x-1"
                        }`}
                      ></span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium dark:text-[#EAEAEA]">
                        Profile Privacy
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isProfilePrivate
                          ? "Your profile is private"
                          : "Your profile is public"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs ${
                          isProfilePrivate
                            ? "text-gray-500 dark:text-gray-400"
                            : "text-[#4B3F72] dark:text-[#B794F4]"
                        }`}
                      >
                        Public
                      </span>
                      <button
                        onClick={handleProfilePrivacyChange}
                        className="bg-gray-200 dark:bg-gray-700 rounded-full w-12 h-6 flex items-center transition-colors duration-300 relative"
                      >
                        <span
                          className={`bg-white dark:bg-gray-300 w-4 h-4 rounded-full transform transition-transform duration-300 ${
                            isProfilePrivate ? "translate-x-6" : "translate-x-1"
                          }`}
                        ></span>
                      </button>
                      <span
                        className={`text-xs ${
                          isProfilePrivate
                            ? "text-[#4B3F72] dark:text-[#B794F4]"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        Private
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex md:hidden">
                  <button className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                    Logout
                  </button>
                </div>

                <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-red-500 mb-4">
                    Danger Zone
                  </h3>
                  {!showDeleteConfirmation ? (
                    <button
                      onClick={() => setShowDeleteConfirmation(true)}
                      className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                    >
                      Delete Account
                    </button>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <span className="text-sm font-medium dark:text-[#EAEAEA]">
                        Confirm password to delete account
                      </span>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]"
                        placeholder="Enter your password"
                      />
                      {isDeletingAccount && (
                        <span className="text-blue-500 text-sm">
                          Verifying password...
                        </span>
                      )}
                      {!isDeletingAccount && passwordVerificationError && (
                        <span className="text-red-500 text-sm">
                          {passwordVerificationError}
                        </span>
                      )}
                      <button
                        onClick={handleDeleteAccountConfirmation}
                        disabled={
                          isDeletingAccount ||
                          !deletePassword ||
                          passwordVerificationError !== null
                        }
                        className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeletingAccount
                          ? "Deleting..."
                          : "Confirm and Delete Account"}
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirmation(false);
                          setDeletePassword("");
                          setPasswordVerificationError(null);
                        }}
                        className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="flex flex-col gap-4">
                {!showPasswordChange ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="currentPassword"
                        className="text-sm font-medium dark:text-[#EAEAEA]"
                      >
                        Confirm Current Password
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]"
                      />
                    </div>

                    {isConfirmingPassword && (
                      <span className="text-blue-500 text-sm">
                        Verifying password...
                      </span>
                    )}
                    {!isConfirmingPassword && passwordVerificationError && (
                      <span className="text-red-500 text-sm">
                        {passwordVerificationError}
                      </span>
                    )}

                    <button
                      onClick={handlePasswordConfirmation}
                      disabled={isConfirmingPassword || !currentPassword}
                      className="w-full px-4 py-2 bg-[#4B3F72] hover:bg-[#3B2F62] dark:bg-[#B794F4] dark:hover:bg-[#A784E4] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isConfirmingPassword
                        ? "Verifying..."
                        : "Verify Password"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="newPassword"
                        className="text-sm font-medium dark:text-[#EAEAEA]"
                      >
                        New Password
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          validateNewPassword(e.target.value);
                          if (confirmPassword) {
                            checkNewPasswordMatch(
                              e.target.value,
                              confirmPassword
                            );
                          }
                        }}
                        onBlur={(e) => {
                          validateNewPassword(e.target.value);
                          checkNewPasswordMatch(
                            e.target.value,
                            confirmPassword
                          );
                        }}
                        className={`w-full px-3 py-2 rounded-lg border ${
                          newPasswordErrors.length > 0
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]`}
                      />
                      {newPasswordErrors.map((error, index) => (
                        <span key={index} className="text-red-500 text-sm mt-1">
                          {error}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium dark:text-[#EAEAEA]"
                      >
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          checkNewPasswordMatch(newPassword, e.target.value);
                        }}
                        onBlur={(e) =>
                          checkNewPasswordMatch(newPassword, e.target.value)
                        }
                        className={`w-full px-3 py-2 rounded-lg border ${
                          confirmPasswordError
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        } bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]`}
                      />
                      {confirmPasswordError && (
                        <span className="text-red-500 text-sm mt-1">
                          {confirmPasswordError}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handlePasswordChange}
                      disabled={
                        isChangingPassword ||
                        newPasswordErrors.length > 0 ||
                        confirmPasswordError !== null ||
                        !newPassword ||
                        !confirmPassword
                      }
                      className="w-full px-4 py-2 bg-[#4B3F72] hover:bg-[#3B2F62] dark:bg-[#B794F4] dark:hover:bg-[#A784E4] text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword
                        ? "Changing Password..."
                        : "Change Password"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

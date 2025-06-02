import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored) setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <section className="relative max-w-5xl mx-auto md:ml-82 px-4 md:px-8 pb-20 h-full min-h-screen">
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center gap-8 py-8">
          <h2 className="text-2xl font-semibold dark:text-[#EAEAEA]">
            Settings
          </h2>

          {/* Tabs */}
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

                <button className="w-full md:hidden px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">
                  Logout
                </button>

                <button className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium">
                  Delete Account
                </button>
              </div>
            )}

            {activeTab === "security" && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-medium dark:text-[#EAEAEA]"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]"
                  />
                </div>

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
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]"
                  />
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
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]"
                  />
                </div>

                <button className="w-full px-4 py-2 bg-[#4B3F72] hover:bg-[#3B2F62] dark:bg-[#B794F4] dark:hover:bg-[#A784E4] text-white rounded-lg text-sm font-medium">
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

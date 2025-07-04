import { useState, useRef, useEffect } from "react";
import { useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";

export default function ProfileEditPage() {
  const { profile, fetchUser } = useProfileStore();
  const { token } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    userName: profile?.userName || "",
    fullName: profile?.fullName || "",
    bio: profile?.bio || "",
    profilePicture: profile?.profilePictureUri || "",
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const BIO_MAX_LENGTH = 150;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      setFormData({
        userName: profile.userName || "",
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        profilePicture: profile.profilePictureUri || "",
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.userName.trim()) {
      setError("Username cannot be empty");
      setIsLoading(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("userName", formData.userName.trim());
      form.append("fullName", formData.fullName);
      form.append("bio", formData.bio);

      const file = fileInputRef.current?.files?.[0];
      if (file) {
        form.append("profilePicture", file);
      } else {
        form.append("profilePicture", "");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/appuser/me/editprofile`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      await fetchUser();
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/profile");
      }, 1800);
    } catch (err) {
      console.error("Full error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > BIO_MAX_LENGTH) return;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#1C1C1E] pt-20 pb-24 md:ml-72 md:pt-12 md:pb-0">
      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-[#232323] rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 animate-fade-in">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-4xl text-green-500"
            />
            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
              Profile updated successfully!
            </span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-[#2A2A2D] rounded-2xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[#2E2E2E] dark:text-[#EAEAEA] mb-8 text-center">
            Edit Profile
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative group">
                <img
                  src={
                    previewImage ||
                    formData.profilePicture ||
                    "/default-profile-picture.jpg"
                  }
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-2 border-[#4B3F72] dark:border-[#B794F4]"
                />
                <div
                  onClick={triggerFileInput}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  <span className="text-white text-sm">Change Photo</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="flex items-center">
                <label
                  htmlFor="userName"
                  className="w-24 text-sm font-medium text-[#2E2E2E] dark:text-[#EAEAEA]"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]"
                />
              </div>

              <div className="flex items-center">
                <label
                  htmlFor="fullName"
                  className="w-24 text-sm font-medium text-[#2E2E2E] dark:text-[#EAEAEA]"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4]"
                />
              </div>

              <div className="flex items-start">
                <label
                  htmlFor="bio"
                  className="w-24 text-sm font-medium text-[#2E2E2E] dark:text-[#EAEAEA] pt-2"
                >
                  Bio
                </label>
                <div className="flex-1">
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    maxLength={BIO_MAX_LENGTH}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1C1C1E] text-[#2E2E2E] dark:text-[#EAEAEA] focus:outline-none focus:ring-1 focus:ring-[#4B3F72] dark:focus:ring-[#B794F4] resize-none"
                  />
                  <div className="flex justify-end mt-1">
                    <span
                      className={`text-sm ${
                        formData.bio.length === BIO_MAX_LENGTH
                          ? "text-red-500"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {formData.bio.length}/{BIO_MAX_LENGTH}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-2 bg-[#4B3F72] hover:bg-[#3B2F62] dark:bg-[#B794F4] dark:hover:bg-[#A784E4] text-white rounded-lg transition-colors duration-300 font-medium ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

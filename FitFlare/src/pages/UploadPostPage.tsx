import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faXmark,
  faRobot,
  faHashtag,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { getUserIdFromToken } from "../helpers/getUserIdeFromToken";
import { useNavigate } from "react-router-dom";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB (in bytes)
const MAX_DESCRIPTION_LENGTH = 150;

export default function UploadpostPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"post" | "story">("post");

  // Story upload state
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreviewUrl, setStoryPreviewUrl] = useState<string | null>(null);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [storyUploading, setStoryUploading] = useState(false);
  const [storySuccess, setStorySuccess] = useState(false);
  const storyFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 15MB");
        return;
      }
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setError(null);
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        analyzeMediaWithAI(file);
      } else {
        setError("Please select an image or video file.");
      }
    }
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = e.target.value;
    if (text.length <= MAX_DESCRIPTION_LENGTH) {
      setDescription(text);
    }
  };

  const analyzeMediaWithAI = async (file: File) => {
    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken();
    if (!token || !userId || !file) {
      setError("Missing required data");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("description", description);
    formData.append("status", "Drafted");
    formData.append("media", file);
    hashtags.forEach((tag) => formData.append("hashtags", tag));

    setIsAnalyzing(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/post`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        setError("AI analysis failed. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      const aiResponse = await res.text();
      console.log(aiResponse);

      setAiSuggestion(aiResponse);
    } catch {
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 15MB");
        return;
      }
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setError(null);
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        analyzeMediaWithAI(file);
      } else {
        setError("Please drop an image or video file.");
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAiSuggestion("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddHashtag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newHashtag.trim()) {
      e.preventDefault();
      const tag = newHashtag.trim().startsWith("#")
        ? newHashtag.trim()
        : `#${newHashtag.trim()}`;
      if (!hashtags.includes(tag)) {
        setHashtags([...hashtags, tag]);
      }
      setNewHashtag("");
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const userId = getUserIdFromToken();
    if (!token || !userId || !selectedFile) {
      setError("Missing required data");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("description", description);
    formData.append("status", "Publishing");
    formData.append("media", selectedFile);
    hashtags.forEach((tag) => formData.append("hashtags", tag));

    const res = await fetch(`${import.meta.env.VITE_API_URL}/post`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (res.ok) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/");
        console.log(hashtags);
      }, 1800);
    } else {
      setError("Upload failed. Try again.");
    }
  };

  const handleStoryFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setStoryError("File size must be less than 15MB");
        return;
      }
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setStoryError(null);
        setStoryFile(file);
        const url = URL.createObjectURL(file);
        setStoryPreviewUrl(url);
      } else {
        setStoryError("Please select an image or video file.");
      }
    }
  };

  const handleStoryDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setStoryError("File size must be less than 15MB");
        return;
      }
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setStoryError(null);
        setStoryFile(file);
        const url = URL.createObjectURL(file);
        setStoryPreviewUrl(url);
      } else {
        setStoryError("Please drop an image or video file.");
      }
    }
  };

  const handleStoryDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleRemoveStoryFile = () => {
    setStoryFile(null);
    setStoryPreviewUrl(null);
    setStoryError(null);
    if (storyFileInputRef.current) {
      storyFileInputRef.current.value = "";
    }
  };

  const handleStorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !storyFile) {
      setStoryError("Missing required data");
      return;
    }
    const formData = new FormData();
    formData.append("media", storyFile);
    setStoryUploading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/story`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (res.ok) {
        setStorySuccess(true);
        setTimeout(() => {
          setStorySuccess(false);
          setStoryFile(null);
          setStoryPreviewUrl(null);
          setActiveTab("post");
        }, 1800);
      } else {
        setStoryError("Upload failed. Try again.");
      }
    } catch {
      setStoryError("Upload failed. Try again.");
    } finally {
      setStoryUploading(false);
    }
  };

  return (
    <div className="flex-1 md:ml-72 text-[#2E2E2E] dark:text-[#EAEAEA] min-h-screen pb-16 md:pb-0">
      {/* Tabs */}
      <div className="max-w-3xl mx-auto pt-6 pb-2 flex gap-2">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 focus:outline-none ${
            activeTab === "post"
              ? "bg-[#B794F4] text-white"
              : "bg-gray-200 dark:bg-[#232323] text-[#2E2E2E] dark:text-[#EAEAEA]"
          }`}
          onClick={() => setActiveTab("post")}
        >
          Upload Post
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-colors duration-200 focus:outline-none ${
            activeTab === "story"
              ? "bg-[#B794F4] text-white"
              : "bg-gray-200 dark:bg-[#232323] text-[#2E2E2E] dark:text-[#EAEAEA]"
          }`}
          onClick={() => setActiveTab("story")}
        >
          Upload Story
        </button>
      </div>
      {/* Tab Content */}
      {activeTab === "post" ? (
        <>
          {/* Success Popout */}
          {showSuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
              <div className="bg-white dark:bg-[#232323] rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 animate-fade-in">
                <FontAwesomeIcon
                  icon={faCloudArrowUp}
                  className="text-4xl text-green-500"
                />
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Uploaded successfully!
                </span>
              </div>
            </div>
          )}
          <div className="max-w-3xl mx-auto p-4 md:p-8">
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${selectedFile ? "border-[#B794F4]" : "border-gray-700"}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {selectedFile ? (
                  <div className="relative">
                    {selectedFile.type.startsWith("image/") ? (
                      <img
                        src={previewUrl!}
                        alt="Preview"
                        className="max-h-96 mx-auto rounded-lg"
                      />
                    ) : (
                      <video
                        src={previewUrl!}
                        controls
                        className="max-h-96 mx-auto rounded-lg"
                      />
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <FontAwesomeIcon
                      icon={faCloudArrowUp}
                      className="text-4xl text-[#B794F4]"
                    />
                    <div>
                      <p className="text-lg font-medium">
                        Drag and drop your media here, or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[#B794F4] hover:underline"
                        >
                          browse
                        </button>
                      </p>
                      <p className="text-sm text-gray-400">
                        Supports images and videos (max 15MB)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm flex items-center gap-2">
                  <FontAwesomeIcon icon={faInfoCircle} />
                  {error}
                </div>
              )}

              {isAnalyzing && (
                <div className="flex items-center justify-center space-x-2 text-[#B794F4]">
                  <FontAwesomeIcon icon={faRobot} className="animate-bounce" />
                  <span>Analyzing your media...</span>
                </div>
              )}

              {aiSuggestion && (
                <div className="bg-[#B794F4]/10 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <FontAwesomeIcon
                      icon={faRobot}
                      className="text-[#B794F4]"
                    />
                    <span className="font-medium">AI Assistant</span>
                  </div>
                  <p className="text-sm">{aiSuggestion}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="description" className="text-lg font-medium">
                    Description
                  </label>
                  <span
                    className={`text-sm ${
                      description.length >= MAX_DESCRIPTION_LENGTH
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {description.length}/{MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <textarea
                  id="description"
                  value={description}
                  onChange={handleDescriptionChange}
                  placeholder="Write a description for your post..."
                  className="w-full h-32 p-4 rounded-lg border border-gray-700 
                    placeholder-gray-500 focus:outline-none focus:ring-2 
                    focus:ring-[#B794F4] transition-colors resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium">Hashtags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm
                        bg-[#B794F4]/10 text-[#B794F4]"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="ml-2 hover:text-red-500"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faHashtag}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyDown={handleAddHashtag}
                    placeholder="Add hashtags (press Enter to add)"
                    className="w-full pl-10 pr-4 py-2 rounded-lg border
                      border-gray-700 placeholder-gray-500 
                      focus:outline-none focus:ring-2 focus:ring-[#B794F4] transition-colors"
                  />
                </div>
              </div>
            </form>

            <div className=" md:left-72 p-4 pt-10 border-t border-gray-700">
              <div className="max-w-3xl mx-auto">
                <button
                  type="submit"
                  form="upload-form"
                  className="w-full py-3 px-6 bg-[#B794F4] text-white rounded-lg 
                    hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!selectedFile || !description.trim()}
                >
                  Upload Post
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
          {storySuccess && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
              <div className="bg-white dark:bg-[#232323] rounded-xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 animate-fade-in">
                <FontAwesomeIcon
                  icon={faCloudArrowUp}
                  className="text-4xl text-green-500"
                />
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Story uploaded successfully!
                </span>
              </div>
            </div>
          )}
          <form
            id="upload-story-form"
            onSubmit={handleStorySubmit}
            className="space-y-6"
          >
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                storyFile ? "border-[#B794F4]" : "border-gray-700"
              }`}
              onDrop={handleStoryDrop}
              onDragOver={handleStoryDragOver}
            >
              {storyFile ? (
                <div className="relative">
                  {storyFile.type.startsWith("image/") ? (
                    <img
                      src={storyPreviewUrl!}
                      alt="Preview"
                      className="max-h-96 mx-auto rounded-lg"
                    />
                  ) : (
                    <video
                      src={storyPreviewUrl!}
                      controls
                      className="max-h-96 mx-auto rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveStoryFile}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <FontAwesomeIcon
                    icon={faCloudArrowUp}
                    className="text-4xl text-[#B794F4]"
                  />
                  <div>
                    <p className="text-lg font-medium">
                      Drag and drop your story here, or{" "}
                      <button
                        type="button"
                        onClick={() => storyFileInputRef.current?.click()}
                        className="text-[#B794F4] hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports images and videos (max 15MB)
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={storyFileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleStoryFileSelect}
                className="hidden"
              />
            </div>
            {storyError && (
              <div className="text-red-500 text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faInfoCircle} />
                {storyError}
              </div>
            )}
            <div className=" md:left-72 p-4 pt-10 border-t border-gray-700">
              <div className="max-w-3xl mx-auto">
                <button
                  type="submit"
                  form="upload-story-form"
                  className="w-full py-3 px-6 bg-[#B794F4] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!storyFile || storyUploading}
                >
                  {storyUploading ? "Uploading..." : "Upload Story"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: number;
    description: string;
    hashTags: string[];
  };
  onSave: (description: string, tags: string[]) => void;
  onDelete: () => void;
}

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onSave,
  onDelete,
}: EditPostModalProps) {
  const [description, setDescription] = useState(post.description);
  const [tags, setTags] = useState(post.hashTags.join(" "));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    const tagArray = tags
      .split(" ")
      .filter((tag) => tag.trim() !== "")
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`));
    onSave(description, tagArray);
    onClose();
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
      onClose();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-sm dark:bg-[#1C1C1E]/30"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white/95 dark:bg-[#1C1C1E] rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Edit Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              rows={4}
              placeholder="Write a description..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags (space separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="#tagexample #tagexample2"
            />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleSave}
              className="w-full py-2 px-4 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600"
            >
              Save Changes
            </button>

            <button
              onClick={handleDelete}
              className={`w-full py-2 px-4 rounded-lg font-semibold ${
                showDeleteConfirm
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {showDeleteConfirm
                ? "Click again to confirm delete"
                : "Delete Post"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

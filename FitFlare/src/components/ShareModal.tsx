import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSearch } from "@fortawesome/free-solid-svg-icons";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  postId,
}: ShareModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const users: User[] = [
    {
      id: "1",
      name: "John Doe",
      username: "johndoe",
      avatar: "/path-to-avatar.jpg",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = () => {
    console.log("Sharing post", postId, "with users:", selectedUsers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm dark:bg-[#1C1C1E]/30">
      <div className="bg-white/95 dark:bg-[#1C1C1E] rounded-xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Share</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer"
                onClick={() => toggleUser(user.id)}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold dark:text-white">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.name}
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => {}}
                  className="w-5 h-5 accent-blue-500"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleShare}
            disabled={selectedUsers.length === 0}
            className={`w-full mt-4 py-2 px-4 rounded-lg font-semibold ${
              selectedUsers.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-blue-200 text-white cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

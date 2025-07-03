import { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { useAuthStore } from "../../../store/authStore";

interface FoundUser {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  profilePictureSasUri: string;
}

interface AddAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdminAdded: () => void;
}

export default function AddAdminModal({
  isOpen,
  onClose,
  onAdminAdded,
}: AddAdminModalProps) {
  const [email, setEmail] = useState("");
  const [foundUsers, setFoundUsers] = useState<FoundUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  const { token } = useAuthStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setFoundUsers([]);

    try {
      const res = await fetch(
        "https://localhost:7014/api/admin/admins/find-by-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ Email: email.trim() }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setFoundUsers(data);
        } else if (data && typeof data === "object") {
          setFoundUsers([data]);
        }
      } else {
        const errText = await res.text();
        try {
          const errJson = JSON.parse(errText);
          if (errJson.errors && typeof errJson.errors === "object") {
            const messages = Object.values(errJson.errors).flat();
            setError(messages.join(" "));
          } else {
            setError(
              errJson.title || errJson.detail || "An unknown error occurred."
            );
          }
        } catch {
          setError(errText || "An unknown error occurred.");
        }
      }
    } catch  {
      setError("Network error during search.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: string) => {
    setPromotingId(userId);
    setError(null);
    try {
      const res = await fetch(
        `https://localhost:7014/api/admin/admins/${userId}/promote-to-admin`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        alert("User promoted to admin successfully!");
        onAdminAdded();
        onClose();
      } else {
        const errText = await res.text();
        setError(errText || "Failed to promote user.");
      }
    } catch {
      setError("Network error during promotion.");
    } finally {
      setPromotingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg w-full p-0">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Add New Admin
        </h2>
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by user email..."
            required
            className="flex-grow w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button variant="primary" size="sm" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center h-24 text-gray-400 dark:text-gray-500">
              Loading...
            </div>
          )}
          {!loading && foundUsers.length > 0
            ? foundUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        user.profilePictureSasUri ||
                        "/default-profile-picture.jpg"
                      }
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {user.fullName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePromote(user.id)}
                    disabled={promotingId === user.id}
                  >
                    {promotingId === user.id ? "Adding..." : "Add"}
                  </Button>
                </div>
              ))
            : !loading &&
              !error && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No users found.
                </p>
              )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}

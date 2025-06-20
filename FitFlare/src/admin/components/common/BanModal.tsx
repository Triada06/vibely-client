import React, { useState } from "react";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface BanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { reason: string; expiresAt: string | null }) => void;
  initialReason?: string;
  initialExpiresAt?: string | null;
  loading?: boolean;
  error?: string | null;
}

export default function BanModal({
  isOpen,
  onClose,
  onSubmit,
  initialReason = "",
  initialExpiresAt = null,
  loading = false,
  error = null,
}: BanModalProps) {
  const [reason, setReason] = useState(initialReason);
  const [expiresAt, setExpiresAt] = useState<string | "">(
    initialExpiresAt || ""
  );

  // Reset fields when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setReason(initialReason);
      setExpiresAt(initialExpiresAt || "");
    }
  }, [isOpen, initialReason, initialExpiresAt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit({
      reason: reason.trim(),
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md w-full p-0">
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Ban User
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            rows={3}
            placeholder="Enter reason for ban..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Expiration Date (optional)
          </label>
          <input
            type="datetime-local"
            className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
          <div className="text-xs text-gray-400 mt-1">
            Leave blank for permanent ban.
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" disabled={loading || !reason.trim()}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

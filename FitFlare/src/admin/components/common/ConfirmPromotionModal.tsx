import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";

interface ConfirmPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  userName: string;
}

export default function ConfirmPromotionModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  userName,
}: ConfirmPromotionModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        Confirm Promotion
      </h2>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Are you sure you want to promote{" "}
        <span className="font-bold">{userName}</span> to an Owner?
      </p>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        A confirmation email will be sent to your registered email address to
        verify this action.
      </p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={loading}>
          {loading ? "Sending..." : "Yes, Promote"}
        </Button>
      </div>
    </Modal>
  );
}

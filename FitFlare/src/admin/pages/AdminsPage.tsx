import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import Badge from "../components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import Button from "../components/ui/button/Button";
import AddAdminModal from "../components/common/AddAdminModal";
import ConfirmPromotionModal from "../components/common/ConfirmPromotionModal";

interface Admin {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  role: "Admin" | "Owner";
  profilePictureSasUri: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { token, userId } = useAuthStore();
  const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://localhost:7014/api/admin/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error("Failed to fetch admins", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdmins();
    }
  }, [token]);

  const handlePromoteClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setIsPromoteModalOpen(true);
    setPromotionMessage(null);
  };

  const handleConfirmPromotion = async () => {
    if (!selectedAdmin) return;

    setPromoteLoading(true);
    setPromotionMessage(null);
    try {
      const res = await fetch(
        `https://localhost:7014/api/admin/admins/${selectedAdmin.id}/make-app-owner`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setPromotionMessage(
          "A confirmation email has been sent to your inbox. Please verify to complete the ownership transfer."
        );
        setIsPromoteModalOpen(false);
      } else {
        const errorText = await res.text();
        setPromotionMessage(`Failed to start promotion: ${errorText}`);
      }
    } catch (error) {
      console.error(error);
      setPromotionMessage("An error occurred while starting the promotion.");
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (
      window.confirm(
        "Are you sure you want to remove this user from their admin role? This action cannot be undone."
      )
    ) {
      try {
        const res = await fetch(
          `https://localhost:7014/api/admin/admins/${adminId}/remove-admin`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          setAdmins((prevAdmins) =>
            prevAdmins.filter((admin) => admin.id !== adminId)
          );
          alert("Admin removed successfully.");
        } else {
          const errorText = await res.text();
          alert(`Failed to remove admin: ${errorText}`);
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while removing the admin.");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Administrators
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Admin
          </Button>
        </div>

        {promotionMessage && (
          <div className="mb-4 p-3 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {promotionMessage}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-48 text-gray-400 dark:text-gray-500">
            Loading administrators...
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    User
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Role
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden rounded-full">
                          <img
                            width={40}
                            height={40}
                            src={
                              admin.profilePictureSasUri ||
                              "/default-profile-picture.jpg"
                            }
                            alt={admin.fullName}
                          />
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {admin.userName}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {admin.fullName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      {admin.email}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={admin.role === "Owner" ? "success" : "warning"}
                      >
                        {admin.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {admin.role !== "Owner" && userId !== admin.id && (
                          <button
                            className="text-blue-500 hover:underline"
                            onClick={() => handlePromoteClick(admin)}
                          >
                            Promote to Owner
                          </button>
                        )}
                        {userId !== admin.id && (
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => handleRemoveAdmin(admin.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <AddAdminModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdminAdded={fetchAdmins}
      />
      {selectedAdmin && (
        <ConfirmPromotionModal
          isOpen={isPromoteModalOpen}
          onClose={() => setIsPromoteModalOpen(false)}
          onConfirm={handleConfirmPromotion}
          loading={promoteLoading}
          userName={selectedAdmin.userName}
        />
      )}
    </div>
  );
}

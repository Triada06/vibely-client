import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { useEffect, useState } from "react";
import { useUserStore } from "../../../store/storeAdmin";
import Badge from "../../ui/badge/Badge";
import { useNavigate } from "react-router-dom";
import BanModal from "../../common/BanModal";

function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return "0";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export default function BasicTableOne() {
  const { users, fetchUsers } = useUserStore();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("asc");
  const navigate = useNavigate();
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banUserId, setBanUserId] = useState<string | null>(null);
  const [banLoading, setBanLoading] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers(page, searchText, sort, pageSize);
  }, [page, pageSize, searchText, sort]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [pageSize, searchText, sort]);

  interface Order {
    id: string;
    user: {
      email: string;
      userName: string;
      profilePictureUri: string;
      fullName: string;
    };
    isBanned: boolean;
    posts: string;
  }

  const formattedData: Order[] = users.map((user) => ({
    id: user.id,
    user: {
      email: user.email,
      userName: user.userName,
      profilePictureUri: user.profilePictureUri,
      fullName: user.fullName,
    },
    isBanned: user.isBanned,
    posts: formatNumber(user.posts),
  }));

  const handleBanClick = (userId: string) => {
    setBanUserId(userId);
    setBanModalOpen(true);
    setBanError(null);
  };

  const handleBanSubmit = async ({
    reason,
    expiresAt,
  }: {
    reason: string;
    expiresAt: string | null;
  }) => {
    if (!banUserId) return;
    setBanLoading(true);
    setBanError(null);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/ban`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: banUserId, reason, expiresAt }),
      });
      if (res.ok) {
        setBanModalOpen(false);
        setBanUserId(null);
        fetchUsers(page, searchText, sort, pageSize); // Refresh users
      } else {
        const errText = await res.text();
        try {
          const errJson = JSON.parse(errText);
          setBanError(
            errJson.detail || errJson.title || errText || "Failed to ban user."
          );
        } catch {
          setBanError(errText || "Failed to ban user.");
        }
      }
    } catch {
      setBanError("Network error.");
    } finally {
      setBanLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Filter Controls */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-6 pt-6 pb-4 mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search users..."
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          <option value="asc">Sort Ascending</option>
          <option value="desc">Sort Descending</option>
        </select>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </div>
      <div className="max-w-full overflow-x-auto mb-6">
        <Table>
          {/* Table Header */}
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
                User Email Address
              </TableCell>

              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Is Banned
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {formattedData.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 overflow-hidden rounded-full">
                      <img
                        width={40}
                        height={40}
                        src={
                          order.user.profilePictureUri ??
                          "/default-profile-picture.jpg"
                        }
                        alt={order.user.fullName}
                      />
                    </div>
                    <div>
                      <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {order.user.userName}
                      </span>
                      <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                        {order.user.fullName}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {order.user.email}
                </TableCell>

                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={order.isBanned ? "warning" : "success"}
                  >
                    {order.isBanned ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => navigate(`/admin/appusers/${order.id}`)}
                    >
                      View
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleBanClick(order.id)}
                      disabled={order.isBanned}
                    >
                      {order.isBanned ? "Banned" : "Ban"}
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-end items-center mt-4 px-6 pb-6 gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="mx-2  text-[#2E2E2E] dark:text-[#EAEAEA]">
          Page {page}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={users.length < pageSize}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>
      <BanModal
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        onSubmit={handleBanSubmit}
        loading={banLoading}
        error={banError}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { useUserStore } from "../store/storeAdmin";
import { usePostStore } from "../../store/appPostsStore";
import {
  BannedUsersStatisticsChart,
  UploadedPostsStatisticsChart,
} from "../components/statistics/BannedAndPostsStatisticsChart";

interface DashboardMonthlyStats {
  bannedUsers: number[];
  uploadedPosts: number[];
}

export default function DashBoard() {
  const { fetchUsers } = useUserStore();
  const { fetchPosts } = usePostStore();
  const [stats, setStats] = useState<DashboardMonthlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers(1, "", "asc", 10);
    fetchPosts();
    const fetchStats = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/dashboard/monthly`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="mt-8 flex flex-col">
        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Loading dashboard statistics...
          </div>
        ) : (
          <>
            <BannedUsersStatisticsChart data={stats?.bannedUsers} />
            <UploadedPostsStatisticsChart data={stats?.uploadedPosts} />
          </>
        )}
      </div>
    </>
  );
}

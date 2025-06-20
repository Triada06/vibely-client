import Chart from "react-apexcharts";
import { useMemo } from "react";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface ChartProps {
  data?: number[];
}

export function BannedUsersStatisticsChart({ data }: ChartProps) {
  const bannedData = useMemo(
    () => data || [2, 1, 3, 2, 4, 3, 2, 1, 2, 3, 2, 1],
    [data]
  );
  const chartOptions = {
    colors: ["#F79009"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area" as const,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    fill: {
      type: "gradient" as const,
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    xaxis: {
      type: "category" as const,
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };
  const chartSeries = [
    {
      name: "Banned Users",
      data: bannedData,
    },
  ];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Banned Users Statistics
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Monthly statistics for banned users
        </p>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}

export function UploadedPostsStatisticsChart({ data }: ChartProps) {
  const postsData = useMemo(
    () => data || [10, 12, 8, 15, 14, 13, 16, 11, 9, 17, 12, 14],
    [data]
  );
  const chartOptions = {
    colors: ["#465FFF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "area" as const,
      toolbar: { show: false },
    },
    stroke: {
      curve: "smooth" as const,
      width: 2,
    },
    fill: {
      type: "gradient" as const,
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 6 },
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    xaxis: {
      type: "category" as const,
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };
  const chartSeries = [
    {
      name: "Uploaded Posts",
      data: postsData,
    },
  ];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6 mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Uploaded Posts Statistics
        </h3>
        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
          Monthly statistics for uploaded posts
        </p>
      </div>
      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="w-full">
          <Chart
            options={chartOptions}
            series={chartSeries}
            type="area"
            height={310}
          />
        </div>
      </div>
    </div>
  );
}

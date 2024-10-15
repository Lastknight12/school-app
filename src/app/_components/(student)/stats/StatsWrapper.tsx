"use client";

import { Loader2 } from "lucide-react";

import { api } from "~/trpc/react";

import Chart from "./Chart";
import StatsInfo from "./StatsInfo";

export default function Stats() {
  const chartData = api.transfers.getChartData.useQuery();
  const statsData = api.transfers.getStatsData.useQuery();

  if (chartData.isLoading || statsData.isLoading) {
    return (
      // 72px - navbar, 57px - 20px - bottom navigation
      <div className="flex h-[calc(100vh-72px-57px-20px)] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
      </div>
    );
  }

  return (
    <div className="mb-6 h-max px-6">
      <Chart chartData={chartData.data ?? []} />
      <StatsInfo statsData={statsData.data!} />
    </div>
  );
}

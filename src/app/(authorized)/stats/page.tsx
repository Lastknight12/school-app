"use client";

import { Loader2 } from "lucide-react";

import getChartData from "~/server/callers/transfers/chart/get";
import getStats from "~/server/callers/transfers/stats/get";

import Chart from "./_components/Chart";
import StatsInfo from "./_components/StatsInfo";

export default function Stats() {
  const chartData = getChartData();
  const statsData = getStats();

  if (chartData.isLoading || statsData.isLoading) {
    return (
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

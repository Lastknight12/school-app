"use client";

import { api } from "~/trpc/react";
import Spinner from "~/components/ui/spinner";
import Chart from "./Chart";
import StatsInfo from "./StatsInfo";

export default function Stats() {
  const chartData = api.transfers.getChartData.useQuery();
  const statsData = api.transfers.getStatsData.useQuery();

  if (chartData.isLoading || statsData.isLoading) {
    return (
      // 72px - navbar, 57px - 20px - bottom navigation
      <div className="flex h-[calc(100vh-72px-57px-20px)] w-full items-center justify-center">
        <Spinner containerClassName="!h-7 !w-7" />
      </div>
    );
  }

  return (
    <div className="mb-6 h-max">
      <Chart chartData={chartData.data ?? []} />
      <StatsInfo statsData={statsData.data!} />
    </div>
  );
}

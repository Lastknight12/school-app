"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { api } from "~/trpc/react";

import IncomingChart from "./IncomingChart";
import OutgoingChart from "./OutgoingChart";
import StatsInfo from "./StatsInfo";

export default function StatsPage() {
  const [currentTab, setCurrentTab] = useState<"incoming" | "outgoing">(
    "outgoing",
  );
  const chartData = api.transfers.getChartData.useQuery();
  const statsData = api.transfers.getStatsData.useQuery();

  if (chartData.isLoading || statsData.isLoading) {
    return (
      <div className="flex h-[calc(100vh-72px-57px-20px)] w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
      </div>
    );
  }

  return (
    <div className="mb-6 h-max px-6">
      {chartData.data && (
        <>
          {currentTab === "incoming" && (
            <IncomingChart chartData={chartData.data} />
          )}
          {currentTab === "outgoing" && (
            <OutgoingChart chartData={chartData.data} />
          )}
        </>
      )}

      {statsData.data && (
        <StatsInfo
          statsData={statsData.data}
          onTabChange={(tab) => setCurrentTab(tab)}
        />
      )}
    </div>
  );
}

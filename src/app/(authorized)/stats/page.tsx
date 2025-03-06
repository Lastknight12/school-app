"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import getChartData from "~/server/callers/transfers/chart/get";
import getStats from "~/server/callers/transfers/stats/get";

import IncomingChart from "./_components/IncomingChart";
import OutgoingChart from "./_components/OutgoingChart";
import StatsInfo from "./_components/StatsInfo";

export default function Stats() {
  const [currentTab, setCurrentTab] = useState<"incoming" | "outgoing">(
    "outgoing",
  );
  const statsData = getStats();
  const chartData = getChartData();

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

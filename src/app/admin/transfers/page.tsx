"use client"

import { TransfersTable } from "~/app/_components/(admin)/transfers/TransfersTable";

export default function Page() {
  return (
    <div>
      <TransfersTable from={new Date("2024-10-09")} to={new Date("2024-10-09")}/>
    </div>
  );
}
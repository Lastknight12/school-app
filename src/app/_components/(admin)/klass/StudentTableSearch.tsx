"use client"

import { useStudentTable } from "./StudentTable";

import { Input } from "~/shadcn/ui/input";

export function StudentTableSearch() {
  const table = useStudentTable();

  if (!table) {
    throw new Error(
      "StudentTableSearch must be used within a <StudentTable />",
    );
  }

  return (
    <Input
      placeholder="Search by name..."
      onChange={(e) => table.getColumn("name")?.setFilterValue(e.target.value)}
      className="max-w-max"
    />
  );
}

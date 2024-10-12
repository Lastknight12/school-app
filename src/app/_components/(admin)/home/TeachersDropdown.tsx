import { Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import { Button } from "~/shadcn/ui/button";

interface Props {
  onSelect: (id: string) => void;
  teacherIds: string[];
}

export default function TeachersDropdown({ onSelect, teacherIds }: Props) {
  const [showDropdown, setShowDropdown] = useState(false);

  const getAllTeachers = api.user.getAllTeachers.useQuery();

  return (
    <div className="relative">
      <Button onClick={() => setShowDropdown(!showDropdown)}>
        {teacherIds.length > 0 && getAllTeachers.data
          ? teacherIds.map((id, i) => (
              <Image
                key={id}
                src={
                  getAllTeachers.data?.find((teacher) => teacher.id === id)!
                    .image
                }
                alt="avatar"
                width={25}
                height={25}
                className={cn("rounded-full shadow-md", i !== 0 && "-ml-2")}
              />
            ))
          : "Виберіть вчителів"}
      </Button>

      {showDropdown && (
        <div className="absolute z-10 mt-2 flex h-40 min-w-[240px] flex-col rounded-lg bg-[#282828] p-2">
          {getAllTeachers.isLoading && (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#b5b5b5]" />
            </div>
          )}

          <div className="overflow-y-auto pr-2">
            {getAllTeachers.data?.map((teacher) => (
              <div
                className="flex cursor-pointer items-center justify-start gap-2 rounded-lg px-2 py-3 hover:bg-[#393939]"
                key={teacher.id}
                onClick={() => {
                  teacherIds.includes(teacher.id)
                    ? onSelect(teacher.id)
                    : onSelect(teacher.id);
                }}
              >
                {/* Include in div but dont show */}
                <Check
                  size={16}
                  className={cn(
                    teacherIds.includes(teacher.id)
                      ? "text-[#b5b5b5]"
                      : "text-transparent",
                  )}
                />

                <Image
                  src={teacher.image}
                  alt="avatar"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <p>
                  {teacher.name.length > 13
                    ? teacher.name.slice(0, 13) + "..."
                    : teacher.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

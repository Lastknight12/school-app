"use client";

import { UserRole } from "@prisma/client";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { cn } from "~/lib/utils";

import { TruncatedText } from "~/app/_components/shared/TruncatedText";

import { Button } from "~/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shadcn/ui/dropdown-menu";
import { Input } from "~/shadcn/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shadcn/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shadcn/ui/table";

export default function UsersModelContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const utils = api.useUtils();

  const {
    data: users,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = api.user.getUsersByRole.useQuery();

  const updateUserRoleMutation = api.user.updateUserRole.useMutation({
    onSuccess: () => {
      void utils.user.getUsersByRole.invalidate();
      toast.success("Користувача оновлено");
    },

    onError: () => {
      toast.error("Виникла помилка під час оновлення користувача");
    },
  });

  const deleteUserMutation = api.user.deleteUser.useMutation({
    onSuccess: () => {
      void utils.user.getUsersByRole.invalidate();
      toast.success("Користувача видалено");
    },

    onError: () => {
      toast.error("Виникла помилка під час видалення користувача");
    },
  });

  const filteredUsers = users
    ?.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder) {
        return sortOrder === "asc"
          ? a.role.localeCompare(b.role)
          : b.role.localeCompare(a.role);
      }
      return 0;
    });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers?.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = filteredUsers
    ? Math.ceil(filteredUsers.length / usersPerPage)
    : 0;

  const handleUpdateRole = (userId: string, newRole: string) => {
    updateUserRoleMutation.mutate({ userId, newRole: newRole as UserRole });
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center ml-4">
            <Search className="h-4 w-4 text-muted-foreground z-10" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                currentPage !== 1 && setCurrentPage(1);
              }}
              className="pl-10 -ml-8 rounded-full"
            />
          </div>

          <div className="flex items-center gap-2 space-x-2 w-max">
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchUsers()}
              disabled={isFetchingUsers}
            >
              <RefreshCw className={cn(isFetchingUsers && "animate-spin")} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </Button>
            <div className="text-sm text-muted-foreground">
              {totalPages > 0
                ? `Page ${currentPage} of ${totalPages}`
                : "Loading..."}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <Table className="mb-4">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead
              className="w-[150px] cursor-pointer"
              onClick={() =>
                setSortOrder(
                  sortOrder === "asc"
                    ? "desc"
                    : sortOrder === "desc"
                      ? ""
                      : "asc",
                )
              }
            >
              Role {sortOrder === "asc" && <ChevronUp className="inline" />}
              {sortOrder === "desc" && <ChevronDown className="inline" />}
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetchingUsers && (
            <TableRow>
              <TableCell colSpan={5}>
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#b5b5b5]" />
              </TableCell>
            </TableRow>
          )}

          {currentUsers?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <TruncatedText text={user.name} maxLength={20} />
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.balance + "$"}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions:</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={async () => {
                        await navigator.clipboard.writeText(user.email);
                        toast.success("Email copied to clipboard");
                      }}
                    >
                      Копіювати email
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        deleteUserMutation.mutate({ id: user.id });
                      }}
                    >
                      {deleteUserMutation.isPending ? (
                        <Loader2 className="mx-auto h-3 w-3 animate-spin text-[#b5b5b5]" />
                      ) : (
                        <p>Видалити</p>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuLabel>Role:</DropdownMenuLabel>
                    <div className="relative">
                      <Select
                        onValueChange={(value) =>
                          handleUpdateRole(user.id, value)
                        }
                        defaultValue={user.role}
                      >
                        <div>
                          <SelectTrigger
                            className="w-[150px] bg-secondary mx-2 mb-2 disabled:opacity-20"
                            disabled={updateUserRoleMutation.isPending}
                          >
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>

                          {updateUserRoleMutation.isPending && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          )}
                        </div>
                        <SelectContent>
                          <SelectItem value={UserRole.STUDENT}>
                            STUDENT
                          </SelectItem>
                          <SelectItem value={UserRole.TEACHER}>
                            TEACHER
                          </SelectItem>
                          <SelectItem value={UserRole.ADMIN}>ADMIN</SelectItem>
                          <SelectItem value={UserRole.SELLER}>
                            SELLER
                          </SelectItem>
                          <SelectItem value={UserRole.RADIO_CENTER}>
                            RADIO_CENTER
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

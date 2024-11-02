"use client";

import { type Badge, UserRole } from "@prisma/client";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  Search,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/shadcn/ui/button";
import { Checkbox } from "~/shadcn/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/shadcn/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shadcn/ui/dropdown-menu";
import { ScrollArea } from "~/shadcn/ui/scroll-area";
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

interface UserFromApi {
  name: string;
  role: UserRole;
  id: string;
  email: string;
  image: string;
  balance: number;
  teacherClasses: {
    name: string;
    id: string;
  }[];
  studentClass: {
    name: string;
    id: string;
  } | null;
  badge_for_assignment: Badge[];
}

export default function UsersModelContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const utils = api.useUtils();

  const { data: users, isFetching: isFetchingUsers } =
    api.user.getUsersByRole.useQuery();
  const { data: allBadges, isFetching: isFetchingBadges } =
    api.user.getAllBadges.useQuery();
  const [selectedUser, setSelectedUser] = useState<UserFromApi | null>(null);
  const [allowedBadgesCache, setAllowedBadgesCache] = useState<Badge[]>(
    selectedUser?.badge_for_assignment ?? [],
  );

  const updateUserBadgesMutation = api.user.updateUserBadges.useMutation({
    onSuccess: () => {
      void utils.user.getUsersByRole.invalidate();
      setIsBadgeDialogOpen(false);
      toast.success("Успішно оновлено бейджі користувача");
    },

    onError: () => {
      toast.error("Виникла помилка під час оновлення користувача");
    },
  });

  const updateUserRoleMutation = api.user.updateUserRole.useMutation({
    onSuccess: () => {
      void utils.user.getUsersByRole.invalidate();
      toast.success("Користувача оновлено");
    },

    onError: () => {
      toast.error("Виникла помилка під час оновлення користувача");
    },
  });

  const filteredUsers = users
    ?.filter((user) =>
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
    // In a real application, you would update the user's role in the database here
    updateUserRoleMutation.mutate({ userId, newRole: newRole as UserRole });
  };

  const handleToggleBadge = (userId: string, badge: Badge) => {
    // In a real application, you would update the user's badges in the database here
    setAllowedBadgesCache((prevBadges) =>
      prevBadges.includes(badge)
        ? prevBadges.filter((b) => b.name !== badge.name)
        : [...prevBadges, badge],
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-3 px-3 py-2 border-[#3d3d3d] border bg-card rounded-full">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none placeholder:text-[#8f8f8f] bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 space-x-2 w-max">
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
            <TableHead>Email</TableHead>
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
              <TableCell className="font-medium">{user.name}</TableCell>
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
                      onClick={() => navigator.clipboard.writeText(user.email)}
                    >
                      Copy email
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        setSelectedUser(user);
                        setAllowedBadgesCache(user.badge_for_assignment);
                        setIsBadgeDialogOpen(true);
                      }}
                    >
                      Add badges
                    </DropdownMenuItem>
                    <DropdownMenuItem>View details</DropdownMenuItem>
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
                            className="w-[150px] mx-2 mb-2 disabled:opacity-20"
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

      <Dialog
        open={isBadgeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUser(null);
            setAllowedBadgesCache([]);
          }
          setIsBadgeDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Badges for {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Select or deselect badges for this user. Click save when
              you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px] w-full">
            <div className="grid grid-cols-2 gap-4">
              {isFetchingBadges && (
                <div className="mx-auto">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}

              {allBadges?.map((badge) => (
                <div
                  key={badge.name}
                  className="flex items-center space-x-2"
                  onClick={() => handleToggleBadge(selectedUser!.id, badge)}
                >
                  <Checkbox
                    id={badge.name}
                    checked={allowedBadgesCache.some(
                      (b) => b.name === badge.name,
                    )}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor={badge.name}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {badge.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="justify-end">
            <Button
              disabled={updateUserBadgesMutation.isPending}
              onClick={() =>
                updateUserBadgesMutation.mutate({
                  userId: selectedUser!.id,
                  badges: allowedBadgesCache,
                })
              }
            >
              Save
              {updateUserBadgesMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

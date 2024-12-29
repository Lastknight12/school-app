"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { ColorPicker } from "./ColorPicker";

import Badge from "~/shadcn/ui/badge";
import { Button } from "~/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/shadcn/ui/dialog";
import { Input } from "~/shadcn/ui/input";
import { Label } from "~/shadcn/ui/label";

type Badge = {
  name: string;
  color: string;
  borderColor: string;
  backgroundColor: string;
};

export default function AddBadgeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [badgeName, setBadgeName] = useState("");
  const [textColor, setTextColor] = useState("#fff");
  const [backgroundColor, setBackgroundColor] = useState("#000");
  const utils = api.useUtils();

  const addBadgeMutation = api.user.addBadge.useMutation({
    onSuccess: () => {
      void utils.user.getAllBadges.invalidate();
      setIsOpen(false);
      resetForm();
    },

    onError: () => {
      toast.error(`Виникла помилка під час додавання бейджу`);
    },
  });

  const handleAddBadge = () => {
    addBadgeMutation.mutate({
      name: badgeName,
      textColor: textColor,
      backgroundColor: backgroundColor,
    });
  };

  const resetForm = () => {
    setBadgeName("");
    setTextColor("#fff");
    setBackgroundColor("#000");
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add Badge</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a New Badge</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="badgeName">Badge Name:</Label>
              <Input
                id="badgeName"
                value={badgeName}
                variant="accent"
                onChange={(e) => setBadgeName(e.target.value)}
                placeholder="Enter badge name"
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="badgeName">Text color:</Label>
              <ColorPicker
                defaultValue={textColor}
                onChange={(color) => {
                  setTextColor(color);
                }}
              />
            </div>

            <div className="flex flex-col items-start gap-2">
              <Label htmlFor="badgeName">Background color:</Label>
              <ColorPicker
                defaultValue={backgroundColor}
                onChange={(color) => {
                  setBackgroundColor(color);
                }}
              />
            </div>

            <div className="mx-auto">
              <Badge
                className="py-2 px-4 text-lg"
                name={badgeName}
                textColor={textColor}
                background={backgroundColor}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleAddBadge}
              disabled={addBadgeMutation.isPending}
            >
              Add Badge
              {addBadgeMutation.isPending && (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn, truncateText } from "~/lib/utils";

import { Button } from "~/shadcn/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/shadcn/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "~/shadcn/ui/popover";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  type?: "popover" | "hover";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleCopy}
      aria-label="Copy text"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function TruncatedText({
  text,
  maxLength = 300,
  type = "popover",
  className,
}: TruncatedTextProps) {
  const isTruncated = text.length > maxLength;
  const truncatedText = isTruncated
    ? truncateText(text, maxLength) + "..."
    : text;

  if (!isTruncated) {
    return <span className={className}>{text}</span>;
  }

  if (type === "popover")
    return (
      <Popover>
        <PopoverTrigger asChild>
          {isTruncated ? (
            <p
              className={cn(
                "cursor-pointer rounded px-1 -mx-1 transition-colors",
                className,
              )}
            >
              {truncatedText}
            </p>
          ) : (
            <p className={cn("transition-colors", className)}>{text}</p>
          )}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="max-w-md w-auto max-h-80 overflow-y-auto"
        >
          <div className="flex items-start gap-2">
            <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {text}
            </p>
            <CopyButton text={text} />
          </div>
        </PopoverContent>
      </Popover>
    );

  if (type === "hover")
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          {isTruncated ? (
            <p
              className={cn(
                "cursor-pointer rounded px-1 -mx-1 transition-colors",
                className,
              )}
            >
              {truncatedText}
            </p>
          ) : (
            <p className={cn("transition-colors", className)}>{text}</p>
          )}
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="max-w-md w-auto max-h-80 overflow-y-auto"
        >
          <div className="flex items-start gap-2">
            <p className="text-left text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {text}
            </p>
            <CopyButton text={text} />
          </div>
        </HoverCardContent>
      </HoverCard>
    );
}

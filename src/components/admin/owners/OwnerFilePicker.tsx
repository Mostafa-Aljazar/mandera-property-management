"use client";

import Image from "next/image";
import { FileImage, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function OwnerFilePicker({
  hint,
  previewUrl,
  invalid,
  rounded = "full",
  onPick,
  ...props
}: {
  hint: string;
  previewUrl: string | null;
  invalid?: boolean;
  rounded?: "full" | "xl";
  onPick: (file: File | undefined) => void;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}) {
  return (
    <label
      id={props.id}
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-lg border border-dashed bg-muted/30 p-4 transition-colors hover:bg-muted/50",
        invalid && "border-destructive/50 bg-destructive/5",
      )}
    >
      {previewUrl ? (
        <div
          className={cn(
            "relative size-14 shrink-0 overflow-hidden",
            rounded === "full" ? "rounded-full" : "rounded-lg",
          )}
        >
          <Image
            src={previewUrl}
            alt=""
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex size-14 shrink-0 items-center justify-center bg-muted text-muted-foreground",
            rounded === "full" ? "rounded-full" : "rounded-lg",
          )}
        >
          {rounded === "full" ? (
            <ImagePlus className="size-5" />
          ) : (
            <FileImage className="size-5" />
          )}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{hint}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          JPG / PNG / WEBP — حتى 2MB
        </p>
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-describedby={props["aria-describedby"]}
        aria-invalid={props["aria-invalid"]}
        onChange={(e) => onPick(e.target.files?.[0])}
      />
    </label>
  );
}

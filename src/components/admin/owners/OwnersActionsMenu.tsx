"use client";

import Link from "next/link";
import { Eye, MoreVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DeleteOwnerForm,
  ToggleActiveForm,
} from "@/components/admin/owners/RowActions";

export function OwnersActionsMenu({
  ownerId,
  isActive,
}: {
  ownerId: string;
  isActive: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="المزيد من الإجراءات"
          />
        }
      >
        <MoreVertical />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem render={<Link href={`/admin/owners/${ownerId}`} />}>
          <Eye />
          فتح
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<Link href={`/admin/owners/${ownerId}/edit`} />}
        >
          <Pencil />
          تعديل
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <ToggleActiveForm ownerId={ownerId} isActive={isActive} variant="menu" />
        <DeleteOwnerForm ownerId={ownerId} variant="menu" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

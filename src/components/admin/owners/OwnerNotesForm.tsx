"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  updateOwnerNotes,
  type UpdateOwnerNotesState,
} from "@/actions/admin/owners/updateOwnerNotes.action";
import { useActionToast } from "@/hooks/use-action-toast";

const initialState: UpdateOwnerNotesState = {
  error: null,
  success: false,
  updatedAt: null,
};

export function OwnerNotesForm({
  ownerId,
  notes,
  disabled = false,
}: {
  ownerId: string;
  notes: string | null;
  disabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateOwnerNotes,
    initialState,
  );
  const [value, setValue] = useState(notes ?? "");

  useEffect(() => {
    setValue(notes ?? "");
  }, [notes]);

  useActionToast(pending, state, {
    successMessage: "تم التعديل بنجاح",
    successDescription: "تم حفظ ملاحظات المالك",
    errorTitle: "تعذر حفظ الملاحظات",
  });

  const dirty = value.trim() !== (notes ?? "").trim();

  return (
    <Card>
      <CardHeader className="flex-row items-start gap-3 space-y-0">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <StickyNote className="size-4.5" />
        </div>
        <div>
          <CardTitle>ملاحظات الإدارة</CardTitle>
          <CardDescription className="mt-1">
            ملاحظات داخلية عن المالك — تظهر لمدير المنصة فقط
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="ownerId" value={ownerId} />
          <Textarea
            name="notes"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled || pending}
            rows={6}
            maxLength={2000}
            placeholder="اكتب ملاحظاتك هنا… مثل طريقة التواصل المفضلة، أو أي تنبيه يخص الحساب."
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {value.length}/2000
              {disabled ? " — الحساب محذوف ولا يمكن تعديله" : ""}
            </p>
            <Button type="submit" disabled={disabled || pending || !dirty}>
              {pending && <Loader2 className="animate-spin" />}
              {pending ? "جارٍ الحفظ..." : "حفظ الملاحظات"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

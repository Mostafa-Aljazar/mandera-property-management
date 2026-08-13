"use client";

import { useActionState, useEffect, useState } from "react";
import { Loader2, StickyNote } from "lucide-react";
import {
  updateOwnerNotes,
  type UpdateOwnerNotesState,
} from "@/actions/admin/owners/updateOwnerNotes.action";
import { useActionToast } from "@/hooks/use-action-toast";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

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
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_36px_rgba(15,42,55,0.04)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <StickyNote className="size-4" style={{ color: BRAND.red }} />
            <h2 className="text-base font-bold" style={{ color: BRAND.navy }}>
              ملاحظات الإدارة
            </h2>
          </div>
          <p className="mt-1 text-sm text-[#5b6b73]">
            ملاحظات داخلية عن المالك — تظهر لمدير المنصة فقط
          </p>
        </div>
      </div>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="ownerId" value={ownerId} />
        <textarea
          name="notes"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={disabled || pending}
          rows={6}
          maxLength={2000}
          placeholder="اكتب ملاحظاتك هنا… مثل طريقة التواصل المفضلة، أو أي تنبيه يخص الحساب."
          className={cn(
            "w-full resize-y rounded-xl border border-[#16445B]/12 bg-[#f7fafb] px-3.5 py-3 text-sm leading-7 text-[#16445B]",
            "outline-none transition-colors placeholder:text-[#8a969c]",
            "focus-visible:border-[#16445B]/35 focus-visible:ring-3 focus-visible:ring-[#16445B]/10",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#8a969c]">
            {value.length}/2000
            {disabled ? " — الحساب محذوف ولا يمكن تعديله" : ""}
          </p>
          <button
            type="submit"
            disabled={disabled || pending || !dirty}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-45"
            style={{ backgroundColor: BRAND.navy }}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "جارٍ الحفظ..." : "حفظ الملاحظات"}
          </button>
        </div>
      </form>
    </section>
  );
}

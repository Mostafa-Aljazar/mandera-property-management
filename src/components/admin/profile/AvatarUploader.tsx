"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const MAX_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUploader({
  userId,
  fullName,
  avatarUrl,
}: {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [uploading, setUploading] = useState(false);

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("تعذر رفع الصورة", {
        description: "الصورة لازم تكون JPG أو PNG أو WEBP",
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("تعذر رفع الصورة", {
        description: "حجم الصورة أكبر من 2 ميجا",
      });
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.type.split("/")[1];
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setUploading(false);
      toast.error("تعذر رفع الصورة", {
        description: uploadError.message,
      });
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);
    const bustedUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: dbError } = await supabase
      .from("users")
      .update({ avatar_url: bustedUrl })
      .eq("id", userId);

    setUploading(false);

    if (dbError) {
      toast.error("تعذر حفظ الصورة", {
        description: dbError.message,
      });
      return;
    }

    setPreview(bustedUrl);
    toast.success("تم التعديل بنجاح", {
      description: "تم تحديث صورة الملف الشخصي",
    });
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative shrink-0 disabled:opacity-60"
        aria-label="تغيير الصورة الشخصية"
      >
        <Avatar
          className="size-24 ring-4 ring-white shadow-[0_12px_32px_rgba(15,42,55,0.16)] sm:size-28"
          style={{ backgroundColor: `${BRAND.navy}14` }}
        >
          {preview && <AvatarImage src={preview} alt={fullName} />}
          <AvatarFallback
            className="text-2xl font-bold"
            style={{ color: BRAND.navy, backgroundColor: `${BRAND.navy}14` }}
          >
            {initials || "؟"}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute inset-e-0 bottom-0 flex size-9 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white transition-transform group-hover:scale-105",
          )}
          style={{ backgroundColor: BRAND.red }}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
        </span>
      </button>

      <div className="min-w-0 text-center sm:text-start">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="font-bold" style={{ color: BRAND.navy }}>
          {fullName || "حساب الأدمن"}
        </p>
        <p className="mt-1 text-sm leading-6 text-[#5b6b73]">
          JPG / PNG / WEBP — حتى 2MB
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#16445B]/15 bg-white px-4 text-sm font-semibold text-[#16445B] transition-colors hover:bg-[#f7fafb] disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "جارٍ الرفع..." : "تغيير الصورة"}
        </button>
      </div>
    </div>
  );
}

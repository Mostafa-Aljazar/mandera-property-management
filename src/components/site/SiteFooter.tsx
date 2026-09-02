import Image from "next/image";
import Link from "next/link";
import { IMG_LOGO } from "@/assets";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/5 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-8">
        <Link href="/login" className="shrink-0">
          <Image
            src={IMG_LOGO}
            alt="Mandera Property Management"
            width={130}
            height={32}
            unoptimized
            className="h-7 w-auto"
          />
        </Link>
        <p className="text-xs text-[#8a969c]">
          © {new Date().getFullYear()} Mandera
        </p>
      </div>
    </footer>
  );
}

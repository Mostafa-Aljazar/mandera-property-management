"use client";

import { useMemo } from "react";
import { Combobox } from "@base-ui/react/combobox";
import * as Flags from "country-flag-icons/react/3x2";
import { getCountryCallingCode, type Country } from "react-phone-number-input";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type CountryOption = {
  value?: string;
  label: string;
  divider?: boolean;
};

type PhoneCountryComboboxProps = {
  value?: string;
  onChange: (value: string | undefined) => void;
  options: CountryOption[];
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
};

function dialCodeOf(country?: string) {
  if (!country) return "";
  try {
    return `+${getCountryCallingCode(country as Country)}`;
  } catch {
    return "";
  }
}

function CountryFlag({
  country,
  className,
}: {
  country?: string;
  className?: string;
}) {
  if (!country) {
    return (
      <span
        className={cn(
          "inline-flex h-3.5 w-5 items-center justify-center rounded-[3px] bg-[#e8eef1] text-[10px]",
          className,
        )}
        aria-hidden
      >
        🌐
      </span>
    );
  }

  const Flag = Flags[country as keyof typeof Flags];
  if (!Flag) {
    return (
      <span
        className={cn(
          "inline-flex h-3.5 w-5 items-center justify-center rounded-[3px] bg-[#e8eef1] text-[10px] font-semibold text-[#5b6b73]",
          className,
        )}
        aria-hidden
      >
        {country}
      </span>
    );
  }

  return (
    <Flag
      aria-hidden
      title={country}
      className={cn(
        "h-3.5 w-5 shrink-0 rounded-[3px] object-cover shadow-[0_0_0_1px_rgba(15,42,55,0.12)]",
        className,
      )}
    />
  );
}

export function PhoneCountryCombobox({
  value,
  onChange,
  options,
  disabled,
  readOnly,
  className,
}: PhoneCountryComboboxProps) {
  const items = useMemo(
    () => options.filter((option) => !option.divider),
    [options],
  );

  const selected = useMemo(
    () => items.find((item) => (item.value || undefined) === value) ?? null,
    [items, value],
  );

  return (
    <Combobox.Root
      items={items}
      value={selected}
      onValueChange={(next) => {
        if (!next) {
          onChange(undefined);
          return;
        }
        onChange(next.value || undefined);
      }}
      itemToStringLabel={(item) =>
        item.value
          ? `${item.label} ${dialCodeOf(item.value)}`
          : item.label
      }
      isItemEqualToValue={(a, b) => (a?.value || "ZZ") === (b?.value || "ZZ")}
      disabled={disabled || readOnly}
      modal={false}
    >
      <Combobox.Trigger
        type="button"
        className={cn(
          "PhoneInputCountry relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-1.5 text-[#16445B] outline-none transition-colors",
          "hover:bg-[#16445B]/08 focus-visible:ring-2 focus-visible:ring-[#16445B]/20",
          "data-popup-open:bg-[#16445B]/10",
          (disabled || readOnly) && "pointer-events-none opacity-50",
          className,
        )}
        aria-label={selected?.label || "اختر الدولة"}
      >
        <CountryFlag country={value} className="h-4 w-[1.4rem]" />
        <Combobox.Icon className="flex text-[#8a969c]">
          <ChevronDown className="size-3.5" />
        </Combobox.Icon>
      </Combobox.Trigger>

      <Combobox.Portal>
        <Combobox.Positioner
          className="z-50 outline-none"
          sideOffset={8}
          align="start"
        >
          <Combobox.Popup
            className={cn(
              "flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-black/8 bg-white",
              "shadow-[0_18px_50px_rgba(15,42,55,0.14)] outline-none",
              "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150",
              "data-starting-style:scale-95 data-starting-style:opacity-0",
              "data-ending-style:scale-95 data-ending-style:opacity-0",
            )}
            aria-label="اختر الدولة"
          >
            <div className="border-b border-black/5 p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 start-2.5 size-3.5 -translate-y-1/2 text-[#8a969c]" />
                <Combobox.Input
                  placeholder="ابحث عن دولة أو رمز..."
                  className="h-9 w-full rounded-xl border border-[#16445B]/12 bg-[#f7fafb] pe-3 ps-8 text-sm text-[#16445B] outline-none placeholder:text-[#8a969c] focus:border-[#16445B]/30 focus:ring-[3px] focus:ring-[#16445B]/12"
                />
              </div>
            </div>

            <Combobox.Empty className="px-4 py-6 text-center text-sm text-[#8a969c]">
              لا توجد نتائج
            </Combobox.Empty>

            <Combobox.List className="max-h-64 scroll-py-1 overflow-y-auto overscroll-contain p-1.5 outline-none">
              {(item: CountryOption) => {
                const dial = dialCodeOf(item.value);
                return (
                  <Combobox.Item
                    key={item.value || "ZZ"}
                    value={item}
                    className={cn(
                      "group flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-[#16445B] outline-none select-none",
                      "data-highlighted:bg-[#16445B] data-highlighted:text-white",
                      "data-selected:font-semibold",
                    )}
                  >
                    <CountryFlag country={item.value} />
                    <span className="min-w-0 flex-1 truncate text-start">
                      {item.label}
                    </span>
                    {dial ? (
                      <span
                        dir="ltr"
                        className="shrink-0 font-mono text-xs tabular-nums text-[#8a969c] group-data-highlighted:text-white/80"
                      >
                        {dial}
                      </span>
                    ) : null}
                    <Combobox.ItemIndicator className="flex w-3.5 shrink-0 text-current">
                      <Check className="size-3.5" />
                    </Combobox.ItemIndicator>
                  </Combobox.Item>
                );
              }}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

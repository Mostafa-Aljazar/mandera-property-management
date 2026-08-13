"use client";

import PhoneInput, { type Country } from "react-phone-number-input";
import ar from "react-phone-number-input/locale/ar";
import "react-phone-number-input/style.css";
import { PhoneCountryCombobox } from "@/components/common/PhoneCountryCombobox";
import { cn } from "@/lib/utils";

type PhoneFieldProps = {
  id?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  defaultCountry?: Country;
};

export function PhoneField({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  invalid,
  className,
  defaultCountry = "AE",
}: PhoneFieldProps) {
  return (
    <PhoneInput
      id={id}
      international
      defaultCountry={defaultCountry}
      labels={ar}
      value={value || undefined}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      countrySelectComponent={PhoneCountryCombobox}
      className={cn(
        "PhoneField flex h-11 w-full items-center gap-2 rounded-xl border border-[#16445B]/12 bg-[#f7fafb] px-3 text-sm transition-[color,box-shadow]",
        "focus-within:border-[#16445B]/35 focus-within:ring-[3px] focus-within:ring-[#16445B]/15",
        invalid &&
          "border-[#ED1B24]/40 focus-within:border-[#ED1B24]/50 focus-within:ring-[#ED1B24]/15",
        disabled && "opacity-60",
        className,
      )}
      numberInputProps={{
        className:
          "min-w-0 flex-1 border-0 bg-transparent p-0 text-start outline-none",
        dir: "ltr",
      }}
    />
  );
}

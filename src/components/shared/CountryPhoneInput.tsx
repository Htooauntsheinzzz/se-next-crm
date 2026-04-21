"use client";

import { useEffect, useState } from "react";
import {
  combinePhoneValue,
  COUNTRY_CODE_OPTIONS,
  DEFAULT_COUNTRY_CODE,
  parsePhoneValue,
} from "@/lib/phone";

interface CountryPhoneInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const CountryPhoneInput = ({
  label,
  value,
  onChange,
  error,
  placeholder = "123456789",
  disabled = false,
}: CountryPhoneInputProps) => {
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [localNumber, setLocalNumber] = useState("");

  useEffect(() => {
    const parsed = parsePhoneValue(value);
    setCountryCode(parsed.countryCode);
    setLocalNumber(parsed.localNumber);
  }, [value]);

  const handleCountryCodeChange = (nextCountryCode: string) => {
    setCountryCode(nextCountryCode);
    onChange(combinePhoneValue(nextCountryCode, localNumber));
  };

  const handleLocalNumberChange = (nextLocalNumber: string) => {
    const digitsOnly = nextLocalNumber.replace(/\D/g, "");
    setLocalNumber(digitsOnly);
    onChange(combinePhoneValue(countryCode, digitsOnly));
  };

  return (
    <div>
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="mt-1 grid grid-cols-[92px_minmax(0,1fr)] gap-2">
        <select
          value={countryCode}
          disabled={disabled}
          onChange={(event) => handleCountryCodeChange(event.target.value)}
          title={COUNTRY_CODE_OPTIONS.find((option) => option.value === countryCode)?.label}
          className="h-10 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700"
        >
          {COUNTRY_CODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.value}
            </option>
          ))}
        </select>

        <input
          type="number"
          min={0}
          step={1}
          disabled={disabled}
          value={localNumber}
          onChange={(event) => handleLocalNumberChange(event.target.value)}
          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm text-slate-700 outline-none ring-[#D9CFF5] [appearance:textfield] focus:ring-2 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder={placeholder}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
    </div>
  );
};

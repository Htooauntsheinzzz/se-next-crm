export interface CountryCodeOption {
  value: string;
  label: string;
}

export const COUNTRY_CODE_OPTIONS: CountryCodeOption[] = [
  { value: "+66", label: "Thailand (+66)" },
  { value: "+95", label: "Myanmar (+95)" },
  { value: "+1", label: "United States (+1)" },
  { value: "+44", label: "United Kingdom (+44)" },
  { value: "+91", label: "India (+91)" },
  { value: "+81", label: "Japan (+81)" },
  { value: "+65", label: "Singapore (+65)" },
  { value: "+60", label: "Malaysia (+60)" },
];

export const DEFAULT_COUNTRY_CODE = "+66";

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

export const parsePhoneValue = (
  value: string | null | undefined,
): { countryCode: string; localNumber: string } => {
  const raw = (value ?? "").trim();

  if (!raw) {
    return { countryCode: DEFAULT_COUNTRY_CODE, localNumber: "" };
  }

  const sortedCodes = [...COUNTRY_CODE_OPTIONS].sort((a, b) => b.value.length - a.value.length);
  const matchedCode = sortedCodes.find((option) => raw.startsWith(option.value));

  if (matchedCode) {
    return {
      countryCode: matchedCode.value,
      localNumber: normalizeDigits(raw.slice(matchedCode.value.length)),
    };
  }

  return {
    countryCode: DEFAULT_COUNTRY_CODE,
    localNumber: normalizeDigits(raw),
  };
};

export const combinePhoneValue = (countryCode: string, localNumber: string) => {
  const digits = normalizeDigits(localNumber);
  if (!digits) {
    return "";
  }
  return `${countryCode}${digits}`;
};

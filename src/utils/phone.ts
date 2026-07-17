const AUSTRALIAN_NATIONAL_PHONE_PATTERN =
  /^(?:0[23478]\d{8}|13\d{4}|1[38]00\d{6})$/;
const INTERNATIONAL_PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export const isValidPhoneNumber = (value: string) => {
  const compact = value.trim().replace(/[\s().-]/g, "");
  const countryCodeMatch = compact.match(/^\+?61(.*)$/);

  if (countryCodeMatch) {
    const nationalNumber = countryCodeMatch[1].startsWith("0")
      ? countryCodeMatch[1]
      : `0${countryCodeMatch[1]}`;

    return AUSTRALIAN_NATIONAL_PHONE_PATTERN.test(nationalNumber);
  }

  return (
    AUSTRALIAN_NATIONAL_PHONE_PATTERN.test(compact) ||
    INTERNATIONAL_PHONE_PATTERN.test(compact)
  );
};

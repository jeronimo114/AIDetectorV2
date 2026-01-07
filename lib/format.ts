const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZone: "UTC"
});

export const formatDateTimeUTC = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${dateTimeFormatter.format(date)} UTC`;
};

export const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const [whole, fraction] = value.toString().split(".");
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction ? `${withCommas}.${fraction}` : withCommas;
};

import dayjs from "dayjs";
export const handleNicknameChange = (
  event: React.ChangeEvent<HTMLInputElement>
): string => {
  let value = event.target.value;
  if (!value.match(/^@/)) {
    value = "@" + value;
  }
  return value;
};

export const labelStartWith = (value?: string, startWith?: string): string => {
  if (!value) return "";
  return value.startsWith(startWith ?? "") ? value : `${startWith}${value}`;
};

export const formatDate = (date: string, formatReplace?: string): string => {
  const isToday = dayjs().isSame(date, "day");
  const dateFormat = formatReplace
    ? formatReplace
    : isToday
    ? "hh:mm"
    : "DD MMM, hh:mm";

  const formattedDate = dayjs(date).format(dateFormat);

  return isToday ? `Today, ${formattedDate}` : formattedDate;
};

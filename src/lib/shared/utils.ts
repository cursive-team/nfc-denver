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

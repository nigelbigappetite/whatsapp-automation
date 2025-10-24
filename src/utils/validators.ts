export const isValidEmail = (s: string) =>
  /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(s.trim());

export const isValidPhone = (s: string) =>
  /^[0-9\s+()-]{7,15}$/.test(s.trim());

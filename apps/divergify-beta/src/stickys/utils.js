export function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function isValidISODate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  return date.toISOString().startsWith(value);
}

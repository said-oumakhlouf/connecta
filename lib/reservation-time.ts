export function reservationTime(deadline: string | null | undefined, now: number) {
  const end = deadline ? Date.parse(deadline) : NaN;
  if (!Number.isFinite(end)) return null;
  const seconds = Math.max(0, Math.ceil((end - now) / 1000));
  return {
    expired: seconds === 0,
    label: `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, '0')} s`,
  };
}

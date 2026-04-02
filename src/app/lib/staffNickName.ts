/**
 * Postgres uses `nick_name`; admin forms use `nickname`.
 * API usually maps both; this covers raw rows and cached payloads.
 */
export function normalizeStaffRecord<T extends Record<string, unknown>>(
  row: T,
): T & {
  nickname: string;
  hireDate: string;
  licenseNumber: string;
  role: string;
  baseHourlyRate: string;
} {
  const r = row as Record<string, unknown>;
  const nick = r.nickname ?? r.nick_name;
  const hourly = r.hourly_rate ?? r.hourlyRate ?? r.baseHourlyRate;
  return {
    ...row,
    nickname: nick != null && String(nick).trim() !== "" ? String(nick) : "",
    hireDate: String(r.hireDate ?? r.hire_date ?? ""),
    licenseNumber: String(r.licenseNumber ?? r.license_number ?? ""),
    role: String(r.role ?? "Nail Technician"),
    baseHourlyRate:
      hourly != null && hourly !== ""
        ? String(hourly)
        : String(r.baseHourlyRate ?? ""),
  };
}

export function normalizeStaffList<T extends Record<string, unknown>>(
  rows: T[],
): (T & { nickname: string })[] {
  return rows.map(normalizeStaffRecord);
}

/** Public-facing label: nickname when set, otherwise legal name. */
export function getStaffDisplayName(staff: {
  name: string;
  nickname?: string;
  nick_name?: string | null;
}): string {
  const nick = staff.nickname ?? staff.nick_name;
  if (nick != null && String(nick).trim() !== "") {
    return String(nick).trim();
  }
  return staff.name ?? "";
}

/** Parsed parts for admin UI: nickname + legal name (tên thật). */
export function getStaffAdminTitleParts(staff: {
  name?: string;
  nickname?: string;
  nick_name?: string | null;
}): { nickname: string; legalName: string } {
  const legalName = String(staff.name ?? "").trim();
  const nickRaw = staff.nickname ?? staff.nick_name;
  const nickname =
    nickRaw != null && String(nickRaw).trim() !== ""
      ? String(nickRaw).trim()
      : "";
  return { nickname, legalName };
}

/**
 * Plain string for search, sort, aria: "Nickname (Legal name)" when both exist;
 * otherwise legal name only, or nickname only.
 */
export function getStaffAdminTitle(staff: {
  name?: string;
  nickname?: string;
  nick_name?: string | null;
}): string {
  const { nickname, legalName } = getStaffAdminTitleParts(staff);
  if (nickname && legalName) return `${nickname} (${legalName})`;
  if (legalName) return legalName;
  return nickname;
}

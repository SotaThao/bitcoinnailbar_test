/**
 * Postgres uses `nick_name`; admin forms use `nickname`.
 * API usually maps both; this covers raw rows and cached payloads.
 */
export function normalizeStaffRecord<T extends Record<string, unknown>>(
  row: T,
): T & { nickname: string } {
  const r = row as Record<string, unknown>;
  const nick = r.nickname ?? r.nick_name;
  return {
    ...row,
    nickname: nick != null && String(nick).trim() !== "" ? String(nick) : "",
  };
}

export function normalizeStaffList<T extends Record<string, unknown>>(
  rows: T[],
): (T & { nickname: string })[] {
  return rows.map(normalizeStaffRecord);
}

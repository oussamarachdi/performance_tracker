/**
 * One signup row from the Signups Marketing sheet.
 * Fields match header names or logical names for columns D, J, K, L, M, R.
 * personId joins with Expa Application sheet for "applied" metric.
 */
export interface RawSheetRow {
  submittedAt: string;
  universityName: string;
  internshipType: string;
  memberName: string;
  referral: string;
  accountStatus: string;
  /** Person/EP ID to match with Expa Application (Unique Person ID). */
  personId: string;
}

/** Header name → column index (0-based). Used to parse rows by header. */
export interface SheetHeaderMap {
  submittedAt: number;
  universityName: number;
  internshipType: number;
  memberName: number;
  referral: number;
  accountStatus: number;
  personId: number;
}

const DEFAULT_HEADER_MAP: SheetHeaderMap = {
  submittedAt: 3,   // D - Submitted at
  universityName: 9,  // J - [UN] University Name
  internshipType: 10, // K - Type of abroad internship
  memberName: 12,     // M - Member Name
  referral: 11,       // L - Referral
  accountStatus: 17,  // R - Account Status
  personId: -1,       // optional; detect by header
};

/** Find column index by trying candidates in order; prefers first candidate that matches a header. */
function findColumnByCandidates(headerRow: string[], candidates: string[]): number {
  for (const c of candidates) {
    const i = headerRow.findIndex((cell) =>
      String(cell ?? "").trim().toLowerCase().includes(c.toLowerCase())
    );
    if (i >= 0) return i;
  }
  return -1;
}

/** Build header map from first row (array of cell values). Falls back to defaults if header not found. */
export function buildHeaderMap(headerRow: string[]): SheetHeaderMap {
  const findIndex = (candidates: string[]): number => {
    const i = headerRow.findIndex((cell) =>
      candidates.some((c) => cell.trim().toLowerCase().includes(c.toLowerCase()))
    );
    return i >= 0 ? i : -1;
  };
  // Signups sheet: column is "EXPA ID" – prefer that over a generic "ID"
  const personIdIdx = findColumnByCandidates(headerRow, ["expa id", "expa person id", "person id", "ep id", "unique person id", "id"]);
  return {
    submittedAt: findIndex(["submitted at"]) >= 0 ? findIndex(["submitted at"]) : DEFAULT_HEADER_MAP.submittedAt,
    universityName: findIndex(["[un] university name", "university name"]) >= 0 ? findIndex(["[un] university name", "university name"]) : DEFAULT_HEADER_MAP.universityName,
    internshipType: findIndex(["type of abroad internship", "internship"]) >= 0 ? findIndex(["type of abroad internship", "internship"]) : DEFAULT_HEADER_MAP.internshipType,
    memberName: findIndex(["member name", "member"]) >= 0 ? findIndex(["member name", "member"]) : DEFAULT_HEADER_MAP.memberName,
    referral: findIndex(["referral"]) >= 0 ? findIndex(["referral"]) : DEFAULT_HEADER_MAP.referral,
    accountStatus: findIndex(["account status", "account"]) >= 0 ? findIndex(["account status", "account"]) : DEFAULT_HEADER_MAP.accountStatus,
    personId: personIdIdx >= 0 ? personIdIdx : DEFAULT_HEADER_MAP.personId,
  };
}

function getCell(row: string[], index: number): string {
  if (index < 0 || index >= row.length) return "";
  const v = row[index];
  return typeof v === "string" ? v.trim() : String(v ?? "").trim();
}

/** Normalize person/EP ID for consistent join between Signups and Expa Application (handles numbers from Sheets). */
export function normalizePersonId(value: unknown): string {
  if (value == null) return "";
  const s = typeof value === "string" ? value.trim() : String(value).trim();
  if (!s) return "";
  const num = Number(s);
  if (Number.isFinite(num) && !Number.isNaN(num)) return String(Math.trunc(num));
  return s;
}

/** Map a sheet data row (string[]) to RawSheetRow using the header map. */
export function parseRow(row: string[], headerMap: SheetHeaderMap): RawSheetRow {
  const personIdRaw =
    headerMap.personId >= 0 && headerMap.personId < (row?.length ?? 0)
      ? row[headerMap.personId]
      : "";
  return {
    submittedAt: getCell(row, headerMap.submittedAt),
    universityName: getCell(row, headerMap.universityName),
    internshipType: getCell(row, headerMap.internshipType),
    memberName: getCell(row, headerMap.memberName),
    referral: getCell(row, headerMap.referral),
    accountStatus: getCell(row, headerMap.accountStatus),
    personId: normalizePersonId(personIdRaw),
  };
}

/** Find column index by trying candidates in order; prefers first candidate that matches a header. */
function findColumnIndex(headerRow: string[], candidates: string[]): number {
  for (const c of candidates) {
    const i = headerRow.findIndex((cell) =>
      String(cell ?? "").trim().toLowerCase().includes(c.toLowerCase())
    );
    if (i >= 0) return i;
  }
  return -1;
}

/**
 * Parse Expa Application sheet into a Set of unique person IDs (normalized, non-empty).
 * Sheet column is "Person ID" – prefer that first.
 */
export function parseExpaApplicationPersonIds(headerRow: string[], dataRows: string[][]): Set<string> {
  const idx = findColumnIndex(headerRow, ["person id", "unique person id", "expa person id", "ep id", "expa id", "id"]);
  if (idx < 0) return new Set();
  const set = new Set<string>();
  for (const row of dataRows) {
    const raw = idx < row.length ? row[idx] : undefined;
    const v = normalizePersonId(raw);
    if (v) set.add(v);
  }
  return set;
}

/**
 * Parse Members Info sheet into Map(normalized name -> department).
 * Name column: "name", "member name", "person". Department column: "department", "dept".
 * Keys are normalized (trim + lowercase) for lookup against Signups memberName.
 */
export function parseMembersInfo(headerRow: string[], dataRows: string[][]): Map<string, string> {
  const nameIdx = findColumnIndex(headerRow, ["name", "member name", "person"]);
  const deptIdx = findColumnIndex(headerRow, ["department", "dept"]);
  if (nameIdx < 0 || deptIdx < 0) return new Map();
  const map = new Map<string, string>();
  for (const row of dataRows) {
    const name = nameIdx < row.length ? String(row[nameIdx] ?? "").trim() : "";
    const dept = deptIdx < row.length ? String(row[deptIdx] ?? "").trim() : "";
    if (name) {
      const key = name.toLowerCase();
      map.set(key, dept || "General");
    }
  }
  return map;
}

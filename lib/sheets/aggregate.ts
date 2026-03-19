import type { RawSheetRow } from "./types";
import type { Member, University, Product, CampaignData } from "@/lib/mockData";

// ─── Constants ───────────────────────────────────────────────────────────────

const TEXT_ACCOUNT_CREATED = "created successfully";
const TEXT_ALREADY_EXISTS  = "already exists";

// ─── Utility helpers ─────────────────────────────────────────────────────────

/** URL-safe slug for IDs. */
function slug(str: string): string {
  return (str ?? "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Normalise a member name for map lookups. */
function normalizeName(name: string): string {
  return (name ?? "").trim().toLowerCase();
}

// ─── Row classification ───────────────────────────────────────────────────────

function isSignedUp(accountStatus: string): boolean {
  const s = normalizeName(accountStatus);
  return s.includes(TEXT_ACCOUNT_CREATED) && !s.includes(TEXT_ALREADY_EXISTS);
}

function isAlreadyExists(accountStatus: string): boolean {
  return normalizeName(accountStatus).includes(TEXT_ALREADY_EXISTS);
}

// ─── Date parsing ─────────────────────────────────────────────────────────────

/**
 * Parse a date string or Google Sheets serial number to YYYY-MM-DD.
 * Returns "" when the input cannot be parsed.
 */
function parseDateOnly(raw: string): string {
  const s = (raw ?? "").trim();
  if (!s) return "";

  // ISO / locale string
  let d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  // Google Sheets serial (days since 1899-12-30)
  const serial = Number(s);
  if (Number.isFinite(serial) && serial > 0) {
    d = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  }

  // Slash / dash delimited: detect year position by value > 1000
  const parts = s.split(/[\/\-]/).map(Number);
  if (parts.length === 3 && parts.every(Number.isFinite)) {
    const [a, b, c] = parts;
    const year  = a > 1000 ? a : c > 1000 ? c : null;
    const month = a > 1000 ? b : c > 1000 ? b : b;
    const day   = a > 1000 ? c : c > 1000 ? a : (a > 12 ? a : c);
    if (year !== null) {
      d = new Date(year, month - 1, day);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
  }

  return "";
}

// ─── Bucket types ─────────────────────────────────────────────────────────────

interface Bucket {
  leads:          number;
  signups:        number;
  alreadyExists:  number;
  appliedIds:     Set<string>;  // dedup key – either personId or row sentinel
}

interface MemberBucket extends Bucket {
  universities:  Set<string>;
  products:      Set<string>;
  leadsByDate:   Map<string, number>;
}

function emptyBucket(): Bucket {
  return { leads: 0, signups: 0, alreadyExists: 0, appliedIds: new Set() };
}

function emptyMemberBucket(): MemberBucket {
  return {
    ...emptyBucket(),
    universities: new Set(),
    products:     new Set(),
    leadsByDate:  new Map(),
  };
}

// ─── Applied-count resolution ─────────────────────────────────────────────────

/**
 * Decide whether EXPA data should be used as the source of truth for "applied".
 *
 * Rules:
 *  - If no EXPA set was provided → false (use signups as proxy).
 *  - If at least one signed-up person matched in EXPA → true.
 *  - If EXPA was provided but zero rows matched → false (EXPA data is stale /
 *    mis-joined; fall back to signups so we don't silently report 0 applied).
 */
function resolveAppliedStrategy(
  expaPersonIds: Set<string> | null,
  signedUpIds: Set<string>
): boolean {
  if (!expaPersonIds || expaPersonIds.size === 0) return false;
  for (const id of signedUpIds) {
    if (expaPersonIds.has(id)) return true;
  }
  return false;  // EXPA present but no overlap → don't trust it
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface AggregatedDepartment {
  id:              string;
  name:            string;
  leads:           number;
  signups:         number;
  contacted:       number;
  interested:      number;
  applied:         number;
  /** signups → applied rate (0-100). */
  signupToApplyRate: number;
}

export interface AggregatedResult {
  members:         Member[];
  universities:    University[];
  products:        Product[];
  departments:     AggregatedDepartment[];
  campaignMetrics: CampaignData[];
  totals: {
    leads:         number;
    signups:       number;
    contacted:     number;
    interested:    number;
    applied:       number;
    alreadyExists: number;
  };
  /** leads → applied rate (0-100) – top-level funnel conversion. */
  leadConversionRate: number;
  /** signups → applied rate (0-100) – post-signup conversion. */
  signupToApplyRate: number;
}

// ─── Main aggregation ─────────────────────────────────────────────────────────

export function aggregate(
  rawRows:                RawSheetRow[],
  expaPersonIds:          Set<string> | null = null,
  memberDepartmentByName: Map<string, string> | null = null
): AggregatedResult {

  // 1. Drop structurally empty rows (all key fields blank)
  const rows = rawRows.filter(
    (r) => r.memberName || r.universityName || r.internshipType || r.submittedAt
  );

  // 2. Collect signed-up person IDs for EXPA matching
  const signedUpPersonIds = new Set<string>();
  for (const r of rows) {
    if (isSignedUp(r.accountStatus) && r.personId) {
      signedUpPersonIds.add(r.personId);
    }
  }

  const useExpa = resolveAppliedStrategy(expaPersonIds, signedUpPersonIds);

  // 3. Per-row accumulation into four lookup maps
  const byMember     = new Map<string, MemberBucket>();
  const byUniversity = new Map<string, Bucket>();
  const byProduct    = new Map<string, Bucket>();
  const byDate       = new Map<string, Bucket>();

  for (let i = 0; i < rows.length; i++) {
    const r         = rows[i];
    const signedup  = isSignedUp(r.accountStatus);
    const already   = isAlreadyExists(r.accountStatus);
    const date      = parseDateOnly(r.submittedAt);

    /**
     * Applied dedup key:
     *  - EXPA mode:     person's EXPA ID (deduplicates people who filled the
     *                   form more than once).
     *  - Non-EXPA mode: row sentinel – every signed-up row counts once,
     *                   no cross-entity deduplication needed.
     */
    const appliedId: string | null =
      signedup
        ? useExpa
          ? (r.personId && expaPersonIds!.has(r.personId) ? r.personId : null)
          : `__row_${i}`
        : null;

    // ── University ──
    const uKey = r.universityName || "(Unknown)";
    const ub   = byUniversity.get(uKey) ?? emptyBucket();
    ub.leads++;
    if (signedup) ub.signups++;
    if (already)  ub.alreadyExists++;
    if (appliedId !== null) ub.appliedIds.add(appliedId);
    byUniversity.set(uKey, ub);

    // ── Product ──
    const pKey = r.internshipType || "(Unknown)";
    const pb   = byProduct.get(pKey) ?? emptyBucket();
    pb.leads++;
    if (signedup) pb.signups++;
    if (already)  pb.alreadyExists++;
    if (appliedId !== null) pb.appliedIds.add(appliedId);
    byProduct.set(pKey, pb);

    // ── Member ──
    const mKey = r.memberName || "(Unknown)";
    const mb   = byMember.get(mKey) ?? emptyMemberBucket();
    mb.leads++;
    if (signedup) mb.signups++;
    if (already)  mb.alreadyExists++;
    if (appliedId !== null) mb.appliedIds.add(appliedId);
    if (r.universityName) mb.universities.add(r.universityName);
    if (r.internshipType) mb.products.add(r.internshipType);
    if (date) mb.leadsByDate.set(date, (mb.leadsByDate.get(date) ?? 0) + 1);
    byMember.set(mKey, mb);

    // ── Date ──
    if (date) {
      const db = byDate.get(date) ?? emptyBucket();
      db.leads++;
      if (signedup) db.signups++;
      if (already)  db.alreadyExists++;
      if (appliedId !== null) db.appliedIds.add(appliedId);
      byDate.set(date, db);
    }
  }

  // 4. Totals (computed directly, not derived from entity maps to avoid
  //    double-counting the same person appearing under multiple entities)
  const totalLeads        = rows.length;
  const totalSignups      = rows.filter((r) => isSignedUp(r.accountStatus)).length;
  const totalAlreadyExists = rows.filter((r) => isAlreadyExists(r.accountStatus)).length;
  const totalApplied      = useExpa
    ? (() => {
        const s = new Set<string>();
        for (const r of rows) {
          if (isSignedUp(r.accountStatus) && r.personId && expaPersonIds!.has(r.personId)) {
            s.add(r.personId);
          }
        }
        return s.size;
      })()
    : totalSignups;

  const leadConversionRate  = totalLeads    ? (totalApplied / totalLeads)    * 100 : 0;
  const signupToApplyRate   = totalSignups  ? (totalApplied / totalSignups)  * 100 : 0;

  // ── Helper: per-entity rates (consistently use signups as denominator) ──
  const entityRates = (b: Bucket) => ({
    applied:           b.appliedIds.size,
    signupToApplyRate: b.signups ? (b.appliedIds.size / b.signups) * 100 : 0,
  });

  // 5. Build output arrays
  const universities: University[] = Array.from(byUniversity.entries()).map(([name, b]) => ({
    id: slug(name) || "unknown",
    name,
    location: "",
    leads:           b.leads,
    signups:         b.signups,
    contacted:       0,
    interested:      0,
    ...entityRates(b),
    conversionRate:  entityRates(b).signupToApplyRate,  // alias for UI compat
  }));

  const products: Product[] = Array.from(byProduct.entries()).map(([name, b]) => ({
    id: slug(name) || "unknown",
    name,
    description: "",
    leads:           b.leads,
    signups:         b.signups,
    contacted:       0,
    interested:      0,
    ...entityRates(b),
    conversionRate:  entityRates(b).signupToApplyRate,
  }));

  const members: Member[] = Array.from(byMember.entries()).map(([name, mb]) => {
    const datesWithBooth = Array.from(mb.leadsByDate.values()).filter((n) => n >= 5);
    const boothsAttended = datesWithBooth.length > 0
      ? datesWithBooth.length
      : mb.leads >= 5 ? 1 : 0;  // TODO: replace heuristic with explicit event column

    const department = memberDepartmentByName?.get(normalizeName(name)) ?? "General";
    const { applied, signupToApplyRate: conv } = entityRates(mb);

    return {
      id:                  slug(name) || "unknown",
      name,
      department,
      leads:               mb.leads,
      signups:             mb.signups,
      contacted:           0,
      interested:          0,
      applied,
      conversionRate:      conv,
      boothsAttended,
      dailyMetrics:        [],
      universitiesVisited: Array.from(mb.universities).map((n) => slug(n) || "unknown"),
      productsPromoted:    Array.from(mb.products).map((n) => slug(n) || "unknown"),
    };
  });

  const campaignMetrics: CampaignData[] = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, b]) => ({
      date,
      leads:      b.leads,
      signups:    b.signups,
      contacted:  0,
      interested: 0,
      applied:    b.appliedIds.size,
    }));

  // 6. Departments – derived by aggregating member data (avoids double-counting
  //    because members are already deduplicated at the person level)
  const departments: AggregatedDepartment[] = Array.from(
    new Set(members.map((m) => m.department))
  ).map((deptName) => {
    const deptMembers = members.filter((m) => m.department === deptName);
    const leads    = deptMembers.reduce((s, m) => s + m.leads,   0);
    const signups  = deptMembers.reduce((s, m) => s + m.signups, 0);
    const applied  = deptMembers.reduce((s, m) => s + m.applied, 0);
    return {
      id:                slug(deptName) || "general",
      name:              deptName,
      leads,
      signups,
      contacted:         0,
      interested:        0,
      applied,
      signupToApplyRate: signups ? (applied / signups) * 100 : 0,
    };
  });

  return {
    members,
    universities,
    products,
    departments,
    campaignMetrics,
    totals: {
      leads:         totalLeads,
      signups:       totalSignups,
      contacted:     0,
      interested:    0,
      applied:       totalApplied,
      alreadyExists: totalAlreadyExists,
    },
    leadConversionRate,
    signupToApplyRate,
  };
}
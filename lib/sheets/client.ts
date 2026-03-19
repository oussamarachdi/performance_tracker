import { google } from "googleapis";
import {
  buildHeaderMap,
  parseRow,
  parseExpaApplicationPersonIds,
  parseMembersInfo,
  type RawSheetRow,
} from "./types";

const SCOPE = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

function getAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyJson) {
    try {
      const credentials = JSON.parse(keyJson);
      return new google.auth.GoogleAuth({ credentials, scopes: SCOPE });
    } catch {
      throw new Error("Invalid GOOGLE_SERVICE_ACCOUNT_KEY JSON");
    }
  }
  if (keyPath) {
    return new google.auth.GoogleAuth({ keyFile: keyPath, scopes: SCOPE });
  }
  throw new Error(
    "Missing Google credentials: set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS"
  );
}

/**
 * Fetches all data rows from the configured sheet and returns parsed RawSheetRow[].
 * Uses header row to map columns. Data starts at row 2.
 */
export async function fetchSheetRows(): Promise<RawSheetRow[]> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID");
  }

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const range = "Signups!A:Z";
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const rows = res.data.values as string[][] | undefined;
  if (!rows || rows.length < 2) {
    return [];
  }

  const [headerRow, ...dataRows] = rows;
  const headerMap = buildHeaderMap(headerRow);

  return dataRows.map((row) => parseRow(row, headerMap));
}

/**
 * Fetches the "Expa Application" sheet and returns a Set of unique person IDs.
 * Used to compute "applied" (only signed-up leads whose Person ID appears here count).
 * On missing sheet or parse failure returns empty Set.
 */
export async function fetchExpaApplicationPersonIds(): Promise<Set<string>> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return new Set();

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const range = "'Expa Application'!A:Z";
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values as string[][] | undefined;
    if (!rows || rows.length < 2) {
      console.warn("[Expa Application] Sheet returned no rows");
      return new Set();
    }
    const [headerRow, ...dataRows] = rows;
    const ids = parseExpaApplicationPersonIds(headerRow, dataRows);
    console.log(`[Expa Application] Found ${ids.size} unique Person IDs from ${dataRows.length} rows`);
    return ids;
  } catch (err) {
    console.error("[Expa Application] Failed to fetch sheet:", err);
    return new Set();
  }
}

/**
 * Fetches the "Members Info" sheet and returns Map(normalized name -> department).
 * Used to set each member's department and build the departments list.
 * On missing sheet or parse failure returns empty Map.
 */
export async function fetchMembersInfo(): Promise<Map<string, string>> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) return new Map();

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });
    const range = "'Members Info'!A:Z";
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const rows = res.data.values as string[][] | undefined;
    if (!rows || rows.length < 1) {
      console.warn("[Members Info] Sheet returned no rows");
      return new Map();
    }
    const [headerRow, ...dataRows] = rows;
    const map = parseMembersInfo(headerRow, dataRows);
    console.log(`[Members Info] Found ${map.size} members from ${dataRows.length} rows`);
    return map;
  } catch (err) {
    console.error("[Members Info] Failed to fetch sheet:", err);
    return new Map();
  }
}

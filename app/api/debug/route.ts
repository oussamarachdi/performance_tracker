import { NextResponse } from "next/server";
import { google } from "googleapis";
import {
  fetchSheetRows,
  fetchExpaApplicationPersonIds,
  fetchMembersInfo,
} from "@/lib/sheets/client";

function getAuth() {
  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyJson) return new google.auth.GoogleAuth({ credentials: JSON.parse(keyJson), scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  if (keyPath) return new google.auth.GoogleAuth({ keyFile: keyPath, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"] });
  throw new Error("No credentials");
}

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    let membersInfoHeaders: string[] = [];
    let membersInfoSampleRow: string[] = [];
    try {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId, range: "'Members Info'!A:Z" });
      const allRows = res.data.values as string[][] | undefined;
      if (allRows && allRows.length >= 1) {
        membersInfoHeaders = allRows[0];
        if (allRows.length >= 2) membersInfoSampleRow = allRows[1];
      }
    } catch (e) {
      membersInfoHeaders = [`ERROR: ${e instanceof Error ? e.message : String(e)}`];
    }

    const [rows, expaPersonIds, memberDepartmentByName] = await Promise.all([
      fetchSheetRows(),
      fetchExpaApplicationPersonIds(),
      fetchMembersInfo(),
    ]);

    return NextResponse.json({
      signupRows: rows.length,
      expaUniquePersonIds: expaPersonIds.size,
      expaPersonIdsSample: Array.from(expaPersonIds).slice(0, 10),
      membersInfoCount: memberDepartmentByName.size,
      membersInfoHeaders,
      membersInfoSampleRow,
      membersInfoSample: Object.fromEntries(
        Array.from(memberDepartmentByName.entries()).slice(0, 10)
      ),
      signupPersonIdSample: rows
        .filter((r) => r.personId)
        .slice(0, 10)
        .map((r) => ({ member: r.memberName, personId: r.personId })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

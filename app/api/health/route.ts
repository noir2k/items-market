import { NextResponse } from "next/server";
import { checkStagingHealth } from "../../../lib/staging-health";

export async function GET() {
  const health = await checkStagingHealth();

  return NextResponse.json(health, {
    status: health.ok ? 200 : 503
  });
}

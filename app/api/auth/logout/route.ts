import { clearAuthCookie } from "@/lib/server/auth";
import { apiOk } from "@/lib/server/http";

export async function POST() {
  await clearAuthCookie();
  return apiOk({ success: true });
}

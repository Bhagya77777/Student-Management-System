import { requireAuth, sanitizeUser } from "@/lib/server/auth";
import { apiError, apiOk } from "@/lib/server/http";

export async function GET() {
  try {
    const user = await requireAuth();
    return apiOk({ user: sanitizeUser(user) });
  } catch {
    return apiError(401, "Unauthorized");
  }
}

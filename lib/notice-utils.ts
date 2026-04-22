const CANONICAL_ROLE_MAP: Record<string, string> = {
  students: "student",
  student: "student",
  parents: "parent",
  parent: "parent",
  lecturers: "lecturer",
  lecturer: "lecturer",
  admins: "admin",
  admin: "admin",
  all: "all",
};
 
export function normalizeNoticeAudience(audience: string[]) {
  return Array.from(
    new Set(
      audience
        .map((value) => CANONICAL_ROLE_MAP[String(value).toLowerCase().trim()] || String(value).toLowerCase().trim())
        .filter(Boolean)
    )
  );
}

export function noticeTargetsRole(targetAudience: string[], role?: string) {
  if (!role) {
    return false;
  }

  const canonical = CANONICAL_ROLE_MAP[String(role).toLowerCase().trim()] || String(role).toLowerCase().trim();
  return targetAudience.includes("all") || targetAudience.includes(canonical);
}

export function formatNoticeAudienceLabel(value: string) {
  const canonical = CANONICAL_ROLE_MAP[String(value).toLowerCase().trim()] || String(value).toLowerCase().trim();

  switch (canonical) {
    case "student":
      return "Students";
    case "parent":
      return "Parents";
    case "lecturer":
      return "Lecturers";
    case "admin":
      return "Admins";
    case "all":
      return "All";
    default:
      return canonical.charAt(0).toUpperCase() + canonical.slice(1);
  }
}
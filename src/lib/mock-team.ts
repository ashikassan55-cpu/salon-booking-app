/**
 * Decorative stats row under the Team section — still static, not backed by
 * any real metric (no "years of experience" or "happy clients" counter
 * exists anywhere in the schema). Team members themselves are now real,
 * DB-backed data (see src/lib/types.ts's TeamMember and src/app/page.tsx).
 */
export const teamStats = [
  { label: "Years of Experience", value: "10" },
  { label: "Awards Won", value: "15" },
  { label: "Services Offered", value: "20+" },
  { label: "Happy Clients / Month", value: "450+" },
] as const;

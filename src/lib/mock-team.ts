/**
 * Decorative stat values under the Team section — still static, not backed
 * by any real metric (no "years of experience" or "happy clients" counter
 * exists anywhere in the schema). Just the numbers live here; the labels
 * are translated strings (see the "stats" keys in messages/en and
 * messages/ar's public-team.json). Team members themselves are real,
 * DB-backed data — see src/lib/types.ts's TeamMember and src/app/page.tsx.
 */
export const teamStatValues = {
  yearsExperience: "10",
  awardsWon: "15",
  servicesOffered: "20+",
  happyClients: "450+",
} as const;

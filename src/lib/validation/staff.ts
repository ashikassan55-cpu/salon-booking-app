import { z } from "zod";
import type { getTranslations } from "next-intl/server";
import { weeklyScheduleSchema } from "./working-hours";

type Translator = Awaited<ReturnType<typeof getTranslations>>;

export function createStaffSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(2, t("staff.nameMin")),
    role: z.string().trim().min(2, t("staff.roleMin")),
    schedule: weeklyScheduleSchema,
    bio: z.string().trim().max(300, t("staff.bioMax")).optional(),
    suiteLabel: z.string().trim().max(40, t("staff.suiteLabelMax")).optional(),
  });
}

export type StaffInput = z.infer<ReturnType<typeof createStaffSchema>>;

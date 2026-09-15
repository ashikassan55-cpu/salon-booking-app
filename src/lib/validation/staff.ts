import { z } from "zod";
import { weeklyScheduleSchema } from "./working-hours";

export const staffSchema = z.object({
  name: z.string().trim().min(2, "Enter a stylist name"),
  role: z.string().trim().min(2, "Enter a role or title"),
  schedule: weeklyScheduleSchema,
});

export type StaffInput = z.infer<typeof staffSchema>;

import { z } from "zod";

/** One {service, optional price override} pairing — only services the
 * stylist actually performs are included; an omitted service means "doesn't
 * offer this." customPrice null/absent means "use the base service price." */
export const staffServicePricingSchema = z.object({
  serviceId: z.string().uuid(),
  customPrice: z.coerce.number().positive().nullable().optional(),
});

export const staffServicePricingListSchema = z.array(staffServicePricingSchema);

export type StaffServicePricingInput = z.infer<typeof staffServicePricingSchema>;

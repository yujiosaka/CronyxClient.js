import { z } from "zod";

const Duration = z.object({
  years: z.number().optional(),
  months: z.number().optional(),
  weeks: z.number().optional(),
  days: z.number().optional(),
  hours: z.number().optional(),
  minutes: z.number().optional(),
  seconds: z.number().optional(),
});

/**
 * @internal
 */
export const PostBody = z.object({
  jobInterval: z.union([z.string(), z.number(), Duration]),
  startBuffer: z.union([z.number(), Duration]).optional(),
  retryInterval: z.union([z.number(), Duration]).optional(),
  requiredJobNames: z.array(z.string()).optional(),
  timezone: z.string().optional(),
  noLock: z.boolean().optional(),
  jobIntervalStartedAt: z
    .date()
    .transform((date) => date.toISOString())
    .optional(),
});

/**
 * @internal
 */
export type PostBody = z.infer<typeof PostBody>;

/**
 * @internal
 */
export const PostResponse = z
  .object({
    id: z.string().nullable(),
    name: z.string(),
    interval: z.number(),
    intervalStartedAt: z.coerce.date(),
    intervalEndedAt: z.coerce.date(),
    isActive: z.boolean(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
  })
  .nullable();

/**
 * @internal
 */
export type PostResponse = z.infer<typeof PostResponse>;

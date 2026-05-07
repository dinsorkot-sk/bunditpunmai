import type { ZodSchema } from 'zod'
import { createError } from 'h3'

/**
 * Validates data against a Zod schema.
 * Returns parsed data on success, or throws a 400 HTTP error with validation issue details.
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }))

    throw createError({
      statusCode: 400,
      statusMessage: 'Validation error',
      message: JSON.stringify(issues),
    })
  }

  return result.data
}

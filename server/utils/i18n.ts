/**
 * i18n query helpers for locale-aware API queries.
 * When a non-default locale is requested, LEFT JOIN the translation table
 * and use COALESCE to fall back to the original (default locale) value.
 */
import { sql, type AnyColumn, type SQL } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'

/**
 * Parse locale from query params.
 * Returns the locale string if present and not 'th', otherwise null.
 */
export function getLocale(query: Record<string, any>): string | null {
  const locale = query.locale
  if (locale && typeof locale === 'string' && locale !== 'th') {
    return locale
  }
  return null
}

/**
 * Build a COALESCE expression for locale-aware field selection.
 * If locale is provided, uses COALESCE(translationField, originalField).
 * Otherwise, returns the original field.
 */
export function localizedField<T extends SQLiteTable>(
  originalField: AnyColumn,
  translationField: AnyColumn | null,
  locale: string | null,
): SQL | AnyColumn {
  if (!locale || !translationField) {
    return originalField
  }
  return sql`COALESCE(${translationField}, ${originalField})`.mapWith(originalField)
}

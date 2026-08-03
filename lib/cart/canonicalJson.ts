/**
 * Order-insensitive JSON serialisation, used to compare cart line identity.
 *
 * This function ensures that the same data will always produce the same JSON
 * string, regardless of the order in which the keys are defined. This is
 * important for comparing cart items, as the order of keys in a JSON object
 * can vary depending on how it was created or processed.
 */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortDeep(value))
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (value === null || typeof value !== 'object') return value

  const record = value as Record<string, unknown>
  return Object.keys(record)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = sortDeep(record[key])
      return acc
    }, {})
}

/**
 * Canonical identity string for a cart item's `customizations`.
 *
 * Treats `null`, `undefined` and `{}` as the same thing, because the three are
 * used interchangeably across the codebase: the store leaves the field
 * `undefined` for non-custom items, the database column is nullable, and
 * `buildCartItem` produces an empty object when a product has groups but no
 * selections.
 */
export function customizationsKey(customizations: unknown): string {
  if (customizations == null) return '{}'
  return canonicalJson(customizations)
}

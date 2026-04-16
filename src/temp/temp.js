/**
 * Replaces SQL placeholders (? or $1, $2) with actual parameter values.
 * - For ? : positional, index-based
 * - For $n : 1‑based index (e.g., $1 -> params[0])
 * - Returns a readable SQL string for logging/debugging only.
 */
printQuery : (sql, params = []) => {
  // Detect if SQL uses $n placeholders (e.g., $1, $2)
  if (/\$\d+/.test(sql)) {
    return sql.replace(/\$(\d+)/g, (match, num) => {
      const idx = parseInt(num, 10) - 1;
      const val = params[idx];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      if (val instanceof Date) {
        return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
      }
      return `'${val.toString().replace(/'/g, "''")}'`;
    });
  }

  // Fallback to ? placeholders
  let index = 0;
  return sql.replace(/\?/g, () => {
    if (index >= params.length) return '?';
    const val = params[index++];
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return val;
    if (val instanceof Date) {
      return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
    return `'${val.toString().replace(/'/g, "''")}'`;
  });
};

// Usage (unchanged from before)
let sqlUpdate = updateQueries.updateConfigurations();
const params = [sanitizedValue, config_name];

// Log the fully substituted query
logQueryToFile(printQuery(sqlUpdate, params));

// Execute the parameterized query (safe)
await query(sqlUpdate, params);
export function csvCell(v: string | null): string {
  let s = v ?? ''
  // Neutralize spreadsheet formula triggers (Excel/Sheets/LibreOffice)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  return `"${s.replace(/"/g, '""')}"`
}

export function toCSV(rows: string[][]): string {
  return rows.map((r) => r.map((v) => csvCell(v)).join(',')).join('\n')
}

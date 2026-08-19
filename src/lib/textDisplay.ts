export function formatDisplayText(value?: string | null): string {
  return (value ?? "").replace(/\\n/g, "\n").replace(/\r\n?/g, "\n");
}

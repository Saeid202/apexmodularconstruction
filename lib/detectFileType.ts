export type FileType = "pdf" | "excel" | "word" | "other";

export function detectFileType(filename: string): FileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "excel";
  if (["docx", "doc"].includes(ext)) return "word";
  return "other";
}

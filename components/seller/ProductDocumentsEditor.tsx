"use client";

import { useRef, useState } from "react";
import { X, Upload, FileText, FileSpreadsheet, File } from "lucide-react";
import { uploadProductDocument } from "@/lib/uploadProductDocument";
import { detectFileType, type FileType } from "@/lib/detectFileType";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

export interface DocSlot {
  id?: string;          // existing DB id (undefined = new)
  name: string;
  url: string;
  file_type: FileType;
  storage_path: string;
  position: number;
  uploading?: boolean;
  error?: string;
}

interface Props {
  userId: string;
  docs: DocSlot[];
  onChange: (docs: DocSlot[]) => void;
}

const FILE_TYPE_CONFIG: Record<FileType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pdf:   { icon: FileText,        color: "#DC2626", bg: "#FEF2F2", label: "PDF" },
  excel: { icon: FileSpreadsheet, color: "#16A34A", bg: "#F0FDF4", label: "Excel" },
  word:  { icon: FileText,        color: "#2563EB", bg: "#EFF6FF", label: "Word" },
  other: { icon: File,            color: "#6B7280", bg: "#F9FAFB", label: "File" },
};

const ACCEPTED = ".pdf,.xlsx,.xls,.csv,.docx,.doc";

export function ProductDocumentsEditor({ userId, docs, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const newSlots: DocSlot[] = Array.from(files).map((f, i) => ({
      name: f.name.replace(/\.[^.]+$/, ""), // default name = filename without extension
      url: "",
      file_type: detectFileType(f.name),
      storage_path: "",
      position: docs.length + i,
      uploading: true,
    }));

    // Optimistically add slots
    onChange([...docs, ...newSlots]);

    // Upload each file
    const uploaded = await Promise.all(
      Array.from(files).map(async (file, i) => {
        try {
          const { url, storagePath } = await uploadProductDocument(file, userId);
          return { ...newSlots[i], url, storage_path: storagePath, uploading: false };
        } catch (err: any) {
          return { ...newSlots[i], uploading: false, error: err.message ?? "Upload failed" };
        }
      })
    );

    onChange([...docs, ...uploaded]);
  }

  function removeDoc(idx: number) {
    onChange(docs.filter((_, i) => i !== idx).map((d, i) => ({ ...d, position: i })));
  }

  function updateName(idx: number, name: string) {
    const updated = [...docs];
    updated[idx] = { ...updated[idx], name };
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      {/* Existing / uploaded docs */}
      {docs.length > 0 && (
        <div className="space-y-2">
          {docs.map((doc, idx) => {
            const cfg = FILE_TYPE_CONFIG[doc.file_type];
            const Icon = cfg.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                style={{ borderColor: `${PURPLE}22`, backgroundColor: cfg.bg }}
              >
                {/* Icon */}
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${cfg.color}18` }}
                >
                  {doc.uploading ? (
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke={cfg.color} strokeWidth="4" />
                      <path className="opacity-75" fill={cfg.color} d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                  )}
                </div>

                {/* Name input */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={doc.name}
                    onChange={(e) => updateName(idx, e.target.value)}
                    placeholder="Document name…"
                    className="w-full bg-transparent text-sm font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none"
                  />
                  {doc.error && <p className="text-[10px] text-red-500 mt-0.5">{doc.error}</p>}
                  {!doc.uploading && !doc.error && (
                    <p className="text-[10px] text-gray-400 mt-0.5">{cfg.label}</p>
                  )}
                  {doc.uploading && (
                    <p className="text-[10px] text-gray-400 mt-0.5">Uploading…</p>
                  )}
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeDoc(idx)}
                  className="shrink-0 rounded-lg p-1 text-gray-400 hover:bg-white hover:text-red-500 transition-colors"
                  aria-label="Remove document"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Drop zone */}
      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-colors"
        style={{
          borderColor: dragOver ? PURPLE : `${GOLD}66`,
          backgroundColor: dragOver ? "#EDE9F6" : "#FDFBF7",
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="h-5 w-5" style={{ color: PURPLE }} />
        <p className="text-xs font-semibold text-gray-600">
          Click or drag to upload documents
        </p>
        <p className="text-[10px] text-gray-400">PDF, Excel, Word — no size limit</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

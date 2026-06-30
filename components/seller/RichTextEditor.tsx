"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { useEffect, useCallback, useState } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered, Link as LinkIcon,
  Link2Off, RemoveFormatting, Pilcrow, Palette,
} from "lucide-react";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

const PRESET_COLORS = [
  { label: "Default",  value: "inherit" },
  { label: "Purple",   value: "#4B1D8F" },
  { label: "Gold",     value: "#D4AF37" },
  { label: "Dark",     value: "#111827" },
  { label: "Gray",     value: "#6B7280" },
  { label: "Red",      value: "#DC2626" },
  { label: "Green",    value: "#16A34A" },
  { label: "Blue",     value: "#2563EB" },
];

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="flex h-7 w-7 items-center justify-center rounded-md transition-all"
      style={{
        backgroundColor: active ? PURPLE : "transparent",
        color: active ? "white" : "#374151",
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-gray-200 shrink-0" />;
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const [colorOpen, setColorOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Underline,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "outline-none min-h-[180px] px-4 py-3 text-sm text-gray-800 leading-relaxed",
      },
    },
  });

  // Sync external value changes (e.g. initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Enter URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const isH2 = editor.isActive("heading", { level: 2 });
  const isH3 = editor.isActive("heading", { level: 3 });

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{
        borderColor: focused ? PURPLE : "#E5E7EB",
        boxShadow: focused ? `0 0 0 2px ${PURPLE}33` : "none",
      }}
    >
      {/* ── Toolbar ── */}
      <div
        className="flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5"
        style={{ borderColor: "#F3F4F6", backgroundColor: "#FAFAFA" }}
      >
        {/* Structure */}
        <ToolbarButton
          title="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 2"
          active={isH2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading 3"
          active={isH3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Formatting */}
        <ToolbarButton
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Color picker */}
        <div className="relative">
          <ToolbarButton
            title="Text color"
            active={colorOpen}
            onClick={() => setColorOpen((v) => !v)}
          >
            <Palette className="h-3.5 w-3.5" />
          </ToolbarButton>
          {colorOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-20 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
              style={{ minWidth: 180 }}
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">Text Color</p>
              <div className="grid grid-cols-4 gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.label}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (c.value === "inherit") {
                        editor.chain().focus().unsetColor().run();
                      } else {
                        editor.chain().focus().setColor(c.value).run();
                      }
                      setColorOpen(false);
                    }}
                    className="flex flex-col items-center gap-0.5 rounded-lg p-1.5 hover:bg-gray-50 transition-colors"
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-gray-200"
                      style={{ backgroundColor: c.value === "inherit" ? "white" : c.value }}
                    />
                    <span className="text-[9px] text-gray-500 leading-none">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Link */}
        <ToolbarButton
          title="Add / edit link"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          title="Remove link"
          active={false}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off className="h-3.5 w-3.5" />
        </ToolbarButton>

        <Divider />

        {/* Clear */}
        <ToolbarButton
          title="Clear formatting"
          active={false}
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      {/* ── Editor area ── */}
      <div
        onClick={() => { editor.commands.focus(); setColorOpen(false); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="bg-white"
      >
        {!editor.getText() && placeholder && (
          <p className="pointer-events-none absolute px-4 pt-3 text-sm text-gray-400 select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

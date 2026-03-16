/**
 * Rich Text Editor Component (Atom)
 * Simple WYSIWYG editor with toolbar for formatting text
 * Stores content as HTML string
 */

import { useRef, useCallback, useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Type,
  CaseSensitive,
  Palette,
  Minus,
  Plus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  List,
  ListOrdered,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  className?: string;
}

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#FF9800", "#FFC107", "#4CAF50",
  "#2196F3", "#9C27B0", "#E91E63", "#795548", "#607D8B", "#00BCD4",
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Type here...",
  disabled = false,
  minHeight = "120px",
  className = "",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const sizePickerRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync value from outside only when editor is not focused
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
  }, [value]);

  // Close pickers on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (sizePickerRef.current && !sizePickerRef.current.contains(e.target as Node)) {
        setShowSizePicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalUpdate.current = true;
      onChange(editorRef.current.innerHTML);
      // Reset flag after a tick
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    // Restore focus to editor before executing command
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  const handleUppercase = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const text = selection.toString();
    const isUpper = text === text.toUpperCase();
    const newText = isUpper ? text.toLowerCase() : text.toUpperCase();

    // Delete selected text and insert new
    range.deleteContents();
    const textNode = document.createTextNode(newText);
    range.insertNode(textNode);

    // Re-select the new text
    const newRange = document.createRange();
    newRange.selectNodeContents(textNode);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleInput();
  }, [handleInput]);

  const ToolbarButton = ({
    onClick,
    active = false,
    title,
    children,
    className: btnClass = "",
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing selection
        onClick();
      }}
      title={title}
      className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${
        active ? "bg-gray-200 text-gray-900" : "text-gray-600"
      } ${btnClass}`}
      disabled={disabled}
    >
      {children}
    </button>
  );

  const isEmpty = !value || value === "<br>" || value === "<div><br></div>";

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden bg-white ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Text formatting */}
        <ToolbarButton onClick={() => execCommand("bold")} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("italic")} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("underline")} title="Underline">
          <Underline className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Uppercase toggle */}
        <ToolbarButton onClick={handleUppercase} title="Toggle UPPERCASE">
          <CaseSensitive className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Font size */}
        <div className="relative" ref={sizePickerRef}>
          <ToolbarButton
            onClick={() => {
              setShowSizePicker(!showSizePicker);
              setShowColorPicker(false);
            }}
            title="Font Size"
          >
            <Type className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showSizePicker && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCommand("fontSize", "7"); // Use size 7 as placeholder
                    // Find the font elements and replace with span
                    if (editorRef.current) {
                      const fontElements = editorRef.current.querySelectorAll('font[size="7"]');
                      fontElements.forEach((el) => {
                        const span = document.createElement("span");
                        span.style.fontSize = size;
                        span.innerHTML = el.innerHTML;
                        el.replaceWith(span);
                      });
                      handleInput();
                    }
                    setShowSizePicker(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 transition-colors"
                  style={{ fontSize: size }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text color */}
        <div className="relative" ref={colorPickerRef}>
          <ToolbarButton
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowSizePicker(false);
            }}
            title="Text Color"
          >
            <Palette className="w-3.5 h-3.5" />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <div className="grid grid-cols-6 gap-1.5">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      execCommand("foreColor", color);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              {/* Custom color input */}
              <div className="mt-2 pt-2 border-t border-gray-100">
                <label className="flex items-center gap-2 text-xs text-gray-500">
                  Custom:
                  <input
                    type="color"
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                    onChange={(e) => {
                      execCommand("foreColor", e.target.value);
                      setShowColorPicker(false);
                    }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Alignment */}
        <ToolbarButton onClick={() => execCommand("justifyLeft")} title="Align Left">
          <AlignLeft className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyCenter")} title="Align Center">
          <AlignCenter className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("justifyRight")} title="Align Right">
          <AlignRight className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Lists */}
        <ToolbarButton onClick={() => execCommand("insertUnorderedList")} title="Bullet List">
          <List className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("insertOrderedList")} title="Numbered List">
          <ListOrdered className="w-3.5 h-3.5" />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <ToolbarButton onClick={() => execCommand("undo")} title="Undo">
          <Undo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand("redo")} title="Redo">
          <Redo2 className="w-3.5 h-3.5" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onBlur={handleInput}
          className="px-3 py-2 outline-none text-sm text-gray-900 leading-relaxed overflow-y-auto"
          style={{ minHeight }}
          suppressContentEditableWarning
        />
        {isEmpty && (
          <div className="absolute top-2 left-3 text-sm text-gray-400 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

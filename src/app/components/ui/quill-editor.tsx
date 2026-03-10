import React, { useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Wrapper for ReactQuill to isolate findDOMNode deprecation warning
 * ReactQuill v2.0.0 still uses findDOMNode internally which triggers
 * warnings in React 18 StrictMode. This is a known issue and safe to ignore.
 * 
 * We suppress the console warning here since it's a third-party issue
 * that doesn't affect functionality.
 */
export function QuillEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className = "",
}: QuillEditorProps) {
  useEffect(() => {
    // Suppress findDOMNode warning for ReactQuill
    const originalError = console.error;
    console.error = (...args: any[]) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('findDOMNode')
      ) {
        // Suppress findDOMNode warning from react-quill
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "color",
    "background",
    "link",
  ];

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      className={className}
    />
  );
}
// src/components/forms/RichTextEditor.tsx
"use client";

import React, { useEffect, type MutableRefObject } from "react";
import { Editor } from "@tinymce/tinymce-react";
import type { Editor as TinyMCEEditor } from "tinymce";

interface RichTextEditorProps {
  editorRef: MutableRefObject<TinyMCEEditor | null>;
  content?: string;
  onChange?: (content: string) => void;
  height?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ editorRef, content, onChange, height = 500 }) => {
  useEffect(() => {
    // Set initial content only when the editor is initialized and content changes from outside
    if (
      editorRef.current &&
      content !== undefined &&
      content !== editorRef.current.getContent()
    ) {
      editorRef.current.setContent(content || "");
    }
  }, [content, editorRef]);

  return (
    <Editor
      apiKey="p2yks470qo6wqku09s7bsqaqqnb9lgno6bgvbbsa42pezja1" // This is a public test API key
      onInit={(evt, editor) => {
        editorRef.current = editor;
        if (content) { // Ensure initial content is set if provided
          editor.setContent(content);
        }
      }}
      initialValue={content || ""}
      onEditorChange={(newContent) => {
        if (onChange) onChange(newContent);
      }}
      init={{
        width: "100%",
        height: height,
        plugins: [
          "advlist",
          "autolink",
          "link",
          "image",
          "lists",
          "charmap",
          "preview",
          "anchor",
          "pagebreak",
          "searchreplace",
          "wordcount",
          "visualblocks",
          "code",
          "fullscreen",
          "insertdatetime",
          "media",
          "table",
          "emoticons",
          "help",
          "codesample",
        ],
        toolbar:
          "undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image codesample | print preview media fullscreen | " +
          "forecolor backcolor emoticons | help",
        menubar: "favs file edit view insert format tools table help",
        content_style: `
          body {
            font-family: Georgia, serif;
            font-size: 16px; /* Adjusted for better readability within editor */
          }
          p {
            font-family: Georgia, serif;
            font-size: 16px;
          }
        `,
        skin: "oxide", // Default light skin
        content_css: "default", // Default content CSS
        codesample_languages: [
          { text: "HTML/XML", value: "markup" },
          { text: "JavaScript", value: "javascript" },
          { text: "CSS", value: "css" },
          { text: "Python", value: "python" },
          { text: "Java", value: "java" },
          { text: "C", value: "c" },
          { text: "C++", value: "cpp" },
          { text: "PHP", value: "php" },
          { text: "Ruby", value: "ruby" },
          { text: "Swift", value: "swift" },
          { text: "Bash", value: "bash" },
          { text: "SQL", value: "sql" },
        ],
        codesample_global_prismjs: true,
        paste_data_images: true, // Allows pasting images directly
        media_url_resolver: function (data, resolve) {
          if (
            data.url.includes("youtube.com") ||
            data.url.includes("youtu.be")
          ) {
            const embedHtml = `<iframe width="560" height="315" src="${data.url.replace(
              "watch?v=",
              "embed/"
            )}" frameborder="0" allowfullscreen></iframe>`;
            resolve({ html: embedHtml });
          } else {
            resolve({ html: "" });
          }
        },
      }}
    />
  );
};

export default RichTextEditor;

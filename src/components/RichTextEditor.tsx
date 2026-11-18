'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, error, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const markdownStorage = editor.storage as unknown as { markdown: { getMarkdown: () => string } };
      onChange(markdownStorage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none min-h-[150px] p-3 focus:outline-none bg-bg-secondary border border-border-default rounded-lg transition-all duration-fast ${error ? 'border-error-border ring-1 ring-error-border' : 'focus:border-brand-500 focus:ring-1 focus:ring-brand-500'} ${disabled ? 'bg-bg-tertiary opacity-60 cursor-not-allowed' : ''}`,
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const markdownStorage = editor.storage as unknown as { markdown: { getMarkdown: () => string } };
      if (value !== markdownStorage.markdown.getMarkdown()) {
      editor.commands.setContent(value, { emitUpdate: false });
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="relative group">
      <EditorContent editor={editor} />
      {error && (
        <p className="absolute -bottom-6 left-0 text-xs text-error-text flex items-center gap-1">
          {error}
        </p>
      )}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-50 transition-opacity pointer-events-none">
        <span className="text-[10px] text-text-muted font-mono">Markdown Mode</span>
      </div>
    </div>
  );
}

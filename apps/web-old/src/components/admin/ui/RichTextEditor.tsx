'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ImageIcon, Undo, Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  minHeight?: string;
}

interface ToolbarBtnProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolbarBtn({ onClick, active, title, children, disabled }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        'h-7 w-7 flex items-center justify-center rounded text-sm transition-colors',
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800',
        disabled ? 'opacity-40 cursor-not-allowed' : '',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing…',
  label,
  hint,
  error,
  minHeight = '200px',
}: RichTextEditorProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full h-auto my-2' } }),
      Placeholder.configure({ placeholder, emptyEditorClass: 'is-editor-empty' }),
    ],
    content: value,
    immediatelyRender: false, // Prevent SSR hydration mismatch
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 min-h-[inherit]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  function insertImage() {
    if (!imageUrl.trim() || !editor) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setImageUrl('');
    setShowImageInput(false);
  }

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div
        className={[
          'rounded-xl border bg-white overflow-hidden transition-colors',
          error
            ? 'border-red-400'
            : 'border-gray-300 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20',
        ].join(' ')}
      >
        <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-gray-100 bg-gray-50">
          <ToolbarBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
            <Bold className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
            <Italic className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
            <Strikethrough className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <ToolbarBtn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
            <Heading1 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
            <Heading2 className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
            <Heading3 className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <ToolbarBtn title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
            <List className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Ordered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
            <ListOrdered className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <div className="w-px h-4 bg-gray-200 mx-1" />

          <ToolbarBtn title="Insert image" onClick={() => setShowImageInput((v) => !v)} active={showImageInput}>
            <ImageIcon className="h-3.5 w-3.5" />
          </ToolbarBtn>

          <div className="w-px h-4 bg-gray-200 mx-1 ml-auto" />

          <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="h-3.5 w-3.5" />
          </ToolbarBtn>
          <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="h-3.5 w-3.5" />
          </ToolbarBtn>
        </div>

        {showImageInput && (
          <div className="flex gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/70">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && insertImage()}
              placeholder="Paste image URL and press Enter…"
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
            <button
              type="button"
              onClick={insertImage}
              className="px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Insert
            </button>
          </div>
        )}

        <div style={{ minHeight }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}

      <style>{`
        .tiptap.ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .tiptap.ProseMirror:focus { outline: none; }
        .tiptap.ProseMirror h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.5rem; }
        .tiptap.ProseMirror h2 { font-size: 1.25rem; font-weight: 600; margin: 0.75rem 0 0.5rem; }
        .tiptap.ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
        .tiptap.ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap.ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        .tiptap.ProseMirror li { margin: 0.125rem 0; }
        .tiptap.ProseMirror p { margin: 0.25rem 0; }
        .tiptap.ProseMirror strong { font-weight: 700; }
        .tiptap.ProseMirror em { font-style: italic; }
        .tiptap.ProseMirror s { text-decoration: line-through; }
        .tiptap.ProseMirror img { border-radius: 0.5rem; max-width: 100%; }
      `}</style>
    </div>
  );
}

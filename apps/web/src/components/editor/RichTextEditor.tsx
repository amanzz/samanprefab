'use client';

import React, { useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  /** Called when user clicks Insert Image. Type indicates 'editor' or 'featured'. Host must open MediaLibrary. */
  onImagePick?: (type: 'editor' | 'featured') => void;
}

const TINYMCE_CDN  = 'https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js';
const SKIN_URL     = 'https://cdn.jsdelivr.net/npm/tinymce@7/skins/ui/oxide';
const CONTENT_CSS  = 'https://cdn.jsdelivr.net/npm/tinymce@7/skins/content/default/content.min.css';

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = 450,
  onImagePick,
}: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const wordCount = value
    ? value.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Toolbar extension: Preview toggle + word count */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-1.5 dark:border-gray-800 dark:bg-gray-900/60">
        <span className="text-[11px] text-gray-400">
          {wordCount} word{wordCount !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          onClick={() => setIsPreview((p) => !p)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
            isPreview
              ? 'bg-brand-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
          }`}
        >
          {isPreview ? '✏️ Edit' : '👁 Preview'}
        </button>
      </div>

      {/* Preview pane */}
      {isPreview ? (
        <div
          className="min-h-[300px] p-6 prose prose-sm max-w-none bg-white dark:bg-gray-950 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-gray-400 italic">Nothing to preview yet…</p>' }}
        />
      ) : (
        <Editor
          tinymceScriptSrc={TINYMCE_CDN}
          value={value}
          onEditorChange={onChange}
          init={{
            skin_url: SKIN_URL,
            content_css: CONTENT_CSS,
            min_height: minHeight,
            menubar: false,
            branding: false,
            statusbar: false,
            promotion: false,
            placeholder,
            plugins: 'lists link image autolink table codesample fullscreen searchreplace',
            toolbar:
              'undo redo | styles | bold italic underline strikethrough | ' +
              'forecolor | bullist numlist | outdent indent | ' +
              'blockquote codesample table | link image | ' +
              'alignleft aligncenter alignright | fullscreen | removeformat',
            toolbar_mode: 'sliding',
            style_formats: [
              { title: 'Heading 2', format: 'h2' },
              { title: 'Heading 3', format: 'h3' },
              { title: 'Heading 4', format: 'h4' },
              { title: 'Paragraph', format: 'p' },
              { title: 'Blockquote', format: 'blockquote' },
              { title: 'Code', format: 'code' },
            ],
            content_style: [
              'body { font-family: ui-sans-serif, system-ui, sans-serif;',
              'font-size: 14px; line-height: 1.7; color: #374151;',
              'padding: 12px 16px; }',
              'h2 { font-size: 1.4em; font-weight: 700; margin-top: 1.5em; }',
              'h3 { font-size: 1.2em; font-weight: 600; margin-top: 1.25em; }',
              'blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; color: #6b7280; }',
              'table { border-collapse: collapse; width: 100%; }',
              'table td, table th { border: 1px solid #e5e7eb; padding: 8px 12px; }',
              'table th { background: #f9fafb; font-weight: 600; }',
            ].join(' '),
            link_default_target: '_blank',
            link_assume_external_targets: true,
            image_advtab: true,
            paste_data_images: false,
            ...(onImagePick && {
              file_picker_types: 'image',
              file_picker_callback: (cb: (url: string, meta?: { title?: string }) => void) => {
                // Store callback globally for editor image insertion
                (window as any).__tinymceImageCb = (url: string) => cb(url, { title: '' });
                onImagePick('editor');
              },
            }),
            table_default_attributes: { border: '0' },
            codesample_languages: [
              { text: 'HTML/XML', value: 'markup' },
              { text: 'JavaScript', value: 'javascript' },
              { text: 'CSS', value: 'css' },
            ],
          }}
        />
      )}
    </div>
  );
}

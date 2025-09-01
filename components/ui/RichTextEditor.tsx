import React, { useEffect, useRef } from 'react';
import { textToHtml, htmlToText } from '../../utils/textFormatter';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
}

declare global {
    interface Window {
        Quill: any;
    }
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    onBlur,
    placeholder = "Start writing your chapter...",
    className = "",
    readOnly = false
}) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<any>(null);
    const isUpdatingRef = useRef(false);
    const editorIdRef = useRef(`quill-${Date.now()}-${Math.random()}`);

    useEffect(() => {
        if (!editorRef.current || !window.Quill) return;
        
        // Check if Quill is already initialized on this element
        if (quillRef.current || editorRef.current.classList.contains('ql-container')) return;

        // Initialize Quill with book-focused formatting options
        const quill = new window.Quill(editorRef.current, {
            theme: 'snow',
            readOnly,
            placeholder,
            modules: {
                toolbar: [
                    [{ 'header': [2, 3, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['blockquote'],
                    ['clean']
                ]
            },
            formats: [
                'header', 'bold', 'italic', 'underline',
                'list', 'bullet', 'align', 'blockquote'
            ]
        });

        quillRef.current = quill;

        // Set initial content
        if (value) {
            const htmlContent = textToHtml(value);
            isUpdatingRef.current = true;
            quill.root.innerHTML = htmlContent;
            isUpdatingRef.current = false;
        }

        // Handle content changes
        quill.on('text-change', () => {
            if (isUpdatingRef.current) return;
            
            const html = quill.root.innerHTML;
            const plainText = htmlToText(html);
            onChange(plainText);
        });

        // Handle blur events
        quill.on('selection-change', (range: any) => {
            if (!range && onBlur) {
                onBlur();
            }
        });

        return () => {
            if (quillRef.current) {
                quillRef.current.off('text-change');
                quillRef.current.off('selection-change');
                quillRef.current = null;
            }
        };
    }, []);

    // Update editor when value changes externally
    useEffect(() => {
        if (quillRef.current && !isUpdatingRef.current) {
            const htmlContent = textToHtml(value);
            const currentContent = quillRef.current.root.innerHTML;
            
            if (currentContent !== htmlContent) {
                isUpdatingRef.current = true;
                quillRef.current.root.innerHTML = htmlContent;
                isUpdatingRef.current = false;
            }
        }
    }, [value]);

    return (
        <div className={`rich-text-editor ${className} w-full`}>
            <div ref={editorRef} className="min-h-[300px] w-full" />
        </div>
    );
};

export default RichTextEditor;
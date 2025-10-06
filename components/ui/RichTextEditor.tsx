import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { textToHtml, htmlToText } from '../../utils/textFormatter';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
    value,
    onChange,
    onBlur,
    placeholder = "Start writing your chapter...",
    className = "",
    readOnly = false
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);

    // Initialize Quill
    useEffect(() => {
        if (!wrapperRef.current) return;

        // Create a div for the editor to mount into, and add it to the wrapper
        const editorEl = document.createElement('div');
        editorEl.className = "min-h-[300px] w-full";
        wrapperRef.current.appendChild(editorEl);

        const quill = new Quill(editorEl, {
            theme: 'snow',
            readOnly,
            placeholder,
            modules: {
                toolbar: [
                    [{ 'header': [2, 3, false] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'align': [] }],
                    ['blockquote'],
                    ['clean']
                ]
            },
            formats: [
                'header', 'list', 'align', 'blockquote'
            ]
        });
        quillRef.current = quill;

        // Set initial content
        if (value) {
            const htmlContent = textToHtml(value);
            quill.root.innerHTML = htmlContent;
        }

        // Add event listeners - debounced to avoid excessive updates
        let changeTimeout: NodeJS.Timeout;
        const textChangeHandler = () => {
            if (quill) {
                clearTimeout(changeTimeout);
                changeTimeout = setTimeout(() => {
                    const html = quill.root.innerHTML;
                    const plainText = htmlToText(html);
                    onChange(plainText);
                }, 750); // Wait 750ms after user stops typing
            }
        };
        quill.on('text-change', textChangeHandler);

        const selectionChangeHandler = (range: any) => {
            if (!range && onBlur) {
                onBlur();
            }
        };
        quill.on('selection-change', selectionChangeHandler);

        // Cleanup function: destroy everything inside the wrapper
        return () => {
            clearTimeout(changeTimeout);
            if (wrapperRef.current) {
                wrapperRef.current.innerHTML = '';
            }
            quillRef.current = null;
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    // Update editor when value changes externally
    useEffect(() => {
        if (quillRef.current) {
            const currentContent = quillRef.current.root.innerHTML;
            const newContent = textToHtml(value);
            if (currentContent !== newContent) {
                quillRef.current.root.innerHTML = newContent;
            }
        }
    }, [value]);

    // Handle readOnly prop changes
    useEffect(() => {
        if (quillRef.current) {
            quillRef.current.enable(!readOnly);
        }
    }, [readOnly]);

    return (
        <div className={`rich-text-editor ${className} w-full`} ref={wrapperRef} />
    );
};

export default RichTextEditor;

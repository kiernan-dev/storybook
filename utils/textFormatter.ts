// Utility functions for formatting story content into book-style text

export const formatChapterContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    // Split into paragraphs
    const paragraphs = rawContent
        .split(/\n\s*\n/) // Split on double line breaks
        .map(p => p.trim())
        .filter(p => p.length > 0);
    
    // Format each paragraph with proper book styling
    const formattedParagraphs = paragraphs.map((paragraph, index) => {
        // First paragraph - no indent (book style)
        if (index === 0) {
            return `<p class="text-justify leading-relaxed mb-4">${paragraph}</p>`;
        }
        
        // Subsequent paragraphs - indented first line (classic book style)
        return `<p class="text-justify leading-relaxed mb-4 indent-8">${paragraph}</p>`;
    });
    
    return formattedParagraphs.join('');
};

export const formatChapterTitle = (title: string): string => {
    if (!title) return '';
    
    // Format chapter title in book style
    return `<h2 class="text-2xl font-serif font-bold text-center mb-8 mt-6">${title}</h2>`;
};

export const formatBookContent = (title: string, content: string): string => {
    const formattedTitle = formatChapterTitle(title);
    const formattedContent = formatChapterContent(content);
    
    return `${formattedTitle}${formattedContent}`;
};

// Convert plain text content to HTML for rich text editor
export const textToHtml = (content: string): string => {
    if (!content) return '';
    
    // Simple conversion: split by double newlines for paragraphs
    const paragraphs = content
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
    
    if (paragraphs.length === 0) return content;
    
    return paragraphs
        .map((p, index) => {
            // First paragraph no indent, others indented
            const indentClass = index === 0 ? '' : 'indent-8';
            return `<p class="mb-4 leading-relaxed ${indentClass}">${p}</p>`;
        })
        .join('');
};

// Convert HTML back to plain text for storage
export const htmlToText = (html: string): string => {
    if (!html) return '';
    
    // Create a temporary DOM element to strip HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Convert <p> tags to double newlines
    const paragraphs = Array.from(tempDiv.querySelectorAll('p')).map(p => p.textContent?.trim() || '');
    
    return paragraphs.filter(p => p.length > 0).join('\n\n');
};
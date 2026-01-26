import React, { useEffect, useState } from 'react';

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

const MathText: React.FC<MathTextProps> = ({ text, className = '', block = false }) => {
  const [html, setHtml] = useState<string>(text);
  const [isKatexLoaded, setIsKatexLoaded] = useState(false);

  useEffect(() => {
    const checkKatex = () => !!(window as any).katex;

    if (checkKatex()) {
      setIsKatexLoaded(true);
    } else {
      const interval = setInterval(() => {
        if (checkKatex()) {
          setIsKatexLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    // If KaTeX is not loaded, just display text with line breaks
    if (!isKatexLoaded) {
      setHtml(text.replace(/\n/g, '<br/>'));
      return;
    }

    try {
      // Split by $...$ delimiters
      const parts = text.split(/(\$[^$]+\$)/g);
      
      const processed = parts.map(part => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            // Use renderToString for safer HTML generation
            return (window as any).katex.renderToString(math, {
              throwOnError: false,
              displayMode: block
            });
          } catch (e) {
            console.warn('KaTeX render error:', e);
            return part;
          }
        }
        // Handle regular text: escape generic HTML but allow line breaks
        // Note: In a real app, use a sanitizer. Here we assume trusted content.
        return part.replace(/\n/g, '<br/>');
      }).join('');
      
      setHtml(processed);
    } catch (e) {
      console.error('Math parsing error:', e);
      setHtml(text.replace(/\n/g, '<br/>'));
    }
  }, [text, block, isKatexLoaded]);

  return (
    <span 
      className={`math-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default MathText;
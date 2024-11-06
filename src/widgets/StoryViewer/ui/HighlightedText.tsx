import { FC } from 'react';
import { Typography } from '@/shared/ui/Typography/Typography';

import styles from './StoryViewer.module.scss';

export interface HighlightedTextProps {
    text: string;
    highlights?: string[];
    fontSize?: number;
  }

  
export const HighlightedText: FC<HighlightedTextProps> = ({ text, highlights = [], fontSize = 20 }) => {
    if (!highlights || highlights.length === 0) {
      return (
        <Typography.Text 
          text={text}
          color="#000"
          fontSize={fontSize}
          align="center"
          letterSpacing="-0.5px"
          weight={600}
          fontFamily='"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        />
      );
    }
  
    const highlightRegex = new RegExp(`(${highlights.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(highlightRegex);
  
    return (
      <div style={{ 
        fontSize: `${fontSize}px`,
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        lineHeight: '24px',
        letterSpacing: '-0.5px'
      }}>
        {parts.map((part, index) => {
          const isHighlighted = highlights.some(h => 
            part.toLowerCase() === h.toLowerCase()
          );
          
          return (
            <Typography.Text
              key={index}
              text={part}
              color={isHighlighted ? '#007AFF' : '#000'}
              fontSize={fontSize}
              align="center"
              weight={700}
              fontFamily='-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;'
            />
          );
        })}
      </div>
    );
};
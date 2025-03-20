import type { CSSProperties } from 'vue';

// Common types for UI components
export interface BaseProps {
    className?: string;
    style?: Record<string, string | number>;
} 
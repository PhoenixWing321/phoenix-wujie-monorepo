declare module '@phoenix-wujie-monorepo/ui' {
  import { DefineComponent } from 'vue';
  
  export const Button: DefineComponent<{
    onClick?: () => void;
    disabled?: boolean;
    type?: 'primary' | 'secondary' | 'default';
  }>;
}

export class PhoenixResizer extends HTMLElement {
  setWidth(width: number): number;
  setMinWidth(width: number): void;
  setMaxWidth(width: number): void;
  setOnResize(callback: (width: number) => void): void;
  updateIndicatorPosition(left: number): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'phoenix-resizer': PhoenixResizer;
  }
} 
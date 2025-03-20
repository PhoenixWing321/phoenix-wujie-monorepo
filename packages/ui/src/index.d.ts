declare module '@phoenix-wujie-monorepo/ui' {
  import { DefineComponent } from 'vue';
  
  export const Button: DefineComponent<{
    onClick?: () => void;
    disabled?: boolean;
    type?: 'primary' | 'secondary' | 'default';
  }>;
} 
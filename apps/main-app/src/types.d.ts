// 定义应用配置的类型
interface AppConfig {
  name: string;
  url: string;
  el: string;
  alive: boolean;
  props: Record<string, any>;
  beforeLoad?: () => void;
  afterMount?: () => void;
}

declare module '*.json' {
  const value: {
    apps: AppConfig[];
  };
  export default value;
} 
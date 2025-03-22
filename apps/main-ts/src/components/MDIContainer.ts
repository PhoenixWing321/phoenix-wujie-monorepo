import './MDIContainer.css';
import './WindowComponent';

// 窗口配置接口
interface WindowConfig {
  id: string;          // 窗口唯一标识
  title: string;       // 窗口标题
  url: string;         // 子应用URL
  position?: {         // 窗口位置（可选）
    x: number;
    y: number;
  };
  size?: {            // 窗口大小（可选）
    width: number;
    height: number;
  };
}

// 窗口状态接口
interface WindowState {
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
}

export class MDIContainer {
  private container: HTMLElement;
  private windows: Map<string, HTMLElement> = new Map();
  private windowStates: Map<string, WindowState> = new Map();
  private lastOpenedWindows: WindowConfig[] = [];
  private maxZIndex: number = 0;
  private readonly Z_INDEX_THRESHOLD = 99999;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id ${containerId} not found`);
    }
    this.container = container;
    this.loadLastOpenedWindows();
  }

  // 加载上次打开的窗口记录
  private loadLastOpenedWindows() {
    const saved = localStorage.getItem('lastOpenedWindows');
    if (saved) {
      this.lastOpenedWindows = JSON.parse(saved);
    }
  }

  // 保存窗口记录
  private saveLastOpenedWindows() {
    localStorage.setItem('lastOpenedWindows', JSON.stringify(this.lastOpenedWindows));
  }

  // 激活窗口
  private activateWindow(windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      const currentZIndex = parseInt(window.style.zIndex) || 0;
      
      // 如果当前窗口不是最上层，则将其提升到最上层
      if (currentZIndex < this.maxZIndex) {
        this.maxZIndex++;
        window.style.zIndex = this.maxZIndex.toString();
      }

      // 如果 z-index 超过阈值，重新整理所有窗口的 z-index
      if (this.maxZIndex >= this.Z_INDEX_THRESHOLD) {
        this.reorganizeZIndices();
      }
    }
  }

  // 重新整理所有窗口的 z-index
  private reorganizeZIndices() {
    const sortedWindows = Array.from(this.windows.entries())
      .sort((a, b) => {
        const aIndex = parseInt(a[1].style.zIndex) || 0;
        const bIndex = parseInt(b[1].style.zIndex) || 0;
        return aIndex - bIndex;
      });

    sortedWindows.forEach((entry, index) => {
      entry[1].style.zIndex = (index + 1).toString();
    });

    this.maxZIndex = sortedWindows.length;
  }

  // 添加新窗口
  addWindow(config: WindowConfig) {
    // 检查是否已存在相同URL的窗口
    const existingWindow = Array.from(this.windows.entries())
      .find(([_, win]) => win.getAttribute('data-url') === config.url);
    
    if (existingWindow) {
      // 如果存在，激活该窗口
      this.activateWindow(existingWindow[0]);
      return existingWindow[0];
    }

    // 创建新窗口
    const windowElement = document.createElement('window-component');
    windowElement.setAttribute('id', config.id);
    windowElement.setAttribute('title', config.title);
    windowElement.setAttribute('url', config.url);
    windowElement.setAttribute('data-url', config.url);
    
    if (config.position) {
      windowElement.setAttribute('position', JSON.stringify(config.position));
    }
    if (config.size) {
      windowElement.setAttribute('size', JSON.stringify(config.size));
    }
    windowElement.setAttribute('z-index', (++this.maxZIndex).toString());

    // 添加事件监听器
    windowElement.addEventListener('focus', () => this.activateWindow(config.id));
    windowElement.addEventListener('close', () => this.closeWindow(config.id));
    windowElement.addEventListener('minimize', () => {
      // 处理最小化事件
    });
    windowElement.addEventListener('maximize', () => {
      // 处理最大化事件
    });

    // 添加到容器
    this.container.appendChild(windowElement);
    this.windows.set(config.id, windowElement);
    
    // 记录到最近打开的窗口
    this.lastOpenedWindows = [
      config,
      ...this.lastOpenedWindows.filter(w => w.url !== config.url)
    ].slice(0, 10);
    this.saveLastOpenedWindows();

    return config.id;
  }

  // 关闭窗口
  closeWindow(windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      // 保存窗口状态
      this.saveWindowState(windowId);
      
      // 从lastOpenedWindows中移除
      const url = window.getAttribute('data-url');
      if (url) {
        this.lastOpenedWindows = this.lastOpenedWindows.filter(w => w.url !== url);
        this.saveLastOpenedWindows();
      }
      
      // 移除窗口元素并清理状态
      window.remove();
      this.windows.delete(windowId);
      this.windowStates.delete(windowId);
    }
  }

  // 保存窗口状态
  private saveWindowState(windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      const position = {
        x: window.offsetLeft,
        y: window.offsetTop
      };
      const size = {
        width: window.offsetWidth,
        height: window.offsetHeight
      };
      const isMaximized = window.classList.contains('maximized');

      this.windowStates.set(windowId, {
        position,
        size,
        isMaximized
      });
    }
  }

  // 获取最近打开的窗口列表
  getLastOpenedWindows(): WindowConfig[] {
    return this.lastOpenedWindows;
  }

  // 创建示例窗口
  addDemoWindow(): string {
    const windowId = `window-${Date.now()}`;
    const demoContent = `
      <div style="padding: 20px; text-align: center;">
        <h2>示例窗口</h2>
        <p>这是一个用于演示的示例窗口，您可以：</p>
        <ul style="text-align: left; margin-top: 10px;">
          <li>拖动窗口标题栏来移动窗口</li>
          <li>点击右上角按钮最小化/最大化窗口</li>
          <li>关闭窗口</li>
        </ul>
      </div>
    `;
    
    // 创建一个 blob URL 来显示示例内容
    const blob = new Blob([demoContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    return this.addWindow({
      id: windowId,
      title: '示例窗口',
      url: url
    });
  }

  // 清除所有窗口
  clearWindows() {
    this.windows.forEach(window => window.remove());
    this.windows.clear();
    this.windowStates.clear();
    this.maxZIndex = 0;
  }
} 
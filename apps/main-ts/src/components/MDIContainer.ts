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

    const window = document.createElement('div');
    window.className = 'window';
    window.setAttribute('data-id', config.id);
    window.setAttribute('data-url', config.url);
    
    // 设置初始位置和大小
    if (config.position) {
      window.style.left = `${config.position.x}px`;
      window.style.top = `${config.position.y}px`;
    } else {
      // 默认位置
      window.style.left = `${20 + this.windows.size * 20}px`;
      window.style.top = `${20 + this.windows.size * 20}px`;
    }

    if (config.size) {
      window.style.width = `${config.size.width}px`;
      window.style.height = `${config.size.height}px`;
    } else {
      // 默认大小
      window.style.width = '800px';
      window.style.height = '600px';
    }

    window.innerHTML = `
      <div class="window-header">
        <span class="window-title">${config.title}</span>
        <div class="window-controls">
          <button class="minimize-button">─</button>
          <button class="maximize-button">□</button>
          <button class="close-button">×</button>
        </div>
      </div>
      <div class="window-content">
        <iframe src="${config.url}" frameborder="0"></iframe>
      </div>
    `;

    // 添加窗口控制功能
    this.setupWindowControls(window);

    this.container.appendChild(window);
    this.windows.set(config.id, window);
    
    // 记录到最近打开的窗口
    this.lastOpenedWindows = [
      config,
      ...this.lastOpenedWindows.filter(w => w.url !== config.url)
    ].slice(0, 10); // 只保留最近10个
    this.saveLastOpenedWindows();

    return config.id;
  }

  // 激活窗口
  private activateWindow(windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      // 将窗口置于最上层
      const maxZIndex = Math.max(
        ...Array.from(this.windows.values())
          .map(w => parseInt(w.style.zIndex) || 0)
      );
      window.style.zIndex = `${maxZIndex + 1}`;
    }
  }

  // 设置窗口控制
  private setupWindowControls(window: HTMLElement) {
    const header = window.querySelector('.window-header');
    if (!header) return;

    // 拖拽功能
    this.setupWindowDrag(window);

    // 最小化按钮
    const minimizeBtn = window.querySelector('.minimize-button');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        window.classList.toggle('minimized');
      });
    }

    // 最大化按钮
    const maximizeBtn = window.querySelector('.maximize-button');
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => {
        window.classList.toggle('maximized');
        this.saveWindowState(window.getAttribute('data-id') || '');
      });
    }

    // 关闭按钮
    const closeBtn = window.querySelector('.close-button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeWindow(window.getAttribute('data-id') || '');
      });
    }
  }

  // 设置窗口拖拽
  private setupWindowDrag(window: HTMLElement) {
    const header = window.querySelector('.window-header');
    if (!header) return;

    let isDragging = false;
    let initialX: number;
    let initialY: number;

    const handleMouseDown = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      isDragging = true;
      initialX = mouseEvent.clientX - window.offsetLeft;
      initialY = mouseEvent.clientY - window.offsetTop;
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: Event) => {
      if (!isDragging) return;
      
      const mouseEvent = e as MouseEvent;
      e.preventDefault();
      const currentX = mouseEvent.clientX - initialX;
      const currentY = mouseEvent.clientY - initialY;
      
      window.style.left = `${currentX}px`;
      window.style.top = `${currentY}px`;
    };

    const handleMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    header.addEventListener('mousedown', handleMouseDown);
  }

  // 关闭窗口
  closeWindow(windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      // 保存窗口状态
      this.saveWindowState(windowId);
      window.remove();
      this.windows.delete(windowId);
    }
  }

  // 保存窗口状态
  private saveWindowState(windowId: string) {
    const window = this.windows.get(windowId);
    if (window) {
      this.windowStates.set(windowId, {
        position: { 
          x: window.offsetLeft, 
          y: window.offsetTop 
        },
        size: { 
          width: window.offsetWidth, 
          height: window.offsetHeight 
        },
        isMaximized: window.classList.contains('maximized')
      });
    }
  }

  // 获取最近打开的窗口列表
  getLastOpenedWindows(): WindowConfig[] {
    return this.lastOpenedWindows;
  }

  // 清除所有窗口
  clearWindows() {
    this.container.innerHTML = '';
    this.windows.clear();
    this.windowStates.clear();
  }
} 
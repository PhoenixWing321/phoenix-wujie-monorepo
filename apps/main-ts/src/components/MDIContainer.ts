import './MDIContainer.css';

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
  private maxZIndex: number = 0;  // 记录最大的 z-index
  private readonly Z_INDEX_THRESHOLD = 99999;  // z-index 阈值

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
        window.style.zIndex = `${this.maxZIndex}`;
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

    // 重新分配 z-index，从 1 开始
    sortedWindows.forEach((entry, index) => {
      const [_, win] = entry;
      win.style.zIndex = `${index + 1}`;
    });

    // 更新最大 z-index
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
    
    // 设置新窗口的 z-index 为最大值 + 1
    this.maxZIndex++;
    window.style.zIndex = `${this.maxZIndex}`;
    
    // 记录到最近打开的窗口
    this.lastOpenedWindows = [
      config,
      ...this.lastOpenedWindows.filter(w => w.url !== config.url)
    ].slice(0, 10);
    this.saveLastOpenedWindows();

    return config.id;
  }

  // 设置窗口控制
  private setupWindowControls(window: HTMLElement) {
    const header = window.querySelector('.window-header');
    const windowContent = window.querySelector('.window-content');
    if (!header || !windowContent) return;

    const windowId = window.getAttribute('data-id') || '';

    // 点击标题栏时激活窗口
    header.addEventListener('mousedown', () => {
      this.activateWindow(windowId);
    });

    // 监听 iframe 的点击事件
    const iframe = windowContent.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('load', () => {
        try {
          // 尝试访问 iframe 内容并添加点击监听
          iframe.contentWindow?.addEventListener('click', () => {
            this.activateWindow(windowId);
          });
          iframe.contentWindow?.addEventListener('mousedown', () => {
            this.activateWindow(windowId);
          });
        } catch (e) {
          // 如果是跨域 iframe，则无法直接监听其事件
          // 可以通过点击 iframe 元素本身来激活窗口
          iframe.addEventListener('mousedown', () => {
            this.activateWindow(windowId);
          });
        }
      });
    }

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
    const header = window.querySelector('.window-header') as HTMLElement;
    if (!header) return;

    let isDragging = false;
    let initialX: number;
    let initialY: number;
    let dragPreview: HTMLElement | null = null;
    let overlay: HTMLElement | null = null;

    const createDragElements = () => {
      // 创建遮罩层
      overlay = document.createElement('div');
      overlay.className = 'window-drag-overlay';
      this.container.appendChild(overlay);

      // 添加拖拽状态类
      this.container.classList.add('window-dragging');
      window.classList.add('dragging');

      // 创建拖动预览
      dragPreview = document.createElement('div');
      dragPreview.className = 'window-drag-preview';
      // 复制窗口的大小和位置
      const rect = window.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      dragPreview.style.width = `${rect.width}px`;
      dragPreview.style.height = `${rect.height}px`;
      dragPreview.style.left = `${rect.left - containerRect.left}px`;
      dragPreview.style.top = `${rect.top - containerRect.top}px`;
      this.container.appendChild(dragPreview);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragPreview) return;
      
      e.preventDefault();
      
      // 计算新位置（相对于容器）
      const containerRect = this.container.getBoundingClientRect();
      let currentX = e.clientX - containerRect.left - initialX;
      let currentY = e.clientY - containerRect.top - initialY;

      // 获取容器和预览框的尺寸
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      const previewWidth = dragPreview.offsetWidth;
      const headerHeight = header.offsetHeight;
      
      // 边界检查
      // 左边界：不能完全移出左侧（至少保留100px宽度）
      currentX = Math.max(currentX, -previewWidth + 100);
      // 右边界：不能完全移出右侧（至少保留100px宽度）
      currentX = Math.min(currentX, containerWidth - 100);
      // 上边界：不能移出顶部
      currentY = Math.max(currentY, 0);
      // 下边界：不能完全移出底部（至少保留标题栏高度）
      currentY = Math.min(currentY, containerHeight - headerHeight);
      
      // 更新预览框的位置
      dragPreview.style.left = `${currentX}px`;
      dragPreview.style.top = `${currentY}px`;
    };

    const removeDragElements = () => {
      if (overlay) {
        overlay.remove();
        overlay = null;
      }
      // 移除拖拽状态类
      this.container.classList.remove('window-dragging');
      window.classList.remove('dragging');

      if (dragPreview) {
        // 获取预览框相对于容器的位置
        let finalLeft = parseFloat(dragPreview.style.left);
        let finalTop = parseFloat(dragPreview.style.top);
        
        // 获取容器和窗口的尺寸
        const containerRect = this.container.getBoundingClientRect();
        const windowWidth = window.offsetWidth;
        const headerHeight = header.offsetHeight;
        
        // 最终位置的边界检查
        // 左边界：不能完全移出左侧（至少保留100px宽度）
        finalLeft = Math.max(finalLeft, -windowWidth + 100);
        // 右边界：不能完全移出右侧（至少保留100px宽度）
        finalLeft = Math.min(finalLeft, containerRect.width - 100);
        // 上边界：不能移出顶部
        finalTop = Math.max(finalTop, 0);
        // 下边界：不能完全移出底部（至少保留标题栏高度）
        finalTop = Math.min(finalTop, containerRect.height - headerHeight);
        
        // 移除预览框
        dragPreview.remove();
        dragPreview = null;

        // 设置窗口到最终位置（带动画）
        window.style.transition = 'left 0.15s, top 0.15s';
        window.style.left = `${finalLeft}px`;
        window.style.top = `${finalTop}px`;
        
        // 动画结束后移除过渡效果
        setTimeout(() => {
          window.style.transition = '';
        }, 150);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // 只有点击标题区域（不包括控制按钮）时才启动拖拽
      const isClickOnTitle = target.classList.contains('window-header') || 
                           target.classList.contains('window-title') ||
                           (target === header && !target.closest('.window-controls'));
      
      if (!isClickOnTitle) {
        return;
      }

      isDragging = true;
      const rect = window.getBoundingClientRect();
      initialX = e.clientX - rect.left;
      initialY = e.clientY - rect.top;
      
      createDragElements();
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseUp = () => {
      if (isDragging) {
        removeDragElements();
        isDragging = false;
      }
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
    this.container.innerHTML = '';
    this.windows.clear();
    this.windowStates.clear();
    this.maxZIndex = 0;  // 重置最大 z-index
  }
} 
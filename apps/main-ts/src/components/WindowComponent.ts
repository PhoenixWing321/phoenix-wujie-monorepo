import './WindowComponent.css';

interface WindowComponentProps {
  id: string;
  title: string;
  url: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  zIndex?: number;
}

export class WindowComponent extends HTMLElement {
  private shadow: ShadowRoot;
  private element: HTMLElement;
  private isDragging = false;
  private isMaximized = false;
  private isMinimized = false;
  private originalSize?: { width: number; height: number };
  private originalPosition?: { x: number; y: number };
  private resizeHandles: HTMLElement[] = [];
  private props: WindowComponentProps;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.element = document.createElement('div');
    this.element.className = 'window';
    this.props = {
      id: '',
      title: '',
      url: '',
      position: undefined,
      size: undefined,
      zIndex: undefined
    };
  }

  // 当元素的属性发生变化时调用
  static get observedAttributes() {
    return ['id', 'title', 'url', 'position', 'size', 'z-index'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'id':
        this.props.id = newValue;
        break;
      case 'title':
        this.props.title = newValue;
        break;
      case 'url':
        this.props.url = newValue;
        break;
      case 'position':
        this.props.position = newValue ? JSON.parse(newValue) : undefined;
        if (this.props.position) {
          this.element.style.left = `${this.props.position.x}px`;
          this.element.style.top = `${this.props.position.y}px`;
        }
        break;
      case 'size':
        this.props.size = newValue ? JSON.parse(newValue) : undefined;
        if (this.props.size) {
          this.element.style.width = `${this.props.size.width}px`;
          this.element.style.height = `${this.props.size.height}px`;
        }
        break;
      case 'z-index':
        this.props.zIndex = newValue ? parseInt(newValue) : undefined;
        if (this.props.zIndex !== undefined) {
          this.element.style.zIndex = this.props.zIndex.toString();
        }
        break;
    }

    // 如果组件已经连接到DOM，更新渲染
    if (this.isConnected) {
      this.render();
    }
  }

  // 当组件被添加到 DOM 时调用
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.setupStyles();
  }

  // 当组件从 DOM 中移除时调用
  disconnectedCallback() {
    // 清理事件监听器
    this.removeEventListeners();
  }

  private setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        position: absolute;
      }

      .window {
        position: relative;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        min-width: 200px;
        min-height: 150px;
        transition: box-shadow 0.3s;
        width: 100%;
        height: 100%;
      }

      .window:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .window.maximized {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        border-radius: 0;
      }

      .window.minimized {
        height: 40px !important;
        min-height: 40px !important;
        overflow: hidden;
      }

      .window-header {
        padding: 8px 12px;
        background-color: #f8f8f8;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
        border-radius: 4px 4px 0 0;
      }

      .window-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
        margin-right: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .window-controls {
        display: flex;
        gap: 4px;
      }

      .window-controls button {
        width: 24px;
        height: 24px;
        border: none;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 16px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .window-controls button:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: #333;
      }

      .window-controls .close-button:hover {
        background-color: #ff4d4f;
        color: #fff;
      }

      .window-content {
        flex: 1;
        position: relative;
        overflow: hidden;
        background-color: #fff;
        border-radius: 0 0 4px 4px;
      }

      .window-content iframe {
        width: 100%;
        height: 100%;
        border: none;
        position: absolute;
        top: 0;
        left: 0;
      }

      /* 调整大小指示器样式 */
      .window-resize-handle {
        position: absolute;
        background-color: transparent;
        z-index: 1000;
      }

      /* 边线指示器 */
      .window-resize-handle.north,
      .window-resize-handle.south {
        height: 4px;
        width: 100%;
        cursor: ns-resize;
      }

      .window-resize-handle.east,
      .window-resize-handle.west {
        width: 4px;
        height: 100%;
        cursor: ew-resize;
      }

      /* 角落指示器 */
      .window-resize-handle.northwest,
      .window-resize-handle.northeast,
      .window-resize-handle.southwest,
      .window-resize-handle.southeast {
        width: 8px;
        height: 8px;
      }

      .window-resize-handle.northwest {
        top: -4px;
        left: -4px;
        cursor: nw-resize;
      }

      .window-resize-handle.northeast {
        top: -4px;
        right: -4px;
        cursor: ne-resize;
      }

      .window-resize-handle.southwest {
        bottom: -4px;
        left: -4px;
        cursor: sw-resize;
      }

      .window-resize-handle.southeast {
        bottom: -4px;
        right: -4px;
        cursor: se-resize;
      }
    `;
    this.shadow.appendChild(style);
  }

  private render() {
    this.element.innerHTML = `
      <div class="window-header">
        <span class="window-title">${this.props.title}</span>
        <div class="window-controls">
          <button class="minimize-button">─</button>
          <button class="maximize-button">□</button>
          <button class="close-button">×</button>
        </div>
      </div>
      <div class="window-content">
        <iframe src="${this.props.url}" frameborder="0"></iframe>
      </div>
    `;

    // 添加调整大小的指示器
    const handles = [
      'north', 'south', 'east', 'west',
      'northwest', 'northeast', 'southwest', 'southeast'
    ];

    handles.forEach(handle => {
      const handleElement = document.createElement('div');
      handleElement.className = `window-resize-handle ${handle}`;
      this.element.appendChild(handleElement);
      this.resizeHandles.push(handleElement);
    });

    // 设置初始位置和大小
    if (this.props.position) {
      this.element.style.left = `${this.props.position.x}px`;
      this.element.style.top = `${this.props.position.y}px`;
    }
    if (this.props.size) {
      this.element.style.width = `${this.props.size.width}px`;
      this.element.style.height = `${this.props.size.height}px`;
    }
    if (this.props.zIndex) {
      this.element.style.zIndex = this.props.zIndex.toString();
    }

    // 如果是第一次渲染，将元素添加到shadow DOM
    if (!this.shadow.contains(this.element)) {
      this.shadow.appendChild(this.element);
    }
  }

  private setupEventListeners() {
    // 窗口控制按钮
    const minimizeBtn = this.element.querySelector('.minimize-button');
    const maximizeBtn = this.element.querySelector('.maximize-button');
    const closeBtn = this.element.querySelector('.close-button');

    minimizeBtn?.addEventListener('click', () => this.minimize());
    maximizeBtn?.addEventListener('click', () => this.maximize());
    closeBtn?.addEventListener('click', () => this.close());

    // 窗口焦点
    this.element.addEventListener('mousedown', () => {
      this.dispatchEvent(new CustomEvent('focus'));
    });

    // 标题栏点击和拖动
    const header = this.element.querySelector('.window-header');
    if (header) {
      header.addEventListener('mousedown', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const target = mouseEvent.target as HTMLElement;
        if (target.closest('.window-controls')) return;
        this.startDrag(mouseEvent);
      });
    }

    // 调整大小指示器事件
    this.resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const handleType = handle.classList[1];
        this.startResize(mouseEvent, handleType);
      });
    });
  }

  private removeEventListeners() {
    // 清理所有事件监听器
    const header = this.element.querySelector('.window-header');
    if (header) {
      header.removeEventListener('mousedown', () => {});
    }
    this.resizeHandles.forEach(handle => {
      handle.removeEventListener('mousedown', () => {});
    });
  }

  // 窗口控制方法
  minimize() {
    if (!this.isMinimized) {
      this.isMinimized = true;
      this.element.classList.add('minimized');
      this.dispatchEvent(new CustomEvent('minimize'));
    } else {
      this.isMinimized = false;
      this.element.classList.remove('minimized');
    }
  }

  maximize() {
    if (!this.isMaximized) {
      this.originalSize = {
        width: this.element.offsetWidth,
        height: this.element.offsetHeight
      };
      this.originalPosition = {
        x: this.element.offsetLeft,
        y: this.element.offsetTop
      };

      this.isMaximized = true;
      this.element.classList.add('maximized');
      this.dispatchEvent(new CustomEvent('maximize'));
    } else {
      this.isMaximized = false;
      this.element.classList.remove('maximized');

      if (this.originalSize && this.originalPosition) {
        this.element.style.width = `${this.originalSize.width}px`;
        this.element.style.height = `${this.originalSize.height}px`;
        this.element.style.left = `${this.originalPosition.x}px`;
        this.element.style.top = `${this.originalPosition.y}px`;
      }
    }
  }

  close() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  // 拖拽相关方法
  private startDrag(e: MouseEvent) {
    if (this.isMaximized) return;
    
    this.isDragging = true;
    const rect = this.element.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      if (!this.isDragging) return;
      
      e.preventDefault();
      
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;

      this.element.style.left = `${newX}px`;
      this.element.style.top = `${newY}px`;
    };

    const handleMouseUp = () => {
      this.isDragging = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  // 调整大小相关方法
  private startResize(e: MouseEvent, handle: string) {
    const rect = this.element.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = rect.width;
    const startHeight = rect.height;
    const startLeft = rect.left;
    const startTop = rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      // 根据不同的调整方向计算新的尺寸和位置
      switch (handle) {
        case 'east':
          newWidth = Math.max(startWidth + deltaX, 200);
          break;
        case 'west':
          newWidth = Math.max(startWidth - deltaX, 200);
          newLeft = startLeft + deltaX;
          break;
        case 'south':
          newHeight = Math.max(startHeight + deltaY, 150);
          break;
        case 'north':
          newHeight = Math.max(startHeight - deltaY, 150);
          newTop = startTop + deltaY;
          break;
        case 'southeast':
          newWidth = Math.max(startWidth + deltaX, 200);
          newHeight = Math.max(startHeight + deltaY, 150);
          break;
        case 'southwest':
          newWidth = Math.max(startWidth - deltaX, 200);
          newHeight = Math.max(startHeight + deltaY, 150);
          newLeft = startLeft + deltaX;
          break;
        case 'northeast':
          newWidth = Math.max(startWidth + deltaX, 200);
          newHeight = Math.max(startHeight - deltaY, 150);
          newTop = startTop + deltaY;
          break;
        case 'northwest':
          newWidth = Math.max(startWidth - deltaX, 200);
          newHeight = Math.max(startHeight - deltaY, 150);
          newLeft = startLeft + deltaX;
          newTop = startTop + deltaY;
          break;
      }

      this.element.style.width = `${newWidth}px`;
      this.element.style.height = `${newHeight}px`;
      this.element.style.left = `${newLeft}px`;
      this.element.style.top = `${newTop}px`;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  // 公共方法
  getElement(): HTMLElement {
    return this.element;
  }

  setPosition(x: number, y: number) {
    if (!this.isMaximized) {
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
    }
  }

  setSize(width: number, height: number) {
    if (!this.isMaximized) {
      this.element.style.width = `${width}px`;
      this.element.style.height = `${height}px`;
    }
  }

  setZIndex(zIndex: number) {
    this.element.style.zIndex = zIndex.toString();
  }

  getPosition() {
    return {
      x: this.element.offsetLeft,
      y: this.element.offsetTop
    };
  }

  getSize() {
    return {
      width: this.element.offsetWidth,
      height: this.element.offsetHeight
    };
  }

  getMinSize(): { width: number; height: number } {
    return {
      width: 200,
      height: 150
    };
  }
}

// 注册自定义元素
customElements.define('window-component', WindowComponent); 
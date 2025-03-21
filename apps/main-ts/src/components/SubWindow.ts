import './SubWindow.css';

interface SubWindowProps {
  id: string;
  title: string;
  url: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  zIndex?: number;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  onDragStart?: () => void;
  onDragEnd?: (position: { x: number; y: number }) => void;
}

export class SubWindow {
  private element: HTMLElement;
  private isDragging = false;
  private isMaximized = false;
  private isMinimized = false;
  private originalSize?: { width: number; height: number };
  private originalPosition?: { x: number; y: number };

  constructor(private props: SubWindowProps) {
    this.element = document.createElement('div');
    this.element.className = 'window';
    this.element.setAttribute('data-id', props.id);
    this.element.setAttribute('data-url', props.url);
    
    // 设置初始位置和大小
    if (props.position) {
      this.element.style.left = `${props.position.x}px`;
      this.element.style.top = `${props.position.y}px`;
    }
    if (props.size) {
      this.element.style.width = `${props.size.width}px`;
      this.element.style.height = `${props.size.height}px`;
    }
    if (props.zIndex) {
      this.element.style.zIndex = props.zIndex.toString();
    }

    this.render();
    this.setupEventListeners();
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
      this.props.onFocus?.();
    });

    // 标题栏点击和拖动
    const header = this.element.querySelector('.window-header');
    if (header) {
      header.addEventListener('mousedown', (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const target = mouseEvent.target as HTMLElement;
        if (target.closest('.window-controls')) return;
        
        // 移除这里的 onDragStart 触发，让 MDIContainer 直接处理拖拽
      });
    }
  }

  // 窗口控制方法
  minimize() {
    if (!this.isMinimized) {
      this.isMinimized = true;
      this.element.classList.add('minimized');
      this.props.onMinimize?.();
    } else {
      this.isMinimized = false;
      this.element.classList.remove('minimized');
    }
  }

  maximize() {
    if (!this.isMaximized) {
      // 保存原始大小和位置
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
      this.props.onMaximize?.();
    } else {
      this.isMaximized = false;
      this.element.classList.remove('maximized');

      // 恢复原始大小和位置
      if (this.originalSize && this.originalPosition) {
        this.element.style.width = `${this.originalSize.width}px`;
        this.element.style.height = `${this.originalSize.height}px`;
        this.element.style.left = `${this.originalPosition.x}px`;
        this.element.style.top = `${this.originalPosition.y}px`;
      }
    }
  }

  close() {
    this.props.onClose?.();
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
} 
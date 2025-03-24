export class PhoenixResizer extends HTMLElement {
  private isDragging: boolean = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private tempWidth: number = 0;
  private minWidth: number = 50;
  private maxWidth: number = 400;
  private checkInterval: number | null = null;
  private onResize?: (width: number) => void;
  private targetElement: HTMLElement | null = null;

  constructor() {
    super();
    this.init();
  }

  private init(): void {
    // 创建样式
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 4px;
        background-color: #ddd;
        cursor: col-resize;
        position: relative;
        z-index: 100;
      }

      :host::before {
        content: '';
        position: fixed;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: #2196F3;
        pointer-events: none;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
        left: var(--indicator-left, 0);
        box-shadow: 0 0 10px rgba(33, 150, 243, 0.8);
        border-radius: 2px;
      }

      :host::after {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.1);
        pointer-events: none;
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s;
      }

      :host:hover::before,
      :host(.dragging)::before,
      :host(.dragging)::after {
        opacity: 1;
      }

      :host(.dragging) {
        cursor: col-resize;
        user-select: none;
      }

      :host(.dragging) ~ * {
        pointer-events: none;
      }

      :host(.dragging)::after {
        pointer-events: auto;
      }
    `;

    // 添加到 Shadow DOM
    this.attachShadow({ mode: 'open' });
    this.shadowRoot?.appendChild(style);

    // 绑定事件
    this.addEventListener('mousedown', this.handleMouseDown.bind(this));
  }

  connectedCallback() {
    // 获取目标元素
    const targetId = this.getAttribute('target');
    if (targetId) {
      this.targetElement = document.querySelector(targetId);
    }
  }

  private handleMouseDown(e: MouseEvent): void {
    if (!this.targetElement) return;

    this.isDragging = true;
    this.startX = e.clientX;
    this.startWidth = this.targetElement.clientWidth;
    this.tempWidth = this.startWidth;

    // 添加拖动状态
    this.classList.add('dragging');

    // 添加事件监听器
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));

    // 开始检查鼠标状态
    this.startMouseCheck();
  }

  private startMouseCheck(): void {
    // 清除可能存在的旧定时器
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
    }

    // 每100ms检查一次鼠标状态
    this.checkInterval = window.setInterval(() => {
      if (this.isDragging && !document.hasFocus()) {
        this.handleMouseUp();
      }
    }, 100);
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging || !this.targetElement) return;

    const width = this.startWidth + (e.clientX - this.startX);
    if (width >= this.minWidth && width <= this.maxWidth) {
      this.tempWidth = width;
      // 更新指示线位置
      this.style.setProperty('--indicator-left', `${e.clientX}px`);
      // 调用onResize回调
      this.onResize?.(width);
    }
  }

  private handleMouseUp(): void {
    if (!this.isDragging) return;

    // 清除检查定时器
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // 移除拖动状态
    this.classList.remove('dragging');

    // 应用最终宽度
    if (this.targetElement) {
      this.setWidth(this.tempWidth);
    }

    this.isDragging = false;

    // 移除事件监听器
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  // 公共方法：设置宽度
  public setWidth(width: number): number {
    if (!this.targetElement) return 0;
    const validWidth = Math.min(Math.max(width, this.minWidth), this.maxWidth);
    this.targetElement.style.width = `${validWidth}px`;
    return validWidth;
  }

  // 公共方法：设置最小宽度
  public setMinWidth(width: number): void {
    this.minWidth = width;
  }

  // 公共方法：设置最大宽度
  public setMaxWidth(width: number): void {
    this.maxWidth = width;
  }

  // 公共方法：设置回调函数
  public setOnResize(callback: (width: number) => void): void {
    this.onResize = callback;
  }

  // 公共方法：更新指示线位置
  public updateIndicatorPosition(left: number): void {
    this.style.setProperty('--indicator-left', `${left}px`);
  }
}

// 注册自定义元素
customElements.define('phoenix-resizer', PhoenixResizer); 
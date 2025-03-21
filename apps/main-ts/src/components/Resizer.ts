import './Resizer.css';

export class Resizer {
  private element: HTMLElement;
  private targetElement: HTMLElement;
  private isDragging: boolean = false;
  private startX: number = 0;
  private startWidth: number = 0;
  private tempWidth: number = 0;
  private minWidth: number;
  private maxWidth: number;
  private defaultWidth: number;
  private checkInterval: number | null = null;

  constructor(
    elementId: string,
    targetElementId: string,
    options: {
      minWidth?: number;
      maxWidth?: number;
      defaultWidth?: number;
    } = {}
  ) {
    this.element = document.querySelector(elementId) as HTMLElement;
    if (!this.element) {
      throw new Error(`Resizer element with id "${elementId}" not found`);
    }

    this.targetElement = document.querySelector(targetElementId) as HTMLElement;
    if (!this.targetElement) {
      throw new Error(`Target element with id "${targetElementId}" not found`);
    }

    this.minWidth = options.minWidth || 50;
    this.maxWidth = options.maxWidth || 400;
    this.defaultWidth = options.defaultWidth || 200;

    this.init();
  }

  private init(): void {
    // 绑定事件
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
  }

  private handleMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.startX = e.clientX;
    this.startWidth = this.targetElement.clientWidth;
    this.tempWidth = this.startWidth;

    // 添加拖动状态
    this.element.classList.add('dragging');

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
    if (!this.isDragging) return;

    const width = this.startWidth + (e.clientX - this.startX);
    if (width >= this.minWidth && width <= this.maxWidth) {
      this.tempWidth = width;
      // 更新指示线位置
      this.element.style.setProperty('--indicator-left', `${e.clientX}px`);
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
    this.element.classList.remove('dragging');

    // 应用最终宽度
    this.setWidth(this.tempWidth);

    this.isDragging = false;

    // 移除事件监听器
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  // 公共方法：设置宽度
  public setWidth(width: number): number {
    const validWidth = Math.min(Math.max(width, this.minWidth), this.maxWidth);
    this.targetElement.style.width = `${validWidth}px`;
    return validWidth;
  }

  // 公共方法：更新指示线位置
  public updateIndicatorPosition(left: number): void {
    this.element.style.setProperty('--indicator-left', `${left}px`);
  }
} 
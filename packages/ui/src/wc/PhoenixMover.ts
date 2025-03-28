import { debounce } from 'lodash';

// 添加接口定义
interface Position {
  x: number;
  y: number;
}

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export class PhoenixMover extends HTMLElement {
  private target: HTMLElement | null = null; //被拖拽的元素
  private overlay: HTMLElement | null = null; //被覆盖的元素
  private isDragging: boolean = false; //是否正在拖拽
  private indicator: HTMLElement; //拖拽指示器
  private mask: HTMLElement; //拖拽遮罩
  private startMouseX: number = 0;  // 鼠标起始位置
  private startMouseY: number = 0; //鼠标起始位置
  private startElementX: number = 0;  // 元素起始位置
  private startElementY: number = 0; //元素起始位置
  private checkInterval: number | null = null; //检查定时器
  private lastMouseX: number = 0;  // 鼠标最后位置
  private lastMouseY: number = 0; //鼠标最后位置
  private maskRect: DOMRect | null = null; //遮罩区域
  private debouncedUpdateMaskPosition: () => void; //防抖的更新遮罩位置方法

  // 提取常量
  private static readonly Z_INDEX = {
    INDICATOR: 9999,
    MASK: 9998,
    MOVER_INDICATOR: 1001,
    MOVER_MASK: 999
  };

  private static readonly CHECK_INTERVAL = 100;

  // 可以把样式提取为常量，提高可维护性
  private static readonly STYLES = `
    .indicator {
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      border: 2px dashed #4CAF50;
      background: rgba(76,175,80,0.1);
      display: none;
    }

    .indicator.visible {
      display: block;
    }

    .mask {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.05);
      pointer-events: none;
      z-index: 9998;
      display: none;
    }

    .mask.visible {
      display: block;
    }

    .mover-indicator {
      position: fixed;
      pointer-events: none;
      z-index: 1001;
    }

    .mover-indicator::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border: 3px solid #2196F3;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.3s;
      box-shadow: 0 0 10px rgba(33, 150, 243, 0.8);
      border-radius: 2px;
    }

    .mover-mask {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.05);
      pointer-events: none;
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .mover-indicator.dragging::before,
    .mover-mask.dragging {
      opacity: 1;
    }

    .mover-mask.dragging {
      pointer-events: auto;
      background-color: rgba(0, 0, 0, 0.05);
      backdrop-filter: brightness(0.98) blur(1px);
    }
  `;

  // 将相关的方法分组
  private readonly positionMethods = {
    getRelativePosition: (element: HTMLElement) => { /* ... */ },
    limitPosition: (x: number, y: number) => { /* ... */ },
    updateMaskPosition: () => { /* ... */ }
  };

  private readonly eventHandlers = {
    handleMouseDown: (e: MouseEvent) => { /* ... */ },
    handleMouseMove: (e: MouseEvent) => { /* ... */ },
    handleMouseUp: (e: MouseEvent | null) => { /* ... */ }
  };

  /**
   * @param overlay 被覆盖的元素
   * @param target 被拖拽的元素
   */
  constructor(overlay: HTMLElement | null = null, target: HTMLElement | null = null) {
    super();
    this.setTarget(target);
    this.setOverlay(overlay);

    // 绑定事件处理函数
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.updateMaskPosition = this.updateMaskPosition.bind(this);

    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // 创建样式
    const style = document.createElement('style');
    style.textContent = PhoenixMover.STYLES;
    shadow.appendChild(style);

    // 创建指示器
    this.indicator = document.createElement('div');
    this.indicator.className = 'mover-indicator';

    // 创建遮罩
    this.mask = document.createElement('div');
    this.mask.className = 'mover-mask';
    this.mask.style.position = 'fixed';  // 改为fixed定位
    this.mask.style.zIndex = '1000';  // 改回原来的值
    this.mask.style.display = 'none';  // 初始隐藏

    // 将指示器和遮罩都添加到 Shadow DOM
    shadow.appendChild(this.indicator);
    shadow.appendChild(this.mask);  // 将遮罩添加到Shadow DOM
  }

  // 监听属性变化
  static get observedAttributes() {
    return ['target', 'overlay'];
  }

  // 设置overlay
  setOverlay(overlay: HTMLElement | null) {
    this.overlay = overlay;
  }

  // 设置target
  setTarget(target: HTMLElement | null) {
    this.target = target; 
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    if (name === 'target') {
      // 更新目标元素
      if (this.target) {
        this.target.removeEventListener('mousedown', this.eventHandlers.handleMouseDown);
        if (!newValue) {
          // 如果是移除target，调用stopMove
          this.stopMove();
        }
      }
      this.target = newValue ? document.querySelector(newValue) : null;
    } else if (name === 'overlay') {
      // 更新遮罩区域
      // this.overlay = newValue ? document.querySelector(newValue) : null;
      if (this.overlay) {
        this.maskRect = this.overlay.getBoundingClientRect();
      }
    }
  }

  // 当组件被添加到 DOM 时调用
  connectedCallback() {
    // 设置target
    if(!this.target) {
      const targetSelector = this.getAttribute('target');
      if (targetSelector) {
        this.target = document.querySelector(targetSelector);
        if (this.target) {
          this.target.addEventListener('mousedown', this.handleMouseDown);
        }
      }
    }

    // 设置overlay    
    if(!this.overlay) {
      const overlySelector = this.getAttribute('overlay');
      if (overlySelector) this.overlay = document.querySelector(overlySelector);
    }  

    if(this.overlay) {
      this.maskRect = this.overlay.getBoundingClientRect();
      this.updateMaskPosition();
      this.debouncedUpdateMaskPosition = debounce(this.updateMaskPosition, 100);
      window.addEventListener('resize', this.debouncedUpdateMaskPosition);
    }

    // 绑定全局事件
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  // 更新遮罩位置和尺寸
  private updateMaskPosition = () => {
    try {
      if (this.overlay) {
        const rect = this.overlay.getBoundingClientRect();
        this.mask.style.top = `${rect.top}px`;
        this.mask.style.left = `${rect.left}px`;
        this.mask.style.width = `${rect.width}px`;
        this.mask.style.height = `${rect.height}px`;
        this.maskRect = rect;
      }
    } catch (error) {
      console.error('更新遮罩位置失败:', error);
    }
  };

  // 当组件从 DOM 中移除时调用
  disconnectedCallback() {
    if (this.target) {
      this.target.removeEventListener('mousedown', this.handleMouseDown);
    }

    // 移除全局事件
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('resize', this.debouncedUpdateMaskPosition);

    this.cleanup();
  }

  private getRelativePosition(element: HTMLElement): { left: number; top: number } {
    const parent = element.parentElement;
    if (!parent) return { left: 0, top: 0 };

    const parentRect = parent.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    return {
      left: elementRect.left - parentRect.left,
      top: elementRect.top - parentRect.top
    };
  }

  private limitPosition(x: number, y: number): { x: number, y: number } {
    if (!this.maskRect || !this.target) return { x, y };

    const targetRect = this.target.getBoundingClientRect();
    const parentRect = this.target.parentElement!.getBoundingClientRect();

    // 计算相对于父元素的限制范围
    const minX = this.maskRect.left - parentRect.left;
    const maxX = this.maskRect.right - parentRect.left - targetRect.width;
    const minY = this.maskRect.top - parentRect.top;
    const maxY = this.maskRect.bottom - parentRect.top - targetRect.height;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }

  private handleMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡
    this.isDragging = true;

    if (this.target) {
      const rect = this.target.getBoundingClientRect();
      const relativePos = this.getRelativePosition(this.target);

      // 记录鼠标起始位置
      this.startMouseX = e.clientX;
      this.startMouseY = e.clientY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      // 记录元素起始位置（相对于父元素）
      this.startElementX = relativePos.left;
      this.startElementY = relativePos.top;

      // 添加拖动状态 
      this.indicator.classList.add('dragging');
      
      // 显示并添加遮罩状态
      this.updateMaskPosition();
      this.mask.style.display = 'block';
      this.mask.classList.add('dragging');

      // 设置指示器的初始位置为目标元素的位置
      this.indicator.style.left = `${rect.left}px`;
      this.indicator.style.top = `${rect.top}px`;
      this.indicator.style.width = `${rect.width}px`;
      this.indicator.style.height = `${rect.height}px`;

      // 更新遮罩区域的位置信息
      if (this.overlay) {
        this.maskRect = this.overlay.getBoundingClientRect();
      }
    }

    // 开始检查鼠标状态
    this.startMouseCheck();
  };

  private startMouseCheck(): void {
    // 清除可能存在的旧定时器
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
    }

    // 每100ms检查一次鼠标状态
    this.checkInterval = window.setInterval(() => {
      if (this.isDragging && !document.hasFocus()) {
        this.eventHandlers.handleMouseUp(null);
      }
    }, 100);
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDragging) return;

    e.preventDefault();
    e.stopPropagation(); // 阻止事件冒泡

    // 更新鼠标最后位置
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    // 计算相对移动距离
    const deltaX = e.clientX - this.startMouseX;
    const deltaY = e.clientY - this.startMouseY;

    // 计算新位置并限制在遮罩区域内
    const newPos = this.limitPosition(
      this.startElementX + deltaX,
      this.startElementY + deltaY
    );

    // 更新指示器位置
    const parentRect = this.target!.parentElement!.getBoundingClientRect();
    this.indicator.style.left = `${parentRect.left + newPos.x}px`;
    this.indicator.style.top = `${parentRect.top + newPos.y}px`;
  };

  private handleMouseUp = (e: MouseEvent | null) => {
    if (!this.isDragging) return;

    if (e) {
      e.preventDefault();
      e.stopPropagation(); // 阻止事件冒泡
    }

    // 计算最终的相对移动距离
    if (this.target) {
      const deltaX = this.lastMouseX - this.startMouseX;
      const deltaY = this.lastMouseY - this.startMouseY;

      // 只有当有实际移动时才更新位置
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        // 计算新位置并限制在遮罩区域内
        const newPos = this.limitPosition(
          this.startElementX + deltaX,
          this.startElementY + deltaY
        );
        
        // 更新元素位置
        this.target.style.left = `${newPos.x}px`;
        this.target.style.top = `${newPos.y}px`;
      }
    }

    // 调用stopMove来清理状态
    this.stopMove();
  };

  // 新增：初始化移动的方法
  public initializeMove(e: MouseEvent) {
    if (!this.target || this.isDragging) return;
    
    e.preventDefault();
    this.isDragging = true;

    const rect = this.target.getBoundingClientRect();
    const relativePos = this.getRelativePosition(this.target);

    // 记录起始位置
    this.startMouseX = e.clientX;
    this.startMouseY = e.clientY;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    // 记录元素起始位置
    this.startElementX = relativePos.left;
    this.startElementY = relativePos.top;

    // 添加拖动状态
    this.indicator.classList.add('dragging');

    // 显示并更新遮罩
    this.updateMaskPosition();
    this.mask.style.display = 'block';
    this.mask.classList.add('dragging');

    // 设置指示器位置
    this.indicator.style.left = `${rect.left}px`;
    this.indicator.style.top = `${rect.top}px`;
    this.indicator.style.width = `${rect.width}px`;
    this.indicator.style.height = `${rect.height}px`;

    // 开始检查鼠标状态
    this.startMouseCheck();
  }

  // 新增：停止移动的方法
  public stopMove() {
    this.isDragging = false;
    this.indicator.classList.remove('dragging');
    this.mask.classList.remove('dragging');
    this.mask.style.display = 'none';

    // 清除检查定时器
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }

    // 重置所有状态
    this.startMouseX = 0;
    this.startMouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.startElementX = 0;
    this.startElementY = 0;
  }

  // 添加清理方法
  private cleanup() {
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    window.removeEventListener('resize', this.updateMaskPosition);
  }
}
// 注册自定义元素
customElements.define('phoenix-mover', PhoenixMover);

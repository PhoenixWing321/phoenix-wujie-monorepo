class MoverComponent extends HTMLElement {
    private target: HTMLElement | null = null;
    private maskElement: HTMLElement | null = null;
    private isDragging: boolean = false;
    private indicator: HTMLElement;
    private mask: HTMLElement;
    private startMouseX: number = 0;  // 鼠标起始位置
    private startMouseY: number = 0;
    private startElementX: number = 0;  // 元素起始位置
    private startElementY: number = 0;
    private checkInterval: number | null = null;
    private lastMouseX: number = 0;  // 鼠标最后位置
    private lastMouseY: number = 0;
    private maskRect: DOMRect | null = null;

    constructor() {
        super();

        // 创建 Shadow DOM
        const shadow = this.attachShadow({ mode: 'open' });

        // 添加样式
        const style = document.createElement('link');
        style.setAttribute('rel', 'stylesheet');
        style.setAttribute('href', '../src/components/MoverComponent.css');
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

    // 当组件被添加到 DOM 时调用
    connectedCallback() {
        // 获取传入的属性
        const targetSelector = this.getAttribute('target');
        const maskSelector = this.getAttribute('mask');

        if (targetSelector) {
            this.target = document.querySelector(targetSelector);
            if (this.target) {
                this.target.addEventListener('mousedown', this.handleMouseDown);
            }
        } else {
            console.error('请提供 target 属性');
        }

        if (maskSelector) {
            this.maskElement = document.querySelector(maskSelector);
            if (this.maskElement) {
                this.maskRect = this.maskElement.getBoundingClientRect();
                
                // 更新遮罩尺寸和位置
                this.updateMaskPosition();
                
                // 添加日志
                console.log('遮罩区域尺寸:', {
                    width: this.maskElement.offsetWidth,
                    height: this.maskElement.offsetHeight,
                    boundingRect: this.maskElement.getBoundingClientRect()
                });
                
                console.log('遮罩元素尺寸:', {
                    width: this.mask.offsetWidth,
                    height: this.mask.offsetHeight,
                    boundingRect: this.mask.getBoundingClientRect(),
                    computedStyle: window.getComputedStyle(this.mask)
                });

                // 监听窗口大小变化
                window.addEventListener('resize', this.updateMaskPosition);
            }
        }

        // 绑定全局事件
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
    }

    // 更新遮罩位置和尺寸
    private updateMaskPosition = () => {
        if (this.maskElement) {
            const rect = this.maskElement.getBoundingClientRect();
            this.mask.style.top = `${rect.top}px`;
            this.mask.style.left = `${rect.left}px`;
            this.mask.style.width = `${rect.width}px`;
            this.mask.style.height = `${rect.height}px`;
            this.maskRect = rect;
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
        window.removeEventListener('resize', this.updateMaskPosition);
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
            this.updateMaskPosition();  // 更新遮罩位置
            this.mask.style.display = 'block';
            this.mask.classList.add('dragging');

            // 再次检查遮罩尺寸
            console.log('拖动时遮罩尺寸:', {
                width: this.mask.offsetWidth,
                height: this.mask.offsetHeight,
                display: this.mask.style.display,
                boundingRect: this.mask.getBoundingClientRect()
            });

            // 设置指示器的初始位置为目标元素的位置
            this.indicator.style.left = `${rect.left}px`;
            this.indicator.style.top = `${rect.top}px`;
            this.indicator.style.width = `${rect.width}px`;
            this.indicator.style.height = `${rect.height}px`;

            // 更新遮罩区域的位置信息
            if (this.maskElement) {
                this.maskRect = this.maskElement.getBoundingClientRect();
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
                this.handleMouseUp(null);
            }
        }, 100);
    }

    private handleMouseMove = (e: MouseEvent) => {
        if (!this.isDragging) return;

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

        this.isDragging = false;

        // 清除检查定时器
        if (this.checkInterval) {
            window.clearInterval(this.checkInterval);
            this.checkInterval = null;
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

            // 移除拖动状态 
            this.indicator.classList.remove('dragging');
            this.mask.classList.remove('dragging');
            
            // 隐藏遮罩
            this.mask.style.display = 'none';
        }
    };
}

// 注册自定义元素
customElements.define('mover-component', MoverComponent);
export class PhoenixButton extends HTMLElement {
  private button: HTMLButtonElement;
  private onClick?: () => void;
  private disabled: boolean = false;
  private type: 'primary' | 'secondary' | 'default' = 'default';

  // 提取常量
  private static readonly STYLES = `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      font-weight: 500;
      width: 100%;
      height: 40px;
      outline: none;
      white-space: nowrap;
    }

    button.primary {
      background-color: #4CAF50;
      color: white;
    }

    button.primary:hover {
      background-color: #45a049;
    }

    button.secondary {
      background-color: #2196F3;
      color: white;
    }

    button.secondary:hover {
      background-color: #1976D2;
    }

    button.default {
      background-color: #f5f5f5;
      color: #333;
      border: 1px solid #ddd;
    }

    button.default:hover {
      background-color: #e8e8e8;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      pointer-events: none;
    }
  `;

  constructor() {
    super();

    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' });

    // 创建样式
    const style = document.createElement('style');
    style.textContent = PhoenixButton.STYLES;
    shadow.appendChild(style);

    // 创建按钮
    this.button = document.createElement('button');
    this.button.addEventListener('click', (e) => {
      if (!this.disabled && this.onClick) {
        this.onClick();
      }
    });
    shadow.appendChild(this.button);
  }

  // 监听属性变化
  static get observedAttributes() {
    return ['disabled', 'type'];
  }

  // 当组件被添加到 DOM 时调用
  connectedCallback() {
    this.updateButton();
    this.updateContent();
  }

  // 当属性变化时调用
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return;

    if (name === 'disabled') {
      this.disabled = newValue !== null;
    } else if (name === 'type') {
      this.type = (newValue as 'primary' | 'secondary' | 'default') || 'default';
    }

    this.updateButton();
  }

  // 更新按钮状态
  private updateButton() {
    this.button.disabled = this.disabled;
    this.button.className = this.type;
  }

  // 更新按钮内容
  private updateContent() {
    this.button.textContent = this.textContent || '';
  }

  // 设置点击事件
  setOnClick(callback: () => void) {
    this.onClick = callback;
  }

  // 设置禁用状态
  setDisabled(disabled: boolean) {
    this.disabled = disabled;
    if (disabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.updateButton();
  }

  // 设置按钮类型
  setType(type: 'primary' | 'secondary' | 'default') {
    this.type = type;
    this.setAttribute('type', type);
    this.updateButton();
  }
}

// 注册自定义元素
customElements.define('phoenix-button', PhoenixButton); 
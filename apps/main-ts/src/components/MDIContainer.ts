import './MDIContainer.css';
import { WindowComponent } from './WindowComponent';
import { MoverComponent } from './MoverComponent';


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

export class MDIContainer extends HTMLElement {
  private windows: WindowComponent[] = [];
  private windowStates: Map<string, WindowState> = new Map();
  private lastOpenedWindows: WindowConfig[] = [];
  private maxZIndex: number = 0;
  private readonly Z_INDEX_THRESHOLD = 99999;
  private sharedMover: MoverComponent;
  private toolButtons: HTMLElement;
  private lastArrangement: 'cascade' | 'tile' | null = null;

  constructor() {
    super();
    
    // 创建共享的 mover-component
    this.sharedMover = new MoverComponent();
    this.appendChild(this.sharedMover);
    
    // 添加工具按钮容器
    this.toolButtons = document.createElement('div');
    this.toolButtons.className = 'mdi-tool-buttons';
    this.appendChild(this.toolButtons);

    // 添加排列按钮
    const cascadeButton = document.createElement('button');
    cascadeButton.textContent = '层叠排列';
    cascadeButton.className = 'mdi-tool-button';
    cascadeButton.onclick = () => this.arrangeWindowsCascade();
    this.toolButtons.appendChild(cascadeButton);

    const tileButton = document.createElement('button');
    tileButton.textContent = '并排排列';
    tileButton.className = 'mdi-tool-button';
    tileButton.onclick = () => this.arrangeWindowsTile();
    this.toolButtons.appendChild(tileButton);

    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (this.lastArrangement === 'tile') {
        this.arrangeWindowsTile();
      }
    });
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
    const window = this.windows.find(w => w.id === windowId);
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
    const sortedWindows = Array.from(this.windows)
      .sort((a, b) => {
        const aIndex = parseInt(a.style.zIndex) || 0;
        const bIndex = parseInt(b.style.zIndex) || 0;
        return aIndex - bIndex;
      });

    sortedWindows.forEach((window, index) => {
      window.style.zIndex = (index + 1).toString();
    });

    this.maxZIndex = sortedWindows.length;
  }

  // 添加新窗口
  addWindow(config: WindowConfig) {
    console.log('addWindow', config);
    // 检查是否已存在相同URL的窗口
    const existingWindow = this.windows.find(w => w.getAttribute('data-url') === config.url);
    
    if (existingWindow) {
      console.log('existingWindow', existingWindow);
      // 如果存在，激活该窗口
      this.activateWindow(existingWindow.id);
      return existingWindow.id;
    }

    // 计算错开的位置
    const windowCount = this.windows.length;
    const offset = 30; // 每个窗口错开的距离
    const position = config.position || {
      x: offset * (windowCount % 10), // 最多错开10个位置，然后重新开始
      y: offset * (windowCount % 10)
    };

    // 设置默认大小
    const size = config.size || {
      width: 800,
      height: 600
    };

    // 创建新窗口
    const windowElement = new WindowComponent();
    windowElement.setAttribute('id', config.id);
    windowElement.setAttribute('title', config.title);
    windowElement.setAttribute('url', config.url);
    windowElement.setAttribute('data-url', config.url);
    windowElement.setAttribute('position', JSON.stringify(position));
    windowElement.setAttribute('size', JSON.stringify(size));
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
    windowElement.addEventListener('movestart', (e: Event) => {
      const customEvent = e as CustomEvent;
      // 设置当前目标并初始化移动
      this.sharedMover.setAttribute('target', `#${config.id}`);
      // 将 sharedMover 的 mask 设置为 Shadow DOM 的根元素
      this.sharedMover.setAttribute('mask', ':host');
      (this.sharedMover as any).initializeMove(customEvent.detail.mouseEvent);
    });

    // 修改添加到容器的方式
    this.appendChild(windowElement);
    this.windows.push(windowElement);
    
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
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      // 保存窗口状态
      this.saveWindowState(windowId);
      
      // 从lastOpenedWindows中移除
      const url = window.getAttribute('data-url');
      if (url) {
        this.lastOpenedWindows = this.lastOpenedWindows.filter(w => w.url !== url);
        this.saveLastOpenedWindows();
      }
      
      // 如果当前正在移动这个窗口，停止移动
      if (this.sharedMover.getAttribute('target') === `#${windowId}`) {
        this.sharedMover.removeAttribute('target');
        (this.sharedMover as any).stopMove();
      }
      
      // 修改移除窗口的方式
      window.remove();
      this.windows = this.windows.filter(w => w.id !== windowId);
      this.windowStates.delete(windowId);
    }
  }

  // 保存窗口状态
  private saveWindowState(windowId: string) {
    const window = this.windows.find(w => w.id === windowId);
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
    this.windows = [];
    this.windowStates.clear();
    this.maxZIndex = 0;
    this.lastOpenedWindows = [];
  }

  // 层叠排列窗口
  private arrangeWindowsCascade() {
    const offset = 30; // 每个窗口的偏移量
    const startX = 50;
    const startY = 50;
    
    this.windows.forEach((window, index) => {
      const x = startX + (index * offset);
      const y = startY + (index * offset);
      
      window.setPosition(x, y);
      window.setZIndex(1000 + index);
      
      // 如果窗口被最小化，恢复它
      if ((window as any).isMinimized) {
        window.minimize();
      }
      // 如果窗口被最大化，恢复它
      if ((window as any).isMaximized) {
        window.maximize();
      }
    });
    
    this.lastArrangement = 'cascade';
  }

  // 并排排列窗口
  private arrangeWindowsTile() {
    const windows = this.windows.filter(w => !(w as any).isMinimized);
    if (windows.length === 0) return;

    const containerWidth = this.clientWidth;
    const containerHeight = this.clientHeight;
    
    // 计算最佳的行数和列数
    const count = windows.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    // 计算每个窗口的大小
    const width = Math.floor(containerWidth / cols);
    const height = Math.floor(containerHeight / rows);
    
    windows.forEach((window, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      const x = col * width;
      const y = row * height;
      
      // 如果窗口被最大化，恢复它
      if ((window as any).isMaximized) {
        window.maximize();
      }
      
      window.setPosition(x, y);
      window.setSize(width, height);
      window.setZIndex(1000);
    });
    
    this.lastArrangement = 'tile';
  }
}

// 注册自定义元素
customElements.define('mdi-container', MDIContainer); 
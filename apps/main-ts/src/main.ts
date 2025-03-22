import './style.css';
import { MDIContainer } from './components/MDIContainer';
import './components/WindowComponent';  // 确保 WindowComponent 被注册
import './components/PhoenixResizerCmp';  // 直接导入组件文件，确保组件被注册

// 定义 PhoenixResizerCmp 的类型
declare global {
  interface HTMLElementTagNameMap {
    'phoenix-resizer': any;  // 暂时使用 any 类型，因为组件已经在文件中注册
  }
}

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <div class="toolbar">
      <div class="toolbar-inner">
        <div class="toolbar-header">
          <h2>工具栏</h2>
          <button id="toggleToolbar" class="toggle-button">
            <span class="toggle-icon">◀</span>
          </button>
        </div>
        <div class="tool-buttons">
          <button id="addWindow" class="tool-button">添加窗口</button>
          <button id="clearWindows" class="tool-button">清除所有</button>
          <button id="restoreWindows" class="tool-button">恢复窗口</button>
        </div>
      </div>
    </div>
    <phoenix-resizer target=".toolbar"></phoenix-resizer>
    <div class="windows-container" id="windowsContainer">
      <!-- 子窗口将在这里动态添加 -->
    </div>
  </div>
`

// 工具栏宽度管理
const MIN_WIDTH = 50;
const COLLAPSED_MIN_WIDTH = 75;  // 收缩状态的最小宽度
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 200;

// 获取 Resizer 实例
const toolbarResizer = document.querySelector('phoenix-resizer') as any;
if (toolbarResizer) {
  toolbarResizer.setMinWidth(MIN_WIDTH);
  toolbarResizer.setMaxWidth(MAX_WIDTH);
  toolbarResizer.setWidth(DEFAULT_WIDTH);
  toolbarResizer.setOnResize((width: number) => {
    const toolbar = document.querySelector('.toolbar') as HTMLElement;
    if (toolbar) {
      // 如果宽度大于最小宽度，自动切换到展开状态
      if (width > MIN_WIDTH && toolbar.classList.contains('collapsed')) {
        toolbar.classList.remove('collapsed');
      }
      // 如果宽度小于等于最小宽度，自动切换到收缩状态
      else if (width <= MIN_WIDTH && !toolbar.classList.contains('collapsed')) {
        toolbar.classList.add('collapsed');
      }
    }
  });
}

// 添加工具栏展开/缩小功能
const toggleToolbar = () => {
  const toolbar = document.querySelector('.toolbar') as HTMLElement;
  const toggleIcon = document.querySelector('.toggle-icon');
  if (toolbar && toggleIcon) {
    const isCollapsed = toolbar.classList.toggle('collapsed');
    // 根据状态设置宽度和最小宽度
    const width = isCollapsed ? MIN_WIDTH : DEFAULT_WIDTH;
    toolbarResizer.setMinWidth(isCollapsed ? COLLAPSED_MIN_WIDTH : MIN_WIDTH);
    toolbarResizer.setWidth(width);
    
    // 等待下一帧再更新指示线位置，确保宽度已经应用
    requestAnimationFrame(() => {
      const toolbarRect = toolbar.getBoundingClientRect();
      toolbarResizer.updateIndicatorPosition(toolbarRect.right);
    });
  }
};

// 创建MDI容器实例
const mdiContainer = new MDIContainer();
document.getElementById('windowsContainer')?.appendChild(mdiContainer);

// 添加窗口功能
const addWindow = () => {
  const lastOpenedWindows = mdiContainer.getLastOpenedWindows();
  const windowCount = document.querySelectorAll('window-component').length;
  const offset = 30; // 每个窗口错开的距离
  
  // 计算新窗口的位置
  const position = {
    x: offset * (windowCount % 10), // 最多错开10个位置，然后重新开始
    y: offset * (windowCount % 10)
  };

  // 设置默认大小
  const size = {
    width: 800,
    height: 600
  };
  
  if (lastOpenedWindows.length === 0) {
    // 如果没有打开的窗口，打开默认窗口
    mdiContainer.addWindow({
      id: `window-${Date.now()}`,
      title: '默认窗口',
      url: 'http://localhost:8311', // 这里替换为实际的子应用URL
      position,
      size
    });
  } else {
    // 如果已有窗口，创建一个示例窗口
    const demoWindowId = `demo-${Date.now()}`;
    const demoContent = `
      <div style="padding: 20px; text-align: center;">
        <h2>示例窗口 ${windowCount + 1}</h2>
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
    
    mdiContainer.addWindow({
      id: demoWindowId,
      title: `示例窗口 ${windowCount + 1}`,
      url,
      position,
      size
    });
  }
};

// 清除所有窗口功能
const clearWindows = () => {
  mdiContainer.clearWindows();
};

// 恢复窗口功能
const restoreWindows = () => {
  // 检查是否有上次打开的窗口
  const lastOpenedWindows = mdiContainer.getLastOpenedWindows();
  if (lastOpenedWindows.length > 0) {
    if (confirm('是否恢复上次打开的窗口？')) {
      lastOpenedWindows.forEach(config => {
        mdiContainer.addWindow(config);
      });
    }
  }
};

// 添加事件监听器
document.getElementById('addWindow')?.addEventListener('click', addWindow);
document.getElementById('clearWindows')?.addEventListener('click', clearWindows);
document.getElementById('restoreWindows')?.addEventListener('click', restoreWindows);
document.getElementById('toggleToolbar')?.addEventListener('click', toggleToolbar);

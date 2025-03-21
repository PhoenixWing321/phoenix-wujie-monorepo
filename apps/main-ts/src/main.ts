import './style.css';
import { MDIContainer } from './components/MDIContainer';
import { Resizer } from './components/Resizer';

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
        </div>
      </div>
    </div>
    <div class="resizer"></div>
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

// 创建Resizer实例
const toolbarResizer = new Resizer('.resizer', '.toolbar', {
  minWidth: MIN_WIDTH,
  maxWidth: MAX_WIDTH,
  defaultWidth: DEFAULT_WIDTH,
  onResize: (width: number) => {
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
  }
});

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
const mdiContainer = new MDIContainer('windowsContainer');

// 添加窗口功能
const addWindow = () => {
  const lastOpenedWindows = mdiContainer.getLastOpenedWindows();
  
  if (lastOpenedWindows.length === 0) {
    // 如果没有打开的窗口，打开默认窗口
    mdiContainer.addWindow({
      id: `window-${Date.now()}`,
      title: '默认窗口',
      url: 'http://localhost:8311' // 这里替换为实际的子应用URL
    });
  } else {
    // 如果已有窗口，创建一个示例窗口
    mdiContainer.addDemoWindow();
  }
};

// 清除所有窗口功能
const clearWindows = () => {
  mdiContainer.clearWindows();
};

// 检查是否有上次打开的窗口
const lastOpenedWindows = mdiContainer.getLastOpenedWindows();
if (lastOpenedWindows.length > 0) {
  if (confirm('是否恢复上次打开的窗口？')) {
    lastOpenedWindows.forEach(config => {
      mdiContainer.addWindow(config);
    });
  }
}

// 添加事件监听器
document.getElementById('addWindow')?.addEventListener('click', addWindow);
document.getElementById('clearWindows')?.addEventListener('click', clearWindows);
document.getElementById('toggleToolbar')?.addEventListener('click', toggleToolbar);

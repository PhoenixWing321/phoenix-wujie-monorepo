import './style.css'

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
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 200;

function setToolbarWidth(width: number, toolbar: HTMLElement) {
  // 确保宽度在有效范围内
  const validWidth = Math.min(Math.max(width, MIN_WIDTH), MAX_WIDTH);
  toolbar.style.width = `${validWidth}px`;
  return validWidth;
}

// 添加分隔条拖动功能
const resizer = document.querySelector('.resizer') as HTMLElement;
const toolbar = document.querySelector('.toolbar') as HTMLElement;
let isResizing = false;
let startX: number;
let startWidth: number;
let tempWidth: number;

if (resizer && toolbar) {
  resizer.addEventListener('mousedown', (e: MouseEvent) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = toolbar.clientWidth;
    tempWidth = startWidth;
    
    // 添加拖动状态
    resizer.classList.add('dragging');
    
    // 添加临时事件监听器
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  });
}

function handleMouseMove(e: MouseEvent) {
  if (!isResizing || !resizer) return;
  
  const width = startWidth + (e.clientX - startX);
  // 设置最小和最大宽度
  if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
    tempWidth = width;
    // 更新指示线位置
    resizer.style.setProperty('--indicator-left', `${width}px`);
  }
}

function handleMouseUp() {
  if (!isResizing || !toolbar || !resizer) return;
  
  // 移除拖动状态
  resizer.classList.remove('dragging');
  
  // 更新实际宽度
  setToolbarWidth(tempWidth, toolbar);
  
  isResizing = false;
  // 移除临时事件监听器
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

// 添加工具栏展开/缩小功能
const toggleToolbar = () => {
  const toolbar = document.querySelector('.toolbar') as HTMLElement;
  const toggleIcon = document.querySelector('.toggle-icon');
  if (toolbar && toggleIcon) {
    const isCollapsed = toolbar.classList.toggle('collapsed');
    toggleIcon.textContent = isCollapsed ? '▶' : '◀';
    // 根据状态设置宽度
    setToolbarWidth(isCollapsed ? MIN_WIDTH : DEFAULT_WIDTH, toolbar);
  }
};

// 添加窗口功能
let windowCount = 0;
const addWindow = () => {
  const container = document.getElementById('windowsContainer');
  if (!container) return;

  const window = document.createElement('div');
  window.className = 'window';
  window.style.left = `${20 + windowCount * 20}px`;
  window.style.top = `${20 + windowCount * 20}px`;
  window.innerHTML = `
    <div class="window-header">
      <span>窗口 ${windowCount + 1}</span>
      <button class="close-button">×</button>
    </div>
    <div class="window-content">
      这是窗口 ${windowCount + 1} 的内容
    </div>
  `;

  // 添加拖拽功能
  let isDragging = false;
  let currentX: number;
  let currentY: number;
  let initialX: number;
  let initialY: number;

  const header = window.querySelector('.window-header');
  if (header) {
    header.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true;
      initialX = e.clientX - window.offsetLeft;
      initialY = e.clientY - window.offsetTop;
      
      // 添加临时事件监听器
      document.addEventListener('mousemove', handleWindowMouseMove);
      document.addEventListener('mouseup', handleWindowMouseUp);
    });
  }

  function handleWindowMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    
    window.style.left = `${currentX}px`;
    window.style.top = `${currentY}px`;
  }

  function handleWindowMouseUp() {
    isDragging = false;
    // 移除临时事件监听器
    document.removeEventListener('mousemove', handleWindowMouseMove);
    document.removeEventListener('mouseup', handleWindowMouseUp);
  }

  // 添加关闭按钮功能
  const closeButton = window.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      window.remove();
    });
  }

  container.appendChild(window);
  windowCount++;
};

// 清除所有窗口功能
const clearWindows = () => {
  const container = document.getElementById('windowsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  windowCount = 0;
};

// 添加事件监听器
document.getElementById('addWindow')?.addEventListener('click', addWindow);
document.getElementById('clearWindows')?.addEventListener('click', clearWindows);
document.getElementById('toggleToolbar')?.addEventListener('click', toggleToolbar);

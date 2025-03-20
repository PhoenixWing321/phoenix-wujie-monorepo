import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <div class="toolbar">
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
    <div class="windows-container" id="windowsContainer">
      <!-- 子窗口将在这里动态添加 -->
    </div>
  </div>
`

// 添加工具栏展开/缩小功能
const toggleToolbar = () => {
  const toolbar = document.querySelector('.toolbar');
  const toggleIcon = document.querySelector('.toggle-icon');
  if (toolbar && toggleIcon) {
    toolbar.classList.toggle('collapsed');
    toggleIcon.textContent = toolbar.classList.contains('collapsed') ? '▶' : '◀';
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
    });
  }

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    currentX = e.clientX - initialX;
    currentY = e.clientY - initialY;
    
    window.style.left = `${currentX}px`;
    window.style.top = `${currentY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

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

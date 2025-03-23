import { PhoenixMoverCmp } from '@phoenix-ui/cmp/PhoenixMoverCmp';

// 获取覆盖元素
const overlay = document.getElementById('window-container');

// 创建共享的 phoenix-mover
const sharedMover: PhoenixMoverCmp = new PhoenixMoverCmp(overlay);
document.body.appendChild(sharedMover);

let zMax = 1;  // 添加全局z-index计数器

// 创建移动控制器函数
function appendMoveController(element: HTMLElement): void {
  // 确保元素有初始z-index
  if (!element.style.zIndex) {
    zMax++;
    element.style.zIndex = zMax.toString();
  }
  
  element.addEventListener('mousedown', function(e: MouseEvent) { 
    // 如果z-index小于zMax,则更新z-index
    if(parseInt(element.style.zIndex) < zMax) {
      zMax++;
      element.style.zIndex = zMax.toString();
    }
    
    // 设置当前目标
    sharedMover.setTarget(element);
    // 调用初始化方法并传入原始事件
    sharedMover.initializeMove(e);
  });
}

let elementCount = 0;
function addNewElement(): void {
  const element = document.createElement('div');
  elementCount++;
  
  element.className = 'movable-element';
  element.textContent = `元素 ${elementCount}`;

  // 计算错开的位置
  const offset = 20;  // 每个元素错开的距离
  const baseLeft = 20;  // 基础左边距
  const baseTop = 20;   // 基础上边距
  const maxPerRow = 5;  // 每行最多放置的元素数量

  // 计算当前元素应该在第几行第几列
  const row = Math.floor((elementCount - 1) / maxPerRow);
  const col = (elementCount - 1) % maxPerRow;

  element.style.left = `${baseLeft + col * (offset + 100)}px`;  // 100是元素宽度
  element.style.top = `${baseTop + row * (offset + 100)}px`;    // 100是元素高度
  element.id = `movable-${Date.now()}`; 

  // 为新元素添加移动控制
  appendMoveController(element);
  
  // 添加元素到overlay
  overlay?.appendChild(element);
}

// 使用addEventListener绑定事件
document.getElementById('addElementBtn')?.addEventListener('click', addNewElement);

// 在mouseup时清除target
document.addEventListener('mouseup', () => {
  sharedMover.removeAttribute('target');
  sharedMover.stopMove();
}); 
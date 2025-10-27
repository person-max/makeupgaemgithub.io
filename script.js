// Welcome popup functionality
let messageToggle = true; // Start with nice message

function showWelcome() {
  const welcomeMessage = messageToggle
    ? "Oh, welcome in! We can't wait to help you find a look you love."
    : "Welcome to Makeup Store! Let's create something beautiful.";

  // Toggle for next time
  messageToggle = !messageToggle;

  document.getElementById('welcomeMessage').textContent = welcomeMessage;
  document.getElementById('welcomePopup').style.display = 'flex';
}

function closeWelcome() {
  document.getElementById('welcomePopup').style.display = 'none';
}

// Photo Upload
const photoInput = document.getElementById('photoInput');
const modelEl = document.getElementById('model');

photoInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    modelEl.style.backgroundImage = `url('${reader.result}')`;
    modelEl.classList.add('has-photo');
  };
  reader.readAsDataURL(file);
});

// Gallery Photo Upload
const galleryInput = document.getElementById('galleryInput');
const galleryPreview = document.getElementById('galleryPreview');
const galleryImage = document.getElementById('galleryImage');

galleryInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please choose an image.');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    galleryImage.src = reader.result;
    galleryPreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
});

// Image zoom modal functions
function openImageModal() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  modalImage.src = galleryImage.src;
  modal.style.display = 'flex';
}

function closeImageModal() {
  document.getElementById('imageModal').style.display = 'none';
}

// Zoom and pan controls
const zoomWrapper = document.getElementById('zoomWrapper');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const resetBtn = document.getElementById('resetBtn');
const zoomLevel = document.getElementById('zoomLevel');
const zoomInput = document.getElementById('zoomInput');
const applyBtn = document.getElementById('applyBtn');
const zoomStep = document.getElementById('zoomStep');
const zoomStepVal = document.getElementById('zoomStepVal');

let currentZoom = 1;
let panX = 0, panY = 0;
let zoomStepPercent = 25;

function updateZoom() {
  zoomWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${currentZoom})`;
  const zoomPercent = Math.round(currentZoom * 100);
  zoomLevel.textContent = zoomPercent + '%';
}

function setZoom(newZoom) {
  currentZoom = Math.max(0.5, Math.min(10, newZoom));
  if (currentZoom === 1) {
    panX = 0;
    panY = 0;
  }
  updateZoom();
}

function resetView() {
  currentZoom = 1;
  panX = 0;
  panY = 0;
  zoomInput.value = 100;
  updateZoom();
}

function zoomIn() {
  const factor = 1 + (zoomStepPercent / 100);
  setZoom(currentZoom * factor);
}

function zoomOut() {
  const factor = 1 + (zoomStepPercent / 100);
  setZoom(currentZoom / factor);
}

function applyTypedZoom() {
  const inputValue = parseInt(zoomInput.value);
  if (isNaN(inputValue) || inputValue < 50 || inputValue > 1000) {
    alert('Please enter a number between 50 and 1000');
    return;
  }
  setZoom(inputValue / 100);
}

// Event listeners for zoom controls
zoomInBtn.addEventListener('click', zoomIn);
zoomOutBtn.addEventListener('click', zoomOut);
resetBtn.addEventListener('click', resetView);
applyBtn.addEventListener('click', applyTypedZoom);

zoomInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    applyTypedZoom();
  }
});

zoomStep.addEventListener('input', () => {
  zoomStepPercent = parseInt(zoomStep.value);
  zoomStepVal.textContent = zoomStepPercent + '%';
});

// Arrow key navigation for panning when zoomed
window.addEventListener('keydown', (e) => {
  if (currentZoom <= 1) return;

  const panStep = 20;

  switch(e.key) {
    case 'ArrowUp':
      panY += panStep;
      e.preventDefault();
      break;
    case 'ArrowDown':
      panY -= panStep;
      e.preventDefault();
      break;
    case 'ArrowLeft':
      panX += panStep;
      e.preventDefault();
      break;
    case 'ArrowRight':
      panX -= panStep;
      e.preventDefault();
      break;
  }
  updateZoom();
});

// Drawing Tool
const canvas = document.getElementById('paintLayer');
const ctx = canvas.getContext('2d');
const container = document.getElementById('modelContainer');

let drawing = false;
let erasing = false;
let brushSize = 8;
let brushColor = '#FF0000';
let brushType = 'round';
let lastX = 0, lastY = 0;

function fitCanvasToCSSSize() {
  const dpr = window.devicePixelRatio || 1;

  const prev = document.createElement('canvas');
  prev.width = canvas.width;
  prev.height = canvas.height;
  prev.getContext('2d').drawImage(canvas, 0, 0);

  canvas.width = Math.max(1, Math.floor(250 * dpr));
  canvas.height = Math.max(1, Math.floor(300 * dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (prev.width && prev.height) {
    ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, 250, 300);
  }
}

new ResizeObserver(fitCanvasToCSSSize).observe(canvas);
window.addEventListener('load', () => {
  fitCanvasToCSSSize();
  showWelcome();
  updateZoom();
});

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const pt = (e.touches && e.touches[0]) || e;
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.width / dpr;
  const cssH = canvas.height / dpr;

  return {
    x: (pt.clientX - rect.left) * (cssW / rect.width),
    y: (pt.clientY - rect.top) * (cssH / rect.height)
  };
}

function startDraw(e) {
  if (!container.classList.contains('draw-enabled')) return;
  if (e.pointerId != null && canvas.setPointerCapture) {
    canvas.setPointerCapture(e.pointerId);
  }
  drawing = true;
  const {x,y} = getPos(e);
  lastX = x; lastY = y;

  // For non-round brushes, draw immediately at start position
  if (brushType !== 'round') {
    ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';
    drawBrushShape(x, y);
  }

  e.preventDefault();
}

function moveDraw(e) {
  if (!drawing) return;
  const {x,y} = getPos(e);

  ctx.globalCompositeOperation = erasing ? 'destination-out' : 'source-over';

  if (brushType === 'round') {
    // Original round brush
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else {
    // For other brush types, draw at current position
    drawBrushShape(x, y);
  }

  lastX = x; lastY = y;
  e.preventDefault();
}

function drawBrushShape(x, y) {
  ctx.fillStyle = brushColor;
  const size = brushSize;

  switch(brushType) {
    case 'square':
      ctx.fillRect(x - size/2, y - size/2, size, size);
      break;

    case 'star':
      drawStar(x, y, size);
      break;

    case 'heart':
      drawHeart(x, y, size);
      break;
  }
}

function drawStar(x, y, size) {
  const spikes = 5;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * 0.4;

  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / spikes;
    const px = x + Math.cos(angle - Math.PI/2) * radius;
    const py = y + Math.sin(angle - Math.PI/2) * radius;

    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeart(x, y, size) {
  const width = size;
  const height = size;

  ctx.beginPath();
  const topCurveHeight = height * 0.3;

  // Left curve
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(
    x, y,
    x - width / 2, y,
    x - width / 2, y + topCurveHeight
  );

  // Bottom point
  ctx.bezierCurveTo(
    x - width / 2, y + (height + topCurveHeight) / 2,
    x, y + (height + topCurveHeight) / 2,
    x, y + height
  );

  // Right curve
  ctx.bezierCurveTo(
    x, y + (height + topCurveHeight) / 2,
    x + width / 2, y + (height + topCurveHeight) / 2,
    x + width / 2, y + topCurveHeight
  );

  ctx.bezierCurveTo(
    x + width / 2, y,
    x, y,
    x, y + topCurveHeight
  );

  ctx.closePath();
  ctx.fill();
}

function endDraw() {
  drawing = false;
  ctx.beginPath();
}

canvas.addEventListener('pointerdown', startDraw);
canvas.addEventListener('pointermove', moveDraw);
window.addEventListener('pointerup', endDraw);
window.addEventListener('pointercancel', endDraw);
window.addEventListener('pointerleave', endDraw);

// Color picker
document.querySelectorAll('.color-option').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    brushColor = opt.dataset.color;
    if (erasing) toggleEraser(false);
  });
});

const firstSwatch = document.querySelector('.color-option');
if (firstSwatch) {
  firstSwatch.classList.add('selected');
  brushColor = firstSwatch.dataset.color;
}

// Brush type selection
document.querySelectorAll('.brush-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.brush-type-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    brushType = btn.dataset.brush;
    if (erasing) toggleEraser(false);
  });
});

// Brush size
const sizeInput = document.getElementById('brushSize');
const sizeVal = document.getElementById('brushSizeVal');
sizeInput.addEventListener('input', () => {
  brushSize = +sizeInput.value;
  sizeVal.textContent = brushSize;
});

// Draw toggle
const toggleBtn = document.getElementById('toggleDraw');
toggleBtn.addEventListener('click', () => {
  const on = container.classList.toggle('draw-enabled');
  toggleBtn.textContent = on ? 'Draw: ON' : 'Draw: OFF';
});

// Eraser
const eraserBtn = document.getElementById('eraserBtn');
function toggleEraser(force) {
  erasing = typeof force === 'boolean' ? force : !erasing;
  eraserBtn.textContent = erasing ? 'Eraser: ON' : 'Eraser: OFF';
}
eraserBtn.addEventListener('click', () => toggleEraser());

// Clear drawing
document.getElementById('clearBtn').addEventListener('click', () => {
  const t = ctx.getTransform();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(t.a, t.b, t.c, t.d, t.e, t.f);
});

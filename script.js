/* =============================================
   BOSKES — Windows 2000 Style JavaScript
   Draggable windows, start menu, clock, etc.
   ============================================= */

// ── CLOCK ─────────────────────────────────────
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const el = document.getElementById('taskbarClock');
    if (el) el.textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 10000);

// ── WINDOW MANAGEMENT ─────────────────────────
let zTop = 100;

function bringToFront(id) {
    const win = document.getElementById(id);
    if (win) {
        zTop++;
        win.style.zIndex = zTop;
    }
}

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.style.display = 'flex';
    bringToFront(id);
    closeStartMenu();
}

function closeWindow(id) {
    const win = document.getElementById(id);
    if (win) win.style.display = 'none';
}

function minimizeWindow(id) {
    const win = document.getElementById(id);
    if (win) win.style.display = 'none';
}

function maximizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    const isMax = win.dataset.maximized === '1';
    if (isMax) {
        // Restore
        win.style.top    = win.dataset.prevTop;
        win.style.left   = win.dataset.prevLeft;
        win.style.width  = win.dataset.prevWidth;
        win.style.height = win.dataset.prevHeight || '';
        win.dataset.maximized = '0';
    } else {
        // Maximize
        win.dataset.prevTop    = win.style.top;
        win.dataset.prevLeft   = win.style.left;
        win.dataset.prevWidth  = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.style.top    = '0';
        win.style.left   = '0';
        win.style.width  = '100vw';
        win.style.height = 'calc(100vh - 36px)';
        win.dataset.maximized = '1';
    }
    bringToFront(id);
}

// ── WINDOW DRAGGING ────────────────────────────
let dragging = null;
let dragOffX = 0, dragOffY = 0;

function startDrag(e, id) {
    if (e.target.classList.contains('win-btn')) return;
    dragging = id;
    const win = document.getElementById(id);
    if (!win) return;
    const rect = win.getBoundingClientRect();
    dragOffX = e.clientX - rect.left;
    dragOffY = e.clientY - rect.top;
    bringToFront(id);
    e.preventDefault();
}

document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const win = document.getElementById(dragging);
    if (!win) return;
    let x = e.clientX - dragOffX;
    let y = e.clientY - dragOffY;
    // Clamp within viewport
    x = Math.max(0, Math.min(x, window.innerWidth  - win.offsetWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - win.offsetHeight - 36));
    win.style.left = x + 'px';
    win.style.top  = y + 'px';
});

document.addEventListener('mouseup', () => { dragging = null; });

// ── START MENU ─────────────────────────────────
const startBtn  = document.getElementById('startBtn');
const startMenu = document.getElementById('startMenu');

function closeStartMenu() {
    startMenu.classList.remove('open');
}

if (startBtn && startMenu) {
    startBtn.addEventListener('click', (e) => {
        startMenu.classList.toggle('open');
        e.stopPropagation();
    });
}

document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startBtn.contains(e.target)) {
        closeStartMenu();
    }
});

// Smooth nav links from start menu
document.querySelectorAll('.start-menu-list a').forEach(link => {
    link.addEventListener('click', (e) => {
        closeStartMenu();
        const href = link.getAttribute('href');
        const map = {
            '#nosotros':  'aboutWindow',
            '#servicios': 'servicesWindow',
            '#proyectos': 'portfolioWindow',
            '#contacto':  'contactWindow',
        };
        if (map[href]) openWindow(map[href]);
    });
});

// ── SERVICE TABLE ROW SELECTION ───────────────
function selectRow(row) {
    document.querySelectorAll('.service-tr').forEach(r => r.classList.remove('selected'));
    row.classList.add('selected');
}

// ── BRING WINDOW TO FRONT ON CLICK ────────────
document.querySelectorAll('.win2k-window').forEach(win => {
    win.addEventListener('mousedown', () => bringToFront(win.id));
});

// ── SHOW STATEMENT DIALOG AFTER A BIT ─────────
setTimeout(() => {
    openWindow('statementDialog');
}, 1800);

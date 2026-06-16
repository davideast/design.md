// The viewer's entire client-side surface: the compare tray.
// Pins live in localStorage as "run/case/cell/index" slices (URL-encoded),
// so compare works across pages and across runs.
const KEY = "mg-compare";

function getPins() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

function setPins(pins) {
  localStorage.setItem(KEY, JSON.stringify(pins));
  renderTray();
}

window.mgPin = (item) => {
  const pins = getPins();
  if (!pins.includes(item)) pins.push(item);
  while (pins.length > 3) pins.shift();
  setPins(pins);
};

window.mgClear = () => setPins([]);

function renderTray() {
  const tray = document.getElementById("tray");
  if (!tray) return;
  const pins = getPins();
  if (pins.length === 0) {
    tray.style.display = "none";
    return;
  }
  tray.style.display = "flex";
  const labels = pins.map((p) => decodeURIComponent(p).split("/").slice(1).join("/")).join("  +  ");
  tray.innerHTML = "";
  const span = document.createElement("span");
  span.textContent = `pinned: ${labels}`;
  const open = document.createElement("a");
  open.href = `/compare?items=${pins.join(",")}`;
  open.textContent = `open compare (${pins.length})`;
  const clear = document.createElement("button");
  clear.textContent = "clear";
  clear.onclick = window.mgClear;
  tray.append(span, open, clear);
}

renderTray();

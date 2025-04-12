let table;
let etapas = ["Erosion", "Cooling", "Eruption", "Rising", "Formation"];
let lineCounts = [50, 60, 30, 80, 100];
let bloqueAlturas = [0, 0, 0, 0, 0];
let temperaturas = [];
let posicionesX = [], posicionesY = [], rotaciones = [], tamanios = [], grosorLinea = [];

let selectedEtapa = 0;
let zoomEnabled = true;
let dragEnabled = true;
let dragging = false;
let zoom = 1;
let offsetX = 0, offsetY = 0, lastMouseX = 0, lastMouseY = 0;

let sliders = {};
let svgExporting = false;

function preload() {
  table = loadTable("data/escalas_magma_matter.csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight, SVG);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < etapas.length; i++) {
    posicionesX[i] = 100;
    posicionesY[i] = 0;
    rotaciones[i] = 0;
    tamanios[i] = 24;
    grosorLinea[i] = 0.5;
  }
  calcularBloqueAlturas();
  setupUI();
  noLoop();
}

function draw() {
  if (!svgExporting) {
    resizeCanvas(windowWidth, windowHeight);
    clear();
    if (dragEnabled && dragging) {
      offsetX += mouseX - lastMouseX;
      offsetY += mouseY - lastMouseY;
    }
    translate(offsetX, offsetY);
    scale(zoom);
  }

  background(255);
  drawEscalaTemperatura();
  let yOffset = 50;
  for (let i = 0; i < etapas.length; i++) {
    push();
    translate(posicionesX[i], yOffset + posicionesY[i]);
    rotate(radians(rotaciones[i]));
    fill(0);
    noStroke();
    textSize(tamanios[i]);
    text(etapas[i], 200, bloqueAlturas[i] / 2);
    stroke(0);
    strokeWeight(grosorLinea[i]);
    drawEtapa(i, bloqueAlturas[i]);
    pop();
    yOffset += bloqueAlturas[i] + 40;
  }

  if (!svgExporting) dragging = false;
}

function drawEtapa(idx, h) {
  let n = lineCounts[idx];
  let yStep = h / n;
  for (let i = 0; i < n; i++) {
    let y = i * yStep;
    let noiseVal = noise(i * 0.1, idx);
    let x1 = 0;
    let x2 = 300 + noiseVal * 50 * (idx == 0 ? 0.5 : idx == 1 ? 1.5 : 0.2);
    line(x1, y, x2, y);
  }
}

function drawEscalaTemperatura() {
  let ticks = [0, 5, 15, 40, 1200, 1600];
  for (let t of ticks) {
    let x = map(t, 0, 1600, 50, width - 50);
    stroke(0);
    strokeWeight(t === 40 ? 1.5 : 0.5);
    drawingContext.setLineDash(t === 40 ? [10, 10] : [5, 5]);
    line(x, 0, x, height);
    drawingContext.setLineDash([]);
    noStroke();
    fill(0);
    textSize(12);
    text(`${t}°C`, x, 20);
    text(`${t}°C`, x, height - 20);
  }
}

function setupUI() {
  let container = select("#ui-container");
  container.html("<h2>Etapas</h2>");

  etapas.forEach((etapa, idx) => {
    let btn = createButton(etapa);
    btn.parent(container);
    btn.mousePressed(() => {
      selectedEtapa = idx;
      updateSliders();
    });
  });

  createP("MOVE X").parent(container);
  sliders.x = createSlider(-200, 200, 0).parent(container).input(() => {
    posicionesX[selectedEtapa] = sliders.x.value();
    redraw();
  });

  createP("MOVE Y").parent(container);
  sliders.y = createSlider(-200, 200, 0).parent(container).input(() => {
    posicionesY[selectedEtapa] = sliders.y.value();
    redraw();
  });

  createP("ROTATION").parent(container);
  sliders.r = createSlider(-180, 180, 0).parent(container).input(() => {
    rotaciones[selectedEtapa] = sliders.r.value();
    redraw();
  });

  createP("SIZE").parent(container);
  sliders.s = createInput(tamanios[selectedEtapa]).parent(container).input(() => {
    tamanios[selectedEtapa] = parseInt(sliders.s.value()) || 24;
    redraw();
  });

  createP("THICKNESS").parent(container);
  sliders.t = createInput(grosorLinea[selectedEtapa]).parent(container).input(() => {
    grosorLinea[selectedEtapa] = parseFloat(sliders.t.value()) || 0.5;
    redraw();
  });

  let zoomToggle = createCheckbox("ZOOM", zoomEnabled).parent(container);
  zoomToggle.changed(() => {
    zoomEnabled = zoomToggle.checked();
  });

  let dragToggle = createCheckbox("DRAG", dragEnabled).parent(container);
  dragToggle.changed(() => {
    dragEnabled = dragToggle.checked();
  });

  createButton("EXPORTAR SVG").parent(container).mousePressed(exportarSVG);
  updateSliders();
}

function updateSliders() {
  sliders.x.value(posicionesX[selectedEtapa]);
  sliders.y.value(posicionesY[selectedEtapa]);
  sliders.r.value(rotaciones[selectedEtapa]);
  sliders.s.value(tamanios[selectedEtapa]);
  sliders.t.value(grosorLinea[selectedEtapa]);
}

function calcularBloqueAlturas() {
  for (let i = 0; i < etapas.length; i++) {
    bloqueAlturas[i] = 5 * lineCounts[i];
  }
}

function mousePressed() {
  if (dragEnabled && mouseX > 400) {
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseReleased() {
  dragging = false;
}

function mouseWheel(e) {
  if (zoomEnabled && mouseX > 400) {
    zoom *= e.delta > 0 ? 0.95 : 1.05;
    return false;
  }
}

function exportarSVG() {
  svgExporting = true;
  let timestamp = year() + "_" + nf(month(), 2) + "_" + nf(day(), 2) + "_" + nf(hour(), 2) + nf(minute(), 2);
  let filename = `MAGMA_MATTERS_${timestamp}.svg`;
  save(filename);
  svgExporting = false;
}

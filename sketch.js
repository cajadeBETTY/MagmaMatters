let table;
let etapas = ["Erosion", "Cooling", "Eruption", "Rising", "Formation"];
let colores = ["#e63946", "#457b9d", "#2a9d8f", "#f4a261", "#a8dadc"];

let lineCounts = [];
let bloqueAlturas = [];
let temperaturas = [];

let zoomEnabled = true;
let dragEnabled = true;
let dragging = false;
let offsetX = 0;
let offsetY = 0;
let lastMouseX = 0;
let lastMouseY = 0;
let zoom = 1;

let selectedEtapa = 0;
let posicionesX = [];
let posicionesY = [];
let rotaciones = [];
let tamanios = [];
let grosorLinea = [];

function preload() {
  table = loadTable("data/escalas_magma_matter.csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  initData();
  createUI();
}

function initData() {
  for (let i = 0; i < etapas.length; i++) {
    posicionesX[i] = 0.5;
    posicionesY[i] = 0.0;
    rotaciones[i] = 0;
    tamanios[i] = 24;
    grosorLinea[i] = etapas[i] === "Cooling" ? 1.5 : 0.5;

    let row = table.findRow(etapas[i], "volcan");
    if (!row) continue;

    let years = float(row.get("Years"));
    let numLines = years > 200000 ? int(years / 1000) : years > 1000 ? int(years / 500) : 10;
    lineCounts[i] = constrain(numLines, 5, 500);
  }

  let totalAltura = height * 0.9;
  let baseAltura = totalAltura / etapas.length;
  bloqueAlturas = Array.from({ length: etapas.length }, () => baseAltura);
}

function draw() {
  background(255);

  push();
  translate(offsetX, offsetY);
  scale(zoom);

  let yStart = 100;

  for (let i = 0; i < etapas.length; i++) {
    let etapa = etapas[i];
    let h = bloqueAlturas[i];
    let y = yStart;

    drawEtapaLines(i, y, h);
    drawEtapaLabel(i, y, h);

    yStart += h;
  }

  pop();
}

function drawEtapaLines(i, yStart, altura) {
  let row = table.findRow(etapas[i], "volcan");
  if (!row) return;

  let tmin = float(row.get("Tmin"));
  let tmax = float(row.get("Tmax"));
  let tipo = row.get("Temp Type");
  let n = lineCounts[i];

  stroke(colores[i]);
  strokeWeight(grosorLinea[i]);

  for (let j = 0; j < n; j++) {
    let yy = yStart + (j / n) * altura;
    let tempVal;

    if (tipo === "Range") {
      tempVal = map(noise(j * 0.1, i * 10), 0, 1, tmin, tmax);
    } else {
      tempVal = tmin;
    }

    let x1 = 100;
    let x2 = map(tempVal, 0, 1200, 200, width - 200);
    line(x1, yy, x2, yy);
  }
}

function drawEtapaLabel(i, yStart, altura) {
  push();
  let px = map(posicionesX[i], 0, 1, 200, width - 200);
  let py = yStart + altura + posicionesY[i] * 50;

  translate(px, py);
  rotate(rotaciones[i]);
  textAlign(CENTER, CENTER);
  textSize(tamanios[i]);
  fill(0);
  noStroke();
  text(etapas[i], 0, 0);
  pop();
}

function createUI() {
  let panel = createDiv().addClass("controls");

  createElement("h3", "Etapas").parent(panel);
  etapas.forEach((etapa, i) => {
    let b = createButton(etapa);
    b.parent(panel);
    b.mousePressed(() => {
      selectedEtapa = i;
      updateSliders();
    });
  });

  createElement("label", "MOVE X").parent(panel);
  let sliderX = createSlider(0, 1, 0.5, 0.01).parent(panel).input(() => {
    posicionesX[selectedEtapa] = sliderX.value();
  });

  createElement("label", "MOVE Y").parent(panel);
  let sliderY = createSlider(-1, 1, 0, 0.01).parent(panel).input(() => {
    posicionesY[selectedEtapa] = sliderY.value();
  });

  createElement("label", "ROTATION").parent(panel);
  let sliderR = createSlider(-PI / 2, PI / 2, 0, 0.01).parent(panel).input(() => {
    rotaciones[selectedEtapa] = sliderR.value();
  });

  createElement("label", "SIZE").parent(panel);
  let inputSize = createInput("24").parent(panel).input(() => {
    tamanios[selectedEtapa] = int(inputSize.value());
  });

  createElement("label", "THICKNESS").parent(panel);
  let inputThick = createInput("1").parent(panel).input(() => {
    grosorLinea[selectedEtapa] = float(inputThick.value());
  });

  createElement("label", " ").parent(panel);
  createCheckbox("ZOOM", true).parent(panel).changed(e => {
    zoomEnabled = e.target.checked;
  });

  createCheckbox("DRAG", true).parent(panel).changed(e => {
    dragEnabled = e.target.checked;
  });

  createButton("EXPORTAR SVG").parent(panel).mousePressed(exportSVG);

  function updateSliders() {
    sliderX.value(posicionesX[selectedEtapa]);
    sliderY.value(posicionesY[selectedEtapa]);
    sliderR.value(rotaciones[selectedEtapa]);
    inputSize.value(tamanios[selectedEtapa]);
    inputThick.value(grosorLinea[selectedEtapa]);
  }

  updateSliders();
}

function mousePressed() {
  if (mouseX > 340) {
    dragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseDragged() {
  if (dragEnabled && dragging) {
    offsetX += (mouseX - lastMouseX);
    offsetY += (mouseY - lastMouseY);
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseReleased() {
  dragging = false;
}

function mouseWheel(event) {
  if (zoomEnabled && mouseX > 340) {
    zoom += event.delta > 0 ? -0.05 : 0.05;
    zoom = constrain(zoom, 0.5, 3);
  }
}

function exportSVG() {
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>
    <rect width='100%' height='100%' fill='white'/>
    <text x='${width / 2}' y='40' text-anchor='middle' font-size='20' fill='black'>
      MAGMA MATTERS EXPORTADO
    </text>
  </svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "grafico_magma_matters.svg";
  link.click();
}

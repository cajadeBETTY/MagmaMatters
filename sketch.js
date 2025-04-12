let table;
let etapas = ["Erosion", "Cooling", "Eruption", "Rising", "Formation"];
let lineCounts = [];
let bloqueAlturas = [];
let temperaturas = [];
let posicionesX = [];
let posicionesY = [];
let rotaciones = [];
let tamanios = [];
let grosorLinea = [];

let selectedEtapa = 0;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;

let sliderX, sliderY, sliderR, sliderT, inputSize, exportButton;
let font;

function preload() {
  table = loadTable("data/escalas_magma_matter.csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);

  // Cargar datos
  for (let i = 0; i < etapas.length; i++) {
    let etapa = etapas[i];
    let rows = table.findRows(etapa, 'volcan');
    lineCounts.push(rows.length);
    bloqueAlturas.push(rows.length * 8);
    temperaturas.push(rows.map(r => mapDistorsionadoContinuo(float(r.get("Tmin")), etapa)));
    grosorLinea.push((etapa === "Cooling") ? 0.6 : 0.25);
    posicionesX.push(0.5);
    posicionesY.push(0.0);
    rotaciones.push(0);
    tamanios.push(38);
  }

  createGUI();
}

function draw() {
  background(255);
  translate(width / 2 + offsetX, height / 2 + offsetY);
  scale(zoom);

  drawBloques();
  drawEscalaHorizontal();
}

function drawBloques() {
  let y = -height / 2;
  for (let i = 0; i < etapas.length; i++) {
    let xPos = posicionesX[i] * width - width / 2;
    let yPos = y + posicionesY[i] * bloqueAlturas[i];
    let ang = rotaciones[i];
    let tam = tamanios[i];
    let grosor = grosorLinea[i];

    push();
    translate(xPos, yPos);
    rotate(ang);
    stroke(0);
    strokeWeight(grosor);
    noFill();

    for (let j = 0; j < lineCounts[i]; j++) {
      let t = temperaturas[i][j];
      line(0, j * 8, t, j * 8);
    }

    pop();
    y += bloqueAlturas[i] + 20;
  }
}

function drawEscalaHorizontal() {
  stroke(150);
  strokeWeight(0.5);
  noFill();

  for (let i = 0; i <= 5; i++) {
    let x = map(i, 0, 5, -width / 2 + 100, width / 2 - 100);
    line(x, -height / 2, x, height / 2);
    noStroke();
    fill(0);
    textSize(12);
    textAlign(CENTER);
    text(i * 10 + "°C", x, -height / 2 + 20);
    stroke(150);
  }
}

function createGUI() {
  let gui = createDiv().parent("gui-container");

  let title = createElement('h2', 'Etapas').parent(gui);

  for (let i = 0; i < etapas.length; i++) {
    let btn = createButton(etapas[i]).parent(gui);
    btn.mousePressed(() => selectedEtapa = i);
  }

  createP("MOVE X").parent(gui);
  sliderX = createSlider(0, 1, 0.5, 0.01).parent(gui);
  sliderX.input(() => posicionesX[selectedEtapa] = sliderX.value());

  createP("MOVE Y").parent(gui);
  sliderY = createSlider(-1, 1, 0.0, 0.01).parent(gui);
  sliderY.input(() => posicionesY[selectedEtapa] = sliderY.value());

  createP("ROTATION").parent(gui);
  sliderR = createSlider(-180, 180, 0, 1).parent(gui);
  sliderR.input(() => rotaciones[selectedEtapa] = sliderR.value());

  createP("SIZE").parent(gui);
  inputSize = createInput("24").parent(gui);
  inputSize.input(() => tamanios[selectedEtapa] = float(inputSize.value()));

  createP("THICKNESS").parent(gui);
  sliderT = createInput("0.5").parent(gui);
  sliderT.input(() => grosorLinea[selectedEtapa] = float(sliderT.value()));

  createCheckbox("ZOOM", true).parent(gui).changed(e => zoom = e.target.checked ? 1.2 : 1);
  createCheckbox("DRAG", true).parent(gui);

  exportButton = createButton("EXPORTAR SVG").parent(gui);
  exportButton.mousePressed(exportarComoSVG);
}

function exportarComoSVG() {
  let svg = createGraphics(width, height, SVG);
  svg.clear();
  svg.translate(width / 2, height / 2);

  for (let i = 0; i < etapas.length; i++) {
    let xPos = posicionesX[i] * width - width / 2;
    let yPos = posicionesY[i] * bloqueAlturas[i] - height / 2;
    let ang = rotaciones[i];
    let tam = tamanios[i];
    let grosor = grosorLinea[i];

    svg.push();
    svg.translate(xPos, yPos);
    svg.rotate(radians(ang));
    svg.stroke(0);
    svg.strokeWeight(grosor);
    svg.noFill();

    for (let j = 0; j < lineCounts[i]; j++) {
      let t = temperaturas[i][j];
      svg.line(0, j * 8, t, j * 8);
    }

    svg.pop();
  }

  saveSVG(svg, "magma_matters_" + Date.now() + ".svg");
}

function saveSVG(pg, filename) {
  pg.canvas.toBlob(function(blob) {
    let a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    let url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  });
}

function mapDistorsionadoContinuo(t, etapa) {
  let tMin = (etapa === "Cooling") ? 40 : 5;
  let tMax = (etapa === "Cooling") ? 1200 : 40;
  let tMid = (tMin + tMax) / 2;

  let p;
  if (t <= tMid) {
    p = (t - tMin) / (tMid - tMin) * 0.3;
  } else {
    p = 0.3 + ((t - tMid) / (tMax - tMid)) * 0.7;
  }

  let xMin = 0;
  let xMax = width / 3;
  return xMin + p * (xMax - xMin);
}

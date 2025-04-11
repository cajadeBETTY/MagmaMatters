// === MAGMA GRAPHIC P5.js VERSION ===
// Interacción: zoom con rueda, pan con click+drag
// Botón para exportar imagen

let table;
let etapasGeo = ["Erosion", "Cooling", "Eruption", "Rising", "Formation"];
let numEtapas = etapasGeo.length;
let lineCounts = [];
let bloqueAlturas = [];

let tMin = 0;
let tMid = 40;
let tMax;

let graficoAncho = 600;
let graficoAlto = 1440;
let margen = 38;

let xMin = 100;
let xMax;

let zoom = 1.0;
let zoomMin = 0.5;
let zoomMax = 4.0;

let offsetX = 0;
let offsetY = 0;
let lastMouseX, lastMouseY;
let dragging = false;

let erosionTemps = [];
let coolingTemps = [];

function preload() {
  table = loadTable("Escalas_Magma_Matter_CSV_OK.csv", "header");
}

function setup() {
  createCanvas(1100, 1600);
  textFont("Helvetica");
  calcularEtapas();
  generarTemperaturasErosionYCooling();

  let btn = createButton("Descargar imagen");
  btn.position(20, 20);
  btn.mousePressed(() => saveCanvas('magma_grafico', 'png'));
}

function draw() {
  background(255);
  push();
  translate(margen + offsetX, margen + offsetY);
  scale(zoom);
  drawBloques();
  drawEscalaHorizontal();
  pop();
}

function mouseWheel(event) {
  zoom -= event.delta * 0.001;
  zoom = constrain(zoom, zoomMin, zoomMax);
  return false;
}

function mousePressed() {
  lastMouseX = mouseX;
  lastMouseY = mouseY;
  dragging = true;
}

function mouseReleased() {
  dragging = false;
}

function mouseDragged() {
  if (dragging) {
    offsetX += mouseX - lastMouseX;
    offsetY += mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function calcularEtapas() {
  let formationRow = findEtapa("Formation");
  tMax = parseFloat(formationRow.get("Tmax"));
  let minLineas = Infinity;
  let maxLineas = 0;

  for (let i = 0; i < numEtapas; i++) {
    let row = findEtapa(etapasGeo[i]);
    let years = parseFloat(row.get("Years"));
    let numLines = years > 200000 ? years / 1000 : years > 1000 ? years / 500 : 10;
    numLines = constrain(int(numLines), 5, 500);
    lineCounts[i] = numLines;
    minLineas = min(minLineas, numLines);
    maxLineas = max(maxLineas, numLines);
  }

  let baseAltura = graficoAlto / numEtapas;
  let sumaAltura = 0;

  for (let i = 0; i < numEtapas; i++) {
    let f = map(lineCounts[i], minLineas, maxLineas, 0.375, 2.0);
    let h = baseAltura * f;
    bloqueAlturas[i] = h;
    sumaAltura += h;
  }

  for (let i = 0; i < numEtapas; i++) {
    bloqueAlturas[i] *= graficoAlto / sumaAltura;
  }

  xMax = graficoAncho - 20;
}

function generarTemperaturasErosionYCooling() {
  let nE = lineCounts[0];
  let nC = lineCounts[1];
  erosionTemps = [];
  coolingTemps = [];

  for (let j = 0; j < nE; j++) {
    let pct = j / (nE - 1);
    let wave = (sin(pct * PI * 3) + 1) / 2.0;
    let ruido = noise(j * 0.1);
    let mezcla = lerp(wave, ruido, 0.5);
    erosionTemps[j] = map(mezcla, 0, 1, 5, 40);
  }

  let base = erosionTemps[nE - 1];
  for (let j = 0; j < nC; j++) {
    let pct = j / (nC - 1);
    let easing = pow(pct, 1.5);
    let ruido = noise(j * 0.05 + 200);
    let wave = sin(pct * PI * 1.5);
    let variado = easing + 0.1 * (ruido - 0.5) + 0.1 * wave;
    coolingTemps[j] = lerp(base, 1200, constrain(variado, 0, 1));
  }
}

function drawBloques() {
  let yStart = 0;
  let x40 = mapDistorsionadoContinuo(40);
  stroke(120);
  strokeWeight(1.2);
  for (let y = 0; y <= graficoAlto; y += 6) {
    line(x40, y, x40, y + 3);
  }

  for (let i = 0; i < etapasGeo.length; i++) {
    let row = findEtapa(etapasGeo[i]);
    let t1 = parseFloat(row.get("Tmin"));
    let t2 = parseFloat(row.get("Tmax"));
    let tipo = row.get("Temp Type");
    let n = lineCounts[i];
    let h = bloqueAlturas[i];

    for (let j = 0; j < n; j++) {
      let y = yStart + j * (h / n);
      let temp;
      if (i === 0) temp = erosionTemps[j];
      else if (i === 1) temp = coolingTemps[j];
      else if (tipo === "Range") temp = map(noise(j * 0.1 + i * 10), 0, 1, t1, t2);
      else temp = t1;

      stroke(0);
      strokeWeight(i === 1 ? 0.6 : 0.25);
      line(mapDistorsionadoContinuo(0), y, mapDistorsionadoContinuo(temp), y);
    }

    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(12);
    text(etapasGeo[i], 10, yStart + h / 2);
    yStart += h;
  }
}

function drawEscalaHorizontal() {
  let yLinea = graficoAlto + 50;
  stroke(0);
  line(xMin, yLinea, xMax, yLinea);

  let marcas = [0, tMid];
  for (let etapa of etapasGeo) {
    let row = findEtapa(etapa);
    if (row) {
      marcas.push(parseFloat(row.get("Tmin")));
      marcas.push(parseFloat(row.get("Tmax")));
    }
  }

  for (let t of marcas) {
    let xt = mapDistorsionadoContinuo(t);
    stroke(t === tMid ? 120 : 180);
    strokeWeight(t === tMid ? 1.2 : 1.0);
    for (let y = 0; y <= graficoAlto; y += (t === tMid ? 6 : 12)) {
      line(xt, y, xt, y + (t === tMid ? 3 : 4));
    }
    line(xt, yLinea - 4, xt, yLinea + 4);

    push();
    translate(xt, yLinea + 25);
    rotate(-HALF_PI);
    textAlign(LEFT, CENTER);
    fill(0);
    text(nf(t, 0, 0) + "°C", 0, 0);
    pop();

    push();
    translate(xt, -20);
    rotate(-HALF_PI);
    textAlign(LEFT, CENTER);
    text(nf(t, 0, 0) + "°C", 0, 0);
    pop();
  }
}

function mapDistorsionadoContinuo(t) {
  let p = (t <= tMid)
    ? (t - tMin) / (tMid - tMin) * 0.3
    : 0.3 + ((t - tMid) / (tMax - tMid)) * 0.7;
  return xMin + p * (xMax - xMin);
}

function findEtapa(nombre) {
  for (let r = 0; r < table.getRowCount(); r++) {
    if (table.getString(r, "volcan").trim().toLowerCase() === nombre.toLowerCase()) {
      return table.getRow(r);
    }
  }
  return null;
}

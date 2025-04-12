
let table;
let etapas = [];
let lineCounts = [];
let tempMin = [];
let tempMax = [];
let midTemps = [];
let etapasNombres = [];
let etapasColores = [];

let posicionesX = [];
let posicionesY = [];
let rotaciones = [];
let tamanios = [];
let grosores = [];

let sliderActivo = "";
let selectedEtapa = 0;
let dragging = false;
let dragIndex = -1;

let panelAncho = 300;
let zoomActivo = false;
let dragActivo = false;
let enableZoom = true;
let enableDrag = true;

let fuente;
let exportarSVG = false;

function preload() {
  table = loadTable('data/Escalas_Magma_Matter_CSV_OK.csv', 'csv', 'header');
  fuente = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf');
}

function setup() {
  createCanvas(windowWidth, 1600);
  textFont(fuente);
  textAlign(CENTER, CENTER);
  noFill();

  // Leer datos del CSV
  for (let r = 0; r < table.getRowCount(); r++) {
    let nombre = table.getString(r, "volcan");
    let minT = table.getNum(r, "Tmin");
    let maxT = table.getNum(r, "Tmax");
    let midT = table.getNum(r, "mid");
    let lines = int(map(table.getNum(r, "days"), 0, 80000000, 5, 120));

    etapas.push(r);
    etapasNombres.push(nombre);
    tempMin.push(minT);
    tempMax.push(maxT);
    midTemps.push(midT);
    lineCounts.push(lines);

    posicionesX.push(100);
    posicionesY.push(200 + r * 250);
    rotaciones.push(0);
    tamanios.push(32);
    grosores.push(1);
  }
}

function draw() {
  if (exportarSVG) {
    createCanvas(windowWidth, 1600, SVG);
    exportarSVG = false;
  }

  background(255);
  stroke(0);
  strokeWeight(1);
  textAlign(CENTER, CENTER);

  // Dibujar líneas por etapa
  for (let i = 0; i < etapas.length; i++) {
    let yBase = posicionesY[i];
    let n = lineCounts[i];
    let minT = tempMin[i];
    let maxT = tempMax[i];
    let espacio = 6;

    strokeWeight(grosores[i]);
    for (let j = 0; j < n; j++) {
      let x1 = panelAncho;
      let x2 = width;
      let y = yBase + j * espacio;

      beginShape();
      for (let x = panelAncho; x < width; x += 10) {
        let ruido = noise(x * 0.005, y * 0.005, i * 10) * 40;
        let deformado = y + sin(x * 0.01 + i) * ruido * 0.1;
        vertex(x, deformado);
      }
      endShape();
    }

    // Etiquetas de temperatura (arriba y abajo)
    fill(0);
    noStroke();
    textSize(10);
    text("Tmin: " + minT + "°", width - 60, yBase - 20);
    text("Tmax: " + maxT + "°", width - 60, yBase + n * espacio + 10);
  }

  // Dibujar etiquetas arrastrables
  for (let i = 0; i < etapas.length; i++) {
    push();
    translate(posicionesX[i], posicionesY[i]);
    rotate(radians(rotaciones[i]));
    textSize(tamanios[i]);
    fill(0);
    noStroke();
    text(etapasNombres[i], 0, 0);
    pop();
  }
}

function keyPressed() {
  if (sliderActivo !== "") {
    let i = selectedEtapa;
    if (keyCode === LEFT_ARROW) {
      if (sliderActivo === "X") posicionesX[i] -= 1;
      if (sliderActivo === "Y") posicionesY[i] -= 1;
      if (sliderActivo === "R") rotaciones[i] -= 1;
      if (sliderActivo === "S") tamanios[i] = max(1, tamanios[i] - 1);
      if (sliderActivo === "T") grosores[i] = max(1, grosores[i] - 1);
    } else if (keyCode === RIGHT_ARROW) {
      if (sliderActivo === "X") posicionesX[i] += 1;
      if (sliderActivo === "Y") posicionesY[i] += 1;
      if (sliderActivo === "R") rotaciones[i] += 1;
      if (sliderActivo === "S") tamanios[i] += 1;
      if (sliderActivo === "T") grosores[i] += 1;
    }
  }
}

function mousePressed() {
  // Activar slider
  if (mouseX < panelAncho) {
    if (mouseY > 100 && mouseY < 130) sliderActivo = "X";
    else if (mouseY > 140 && mouseY < 170) sliderActivo = "Y";
    else if (mouseY > 180 && mouseY < 210) sliderActivo = "R";
    else if (mouseY > 220 && mouseY < 250) sliderActivo = "S";
    else if (mouseY > 260 && mouseY < 290) sliderActivo = "T";
    else sliderActivo = "";
  }

  // Activar arrastre si clic en texto
  for (let i = 0; i < etapas.length; i++) {
    let d = dist(mouseX, mouseY, posicionesX[i], posicionesY[i]);
    if (d < 50) {
      dragging = true;
      dragIndex = i;
      break;
    }
  }
}

function mouseDragged() {
  if (dragging && dragIndex !== -1) {
    posicionesX[dragIndex] = mouseX;
    posicionesY[dragIndex] = mouseY;
  }
}

function mouseReleased() {
  dragging = false;
  dragIndex = -1;
}

function keyTyped() {
  if (key === 'e' || key === 'E') {
    exportarSVG = true;
    save("magmamatters_export.svg");
  }
}

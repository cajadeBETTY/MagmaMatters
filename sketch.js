let table;
let etapas = [];
let lineCounts = [];
let tempMin = [];
let tempMax = [];
let midTemps = [];
let etapasNombres = [];

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

  for (let r = 0; r < table.getRowCount(); r++) {
    let nombre = table.getString(r, "volcan");
    let minT = table.getNum(r, "Tmin");
    let maxT = table.getNum(r, "Tmax");
    let years = table.getNum(r, "Years");

    // Validación
    if (isNaN(minT)) {
      console.error(`Fila ${r}: Tmin es inválido para ${nombre}`);
      minT = 0;
    }
    if (isNaN(maxT)) {
      console.error(`Fila ${r}: Tmax es inválido para ${nombre}`);
      maxT = 0;
    }
    if (isNaN(years)) {
      console.warn(`Fila ${r}: Years es inválido para ${nombre}`);
      years = 0;
    }

    let midT = (minT + maxT) / 2;
    let lines = int(map(years, 0, 500000, 5, 120));

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
  background(255);
  stroke(0);
  strokeWeight(1);
  textAlign(CENTER, CENTER);

  drawPanel();

  for (let i = 0; i < etapas.length; i++) {
    let yBase = posicionesY[i];
    let n = lineCounts[i];
    let minT = tempMin[i];
    let maxT = tempMax[i];
    let espacio = 6;

    strokeWeight(grosores[i]);
    for (let j = 0; j < n; j++) {
      let y = yBase + j * espacio;
      beginShape();
      for (let x = panelAncho; x < width; x += 10) {
        let ruido = noise(x * 0.005, y * 0.005, i * 10) * 40;
        let deformado = y + sin(x * 0.01 + i) * ruido * 0.1;
        vertex(x, deformado);
      }
      endShape();
    }

    fill(0);
    noStroke();
    textSize(10);
    text("Tmin: " + minT + "°", width - 60, yBase - 20);
    text("Tmax: " + maxT + "°", width - 60, yBase + n * espacio + 10);
  }

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

function drawPanel() {
  fill(245);
  noStroke();
  rect(0, 0, panelAncho, height);

  textAlign(LEFT, CENTER);
  fill(0);
  textSize(14);
  text("ZOOM", 10, 30);
  text("DRAG", 10, 60);

  fill(zoomActivo ? 'blue' : 200);
  rect(60, 20, 20, 20);

  fill(dragActivo ? 'blue' : 200);
  rect(60, 50, 20, 20);

  let botones = ["EROSION", "COOLING", "ERUPTION", "RISING", "FORMATION"];
  for (let i = 0; i < botones.length; i++) {
    fill(i === selectedEtapa ? 'deepskyblue' : 180);
    rect(10, 100 + i * 30, 130, 25);
    fill(255);
    textAlign(CENTER, CENTER);
    text(botones[i], 75, 112 + i * 30);
  }

  let labels = ["MOVE X", "MOVE Y", "ROTATION", "SIZE", "THICKNESS"];
  for (let i = 0; i < labels.length; i++) {
    fill(sliderActivo === "XYRST"[i] ? 'navy' : 80);
    rect(10, 280 + i * 40, 150, 25);
    fill(255);
    textAlign(LEFT, CENTER);
    text(labels[i], 15, 292 + i * 40);
  }

  fill(0);
  rect(10, 500, 130, 30);
  fill(255);
  text("EXPORTAR SVG", 75, 515);
}

function mousePressed() {
  if (mouseX < panelAncho) {
    if (mouseY >= 20 && mouseY <= 40) zoomActivo = !zoomActivo;
    else if (mouseY >= 50 && mouseY <= 70) dragActivo = !dragActivo;
    else if (mouseY >= 100 && mouseY <= 250) {
      selectedEtapa = int((mouseY - 100) / 30);
    } else if (mouseY >= 280 && mouseY <= 480) {
      let index = int((mouseY - 280) / 40);
      sliderActivo = "XYRST"[index];
    } else if (mouseY >= 500 && mouseY <= 530) {
      saveCanvas("magmamatters_export", "svg");
    }
  }

  for (let i = 0; i < etapas.length; i++) {
    let d = dist(mouseX, mouseY, posicionesX[i], posicionesY[i]);
    if (d < 50) {
      dragging = true;
      dragIndex = i;
      break;
    }
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
    saveCanvas("magmamatters_export", "svg");
  }
}


// sketch.js
let table;
let etapas = [];
let lineCounts = [];
let tempMin = [];
let tempMax = [];
let etapasNombres = [];

let posicionesX = [];
let posicionesY = [];
let rotaciones = [];
let tamanios = [];
let grosores = [];

let selectedEtapa = 0;
let dragging = false;
let dragIndex = -1;
let sliderActivo = "";

let zoomActivo = false;
let dragActivo = false;

let fuente;
let exportarSVG = false;

function preload() {
  table = loadTable('data/escalas_magma_matter.csv', 'csv', 'header');
  fuente = loadFont('https://cdnjs.cloudflare.com/ajax/libs/topcoat/0.8.0/font/SourceCodePro-Regular.otf');
}

function setup() {
  createCanvas(windowWidth, 1600);
  textFont(fuente);
  textAlign(CENTER, CENTER);
  noFill();

  for (let r = 0; r < table.getRowCount(); r++) {
    etapas.push(r);
    etapasNombres.push(table.getString(r, 'volcan'));
    tempMin.push(table.getNum(r, 'Tmin'));
    tempMax.push(table.getNum(r, 'Tmax'));
    lineCounts.push(int(map(table.getNum(r, 'days'), 0, 80000000, 5, 120)));

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

  for (let i = 0; i < etapas.length; i++) {
    let yBase = posicionesY[i];
    let n = lineCounts[i];
    let espacio = 6;
    strokeWeight(grosores[i]);
    for (let j = 0; j < n; j++) {
      let y = yBase + j * espacio;
      beginShape();
      for (let x = 300; x < width; x += 10) {
        let ruido = noise(x * 0.005, y * 0.005, i * 10) * 40;
        let deformado = y + sin(x * 0.01 + i) * ruido * 0.1;
        vertex(x, deformado);
      }
      endShape();
    }

    fill(0);
    noStroke();
    textSize(10);
    text("Tmin: " + tempMin[i] + "°", width - 60, yBase - 20);
    text("Tmax: " + tempMax[i] + "°", width - 60, yBase + n * espacio + 10);
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
  if (mouseX < 300) {
    if (mouseY > 100 && mouseY < 130) sliderActivo = "X";
    else if (mouseY > 140 && mouseY < 170) sliderActivo = "Y";
    else if (mouseY > 180 && mouseY < 210) sliderActivo = "R";
    else if (mouseY > 220 && mouseY < 250) sliderActivo = "S";
    else if (mouseY > 260 && mouseY < 290) sliderActivo = "T";
    else sliderActivo = "";
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

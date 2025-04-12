// Versión de placeholder
function preload() {
  table = loadTable('data/escalas_magma_matter.csv', 'header');
}

function setup() {
  createCanvas(1200, 1600);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(0);
  text("MAGMA MATTERS - p5.js versión en construcción", width / 2, height / 2);
}

function draw() {}
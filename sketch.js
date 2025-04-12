// MAGMA MATTERS - placeholder temporal
let table;

function preload() {
  table = loadTable('data/escalas_magma_matter.csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  textAlign(CENTER, CENTER);
  textSize(20);
  fill(0);
  text("Cargando visualización MAGMA MATTERS...", width / 2, height / 2);
}
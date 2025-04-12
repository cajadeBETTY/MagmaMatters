
let table;
let etapas = ["Erosion", "Cooling", "Eruption", "Rising", "Formation"];
let colores = ["#0af", "#0f0", "#f80", "#f08", "#ccc"];
let lineCounts = [];

function preload() {
  table = loadTable("data/escalas_magma_matter.csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  textSize(16);
  noLoop();
  
  for (let i = 0; i < etapas.length; i++) {
    lineCounts[i] = int(random(20, 100));
  }
}

function draw() {
  background(255);
  let h = height / etapas.length;
  for (let i = 0; i < etapas.length; i++) {
    let y = i * h;
    fill(0);
    text(etapas[i], width / 2, y + h / 2);
    stroke(colores[i]);
    for (let j = 0; j < lineCounts[i]; j++) {
      let x1 = random(100, width - 100);
      let x2 = x1 + random(20, 100);
      let ly = y + map(j, 0, lineCounts[i], 10, h - 10);
      line(x1, ly, x2, ly);
    }
  }
}

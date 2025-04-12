let exportButton;

function preload() {
  table = loadTable('data/escalas_magma_matter.csv', 'header');
}

function setup() {
  createCanvas(1600, 1200);
  background(255);

  exportButton = createButton("EXPORTAR SVG");
  exportButton.position(20, 20);
  exportButton.mousePressed(exportSVG);
}

function draw() {
  background(255);
  fill(0);
  textSize(24);
  textAlign(CENTER, CENTER);
  text("MAGMA MATTERS", width / 2, 60);

  // Ejemplo visual temporal
  let y = 120;
  for (let r = 0; r < table.getRowCount(); r++) {
    let etapa = table.getString(r, "volcan");
    text(etapa, width / 2, y);
    y += 40;
  }
}

function exportSVG() {
  const svg = \`<svg xmlns='http://www.w3.org/2000/svg' width='\${width}' height='\${height}'>
    <rect width='100%' height='100%' fill='white'/>
    <text x='\${width / 2}' y='60' text-anchor='middle' font-size='24' fill='black'>MAGMA MATTERS</text>
  </svg>\`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "grafico_magma_matters.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
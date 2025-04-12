import controlP5.*;
import processing.svg.*;

ControlP5 cp5;

String[] etapasGeo = { "Erosion", "Cooling", "Eruption", "Rising", "Formation" };
int numEtapas = etapasGeo.length;

int[] lineCounts = new int[numEtapas];
float[] bloqueAlturas = new float[numEtapas];
float[] posicionesX = new float[numEtapas];
float[] posicionesY = new float[numEtapas];
float[] rotaciones = new float[numEtapas];
int[] tamanios = new int[numEtapas];
float[] grosorLinea = new float[numEtapas];

float[] erosionTemps;
float[] coolingTemps;

Table table;

float tMin = 0;
float tMid = 40;
float tMax;

int graficoAncho = 600;
int graficoAlto = 1440;

float xMin = 100;
float xMax;

float zoom = 1.0;
float offsetX = 0;
float offsetY = 0;
float scaleFactor = 1.0;

int selectedEtapa = 0;
String sliderActivo = "";

boolean zoomEnabled = true;
boolean dragEnabled = true;
boolean dragging = false;

int panelIzq = 500;

void setup() {
  size(2400, 1680, P2D);
  smooth();
  cp5 = new ControlP5(this);

  table = loadTable("Escalas_Magma_Matter_CSV_OK.csv", "header");
  calcularEtapas();
  generarTemperaturasErosionYCooling();

  int targetHeight = 1200;
  scaleFactor = 1.2 * float(targetHeight) / graficoAlto;

  for (int i = 0; i < numEtapas; i++) {
    posicionesX[i] = 0.5;
    posicionesY[i] = 0.0;
    rotaciones[i] = 0;
    tamanios[i] = 38;
    grosorLinea[i] = etapasGeo[i].equals("Cooling") ? 0.6 : 0.25;
  }

  construirUI();
  actualizarColorSliders();
}

void draw() {
  background(255);

  fill(245);
  noStroke();
  rect(0, 0, panelIzq, height);

  for (int i = 0; i < etapasGeo.length; i++) {
    cp5.get(Button.class, "etapaButton" + i)
       .setColorBackground(i == selectedEtapa ? color(0, 150, 255) : color(180));
  }

  pushMatrix();
  translate(panelIzq + (width - panelIzq) / 2 + offsetX, height / 2 + offsetY);
  scale(scaleFactor * zoom);
  translate(-graficoAncho / 2.0, -graficoAlto / 2.0);
  drawBloques();
  drawEscalaHorizontal();
  popMatrix();

  cp5.draw();
  
    if (mensaje != "" && millis() - mensajeTimer < 5000) {
    fill(0);
    textSize(16);
    textAlign(LEFT, TOP);
    text(mensaje, 30, height - 80);
  }

}

void mousePressed() {
  if (mouseX > panelIzq) dragging = true;

  sliderActivo = "";

  if (mouseSobre(cp5, "posicionesXSlider")) {
    sliderActivo = "X";
  } else if (mouseSobre(cp5, "posicionesYSlider")) {
    sliderActivo = "Y";
  } else if (mouseSobre(cp5, "rotacionesSlider")) {
    sliderActivo = "R";
  }

  actualizarColorSliders();
}

void mouseDragged() {
  if (dragEnabled && dragging && mouseX > panelIzq) {
    offsetX += (mouseX - pmouseX);
    offsetY += (mouseY - pmouseY);
    redraw();
  }
}

void mouseReleased() {
  dragging = false;
}

void mouseWheel(MouseEvent event) {
  if (zoomEnabled && mouseX > panelIzq) {
    float e = event.getCount();
    zoom -= e * 0.05;
    zoom = constrain(zoom, 0.5, 4.0);
    redraw();
  }
}

void keyPressed() {
  float delta = 0.01;
  float rotDelta = radians(1);

  if (sliderActivo.equals("X")) {
    if (keyCode == RIGHT) posicionesX[selectedEtapa] = constrain(posicionesX[selectedEtapa] + delta, 0, 1);
    if (keyCode == LEFT)  posicionesX[selectedEtapa] = constrain(posicionesX[selectedEtapa] - delta, 0, 1);
    cp5.getController("posicionesXSlider").setValue(posicionesX[selectedEtapa]);
  }

  if (sliderActivo.equals("Y")) {
    if (keyCode == RIGHT) posicionesY[selectedEtapa] = constrain(posicionesY[selectedEtapa] + delta, -1, 1);
    if (keyCode == LEFT)  posicionesY[selectedEtapa] = constrain(posicionesY[selectedEtapa] - delta, -1, 1);
    cp5.getController("posicionesYSlider").setValue(posicionesY[selectedEtapa]);
  }

  if (sliderActivo.equals("R")) {
    if (keyCode == RIGHT) rotaciones[selectedEtapa] = constrain(rotaciones[selectedEtapa] + rotDelta, -HALF_PI, HALF_PI);
    if (keyCode == LEFT)  rotaciones[selectedEtapa] = constrain(rotaciones[selectedEtapa] - rotDelta, -HALF_PI, HALF_PI);
    cp5.getController("rotacionesSlider").setValue(rotaciones[selectedEtapa]);
  }

  redraw();
}

boolean mouseSobre(ControlP5 cp5, String nombre) {
  Controller<?> c = cp5.getController(nombre);
  float x = c.getPosition()[0];
  float y = c.getPosition()[1];
  float w = c.getWidth();
  float h = c.getHeight();
  return (mouseX >= x && mouseX <= x + w && mouseY >= y && mouseY <= y + h);
}

String mensaje = "";
int mensajeTimer = 0;

void exportarComoSVG() {
  String ruta = sketchPath("grafico_magma_matters_" + year() + "_" + month() + "_" + day() + ".svg");

  beginRecord(SVG, ruta);
  background(255);
  translate(panelIzq + (width - panelIzq) / 2 + offsetX, height / 2 + offsetY);
  scale(scaleFactor * zoom);
  translate(-graficoAncho / 2.0, -graficoAlto / 2.0);
  drawBloques();
  drawEscalaHorizontal();
  endRecord();

  mensaje = "✅ SVG guardado en carpeta del sketch:\n" + ruta;
  mensajeTimer = millis();
  println(mensaje);
}



void actualizarColorSliders() {
  cp5.getController("posicionesXSlider").setColorActive(sliderActivo.equals("X") ? color(0, 150, 255) : color(120));
  cp5.getController("posicionesYSlider").setColorActive(sliderActivo.equals("Y") ? color(0, 150, 255) : color(120));
  cp5.getController("rotacionesSlider").setColorActive(sliderActivo.equals("R") ? color(0, 150, 255) : color(120));
}

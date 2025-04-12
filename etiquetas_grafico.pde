
import java.util.HashSet;


void drawBloques() {
  float yStart = 0;

  float x40 = mapDistorsionadoContinuo(40.0);
  stroke(120);
  strokeWeight(1.5 / zoom);
  for (float y = -60; y <= graficoAlto + 60; y += 12) {
    line(x40, y, x40, y + 4);
  }

  for (int i = 0; i < etapasGeo.length; i++) {
    String etapa = etapasGeo[i];
    TableRow row = findEtapa(etapa);
    if (row == null) continue;

    float t1 = row.getFloat("Tmin");
    float t2 = row.getFloat("Tmax");
    String tipo = row.getString("Temp Type");
    int numLineas = lineCounts[i];
    float bloqueH = bloqueAlturas[i];

    for (int j = 0; j < numLineas; j++) {
      float y = yStart + j * (bloqueH / float(numLineas));
      float x1, x2, tempVar;

      if (etapa.equals("Erosion")) {
        tempVar = erosionTemps[j];
      } else if (etapa.equals("Cooling")) {
        tempVar = coolingTemps[j];
      } else if (tipo.equalsIgnoreCase("Range")) {
        float noiseVal = noise(j * 0.1 + i * 10);
        tempVar = map(noiseVal, 0, 1, t1, t2);
      } else {
        tempVar = t1;
      }

      x1 = mapDistorsionadoContinuo(0.0);
      x2 = mapDistorsionadoContinuo(tempVar);
      strokeWeight(grosorLinea[i] / zoom);
      stroke(0);
      line(x1, y, x2, y);
    }

    float tx = xMin + posicionesX[i] * (xMax - xMin);
    float ty = yStart + bloqueH * 0.5 + posicionesY[i] * bloqueH;

    pushMatrix();
    translate(tx, ty);
    rotate(rotaciones[i]);

    PFont f = createFont("Arial", tamanios[i], true);
    textFont(f);
    textSize(tamanios[i] / zoom);
    fill(0);
    textAlign(CENTER, CENTER);
    text(etapasGeo[i], 0, 0);
    popMatrix();

    stroke(200);
    strokeWeight(1.0 / zoom);
    for (float x = xMin; x <= xMax; x += 8) {
      line(x, yStart, x + 4, yStart);
      line(x, yStart + bloqueH, x + 4, yStart + bloqueH);
    }

    yStart += bloqueAlturas[i];
  }
}

void drawEscalaHorizontal() {
  float espacioEtiqueta = 30;

  ArrayList<Float> etiquetasUnicas = new ArrayList<Float>();

  for (String etapa : etapasGeo) {
    TableRow row = findEtapa(etapa);
    if (row == null) continue;
    float tmin = row.getFloat("Tmin");
    float tmax = row.getFloat("Tmax");
    if (!etiquetasUnicas.contains(tmin)) etiquetasUnicas.add(tmin);
    if (!etiquetasUnicas.contains(tmax)) etiquetasUnicas.add(tmax);
  }

  if (!etiquetasUnicas.contains(0.0)) etiquetasUnicas.add(0.0);
  if (!etiquetasUnicas.contains(tMid)) etiquetasUnicas.add(tMid);

  for (float t : etiquetasUnicas) {
    float xt = mapDistorsionadoContinuo(t);

    float ySuperior = -espacioEtiqueta - 20;
    float yInferior = graficoAlto + espacioEtiqueta + 20;

    stroke(180);
    strokeWeight(t == tMid ? 1.5 / zoom : 1.0 / zoom);
    float separacion = t == tMid ? 16 : 12;

    for (float y = ySuperior; y <= yInferior; y += separacion) {
      line(xt, y, xt, y + 4);
    }

    drawTempLabel(xt, -espacioEtiqueta, t, true); // etiqueta arriba
    drawTempLabel(xt, graficoAlto + espacioEtiqueta + 20, t, false); // etiqueta abajo
  }
}

void drawTempLabel(float x, float baseY, float valor, boolean arriba) {
  pushMatrix();
  translate(x, baseY);
  rotate(-HALF_PI);
  fill(0);
  textFont(createFont("Arial", 10, true));

  if (arriba) {
    textAlign(LEFT, BOTTOM);
    text(nfc(valor, 0) + "°C", 0, 0);
  } else {
    textAlign(LEFT, TOP);
    text(nfc(valor, 0) + "°C", 0, 0);
  }

  popMatrix();
}



float mapDistorsionadoContinuo(float t) {
  float p;
  if (t <= tMid) {
    p = (t - tMin) / (tMid - tMin) * 0.3;
  } else {
    p = 0.3 + ((t - tMid) / (tMax - tMid)) * 0.7;
  }
  return xMin + p * (xMax - xMin);
}

void drawBloquesSVG(PGraphics pg) {
  float yStart = 0;

  for (int i = 0; i < etapasGeo.length; i++) {
    String etapa = etapasGeo[i];
    TableRow row = findEtapa(etapa);
    if (row == null) continue;

    float t1 = row.getFloat("Tmin");
    float t2 = row.getFloat("Tmax");
    String tipo = row.getString("Temp Type");
    int numLineas = lineCounts[i];
    float bloqueH = bloqueAlturas[i];

    for (int j = 0; j < numLineas; j++) {
      float y = yStart + j * (bloqueH / float(numLineas));
      float x1, x2, tempVar;

      if (etapa.equals("Erosion")) {
        tempVar = erosionTemps[j];
      } else if (etapa.equals("Cooling")) {
        tempVar = coolingTemps[j];
      } else if (tipo.equalsIgnoreCase("Range")) {
        float noiseVal = noise(j * 0.1 + i * 10);
        tempVar = map(noiseVal, 0, 1, t1, t2);
      } else {
        tempVar = t1;
      }

      x1 = mapDistorsionadoContinuo(0);
      x2 = mapDistorsionadoContinuo(tempVar);
      pg.stroke(0);
      pg.strokeWeight(grosorLinea[i]);
      pg.line(x1, y, x2, y);
    }

    yStart += bloqueAlturas[i];
  }
}

void drawEscalaHorizontalSVG(PGraphics pg) {
  HashSet<Float> etiquetasUnicas = new HashSet<Float>();

  for (String etapa : etapasGeo) {
    TableRow row = findEtapa(etapa);
    if (row == null) continue;
    etiquetasUnicas.add(row.getFloat("Tmin"));
    etiquetasUnicas.add(row.getFloat("Tmax"));
  }

  etiquetasUnicas.add(tMid);  // agregar línea de 40°C
  float textoSize = 24;

  float espaciadoSup = 80;
  float espaciadoInf = 80;
  float yMin = 0;
  float yMax = graficoAlto;

  pg.textAlign(LEFT, CENTER);
  pg.textSize(textoSize);
  pg.fill(0);
  pg.stroke(180);
  pg.strokeWeight(1);

  for (float t : etiquetasUnicas) {
    float xt = mapDistorsionadoContinuo(t);

    for (float y = yMin; y <= yMax; y += 12) {
      pg.line(xt, y, xt, y + 4);
    }

    pg.line(xt, yMin - 6, xt, yMin + 6);
    pg.line(xt, yMax - 6, xt, yMax + 6);

    pg.pushMatrix();
    pg.translate(xt, yMin - espaciadoSup);
    pg.rotate(-HALF_PI);
    pg.text(nfc(t, 0) + "°C", 0, 0);
    pg.popMatrix();

    pg.pushMatrix();
    pg.translate(xt, yMax + espaciadoInf);
    pg.rotate(-HALF_PI);
    pg.text(nfc(t, 0) + "°C", 0, 0);
    pg.popMatrix();
  }
}

void calcularEtapas() {
  int minLineas = Integer.MAX_VALUE;
  int maxLineas = 0;
  TableRow formationRow = findEtapa("Formation");
  tMax = formationRow.getFloat("Tmax");

  for (int i = 0; i < numEtapas; i++) {
    TableRow row = findEtapa(etapasGeo[i]);
    float years = row.getFloat("Years");
    int numLines = (years > 200000) ? int(years / 1000) : (years > 1000) ? int(years / 500) : 10;
    numLines = constrain(numLines, 5, 500);
    lineCounts[i] = numLines;
    if (numLines > maxLineas) maxLineas = numLines;
    if (numLines < minLineas) minLineas = numLines;
  }

  float baseAltura = float(graficoAlto) / numEtapas;
  float sumaAltura = 0;
  for (int i = 0; i < numEtapas; i++) {
    float f = map(lineCounts[i], minLineas, maxLineas, 0.375, 2.0);
    bloqueAlturas[i] = baseAltura * f;
    sumaAltura += bloqueAlturas[i];
  }

  for (int i = 0; i < numEtapas; i++) {
    bloqueAlturas[i] *= float(graficoAlto) / sumaAltura;
  }

  xMax = graficoAncho - 20;
}

void generarTemperaturasErosionYCooling() {
  int nE = lineCounts[0];
  int nC = lineCounts[1];
  erosionTemps = new float[nE];
  coolingTemps = new float[nC];

  for (int j = 0; j < nE; j++) {
    float pct = float(j) / (nE - 1);
    float wave = (sin(pct * PI * 3) + 1) / 2.0;
    float ruido = noise(j * 0.1);
    float mezcla = lerp(wave, ruido, 0.5);
    erosionTemps[j] = map(mezcla, 0, 1, 5, 40);
  }

  float base = erosionTemps[nE - 1];
  for (int j = 0; j < nC; j++) {
    float pct = float(j) / (nC - 1);
    float easing = pow(pct, 1.5);
    float ruido = noise(j * 0.05 + 200);
    float wave = sin(pct * PI * 1.5);
    float variado = easing + 0.1 * (ruido - 0.5) + 0.1 * wave;
    coolingTemps[j] = lerp(base, 1200, constrain(variado, 0, 1));
  }
}

TableRow findEtapa(String nombre) {
  for (TableRow row : table.rows()) {
    String n = row.getString("volcan");
    if (n != null && n.trim().equalsIgnoreCase(nombre)) {
      return row;
    }
  }
  return null;
}

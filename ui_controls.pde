void construirUI() {
  PFont fuenteEtiqueta = createFont("Arial", 16);
  int yBase = 30;

  // === ZOOM ===
  Textlabel zoomLabel = cp5.addTextlabel("zoomLabel")
    .setText("ZOOM")
    .setPosition(30, yBase)
    .setFont(fuenteEtiqueta);
  zoomLabel.setColorValue(zoomEnabled ? color(0) : color(120));

  cp5.addToggle("toggleZoom")
    .setPosition(90, yBase)
    .setSize(20, 20)
    .setValue(zoomEnabled)
    .onClick(e -> {
      zoomEnabled = !zoomEnabled;
      Textlabel label = cp5.get(Textlabel.class, "zoomLabel");
      if (label != null) label.setColorValue(zoomEnabled ? color(0) : color(120));
    });

  yBase += 40;

  // === DRAG ===
  Textlabel dragLabel = cp5.addTextlabel("dragLabel")
    .setText("DRAG")
    .setPosition(30, yBase)
    .setFont(fuenteEtiqueta);
  dragLabel.setColorValue(dragEnabled ? color(0) : color(120));

  cp5.addToggle("toggleDrag")
    .setPosition(90, yBase)
    .setSize(20, 20)
    .setValue(dragEnabled)
    .onClick(e -> {
      dragEnabled = !dragEnabled;
      Textlabel label = cp5.get(Textlabel.class, "dragLabel");
      if (label != null) label.setColorValue(dragEnabled ? color(0) : color(120));
    });

  yBase += 50;

for (int i = 0; i < etapasGeo.length; i++) {
  final int index = i;  // ← clave para capturar el valor correcto
  cp5.addButton("etapaButton" + i)
    .setLabel(etapasGeo[i])
    .setPosition(30, yBase)
    .setSize(160, 35)
    .setFont(fuenteEtiqueta)
    .onClick(e -> {
      selectedEtapa = index;
      actualizarColorSliders();
      cp5.get(Textfield.class, "tamaniosInput").setText(str(tamanios[selectedEtapa]));
      cp5.get(Textfield.class, "thicknessInput").setText(str(grosorLinea[selectedEtapa]));
    });

  yBase += 40;
}


  yBase += 30;

  // === SLIDERS ===
  cp5.addTextlabel("labelX").setText("MOVE X").setPosition(30, yBase).setFont(fuenteEtiqueta);
  cp5.addSlider("posicionesXSlider")
    .setPosition(30, yBase + 20)
    .setSize(300, 30)
    .setRange(0, 1)
    .setValue(0.5);

  yBase += 60;

  cp5.addTextlabel("labelY").setText("MOVE Y").setPosition(30, yBase).setFont(fuenteEtiqueta);
  cp5.addSlider("posicionesYSlider")
    .setPosition(30, yBase + 20)
    .setSize(300, 30)
    .setRange(-1.0, 1.0)
    .setValue(0.0);

  yBase += 60;

  cp5.addTextlabel("labelRot").setText("ROTATION").setPosition(30, yBase).setFont(fuenteEtiqueta);
  cp5.addSlider("rotacionesSlider")
    .setPosition(30, yBase + 20)
    .setSize(300, 30)
    .setRange(-HALF_PI, HALF_PI)
    .setValue(0);

  yBase += 60;

  cp5.addTextlabel("labelSize").setText("SIZE").setPosition(30, yBase).setFont(fuenteEtiqueta);
  cp5.addTextfield("tamaniosInput")
    .setPosition(30, yBase + 20)
    .setSize(100, 30)
    .setText("38")
    .setAutoClear(false)
    .setFont(fuenteEtiqueta)
    .onChange(e -> {
      String val = e.getController().getStringValue();
      try {
        int size = int(val);
        if (size >= 1) tamanios[selectedEtapa] = size;
        redraw();
      } catch (Exception ex) {
        println("⚠️ Error al ingresar tamaño");
      }
    });

  yBase += 70;

  cp5.addTextlabel("labelThickness").setText("THICKNESS").setPosition(30, yBase).setFont(fuenteEtiqueta);
  cp5.addTextfield("thicknessInput")
    .setPosition(30, yBase + 20)
    .setSize(100, 30)
    .setText(str(grosorLinea[selectedEtapa]))
    .setAutoClear(false)
    .setFont(fuenteEtiqueta)
    .onChange(e -> {
      String val = e.getController().getStringValue();
      try {
        float grosor = float(val);
        if (grosor > 0) grosorLinea[selectedEtapa] = grosor;
        redraw();
      } catch (Exception ex) {
        println("⚠️ Error al ingresar grosor");
      }
    });

  yBase += 80;

  // === BOTÓN DE EXPORTAR SVG ===
  cp5.addButton("exportarSVG")
    .setLabel("EXPORTAR SVG")
    .setPosition(30, yBase)
    .setSize(180, 40)
    .setFont(fuenteEtiqueta)
    .onClick(e -> {
      Button b = cp5.get(Button.class, "exportarSVG");
      if (b != null) {
        b.setColorBackground(color(0));
        delay(150);
        b.setColorBackground(color(120));
      }
      exportarComoSVG();
    });
}

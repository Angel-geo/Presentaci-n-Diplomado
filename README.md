# Presentación institucional RBTTF

Presentación web de 17 diapositivas, publicada en https://presentacion-diplomado-rbttf.onrender.com .

## Uso

- Clic izquierdo/derecho en el fondo: anterior/siguiente. Flechas del teclado: navegar.
- F: pantalla completa. Escape: salir. R o ↻: repetir animaciones.
- D4 y D7: cada avance recorre las etapas cartográficas antes de cambiar de diapositiva.
- D5: posar el cursor o pulsar una foto para ampliarla; pulsar otra vez para restablecer.
- D6: zoom, desplazamiento, fichas y selección de capas dentro del mapa.
- D13 y D17: el botón Ampliar tablero aprovecha la superficie completa sin salir de la presentación.

## Estructura y ampliación

`dist/` es el sitio listo para publicar. No requiere compilación ni dependencias de instalación. Render conserva `echo Ready` y el directorio de publicación `dist`, en el servicio existente.

- `elements.json`: contenido y orden de las diapositivas. `original` identifica la diapositiva del PPTX fuente; `kind` distingue video, collage y ortofoto.
- `app.js`: navegación, animación cartográfica, video, collage, mapas y aplicaciones incrustadas.
- `style.css`: diseño 16:9, posiciones y animaciones, con soporte para movimiento reducido.
- `assets/`: imágenes proporcionadas y video (misma secuencia de 15 segundos y resolución 1920×1080; optimizado para reproducción web). Las nuevas fotos y ortofoto usan WebP sin pérdida, con los mismos píxeles del PNG original; captura financiera PNG original sin cambios.
- `mapdata.json`: copia local de las capas originales del mapa CTPT utilizada en la primera publicación; las fechas de los atributos se conservan. No se presenta como una actualización automática en tiempo real.
- `slides.json`: correspondencia entre numeración final y original.

Para agregar las tres diapositivas pendientes: insertar sus objetos en `elements.json`, agregar sus recursos en `assets/`, actualizar el índice `slides.json` y, si se insertan antes de escenas especiales, ajustar sus posiciones en `sequences` y en las condiciones de `render()` de `app.js`. El contador se calcula automáticamente. No hay diapositivas vacías reservadas. Un commit en `main` actualiza el mismo servicio Render.

## Datos y límites

- Reserva: 424,000 ha y 33 municipalidades, según la corrección del autor.
- Ámbito del proyecto: 376,500 ha, 30 municipalidades y €14.34 M; se conservan los indicadores del PPTX original.
- MAA y CCB se revelan como capas de píxeles obtenidas de las imágenes originales alineadas. No se inventan geometrías. Se retienen MAA al agregar CCB.
- D6 usa Esri World Topographic Map y las tres capas originales con iconos reducidos y casillas de visibilidad. Los datos del mapa permanecen disponibles si el fondo falla.
- D12 es una captura de referencia, no datos en tiempo real.
- D13 y D17 incrustan las aplicaciones públicas originales de ArcGIS. Requieren internet y soporte WebGL2 para sus mapas. En el navegador remoto de revisión se comprobó la carga del Dashboard y el cambio de su indicador; su mapa informó falta de WebGL2. Esto no es un bloqueo de iframe. La aplicación original conserva sus herramientas y restricciones.

## Comprobaciones de la actualización

Se revisaron el orden de las 17 diapositivas, recursos locales, video automático, indicadores de ambos mapas, collage, fichas y conmutación de capas, acumulación cartográfica MAA/CCB, captura financiera, ficha técnica sin barra inferior, ortofoto y navegación. No se modificaron otros repositorios ni servicios.

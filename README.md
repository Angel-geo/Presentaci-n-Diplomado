# Presentación institucional RBTTF

Presentación web de 28 diapositivas, publicada en https://presentacion-diplomado-rbttf.onrender.com .

## Uso

- Clic izquierdo/derecho en el fondo: anterior/siguiente. Flechas del teclado: navegar.
- F: pantalla completa. Escape: salir. R o ↻: repetir animaciones.
- D15 y D18: cada avance recorre las etapas cartográficas antes de cambiar de diapositiva.
- D16: posar el cursor o pulsar una foto para ampliarla; pulsar otra vez para restablecer.
- D17: zoom, desplazamiento, fichas y selección de capas dentro del mapa.
- D24 y D28: el botón Ampliar tablero aprovecha la superficie completa sin salir de la presentación.

## Estructura y ampliación

`dist/` es el sitio listo para publicar. No requiere compilación ni dependencias de instalación. Render conserva `echo Ready` y el directorio de publicación `dist`, en el servicio existente.

- `elements-v4.json`: contenido y orden de las diapositivas. `original` identifica la diapositiva del PPTX fuente; `kind` distingue video, collage y ortofoto.
- `presentation-v4.js`: navegación, animación cartográfica, video, collage, mapas y aplicaciones incrustadas.
- `presentation-v4.css`: diseño 16:9, posiciones y animaciones, con soporte para movimiento reducido.
- `assets/`: imágenes proporcionadas y video (misma secuencia de 15 segundos y resolución 1920×1080; optimizado para reproducción web). Las nuevas fotos y ortofoto usan WebP sin pérdida, con los mismos píxeles del PNG original; captura financiera PNG original sin cambios.
- `mapdata-v4.json`: copia local de las capas originales del mapa CTPT utilizada en la primera publicación; las fechas de los atributos se conservan. No se presenta como una actualización automática en tiempo real.
- `slides.json`: correspondencia entre numeración final y original.

Se incorporaron las 11 diapositivas con contenido de Presentación1.pptx inmediatamente después del video. Se omitió únicamente la primera página vacía. Los SVG conservan las imágenes y geometrías de la fuente y revelan sus elementos progresivamente.

Para incorporar más diapositivas, insertar sus objetos en `elements-v4.json` y sus recursos en `assets/`. La navegación y las escenas especiales se resuelven mediante `original`/`kind`, por lo que la inserción ya no requiere ajustar números fijos. Actualizar también `slides.json`. El contador se calcula automáticamente.

Corrección del mapa: el archivo publicado anterior estaba truncado y fallaba al interpretar JSON. Se reemplazó por `mapdata-v4.json` íntegro (18 capas) y se añadió un botón para reintentar si una conexión falla. La publicación se verifica comparando el archivo remoto completo con el local.

## Datos y límites

- Reserva: 424,000 ha y 33 municipalidades, según la corrección del autor.
- Ámbito del proyecto: 376,500 ha, 30 municipalidades y €14.34 M; se conservan los indicadores del PPTX original.
- MAA y CCB se revelan como capas de píxeles obtenidas de las imágenes originales alineadas. No se inventan geometrías. Se retienen MAA al agregar CCB.
- D17 usa Esri World Topographic Map y las tres capas originales con iconos reducidos y casillas de visibilidad. Los datos del mapa permanecen disponibles si el fondo falla.
- D23 es una captura de referencia, no datos en tiempo real.
- D24 y D28 incrustan las aplicaciones públicas originales de ArcGIS. Requieren internet y soporte WebGL2 para sus mapas. En el navegador remoto de revisión se comprobó la carga del Dashboard y el cambio de su indicador; su mapa informó falta de WebGL2. Esto no es un bloqueo de iframe. La aplicación original conserva sus herramientas y restricciones.

## Comprobaciones de la actualización

Se revisaron el orden de las 28 diapositivas, recursos locales, video automático, indicadores de ambos mapas, collage, fichas y conmutación de capas, acumulación cartográfica MAA/CCB, captura financiera, ficha técnica sin barra inferior, ortofoto y navegación. No se modificaron otros repositorios ni servicios.

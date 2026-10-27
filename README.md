# Presentación del Diplomado · RBTTF

Presentación institucional animada de 14 diapositivas.

## Desplegar en Render

Crear un **Static Site** conectado a este repositorio.
- Rama: `main`
- Build Command: `echo Ready`
- Publish Directory: `dist`
- Auto-Deploy: activado

## Editar

- `dist/elements.json`: elementos independientes de las 14 diapositivas (texto, imágenes, posiciones).
- `dist/app.js`: navegación, secuencias D3 y D5, y mapa D4.
- `dist/style.css`: diseño y animaciones.
- `dist/mapdata.json`: copia de geometrías y atributos públicos de ArcGIS consultados el 26 de octubre de 2026.
- `dist/assets`: mapas en alta resolución e imágenes optimizadas para web.

Flechas izquierda/derecha para avanzar, pantalla completa y botón para repetir animaciones. D4 abre fichas de infraestructura, equipamiento y planes de manejo. OpenStreetMap es el fondo principal, con Esri como alternativa si falla.

Los datos de las fichas conservan las fechas y estados de la fuente; no se actualizan automáticamente.

Para probar localmente: `python -m http.server 8080 --directory dist`.

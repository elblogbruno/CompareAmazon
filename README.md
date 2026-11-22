# CompareAmazon — Extensión de Navegador

Extensión (Manifest V3 para **Chrome, Edge y Brave**) que detecta las pestañas abiertas de productos de Amazon, te permite elegir cuáles comparar, genera una tabla comparativa clara y moderna, y te permite enviar toda la información a **ChatGPT** o **Claude** con un solo clic.

## Funciones principales

- **Selector de pestañas abiertas**: Detecta automáticamente todas las fichas de producto de Amazon (`/dp/...`) en tu ventana actual (o en todas las ventanas).
- **Tabla comparativa visual**:
  - Destaca automáticamente el **Mejor precio**, **Mejor valorado** y **Más reseñas**.
  - Unifica y alinea las especificaciones técnicas entre productos.
  - Filtro **"Solo diferencias"** para ver únicamente en qué cambian los productos.
  - Buscador de especificaciones, ordenación por precio/valoración/reseñas, favoritos y modo oscuro.
  - Exportación a **CSV**.
- **Integración con ChatGPT y Claude**:
  - Botones directos **ChatGPT** y **Claude** que generan un prompt estructurado en Markdown con todos los productos, precios, valoraciones, puntos clave y especificaciones.
  - Modal **"Personalizar Prompt IA"** para añadir tus prioridades (presupuesto, uso previsto, etc.) antes de enviarlo.

## Cómo instalarla en Chrome / Edge / Brave

1. Abre tu navegador y ve a:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
2. Activa el **Modo de desarrollador** (esquina superior derecha).
3. Haz clic en **Cargar descomprimida** (*Load unpacked*).
4. Selecciona la carpeta `F:\Proyectos\CompareAmazon`.
5. (Opcional) Fija el icono de **CompareAmazon** en la barra de extensiones para tenerlo siempre a mano.

## Cómo usarla

1. Abre en varias pestañas los productos de Amazon que quieras comparar.
2. Haz clic en el icono de **CompareAmazon**.
3. Marca o desmarca los productos que quieras incluir y pulsa **Comparar**.
4. Explora la tabla, filtra por diferencias o pulsa **ChatGPT** / **Claude** (o **Personalizar Prompt IA**) para pedir una recomendación detallada.

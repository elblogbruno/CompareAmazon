# Guía para publicar CompareAmazon en Chrome Web Store (y Edge Add-ons)

Todo está empaquetado y preparado para pasar la revisión a la primera.

---

## 1. Archivos listos para subir

- **Paquete ZIP para Chrome Web Store / Edge Add-ons**:
  `F:\Proyectos\CompareAmazon\store\compareamazon-cws-v1.1.0.zip`
  *(Contiene `manifest.json` directamente en la raíz, como exige Google).*
- **Icono 128×128**: `F:\Proyectos\CompareAmazon\icons\icon128.png`
- **Banner promocional pequeño (440×280)**: `F:\Proyectos\CompareAmazon\store\promo-440x280.png`
- **Banner promocional grande (1400×560)**: `F:\Proyectos\CompareAmazon\store\marquee-1400x560.png`
- **Política de Privacidad (URL pública obligatoria)**:
  `https://www.compareamazon.es/privacidad`
- **Capturas de pantalla (1280×800 px)**:
  Haz 2 o 3 capturas reales de tu navegador (1280×800):
  1. La tabla comparativa con 3–4 productos, badges de *Mejor precio* y *Score*.
  2. La sección de fotos, distribución de estrellas y reseñas con fotos.
  3. El botón *Preguntar a IA* / modal *Compartir enlace*.

---

## 2. Pasos en Chrome Web Store

1. Entra en [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Inicia sesión con tu cuenta de Google y paga la cuota única de desarrollador (**5 USD**, solo se paga una vez).
3. Pulsa **Nuevo elemento (New Item)** y sube `store\compareamazon-cws-v1.1.0.zip`.
4. Rellena las pestañas **Ficha de Chrome Web Store (Store Listing)** y **Privacidad (Privacy)** con los textos de abajo.
5. Pulsa **Enviar a revisión (Submit for Review)**. Suele aprobarse en 24–72 horas.

### Bonus gratis: Microsoft Edge Add-ons (0 €)
Puedes subir **exactamente el mismo archivo** `compareamazon-cws-v1.1.0.zip` en [Microsoft Partner Center — Edge Add-ons](https://partner.microsoft.com/dashboard/microsoftedge/overview) sin coste de registro.

---

## 3. Textos listos para copiar y pegar

### Nombre
`CompareAmazon — Comparador Inteligente`

### Resumen / Descripción corta (máx. 132 caracteres)
`Compara tus pestañas abiertas de Amazon en una tabla clara con cupones, fotos, reseñas, enlaces compartibles e IA.`

### Descripción detallada
```text
¿Cansado de abrir 10 pestañas de Amazon para decidir qué producto comprar?

CompareAmazon convierte tus pestañas abiertas (o los productos que añadas con el botón "+ Comparar" desde las búsquedas de Amazon) en una tabla comparativa clara, rápida y visual.

FUNCIONES PRINCIPALES
• Selector de pestañas y bandeja en Amazon: elige qué pestañas abiertas comparar o añade productos y variantes directamente desde Amazon.
• Precio real con cupones: detecta cupones ocultos, calcula el precio neto final, muestra el precio por unidad y enlaza a Keepa y CamelCamelCamel.
• Comparador Amazon Europa: consulta al instante el precio del mismo ASIN en Amazon ES, DE, FR e IT.
• Galería completa y reseñas reales: todas las fotos con visor ampliado, gráfico de estrellas, reseñas con vídeo y fotos primero, reseñas críticas (1–3★) y alertas automáticas.
• Puntuación automática (Score) y presupuesto máximo: ajusta pesos de precio, valoración y reseñas para destacar el ganador.
• Pregunta a tu IA favorita en 1 clic: genera un prompt estructurado con todos los datos para ChatGPT, Claude, Gemini o Perplexity.
• Comparte por enlace: crea un enlace corto en compareamazon.es/c/... con vista móvil en tarjetas, votación y comentarios para decidir en familia o con amigos sin que tengan que instalar nada.

Compatible con Amazon.es, Amazon.com, Amazon.de, Amazon.fr, Amazon.it, Amazon.co.uk, Amazon.com.mx y más países.
```

### Categoría
`Compras` (*Shopping*)

### Idioma principal
`Español`

---

## 4. Pestaña "Privacidad" (MUY IMPORTANTE para evitar rechazos)

### Propósito único (Single Purpose Description)
```text
Permitir al usuario seleccionar y comparar productos de Amazon en una tabla comparativa local, compartir comparativas mediante enlace en compareamazon.es y exportar los datos a asistentes de IA a petición del usuario.
```

### Justificación de permisos

- **`tabs`**:
  `Necesario para listar las pestañas de productos de Amazon abiertas por el usuario en el popup y permitirle elegir cuáles comparar.`
- **`scripting`**:
  `Necesario para inyectar el script de extracción (scraper.js) bajo demanda únicamente en las pestañas de Amazon que el usuario selecciona para comparar.`
- **`storage`**:
  `Necesario para guardar localmente las preferencias del usuario (tema, idioma), la bandeja de comparación, notas personales, favoritos y comparativas guardadas.`
- **Permisos de host (`*.amazon.*` y `compareamazon.es`)**:
  `Los dominios de Amazon son necesarios para mostrar el botón "+ Comparar", leer los datos de las fichas seleccionadas (incluyendo pestañas en suspensión), consultar reseñas y comparar precios entre tiendas europeas de Amazon. El dominio compareamazon.es se utiliza únicamente cuando el usuario inicia sesión o pulsa "Compartir" para crear enlaces compartibles.`
- **¿Usa código remoto? (Remote code)**:
  **No** (`No, I am not using remote code`). Todo el JavaScript está empaquetado dentro de la extensión.

### Uso de datos (Data Usage)
- Marca: **Contenido de sitios web** (*Website content* — datos de productos de Amazon leídos cuando el usuario inicia una comparativa).
- Marca las 3 certificaciones de cumplimiento (no vendemos datos, no los usamos para fines no relacionados ni para solvencia/préstamos).
- **URL de Política de Privacidad**: `https://www.compareamazon.es/privacidad`

---

## 5. Cuando Google la apruebe
Avísame y actualizamos el botón principal de `https://www.compareamazon.es` para que apunte directamente a tu ficha oficial de Chrome Web Store (instalación en 1 clic).

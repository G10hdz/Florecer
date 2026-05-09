# 🎨 Florecer Pixel Art Studio

## Tu arsenal: 18,000 MXN en créditos Vertex API

Esto es **ORO** para Florecer. Con 18k MXN puedes generar entre **6,000 y 12,000 imágenes** dependiendo del modelo que uses. Eso es suficiente para:

- 50+ variantes de avatar
- 100+ cosméticos (sombreros, vestidos, accesorios, zapatos)
- 20+ estados de ánimo para la compañera
- 30+ iconos de metas
- 50+ efectos de celebración
- Y aún te sobra para iterar

---

## 🎯 Estrategia de Generación

### Fase 1: Fundamentos (20% del presupuesto)
Genera los assets base que todo lo demás usa:

1. **Avatar bases** (3-5 variantes)
   - Chica de piel morena, pelo rizado, vestido blanco
   - Chica de piel morena, pelo corto, vestido blanco  
   - Chica de piel morena, pelo largo, vestido blanco

2. **Compañera (La Semilla)** (4 estados)
   - Triste: semilla marchita
   - Neutral: semilla pequeña
   - Feliz: brote con hojas
   - Emocionada: flor brillante con pétalos de colores

### Fase 2: Cosméticos (40% del presupuesto)
Genera por categoría:

**Sombreros (20+)**
- Boina roja, sombrero de sol, corona de hojas, diadema floral
- Gorro tech, bandana, tiara dorada

**Vestidos (25+)**
- Primavera (rosado con flores), Otoño (naranja con hojas)
- Tech (overalls con circuitos), Formal (negro elegante)
- Playa (veraniego), Cozy (suéter oversized)

**Accesorios (30+)**
- Abeja amiga, laptop mini, taza de café
- Audífonos, cámara, libreta
- Collar de flores, aretes tech, pulsera brillante

**Zapatos (15+)**
- Botas de jardín, tenis tech, sandalias florales
- Zapatillas cozy, botas de montaña

### Fase 3: Iconos de Metas (15% del presupuesto)
Un icono pixel art para cada tipo de meta:

- 💻 Laptop: laptop con código brillante
- 📱 Teléfono: smartphone con aura dorada
- 🎙️ Micrófono: mic con ondas de sonido
- 🖥️ Mini PC: computadora compacta con luces
- 🏍️ Motocicleta: scooter rojo con flores
- 🧠 DGX Spark: cerebro digital con circuitos
- 🚀 Startup: cohete con rastro de flores

### Fase 4: Celebraciones & Efectos (15% del presupuesto)
- Confeti, estrellas brillantes, corazones flotantes
- Aura de nivel up, rayos de sol, arcoíris
- Pétalos de rosa, mariposas, fuegos artificiales

### Fase 5: Iteración (10% del presupuesto)
Guarda para mejorar lo que no te gustó, generar variantes, o crear assets sorpresa.

---

## 🛠️ Prompts Optimizados para Vertex API

### Modelo Recomendado
**Imagen 3** (si está disponible en tu región) o **Stable Diffusion XL** via Vertex

### Template de Prompt

```
pixel art [SUJETO], [MODIFICADORES], 
64x64 resolution, 16-color limited palette, 
cute chibi proportions, big head small body,
warm pastel colors, Latin American folk art inspired,
crisp pixel edges, transparent background,
game sprite asset, centered composition
```

### Negative Prompt (SIEMPRE incluir)

```
photorealistic, 3D render, blurry, gradient background,
complex background, multiple subjects, low resolution,
anti-aliased edges, realistic proportions, photographic
```

### Parámetros Recomendados

```json
{
  "guidanceScale": 7.5,
  "numInferenceSteps": 50,
  "width": 64,
  "height": 64,
  "seed": [aleatorio para variar]
}
```

---

## 📁 Estructura de Carpetas

```
public/
  assets/
    pixelart/
      avatars/
        base_1.png
        base_2.png
        base_3.png
      companion/
        sad.png
        neutral.png
        happy.png
        excited.png
      cosmetics/
        hats/
          sun_hat.png
          leaf_crown.png
          beret.png
        dresses/
          spring.png
          autumn.png
          tech.png
        accessories/
          bee_friend.png
          laptop_mini.png
          coffee_mug.png
        shoes/
          garden_boots.png
          tech_sneakers.png
      goals/
        laptop.png
        phone.png
        mic.png
        minipc.png
        motorbike.png
        ai_brain.png
        rocket.png
      celebrations/
        confetti.png
        stars.png
        levelup_aura.png
        rainbow.png
```

---

## 🔄 Workflow de Generación

### Opción A: Batch Script (Python)

```python
import json
import requests
from google.cloud import aiplatform

# Tu catálogo de assets
assets = [
    {
        "id": "avatar_base_1",
        "prompt": "pixel art cute chibi girl with brown skin and dark curly hair...",
        "width": 64,
        "height": 64
    },
    # ... más assets
]

# Generar todos
for asset in assets:
    response = generate_image(
        prompt=asset["prompt"],
        negative_prompt=NEGATIVE_PROMPT,
        width=asset["width"],
        height=asset["height"]
    )
    save_image(response, f"assets/pixelart/{asset['id']}.png")
```

### Opción B: Consola de Vertex (Manual)
1. Ve a [Vertex AI Studio](https://console.cloud.google.com/vertex-ai/studio)
2. Selecciona "Image Generation"
3. Pega el prompt
4. Ajusta parámetros
5. Descarga y guarda

### Opción C: Retoque Manual (Recomendado)
1. Genera 3-5 variantes de cada asset
2. Elige la mejor
3. Ábrela en Aseprite, Pixaki, o Photoshop
4. Retoca colores, ajusta pixels
5. Exporta PNG con transparencia

---

## 💰 Costos Aproximados

Con **Imagen 3** en Vertex AI:
- ~$0.03 USD por imagen (64x64)
- 18,000 MXN ≈ $900 USD
- **= ~30,000 imágenes posibles**

Pero no necesitas tantas. Con **1,000 imágenes bien curadas** tienes más que suficiente para:
- 50 avatars
- 200 cosméticos
- 100 estados de compañera
- 50 iconos
- 100 efectos
- 500 variaciones/emociones

**Presupuesto recomendado: 3,000-5,000 imágenes (~$100-150 USD)**

---

## 🎨 Guía de Estilo Visual

### Paleta de Colores (16 colores)

```
# Base
Blanco puro: #FFFFFF
Negro puro: #000000
Gris claro: #E8E3D9
Gris medio: #9E9A93

# Cálidos
Rosa pálido: #F4C2C2
Coral: #E8A598
Naranja suave: #F4D03F
Durazno: #F5B7B1

# Fríos
Verde menta: #82E0AA
Verde bosque: #58D68D
Azul cielo: #85C1E9
Azul marino: #5DADE2

# Tierra
Marrón cálido: #D4A574
Terracota: #C0392B
Ocre: #D68910
Dorado: #F7DC6F
```

### Reglas de Composición
1. **Siempre centrado**: El sujeto debe estar en el centro
2. **Fondo transparente**: Usa #FF00FF (magenta) o alpha transparente
3. **Proporciones chibi**: Cabeza 50% del cuerpo
4. **Ojos grandes**: Mínimo 4x4 pixels cada ojo
5. **Sombras simples**: Máximo 1 tono de sombra
6. **Bordes negros**: 1 pixel de outline negro alrededor

---

## 🚀 Próximos Pasos

1. **Hoy**: Genera los 4 estados de la compañera
2. **Esta semana**: Genera 3 avatars base + 10 cosméticos
3. **Próxima semana**: Genera iconos para tus 7 metas actuales
4. **Itera**: Usa el 10% restante para mejorar lo que no te encante

---

## 📝 Prompts Listos para Copiar

### Compañera - Estados

**Triste:**
```
pixel art cute small magical seedling sprite with tiny sad face, 
drooping brown leaves, small rain cloud above, looking down, 
64x64 resolution, 16-color limited palette, crisp pixel edges, 
transparent background, game sprite asset, centered
```

**Feliz:**
```
pixel art cute small magical seedling sprite with tiny smiling face, 
bright green leaves, small pink flowers blooming, sparkle eyes, 
64x64 resolution, 16-color limited palette, crisp pixel edges, 
transparent background, game sprite asset, centered
```

**Emocionada:**
```
pixel art cute small magical seedling sprite with tiny joyful face, 
sparkling eyes, rainbow colored petals, jumping pose, stars around, 
golden aura, 64x64 resolution, 16-color limited palette, 
crisp pixel edges, transparent background, game sprite asset, centered
```

### Avatar Base

```
pixel art cute chibi girl with brown skin and dark curly hair, 
wearing simple white dress, standing pose, big eyes, small smile, 
64x64 resolution, 16-color limited palette, crisp pixel edges, 
transparent background, game sprite asset, centered, 
Latin American folk art inspired colors
```

### Icono de Meta - Laptop

```
pixel art cute open laptop with glowing screen showing code, 
small sparkles around, warm colors, 64x64 resolution, 
16-color limited palette, crisp pixel edges, 
transparent background, game item icon, centered
```

---

**¡Manos a la obra!** Con 18k MXN tienes recursos para hacer de Florecer visualmente único. La clave es la consistencia: todos los assets deben parecer del mismo juego. 🎮✨

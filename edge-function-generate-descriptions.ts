// ===================================================================
// EDGE FUNCTION: GENERAR DESCRIPCIONES CON CHATGPT
// ===================================================================
// Archivo: supabase/functions/generate-product-description/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// No import for OpenAI SDK; use fetch and REST API

// Helper to call OpenAI API
async function openaiChatCompletion({
  apiKey,
  messages,
  max_tokens,
  temperature
}: {
  apiKey: string,
  messages: Array<{ role: string, content: string }>,
  max_tokens: number,
  temperature: number
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens,
      temperature
    })
  });
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
  }
  return response.json();
}

// Edge function handler
export default async function handler(req: Request): Promise<Response> {
  try {
    const apiKey = process.env.OPENAI_API_KEY || (globalThis as any).OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const { nombre, categoria, precio, talla, color } = await req.json();

    // Crear prompt inteligente para generar descripción
    const prompt = `
Eres un experto en moda mayorista. Crea una descripción atractiva y profesional para este producto:

PRODUCTO: ${nombre}
CATEGORÍA: ${categoria}
PRECIO: $${precio}
${talla ? `TALLA: ${talla}` : ''}
${color ? `COLOR: ${color}` : ''}

INSTRUCCIONES:
- Descripción entre 50-100 palabras
- Dirigida a mayoristas/revendedores
- Destaca calidad y potencial de venta
- Menciona versatilidad y público objetivo
- Tono profesional pero atractivo
- Incluye beneficios para el negocio del comprador
- NO incluyas precio en la descripción

FORMATO: Solo texto, sin títulos ni bullets.
`;

    // Generar descripción con ChatGPT
    const response = await openaiChatCompletion({
      apiKey,
      messages: [
        {
          role: "system",
          content: "Eres un experto copywriter especializado en moda mayorista. Creas descripciones que ayudan a vender productos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.7
    });

    const descripcion = response.choices?.[0]?.message?.content?.trim();

    if (!descripcion) {
      throw new Error('No se pudo generar descripción');
    }

    // También generar tags/palabras clave
    const tagsPrompt = `
Basándote en este producto: ${nombre} - ${categoria}
Genera 5 palabras clave separadas por comas para SEO y búsqueda.
Solo las palabras, sin explicaciones.
`;

    const tagsResponse = await openaiChatCompletion({
      apiKey,
      messages: [
        {
          role: "user",
          content: tagsPrompt
        }
      ],
      max_tokens: 50,
      temperature: 0.5
    });

    const tags = tagsResponse.choices?.[0]?.message?.content?.trim().split(',').map((tag: string) => tag.trim());

    return new Response(JSON.stringify({
      success: true,
      data: {
        descripcion,
        tags,
        generado_en: new Date().toISOString()
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('Error generando descripción:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ===================================================================
// EJEMPLOS DE USO:
// ===================================================================
/*
// Desde JavaScript en admin panel:
const response = await supabase.functions.invoke('generate-product-description', {
  body: {
    nombre: 'Remera Basic Cotton',
    categoria: 'Remeras',
    precio: 1500,
    talla: 'M',
    color: 'Blanco'
  }
});

// Respuesta esperada:
{
  "success": true,
  "data": {
    "descripcion": "Remera de algodón premium con corte moderno...",
    "tags": ["remera", "algodón", "básica", "unisex", "casual"],
    "generado_en": "2025-01-01T12:00:00Z"
  }
}
*/

// ===================================================================
// INSTRUCCIONES PARA IMPLEMENTAR:
// ===================================================================
// 1. Crear carpeta: supabase/functions/generate-product-description/
// 2. Guardar este archivo como: index.ts
// 3. Configurar variable OPENAI_API_KEY en Supabase
// 4. Desplegar: supabase functions deploy generate-product-description
// ===================================================================
// ===================================================================
// VERSIÓN GRATIS: GENERAR DESCRIPCIONES CON GROQ (LLAMA 3.1)
// ===================================================================
// 100% GRATIS - Sin límites de uso diario

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Import Deno types and serve function if running in Deno, otherwise polyfill for Node.js
// @ts-ignore
declare const Deno: any;
const serve = typeof Deno !== "undefined" && Deno.serve ? Deno.serve : undefined;

// Groq es GRATIS y más rápido que OpenAI
const GROQ_API_KEY = typeof Deno !== "undefined" && Deno.env ? Deno.env.get('GROQ_API_KEY') : process.env.GROQ_API_KEY; // Gratis en console.groq.com

(serve ?? (async (handler: (req: Request) => Promise<Response>) => {
  const { createServer } = await import("http");
  createServer(async (req, res) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      const request = new Request("http://localhost", { method: req.method, body });
      const response = await handler(request);
      const text = await response.text();
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(text);
    });
  }).listen(8000);
}))(
  async (req: Request): Promise<Response> => {
  try {
    const { nombre, categoria, precio, talla, color } = await req.json();
    
    // Crear prompt para Llama (modelo gratis)
    const prompt = `Eres un experto en moda mayorista. Crea una descripción atractiva y profesional para este producto:

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
- NO incluyas precio en la descripción

Responde solo con la descripción, sin introducción.`;

    // Llamar a Groq (GRATIS y más rápido que OpenAI)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile", // Modelo GRATIS
        messages: [
          {
            role: "system",
            content: "Eres un experto copywriter especializado en moda mayorista."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Error Groq: ${response.status}`);
    }

    const data = await response.json();
    const descripcion = data.choices[0].message.content?.trim();
    
    if (!descripcion) {
      throw new Error('No se pudo generar descripción');
    }

    // Generar tags básicos (sin IA adicional para ahorrar)
    const tags = [
      nombre.toLowerCase(),
      categoria.toLowerCase(),
      color?.toLowerCase(),
      talla?.toLowerCase(),
      'mayorista'
    ].filter(Boolean);

    return new Response(JSON.stringify({
      success: true,
      data: {
        descripcion,
        tags,
        generado_con: 'Llama 3.1 (Groq - Gratis)',
        generado_en: new Date().toISOString()
      }
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Error generando descripción:', error);
    
    // Fallback sin IA
    const { nombre, categoria } = await req.json();
    const fallbackDescription = `${nombre} de alta calidad, ideal para mayoristas. Producto versátil de ${categoria} con excelente relación precio-calidad. Perfecto para reventa y alta rotación en tu negocio.`;
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        descripcion: fallbackDescription,
        tags: [nombre.toLowerCase(), categoria.toLowerCase(), 'mayorista'],
        generado_con: 'Sistema de respaldo',
        generado_en: new Date().toISOString()
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// ===================================================================
// VENTAJAS DE GROQ:
// ✅ 100% GRATIS (sin límites diarios)
// ✅ Más rápido que ChatGPT
// ✅ Llama 3.1 70B (muy inteligente)
// ✅ API key gratuita en console.groq.com
// ===================================================================
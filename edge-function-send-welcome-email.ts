// ===================================================================
// EDGE FUNCTION: ENVIAR EMAILS DE BIENVENIDA
// ===================================================================
// Archivo: supabase/functions/send-welcome-email/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// @ts-ignore: Deno global is provided by the edge runtime
declare const Deno: typeof globalThis.Deno;

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;

// Explicitly type 'req' as Request
Deno.serve(async (req: Request) => {
  try {
    const { email, nombreEmpresa } = await req.json();
    
    // Crear HTML del email de bienvenida
    const welcomeHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 ¡Bienvenido a Ian Modas!</h1>
              <p>Tu cuenta mayorista está lista</p>
            </div>
            <div class="content">
              <h2>¡Hola ${nombreEmpresa}!</h2>
              <p>Gracias por registrarte en <strong>Ian Modas</strong>, tu plataforma de confianza para moda mayorista.</p>
              
              <h3>✅ Tu cuenta está confirmada</h3>
              <p>Ya puedes acceder a:</p>
              <ul>
                <li>📦 Catálogo completo de productos</li>
                <li>💰 Precios mayoristas exclusivos</li>
                <li>🚚 Gestión de pedidos online</li>
                <li>📊 Historial de compras</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="https://ianmodas.com/login" class="button">
                  🚀 Acceder a mi cuenta
                </a>
              </div>
              
              <h3>📞 ¿Necesitas ayuda?</h3>
              <p>Nuestro equipo está disponible para ayudarte:</p>
              <ul>
                <li>📧 Email: soporte@ianmodas.com</li>
                <li>📱 WhatsApp: +598 99 123 456</li>
                <li>🕒 Horario: Lunes a Viernes 9:00 - 18:00</li>
              </ul>
            </div>
            <div class="footer">
              <p>© 2025 Ian Modas - Moda Mayorista de Calidad</p>
              <p>Este email fue enviado automáticamente. Por favor no respondas a este correo.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Enviar email usando Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ian Modas <bienvenida@ianmodas.com>',
        to: email,
        subject: `🎉 ¡Bienvenido a Ian Modas, ${nombreEmpresa}!`,
        html: welcomeHtml,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Error de Resend: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email de bienvenida enviado',
      emailId: data.id 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error enviando email:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ===================================================================
// INSTRUCCIONES PARA IMPLEMENTAR:
// ===================================================================
// 1. Crear carpeta: supabase/functions/send-welcome-email/
// 2. Guardar este archivo como: index.ts
// 3. Configurar variable RESEND_API_KEY en Supabase
// 4. Desplegar: supabase functions deploy send-welcome-email
// ===================================================================
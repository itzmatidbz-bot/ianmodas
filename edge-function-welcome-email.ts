// ===================================================================
// EDGE FUNCTION SIMPLE: EMAILS DE BIENVENIDA (SOLO RESEND)
// ===================================================================
// Archivo: supabase/functions/send-welcome-email/index.ts

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// @ts-ignore: Deno global is provided by the edge runtime environment
declare const Deno: any;

const RESEND_API_KEY = typeof Deno !== "undefined" && Deno.env ? Deno.env.get('RESEND_API_KEY') : undefined;

// Explicitly type req as Request
// @ts-ignore: Deno global is provided by the edge runtime environment
Deno.serve(async (req: Request) => {
  try {
    const { email, nombreEmpresa } = await req.json();
    
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY no configurada');
    }
    
    // HTML simple pero profesional
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">🎉 ¡Bienvenido a Ian Modas!</h1>
          <p style="margin: 10px 0 0;">Tu cuenta mayorista está lista</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333;">¡Hola ${nombreEmpresa}!</h2>
          <p>Gracias por registrarte en <strong>Ian Modas</strong>, tu plataforma de confianza para moda mayorista.</p>
          
          <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">✅ Tu cuenta está confirmada</h3>
            <ul style="color: #555;">
              <li>📦 Catálogo completo de productos</li>
              <li>💰 Precios mayoristas exclusivos</li>
              <li>🚚 Gestión de pedidos online</li>
              <li>📊 Historial de compras</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://ianmodas.com/login" style="background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🚀 Acceder a mi cuenta
            </a>
          </div>
          
          <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
            <p><strong>📞 ¿Necesitas ayuda?</strong></p>
            <p>📧 soporte@ianmodas.com | 📱 +598 99 123 456</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© 2025 Ian Modas - Este email fue enviado automáticamente</p>
        </div>
      </div>
    `;

    // Enviar con Resend
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
        html,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Resend error: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email enviado exitosamente',
      emailId: data.id 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error:', error);
    let errorMessage = 'Unknown error';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// ===================================================================
// CONFIGURACIÓN:
// 1. Cuenta gratis en resend.com
// 2. API key en variables de Supabase: RESEND_API_KEY
// 3. Desplegar: supabase functions deploy send-welcome-email
// ===================================================================
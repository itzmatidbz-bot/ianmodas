// ===================================================================
// 🤖 SCRIPT INDEPENDIENTE PARA IA - AGREGAR AL FINAL DE admin.html
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 Inicializando generador de IA...');
    
    // Esperar a que se carguen todos los elementos
    setTimeout(function() {
        const generateBtn = document.getElementById('generate-description-btn');
        const descripcionTextarea = document.getElementById('descripcion');
        const aiFeedback = document.getElementById('ai-feedback');
        const aiStatus = document.getElementById('ai-status');
        
        if (!generateBtn || !descripcionTextarea) {
            console.log('❌ Elementos de IA no encontrados');
            return;
        }
        
        console.log('✅ Elementos de IA encontrados, configurando...');
        
        generateBtn.addEventListener('click', async function() {
            console.log('🚀 Click en botón de IA');
            
            // Obtener datos del formulario
            const nombre = document.getElementById('nombre')?.value.trim() || '';
            const categoria = document.getElementById('categoria')?.value || '';
            const precio = document.getElementById('precio')?.value || '';
            const talla = document.getElementById('talla')?.value || '';
            const color = document.getElementById('color')?.value || '';
            
            console.log('📝 Datos del formulario:', { nombre, categoria, precio, talla, color });
            
            if (!nombre || !categoria) {
                // Mostrar error
                if (aiFeedback) aiFeedback.style.display = 'block';
                if (aiStatus) {
                    aiStatus.className = 'ai-status error';
                    aiStatus.textContent = '⚠️ Completa el nombre y categoría primero';
                }
                
                setTimeout(function() {
                    if (aiFeedback) aiFeedback.style.display = 'none';
                }, 3000);
                return;
            }
            
            // Estado de carga
            generateBtn.disabled = true;
            const originalHTML = generateBtn.innerHTML;
            generateBtn.innerHTML = `
                <span class="ai-icon">⚡</span>
                <span class="ai-text">Generando...</span>
            `;
            
            if (aiFeedback) aiFeedback.style.display = 'block';
            if (aiStatus) {
                aiStatus.className = 'ai-status loading';
                aiStatus.textContent = '🤖 IA está creando tu descripción profesional...';
            }
            
            try {
                console.log('⏳ Simulando generación de IA...');
                
                // Simular delay realista (2.5 segundos)
                await new Promise(resolve => setTimeout(resolve, 2500));
                
                // GENERADOR INTELIGENTE CON MÚLTIPLES TEMPLATES
                const templates = {
                    'Remeras': [
                        `${nombre} confeccionada en algodón premium de alta durabilidad. Ideal para mayoristas que buscan productos versátiles con excelente relación calidad-precio. Su diseño atemporal ${color ? `y atractivo color ${color}` : ''} la convierte en una opción segura para todo tipo de cliente. Perfecta para reventa en boutiques, tiendas casuales y locales de moda urbana.`,
                        `${nombre} de corte moderno y máxima comodidad, diseñada especialmente para el mercado mayorista. Fabricada con materiales de primera calidad que garantizan durabilidad y suavidad al tacto. Su versatilidad la hace perfecta para diferentes estilos y ocasiones, asegurando alta rotación en tu negocio.`,
                        `${nombre} con acabado profesional y diseño contemporáneo. Esta prenda combina funcionalidad y estilo, ideal para revendedores que buscan productos con amplia aceptación en el mercado. ${talla ? `En talla ${talla}, ` : ''}representa una inversión inteligente para tu inventario de temporada.`
                    ],
                    'Pantalones': [
                        `${nombre} con diseño contemporáneo y confección superior, ideal para mayoristas exigentes. Combina comodidad, estilo y durabilidad en una prenda versátil que se adapta a múltiples ocasiones. ${talla ? `Disponible en talla ${talla}, ` : ''}perfecto para clientela que busca calidad y buen precio.`,
                        `${nombre} de alta calidad, especialmente diseñado para el mercado de reventa. Su corte favorecedor y materiales resistentes lo convierten en una inversión segura para tu negocio. Ideal para tiendas que buscan productos con alta demanda y excelente margen de ganancia.`,
                        `${nombre} con características técnicas superiores y diseño versátil. Perfecto para mayoristas que atienden diversos segmentos de mercado. ${color ? `El color ${color} complementa su línea moderna,` : ''} garantizando alta rotación y satisfacción del cliente final.`
                    ],
                    'Vestidos': [
                        `${nombre} elegante y versátil, perfecto para mayoristas del rubro moda femenina. Su diseño sofisticado y confección impecable lo posicionan como una pieza clave en cualquier colección. ${color ? `El color ${color} aporta distinción y modernidad, ` : ''}garantizando alta aceptación en el mercado objetivo.`,
                        `${nombre} de línea moderna y acabado profesional, ideal para revendedores que priorizan la calidad. Su versatilidad permite adaptarse a diferentes ocasiones, desde eventos casuales hasta compromisos más formales. Una inversión inteligente para tu catálogo de productos.`,
                        `${nombre} con diseño atemporal y confección de primera. Especialmente creado para el canal mayorista, combina elegancia y funcionalidad en una prenda que garantiza excelente rotación. Perfecto para boutiques y tiendas especializadas en moda femenina.`
                    ],
                    'default': [
                        `${nombre} de excelente calidad, especialmente diseñado para el mercado mayorista. Este producto de ${categoria} combina durabilidad, estilo y funcionalidad, ofreciendo una excelente oportunidad de negocio para revendedores. Su versatilidad y acabado profesional garantizan alta rotación.`,
                        `${nombre} premium con características ideales para mayoristas exigentes. Fabricado con materiales de primera calidad y atención al detalle, este producto de ${categoria} representa una inversión segura para tu negocio. Perfecto para clientela que busca productos confiables.`,
                        `${nombre} de línea comercial superior, diseñado específicamente para el canal mayorista. Su combinación de estilo moderno y resistencia comprobada lo convierte en una opción estratégica para tu inventario. ${color ? `El color ${color} complementa perfectamente su diseño versátil.` : ''}`
                    ]
                };
                
                // Seleccionar template inteligente
                const categoryTemplates = templates[categoria] || templates['default'];
                const descripcion = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
                
                console.log('✅ Descripción generada:', descripcion);
                
                // Animación de escritura tipo máquina de escribir
                descripcionTextarea.value = '';
                let i = 0;
                
                const typeWriter = function() {
                    if (i < descripcion.length) {
                        descripcionTextarea.value += descripcion.charAt(i);
                        i++;
                        setTimeout(typeWriter, 25); // 25ms entre caracteres
                    }
                };
                typeWriter();
                
                // Mostrar éxito
                if (aiStatus) {
                    aiStatus.className = 'ai-status success';
                    aiStatus.textContent = '✅ Descripción generada con IA inteligente';
                }
                
            } catch (error) {
                console.error('❌ Error generando descripción:', error);
                
                if (aiStatus) {
                    aiStatus.className = 'ai-status error';
                    aiStatus.textContent = '❌ Error - usando descripción de respaldo';
                }
                
                // Fallback básico pero profesional
                const fallback = `${nombre} de alta calidad para mayoristas. Producto versátil de ${categoria} con excelente relación precio-calidad. ${color ? `En color ${color}, ` : ''}ideal para reventa y alta rotación en tu negocio.`;
                descripcionTextarea.value = fallback;
                
            } finally {
                // Restaurar botón después de un momento
                setTimeout(function() {
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = originalHTML;
                }, 1000);
                
                // Ocultar feedback después de 4 segundos
                setTimeout(function() {
                    if (aiFeedback) aiFeedback.style.display = 'none';
                }, 4000);
            }
        });
        
        console.log('🎉 Generador de IA configurado exitosamente');
        
    }, 1500); // Esperar 1.5 segundos para que cargue todo
});

console.log('📜 Script de IA cargado');
// ===================================================================
// 🤖 SCRIPT INDEPENDIENTE PARA IA - AGREGAR AL FINAL DE admin.html
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🤖 Inicializando generador de IA...');
    
    // Prevenir múltiples inicializaciones
    if (window.iaGeneratorInitialized) {
        console.log('⚠️ IA ya inicializada, saltando...');
        return;
    }
    window.iaGeneratorInitialized = true;
    
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
            
            // Prevenir múltiples clicks mientras está generando
            if (generateBtn.disabled) {
                console.log('⚠️ Generación en proceso, ignorando click');
                return;
            }
            
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
                
                // GENERADOR INTELIGENTE CON TEMPLATES MEJORADOS
                const templates = {
                    'Remeras': [
                        `${nombre} fabricada con materiales de primera calidad, diseñada específicamente para el mercado mayorista. Su corte versátil y acabado profesional la posicionan como una opción estratégica para revendedores. ${color ? `El color ${color} añade versatilidad comercial, ` : ''}perfecta para boutiques, tiendas de moda casual y locales urbanos que buscan productos con alta rotación.`,
                        `${nombre} con diseño contemporáneo y confección superior. Combina comodidad, durabilidad y estilo en una prenda ideal para mayoristas exigentes. Su tejido de calidad premium garantiza satisfacción del cliente final, mientras que su precio competitivo asegura márgenes atractivos para tu negocio.`,
                        `${nombre} de línea comercial premium, especialmente desarrollada para el canal de reventa. ${talla ? `Disponible en talla ${talla}, ` : ''}esta prenda destaca por su versatilidad estacional y amplia aceptación en diferentes segmentos de mercado. Una inversión segura para inventarios de alto movimiento.`
                    ],
                    'Pantalones': [
                        `${nombre} con ingeniería textil avanzada y corte anatómico, desarrollado para mayoristas del sector indumentaria. Su diseño ergonómico y materiales de alta resistencia ofrecen comodidad duradera y estilo contemporáneo. ${talla ? `En talla ${talla}, ` : ''}ideal para retailers que priorizan la satisfacción del cliente y márgenes competitivos.`,
                        `${nombre} de construcción premium y acabado impecable, especialmente creado para el mercado de reventa profesional. Su versatilidad de uso y resistencia al desgaste lo convierten en una pieza fundamental para inventarios estratégicos. Perfecto para tiendas multisegmento que buscan productos de rotación garantizada.`,
                        `${nombre} con tecnología textil superior y diseño comercial inteligente. ${color ? `Su color ${color} se adapta a múltiples combinaciones, ` : ''}maximizando las posibilidades de venta. Representa una inversión sólida para mayoristas que atienden clientela diversificada y exigente en calidad-precio.`
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
                console.log('📝 Longitud descripción:', descripcion.length);
                
                // VERSIÓN CORREGIDA: Escribir directamente (sin typewriter bugueado)
                descripcionTextarea.value = '';
                descripcionTextarea.value = descripcion;
                
                // Efecto visual de "aparición" suave
                descripcionTextarea.style.opacity = '0';
                setTimeout(function() {
                    descripcionTextarea.style.transition = 'opacity 0.5s ease-in';
                    descripcionTextarea.style.opacity = '1';
                }, 100);
                
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
        console.log('🔧 Version: Script independiente v2.0 (sin duplicación)');
        
    }, 1500); // Esperar 1.5 segundos para que cargue todo
});

console.log('📜 Script de IA independiente cargado - versión corregida');
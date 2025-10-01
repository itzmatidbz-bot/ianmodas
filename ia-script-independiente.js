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
            
            // Obtener datos avanzados del formulario
            const nombre = document.getElementById('nombre')?.value.trim() || '';
            const categoria = document.getElementById('categoria')?.selectedOptions[0]?.text || '';
            const tipoPrenda = document.getElementById('tipo-prenda')?.selectedOptions[0]?.text || '';
            const estilo = document.getElementById('estilo')?.selectedOptions[0]?.text || '';
            const color = document.getElementById('color')?.selectedOptions[0]?.text || '';
            const genero = document.getElementById('genero')?.value || 'mujer';
            const temporada = document.getElementById('temporada')?.value || 'todo_año';
            const linea = document.getElementById('linea')?.selectedOptions[0]?.text || '';
            const precio = document.getElementById('precio')?.value || '';
            
            console.log('📝 Datos avanzados del formulario:', { 
                nombre, categoria, tipoPrenda, estilo, color, genero, temporada, linea, precio 
            });
            
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
                
                // GENERADOR INTELIGENTE CON TEMPLATES ULTRA ESPECÍFICOS
                const templates = {
                    'Tops': [
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `de estilo ${estilo.toLowerCase()}` : ''} fabricada con materiales premium especialmente para el mercado mayorista de moda femenina. ${color ? `Su elegante color ${color.toLowerCase()} la convierte en una pieza versátil` : 'Su diseño versátil'} ideal para ${genero === 'mujer' ? 'clientela femenina exigente' : 'todo tipo de clientela'}. ${temporada !== 'todo_año' ? `Perfecta para la temporada ${temporada.replace('_', '/')}, ` : ''}garantiza alta rotación en boutiques y tiendas especializadas. Línea ${linea} con acabado profesional y márgenes competitivos.`,
                        
                        `${nombre}: ${tipoPrenda ? `${tipoPrenda.toLowerCase()} ` : 'prenda '}de construcción superior con corte ${estilo ? estilo.toLowerCase() : 'moderno'} y confección impecable. ${color ? `El color ${color.toLowerCase()} añade sofisticación` : 'Su diseño sofisticado'} y amplía las posibilidades comerciales para mayoristas del sector indumentaria. Desarrollada específicamente para el mercado ${genero}, combina tendencias actuales con la durabilidad que demandan los revendedores profesionales.`,
                        
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `estilo ${estilo.toLowerCase()}` : ''} de línea ${linea} - la inversión perfecta para tu inventario mayorista. ${color ? `Su vibrante color ${color.toLowerCase()} garantiza` : 'Su diseño garantiza'} excelente aceptación en el mercado objetivo. ${temporada !== 'todo_año' ? `Ideal para ${temporada.replace('_', '/')}, ` : ''}combina calidad premium con precio estratégico para maximizar tus márgenes de ganancia.`
                    ],
                    
                    'Pantalones': [
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `de corte ${estilo.toLowerCase()}` : ''} con ingeniería textil avanzada para mayoristas especializados. ${color ? `Su color ${color.toLowerCase()} versátil se adapta a múltiples combinaciones, ` : ''}maximizando las oportunidades de venta. ${genero === 'mujer' ? 'Diseñado para la silueta femenina moderna' : 'Corte universal'}, este producto de línea ${linea} representa una inversión segura con alta rotación garantizada.`,
                        
                        `${nombre}: ${tipoPrenda ? `${tipoPrenda.toLowerCase()} ` : 'pantalón '}${estilo ? `estilo ${estilo.toLowerCase()}` : ''} de construcción premium y acabado impecable. ${temporada !== 'todo_año' ? `Perfecto para ${temporada.replace('_', '/')}, ` : ''}combina comodidad, durabilidad y diseño contemporáneo en una prenda ideal para revendedores exigentes. ${color ? `El color ${color.toLowerCase()} aporta versatilidad comercial` : 'Su versatilidad comercial'} y asegura márgenes atractivos.`,
                        
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `corte ${estilo.toLowerCase()}` : ''} - tecnología textil superior para el mercado mayorista. Especialmente desarrollado para ${genero === 'mujer' ? 'moda femenina' : 'clientela diversa'}, este producto de línea ${linea} destaca por su resistencia al desgaste y estilo atemporal. ${color ? `Su elegante color ${color.toLowerCase()} complementa` : 'Su diseño complementa'} perfectamente cualquier colección comercial.`
                    ],
                    
                    'Vestidos': [
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `estilo ${estilo.toLowerCase()}` : ''} de confección excepcional, diseñado exclusivamente para mayoristas del sector moda femenina. ${color ? `Su deslumbrante color ${color.toLowerCase()} aporta elegancia` : 'Su elegancia'} y distinción, posicionándolo como pieza clave en cualquier inventario estratégico. ${temporada !== 'todo_año' ? `Ideal para ${temporada.replace('_', '/')}, ` : ''}línea ${linea} con garantía de alta rotación.`,
                        
                        `${nombre}: ${tipoPrenda ? `${tipoPrenda.toLowerCase()} ` : 'vestido '}${estilo ? `de diseño ${estilo.toLowerCase()}` : ''} con acabado profesional premium. Combina sofisticación y funcionalidad en una prenda perfecta para boutiques especializadas. ${color ? `El color ${color.toLowerCase()} maximiza` : 'Su diseño maximiza'} las posibilidades de venta, mientras que su versatilidad de uso garantiza satisfacción del cliente final y márgenes competitivos.`,
                        
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `estilo ${estilo.toLowerCase()}` : ''} - inversión inteligente para mayoristas del rubro moda. Su diseño atemporal y calidad superior lo convierten en una pieza fundamental para inventarios de alta rotación. ${color ? `Su color ${color.toLowerCase()} versátil` : 'Su versatilidad'} permite adaptarse a diferentes ocasiones, desde eventos casuales hasta compromisos formales.`
                    ],
                    
                    'Faldas': [
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `de corte ${estilo.toLowerCase()}` : ''} fabricada con precisión para el mercado mayorista especializado. ${color ? `Su sofisticado color ${color.toLowerCase()} la convierte` : 'Su diseño la convierte'} en una pieza versátil perfecta para clientela femenina moderna. ${temporada !== 'todo_año' ? `Especial para ${temporada.replace('_', '/')}, ` : ''}línea ${linea} con calidad premium y márgenes atractivos.`,
                        
                        `${nombre}: ${tipoPrenda ? `${tipoPrenda.toLowerCase()} ` : 'falda '}${estilo ? `estilo ${estilo.toLowerCase()}` : ''} de construcción superior y acabado impecable. Diseñada específicamente para revendedores que priorizan la calidad y el estilo. ${color ? `El color ${color.toLowerCase()} añade` : 'Su diseño añade'} distinción y modernidad, garantizando excelente aceptación en el mercado objetivo.`
                    ],
                    
                    'Conjuntos': [
                        `${nombre}: conjunto ${estilo ? `estilo ${estilo.toLowerCase()}` : ''} de coordinación perfecta para mayoristas del sector moda. ${color ? `Su armonioso color ${color.toLowerCase()} crea` : 'Su diseño crea'} un look completo y sofisticado ideal para ${genero === 'mujer' ? 'clientela femenina' : 'todo tipo de clientela'}. ${temporada !== 'todo_año' ? `Perfecto para ${temporada.replace('_', '/')}, ` : ''}línea ${linea} con garantía de alta rotación y márgenes competitivos.`,
                        
                        `${nombre} ${estilo ? `de diseño ${estilo.toLowerCase()}` : ''} - set completo de calidad premium para mayoristas exigentes. Combina elegancia y funcionalidad en un producto estratégico para tu inventario. ${color ? `Su color ${color.toLowerCase()} versátil maximiza` : 'Su versatilidad maximiza'} las oportunidades comerciales y asegura satisfacción del cliente final.`
                    ],
                    
                    'default': [
                        `${nombre} de línea ${linea} - ${tipoPrenda ? `${tipoPrenda.toLowerCase()} ` : 'prenda '}${estilo ? `estilo ${estilo.toLowerCase()}` : ''} especialmente diseñada para el mercado mayorista. ${color ? `Su elegante color ${color.toLowerCase()} la posiciona` : 'Su diseño la posiciona'} como una opción estratégica para revendedores de ${genero === 'mujer' ? 'moda femenina' : 'indumentaria'}. ${temporada !== 'todo_año' ? `Ideal para ${temporada.replace('_', '/')}, ` : ''}combina calidad superior con precio competitivo.`,
                        
                        `${tipoPrenda ? `${tipoPrenda} ` : ''}${nombre} ${estilo ? `de corte ${estilo.toLowerCase()}` : ''} fabricado con materiales premium y atención al detalle. Este producto de ${categoria} ${color ? `en color ${color.toLowerCase()}` : ''} representa una inversión segura para mayoristas que atienden clientela exigente. Línea ${linea} con garantía de rotación y márgenes atractivos.`,
                        
                        `${nombre}: ${categoria.toLowerCase()} ${estilo ? `estilo ${estilo.toLowerCase()}` : ''} de construcción superior para mayoristas especializados. ${color ? `Su color ${color.toLowerCase()} añade` : 'Su diseño añade'} versatilidad comercial y amplía las posibilidades de venta. ${temporada !== 'todo_año' ? `Perfecto para ${temporada.replace('_', '/')}, ` : ''}ideal para inventarios de alta rotación con márgenes competitivos.`
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
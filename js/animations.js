/**
 * 🎭 IAN MODAS - ANIMACIONES SILICON VALLEY
 * Animaciones profesionales para mejorar la UX
 */

// Intersection Observer para animaciones al scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Animación de entrada para elementos
const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Animación del header al scroll
let lastScrollY = window.scrollY;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    // Agregar clase scrolled al header
    if (currentScrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScrollY = currentScrollY;
});

// Animaciones de hover mejoradas para las tarjetas de producto
document.addEventListener('DOMContentLoaded', () => {
    // Observar elementos para animaciones
    const elementsToAnimate = document.querySelectorAll('.product-card, .stat-card, .contact__card');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        animateOnScroll.observe(el);
    });
    
    // Efecto parallax suave para el hero
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero__content');
    
    if (hero && heroContent) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            if (scrolled < hero.offsetHeight) {
                heroContent.style.transform = `translateY(${rate}px)`;
            }
        });
    }
    
    // Animación de conteo para las estadísticas
    const stats = document.querySelectorAll('.stat__number');
    
    const animateCounter = (element, target) => {
        const duration = 2000;
        const start = performance.now();
        const initialValue = 0;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Función de easing
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(initialValue + (target * easeOut));
            
            if (element.textContent.includes('+')) {
                element.textContent = currentValue.toLocaleString() + '+';
            } else if (element.textContent.includes('/')) {
                element.textContent = target; // Para "24/7"
            } else {
                element.textContent = currentValue.toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    };
    
    // Observer para las estadísticas
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const text = entry.target.textContent;
                let targetNumber;
                
                if (text.includes('1000+')) {
                    targetNumber = 1000;
                } else if (text.includes('98K+')) {
                    targetNumber = 98000;
                } else if (text.includes('24/7')) {
                    return; // No animar este
                }
                
                if (targetNumber) {
                    animateCounter(entry.target, targetNumber);
                    statsObserver.unobserve(entry.target);
                }
            }
        });
    }, observerOptions);
    
    stats.forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // Efecto de hover mejorado para botones
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function(e) {
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                width: 0;
                height: 0;
                left: ${e.offsetX}px;
                top: ${e.offsetY}px;
                transform: translate(-50%, -50%);
                transition: width 0.6s, height 0.6s;
                pointer-events: none;
                z-index: 0;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.style.width = '200px';
                ripple.style.height = '200px';
            }, 10);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Animación para el logo
    const logo = document.querySelector('.nav__logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Scroll suave al top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Efecto de pulse en el logo
            logo.style.animation = 'none';
            setTimeout(() => {
                logo.style.animation = 'logoClick 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            }, 10);
        });
    }
    
    // Animación de aparición escalonada para el grid de productos
    const productGrid = document.querySelector('.product-grid');
    if (productGrid) {
        const observeProducts = new MutationObserver(() => {
            const products = productGrid.querySelectorAll('.product-card');
            products.forEach((product, index) => {
                if (!product.style.animationDelay) {
                    product.style.animationDelay = `${index * 0.1}s`;
                    product.classList.add('animate-in');
                }
            });
        });
        
        observeProducts.observe(productGrid, { childList: true, subtree: true });
    }
});

// CSS en JS para las animaciones adicionales
const additionalStyles = `
@keyframes logoClick {
    0% { transform: scale(1) rotate(0deg); }
    50% { transform: scale(1.1) rotate(2deg); }
    100% { transform: scale(1) rotate(0deg); }
}

.animate-in {
    animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Efecto de shimmer mejorado */
.shimmer {
    background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(255, 255, 255, 0.4) 50%, 
        transparent 100%);
    background-size: 200% 100%;
    animation: shimmerMove 2s infinite;
}

@keyframes shimmerMove {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

/* Mejoras para el loading state */
.loading-pulse {
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
`;

// Agregar estilos al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
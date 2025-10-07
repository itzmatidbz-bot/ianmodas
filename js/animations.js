/**
 * 🎭 IAN MODAS - ANIMACIONES SILICON VALLEY
 * Animaciones profesionales estilo Silicon Valley para UX premium
 */

// Configuración avanzada del Intersection Observer
const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -80px 0px",
};

// Sistema de animaciones escalonadas
const staggerDelay = 150; // ms entre animaciones

// Animación de entrada con efectos escalonados
const animateOnScroll = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0) scale(1)";
        entry.target.classList.add("animated");
        
        // Efecto de resplandor sutil
        entry.target.style.boxShadow = "0 8px 32px rgba(255, 77, 141, 0.1)";
        
        // Remover el resplandor después de la animación
        setTimeout(() => {
          if (!entry.target.matches(":hover")) {
            entry.target.style.boxShadow = "";
          }
        }, 600);
      }, index * 100);
      
      // Unobserve after animation to improve performance
      animateOnScroll.unobserve(entry.target);
    }
  });
}, observerOptions);

// Sistema avanzado de scroll con efectos premium
let lastScrollY = window.scrollY;
let ticking = false;
const header = document.querySelector(".header");

function updateScrollEffects() {
  const currentScrollY = window.scrollY;
  const scrollDirection = currentScrollY > lastScrollY ? "down" : "up";
  const scrollProgress = Math.min(currentScrollY / 150, 1);

  if (header) {
    // Efecto de desvanecimiento y blur progresivo mejorado
    const opacity = 0.85 + scrollProgress * 0.15;
    const blurAmount = 25 + scrollProgress * 15;
    
    header.style.background = `rgba(255, 255, 255, ${opacity})`;
    header.style.backdropFilter = `blur(${blurAmount}px)`;
    header.style.webkitBackdropFilter = `blur(${blurAmount}px)`;
    
    // Auto-hide header en scroll down (solo en desktop)
    if (window.innerWidth > 768) {
      if (currentScrollY > 100) {
        header.classList.add("scrolled");
        if (scrollDirection === "down" && currentScrollY > 300) {
          header.style.transform = "translateY(-100%)";
          header.style.opacity = "0.95";
        } else {
          header.style.transform = "translateY(0)";
          header.style.opacity = "1";
        }
      } else {
        header.classList.remove("scrolled");
        header.style.transform = "translateY(0)";
        header.style.opacity = "1";
      }
    } else {
      // En móvil, mantener header siempre visible
      header.style.transform = "translateY(0)";
      header.style.opacity = "1";
      if (currentScrollY > 50) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }
  }

  lastScrollY = currentScrollY;
  ticking = false;
}

// Throttled scroll listener con detección de dispositivo
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}, { passive: true });

// Animaciones de hover mejoradas para las tarjetas de producto
document.addEventListener("DOMContentLoaded", () => {
  // Observar elementos para animaciones
  const elementsToAnimate = document.querySelectorAll(
    ".product-card, .stat-card, .contact__card",
  );
  elementsToAnimate.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    animateOnScroll.observe(el);
  });

  // Efecto parallax suave para el hero
  const hero = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero__content");

  if (hero && heroContent) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;

      if (scrolled < hero.offsetHeight) {
        heroContent.style.transform = `translateY(${rate}px)`;
      }
    });
  }

  // Animación de conteo para las estadísticas
  const stats = document.querySelectorAll(".stat__number");

  const animateCounter = (element, target) => {
    const duration = 2000;
    const start = performance.now();
    const initialValue = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Función de easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(initialValue + target * easeOut);

      if (element.textContent.includes("+")) {
        element.textContent = currentValue.toLocaleString() + "+";
      } else if (element.textContent.includes("/")) {
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
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const text = entry.target.textContent;
        let targetNumber;

        if (text.includes("1000+")) {
          targetNumber = 1000;
        } else if (text.includes("98K+")) {
          targetNumber = 98000;
        } else if (text.includes("24/7")) {
          return; // No animar este
        }

        if (targetNumber) {
          animateCounter(entry.target, targetNumber);
          statsObserver.unobserve(entry.target);
        }
      }
    });
  }, observerOptions);

  stats.forEach((stat) => {
    statsObserver.observe(stat);
  });

  // Sistema avanzado de micro-interacciones para botones
  const buttons = document.querySelectorAll(".btn");
  buttons.forEach((btn) => {
    // Efecto ripple mejorado
    btn.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        transform: scale(0);
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        z-index: 0;
      `;

      this.style.position = "relative";
      this.style.overflow = "hidden";
      this.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = "scale(1)";
      });

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });

    // Efecto de hover con transformación suave
    btn.addEventListener("mouseenter", function() {
      this.style.transform = "translateY(-2px) scale(1.02)";
      this.style.boxShadow = "0 8px 25px rgba(255, 77, 141, 0.3)";
    });

    btn.addEventListener("mouseleave", function() {
      this.style.transform = "translateY(0) scale(1)";
      this.style.boxShadow = "";
    });

    // Efecto de presión
    btn.addEventListener("mousedown", function() {
      this.style.transform = "translateY(0) scale(0.98)";
    });

    btn.addEventListener("mouseup", function() {
      this.style.transform = "translateY(-2px) scale(1.02)";
    });
  });

  // Micro-interacciones para elementos interactivos
  const interactiveElements = document.querySelectorAll(".product-card, .nav__link, .filter-select");
  interactiveElements.forEach(element => {
    element.addEventListener("mouseenter", function() {
      this.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
    });
  });

  // Animación para el logo
  const logo = document.querySelector(".nav__logo");
  if (logo) {
    logo.addEventListener("click", (e) => {
      e.preventDefault();

      // Scroll suave al top
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Efecto de pulse en el logo
      logo.style.animation = "none";
      setTimeout(() => {
        logo.style.animation = "logoClick 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      }, 10);
    });
  }

  // Animación de aparición escalonada para el grid de productos
  const productGrid = document.querySelector(".product-grid");
  if (productGrid) {
    const observeProducts = new MutationObserver(() => {
      const products = productGrid.querySelectorAll(".product-card");
      products.forEach((product, index) => {
        if (!product.style.animationDelay) {
          product.style.animationDelay = `${index * 0.1}s`;
          product.classList.add("animate-in");
        }
      });
    });

    observeProducts.observe(productGrid, { childList: true, subtree: true });
  }
});

// Finalización del archivo de animaciones
console.log('🎨 Sistema de animaciones IAN MODAS cargado correctamente');

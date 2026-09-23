/**
 * CASA ATMÓSFERA
 * Landing Page - Core Logic
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1. PRELOADER & INTRO LOGIC
       ============================================================ */
    const preloader = document.getElementById('preloader');
    const introScreen = document.getElementById('intro-screen');
    const landing = document.getElementById('landing');
    const btnDiscover = document.getElementById('btn-discover');

    // Deshabilitar scroll en el body mientras se ve el preloader/intro
    document.body.style.overflow = 'hidden';

    // 1. Quitar preloader después de 1 segundo (como pedido en el brief)
    setTimeout(() => {
        preloader.classList.add('fade-out');
        // El preloader tiene z-index 9999, intro-screen 1000
    }, 1200);

    // 2. Click en "Descubrir" -> quita intro, muestra landing y hace scroll a #casas
    if (btnDiscover) {
        btnDiscover.addEventListener('click', () => {
            // Fade out hero
            introScreen.classList.add('fade-out');
            
            // Mostrar landing 
            landing.classList.remove('landing-hidden');
            landing.classList.add('landing-visible');

            // Habilitar scroll del body
            document.body.style.overflow = '';

            // Pequeño timeout para permitir que la vista actualice antes de hacer scroll suave
            setTimeout(() => {
                const casasSection = document.getElementById('casas');
                if (casasSection) {
                    casasSection.scrollIntoView({ behavior: 'smooth' });
                }
                
                // Reiniciar observers para que detecten los elementos recién mostrados
                initScrollObserver();
            }, 50);
        });
    }


    /* ============================================================
       2. SCROLL REVEAL ANIMATIONS (Intersection Observer)
       ============================================================ */
    let observer;

    function initScrollObserver() {
        const revealElements = document.querySelectorAll('.reveal');
        
        if (observer) {
            observer.disconnect();
        }

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Opcional: dejar de observar si solo queremos que anime una vez
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    }


    /* ============================================================
       3. NAVBAR SCROLL EFFECT
       ============================================================ */
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (!landing.classList.contains('landing-visible')) return;

        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });


    /* ============================================================
       4. MOBILE MENU (Hamburger)
       ============================================================ */
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.getElementById('nav-links');
    const navLinks = document.querySelectorAll('.nav-link, .btn-nav-cta');

    if (hamburger && navLinksContainer) {
        hamburger.addEventListener('click', () => {
            const isOpen = hamburger.classList.toggle('is-open');
            navLinksContainer.classList.toggle('nav-open');
            hamburger.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinksContainer.classList.contains('nav-open')) {
                    hamburger.classList.remove('is-open');
                    navLinksContainer.classList.remove('nav-open');
                    hamburger.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                }
            });
        });
    }


    /* ============================================================
       5. OVERLAYS (TRES CASAS)
       ============================================================ */
    const casaCols = document.querySelectorAll('.casa-col');
    const overlays = document.querySelectorAll('.casa-overlay');
    const closeButtons = document.querySelectorAll('.ov-close');
    const closeTriggers = document.querySelectorAll('.ov-close-trigger'); // Botones CTA dentro del overlay

    // Función para abrir overlay
    function openOverlay(casaId) {
        const targetOverlay = document.getElementById(`overlay-${casaId}`);
        if (!targetOverlay) return;

        targetOverlay.hidden = false;
        
        // Bloquear scroll de la página principal
        document.body.style.overflow = 'hidden';

        // Pequeño timeout para forzar reflow y aplicar animación
        requestAnimationFrame(() => {
            targetOverlay.classList.remove('ov-closing');
            targetOverlay.classList.add('ov-open');
        });
    }

    // Función para cerrar overlay
    function closeOverlay(targetOverlay) {
        if (!targetOverlay) return;

        targetOverlay.classList.remove('ov-open');
        targetOverlay.classList.add('ov-closing');
        
        // Desbloquear scroll
        document.body.style.overflow = '';

        // Esperar a que termine la animación antes de ocultar (coincide con transition 0.85s)
        setTimeout(() => {
            if (targetOverlay.classList.contains('ov-closing')) {
                targetOverlay.hidden = true;
                targetOverlay.classList.remove('ov-closing');
            }
        }, 900);
    }

    // Click en cada columna de Casa
    casaCols.forEach(col => {
        col.addEventListener('click', () => {
            const casaId = col.getAttribute('data-casa');
            openOverlay(casaId);
        });

        // Soporte teclado (accesibilidad)
        col.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const casaId = col.getAttribute('data-casa');
                openOverlay(casaId);
            }
        });
    });

    // Click en botón de cerrar
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const overlayId = btn.getAttribute('data-overlay');
            const targetOverlay = document.getElementById(overlayId);
            closeOverlay(targetOverlay);
        });
    });

    // Click en botón CTA del overlay (cierra overlay y va al form)
    closeTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const overlayId = trigger.getAttribute('data-overlay');
            const targetOverlay = document.getElementById(overlayId);
            
            closeOverlay(targetOverlay);
            
            // Cerrar y hacer scroll hacia #formulario se maneja vía href="#formulario" nativo,
            // pero como estamos desbloqueando scroll asíncronamente, aseguramos el scroll después de cerrar:
            const targetHref = trigger.getAttribute('href');
            if (targetHref && targetHref.startsWith('#')) {
                const targetSection = document.querySelector(targetHref);
                if (targetSection) {
                    setTimeout(() => {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                }
            }
        });
    });


    /* ============================================================
       6. FORM SUBMISSION (Simulación)
       ============================================================ */
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Aquí iría la lógica de envío real (fetch, ajax, etc.)
            // Por ahora, simulamos estado de éxito:

            // Simple validation check
            const nombre = document.getElementById('f-nombre').value;
            const email = document.getElementById('f-email').value;
            const whatsapp = document.getElementById('f-whatsapp').value;
            const casa = document.getElementById('f-casa').value;

            if (!nombre || !email || !whatsapp || !casa) {
                alert('Por favor completa los campos requeridos (Nombre, WhatsApp, Email y Casa).');
                return;
            }

            const btnSubmit = document.getElementById('form-submit-btn');
            const originalText = btnSubmit.textContent;
            btnSubmit.textContent = 'Enviando...';
            btnSubmit.style.opacity = '0.7';
            btnSubmit.disabled = true;

            setTimeout(() => {
                contactForm.style.display = 'none';
                formSuccess.hidden = false;
            }, 1000);
        });
    }

});

// Preloader Logic
window.addEventListener('load', () => {
    setTimeout(() => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
            setTimeout(() => preloader.remove(), 800);
        }
    }, 1000); // 1s
});

document.addEventListener('DOMContentLoaded', () => {
    // Feather Icons Init
    if (typeof feather !== 'undefined') feather.replace();

    const btnDiscover    = document.getElementById('btn-discover');
    const introScreen    = document.getElementById('intro-screen');
    const splashEl       = document.getElementById('splash-selection');
    const mainContent    = document.getElementById('main-content');
    const casaOptions    = document.querySelectorAll('.casa-option');

    // ── 1. Botón Descubrir ➔ Muestra las 3 Casas ──────────────
    if (btnDiscover && introScreen && splashEl) {
        btnDiscover.addEventListener('click', () => {
            // Desaparecer intro
            introScreen.style.transition = 'opacity 1s ease, visibility 1s ease';
            introScreen.style.opacity    = '0';
            introScreen.style.visibility = 'hidden';

            setTimeout(() => {
                introScreen.remove();

                // Mostrar Splash (las 3 casas)
                splashEl.classList.remove('hidden-initially');
                splashEl.style.transition    = 'opacity 0s';
                splashEl.style.opacity       = '1';
                splashEl.style.visibility    = 'visible';
                splashEl.style.pointerEvents = 'auto';

                // Activar animación de entrada en cascada
                casaOptions.forEach((panel, i) => {
                    setTimeout(() => {
                        panel.classList.add('panel-animate');
                    }, 50); 
                });

            }, 800);
        });
    }

    // ── 2. Click en Casa ➔ Muestra el Main Content ──────────────────
    if (casaOptions.length > 0 && mainContent && splashEl) {
        casaOptions.forEach(option => {
            option.addEventListener('click', () => {
                const casa = option.getAttribute('data-casa');

                // Colapsar otras
                casaOptions.forEach(opt => {
                    if (opt !== option) opt.style.flex = '0';
                });

                // Expandir seleccionada
                option.style.flex = '5';
                document.body.className = 'theme-' + casa;

                // Transición a la landing page
                setTimeout(() => {
                    splashEl.style.transition  = 'opacity 0.8s ease, visibility 0.8s ease';
                    splashEl.style.opacity     = '0';
                    splashEl.style.visibility  = 'hidden';
                    splashEl.style.pointerEvents = 'none';

                    setTimeout(() => {
                        splashEl.style.display = 'none';

                        mainContent.classList.remove('hidden-initially');
                        mainContent.classList.add('show-content');
                        if (typeof feather !== 'undefined') feather.replace();
                        setupScrollAnimations();
                        window.scrollTo({ top: 0, behavior: 'smooth' });

                    }, 800);
                }, 600);
            });
        });
    }

    // ── Navbar blur scroll ────────────────────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // ── Intersection Observer for Scroll Animations ─────────────────
    function setupScrollAnimations() {
        const fadeEls = document.querySelectorAll('.fade-in:not(.visible)');
        if (!fadeEls.length) return;

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

        fadeEls.forEach(el => observer.observe(el));
    }
});

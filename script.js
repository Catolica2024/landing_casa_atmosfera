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

            // Pop up Socia Fundadora despues de 2 segundos
            setTimeout(() => {
                const popupWrapper = document.getElementById('popup-fundadora-wrapper');
                if(popupWrapper) {
                    popupWrapper.hidden = false;
                    document.body.style.overflow = 'hidden';
                    
                    // Allow display block to apply before adding opacity class
                    requestAnimationFrame(() => {
                        popupWrapper.classList.add('open');
                    });
                }
            }, 2000);
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
       6. FORM SUBMISSION + VALIDACIÓN
       ============================================================ */
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    // ── Helpers de validación ──────────────────────────────────
    const VALIDATORS = {
        nombre: {
            validate: (v) => v.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/.test(v.trim()),
            msg: 'Ingresa tu nombre completo (solo letras, mín. 2 caracteres).'
        },
        whatsapp: {
            validate: (v) => /^[\+]?[\d\s\-\(\)]{7,15}$/.test(v.trim()),
            msg: 'Ingresa un número de WhatsApp válido (ej: +51 999 999 999).'
        },
        email: {
            validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
            msg: 'Ingresa un correo electrónico válido (ej: tu@correo.com).'
        },
        casa: {
            validate: (v) => v !== '' && v !== null,
            msg: 'Por favor elige una Casa de interés.'
        },
        mensaje: {
            validate: (v) => v.trim().length === 0 || v.trim().length <= 500,
            msg: 'El mensaje no puede superar los 500 caracteres.'
        }
    };

    function showFieldError(fieldId, msg) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.add('field-error');
        let errEl = field.parentNode.querySelector('.field-error-msg');
        if (!errEl) {
            errEl = document.createElement('span');
            errEl.className = 'field-error-msg';
            field.parentNode.appendChild(errEl);
        }
        errEl.textContent = msg;
        errEl.style.display = 'block';
    }

    function clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;
        field.classList.remove('field-error');
        const errEl = field.parentNode.querySelector('.field-error-msg');
        if (errEl) errEl.style.display = 'none';
    }

    function clearAllErrors() {
        ['f-nombre','f-whatsapp','f-email','f-casa','f-mensaje'].forEach(clearFieldError);
    }

    // Validación en tiempo real al salir de cada campo
    ['f-nombre','f-whatsapp','f-email','f-casa','f-mensaje'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const key = id.replace('f-','');
        el.addEventListener('blur', () => {
            const val = el.value;
            if (VALIDATORS[key]) {
                if (!VALIDATORS[key].validate(val) && (el.required || val.trim() !== '')) {
                    showFieldError(id, VALIDATORS[key].msg);
                } else {
                    clearFieldError(id);
                }
            }
        });
        el.addEventListener('input', () => {
            if (el.classList.contains('field-error')) clearFieldError(id);
        });
    });

    // Inyectar estilos de validación si no existen
    if (!document.getElementById('form-validation-styles')) {
        const style = document.createElement('style');
        style.id = 'form-validation-styles';
        style.innerHTML = `
            .field-error {
                border-color: #c0392b !important;
                background-color: rgba(192,57,43,0.04) !important;
            }
            .field-error-msg {
                display: block;
                color: #c0392b;
                font-size: 0.75rem;
                font-family: var(--sans);
                margin-top: 5px;
                letter-spacing: 0.3px;
            }
            .field-ok {
                border-color: #27ae60 !important;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearAllErrors();

            const nombre   = document.getElementById('f-nombre').value;
            const email    = document.getElementById('f-email').value;
            const whatsapp = document.getElementById('f-whatsapp').value;
            const casa     = document.getElementById('f-casa').value;
            const mensaje  = document.getElementById('f-mensaje').value;

            // Validar todos los campos
            let isValid = true;

            if (!VALIDATORS.nombre.validate(nombre)) {
                showFieldError('f-nombre', VALIDATORS.nombre.msg);
                isValid = false;
            }
            if (!VALIDATORS.whatsapp.validate(whatsapp)) {
                showFieldError('f-whatsapp', VALIDATORS.whatsapp.msg);
                isValid = false;
            }
            if (!VALIDATORS.email.validate(email)) {
                showFieldError('f-email', VALIDATORS.email.msg);
                isValid = false;
            }
            if (!VALIDATORS.casa.validate(casa)) {
                showFieldError('f-casa', VALIDATORS.casa.msg);
                isValid = false;
            }
            if (!VALIDATORS.mensaje.validate(mensaje)) {
                showFieldError('f-mensaje', VALIDATORS.mensaje.msg);
                isValid = false;
            }

            if (!isValid) {
                // Hacer scroll al primer error
                const firstError = contactForm.querySelector('.field-error');
                if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            const btnSubmit = document.getElementById('form-submit-btn');
            const originalText = btnSubmit.textContent;
            
            btnSubmit.innerHTML = '<span class="spinner" style="display:inline-block; width:15px; height:15px; border:2px solid rgba(229,219,209,0.3); border-radius:50%; border-top-color:#E5DBD1; animation:spin 1s ease-in-out infinite; margin-right:8px; vertical-align:middle;"></span> Enviando...';
            btnSubmit.style.opacity = '0.7';
            btnSubmit.disabled = true;

            const payload = {
                nombre:   nombre.trim(),
                whatsapp: whatsapp.trim(),
                email:    email.trim(),
                casa:     casa,
                mensaje:  mensaje.trim()
            };

            fetch('send_email.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                contactForm.style.display = 'none';
                formSuccess.innerHTML = `
                    <div style="display:flex; flex-direction:column; align-items:center; text-align:center; animation: introReveal 0.8s ease-out;">
                        <div style="width:60px; height:60px; border-radius:50%; background:#32332D; color:#E5DBD1; display:flex; justify-content:center; align-items:center; font-size:24px; margin-bottom:20px;">✓</div>
                        <h3 style="font-family:var(--serif); font-size:2rem; color:#32332D; margin-bottom:10px;">¡Gracias, ${nombre.trim()}!</h3>
                        <p style="color:#858D8F; font-size:1rem; max-width:90%; margin:0 auto;">Hemos recibido tu solicitud con éxito. Nos pondremos en contacto contigo pronto para brindarte toda la información.</p>
                    </div>
                `;
                formSuccess.hidden = false;
            })
            .catch(err => {
                console.error(err);
                btnSubmit.innerHTML = originalText;
                btnSubmit.style.opacity = '1';
                btnSubmit.disabled = false;
                alert('Hubo un problema al enviar el mensaje. Inténtalo de nuevo.');
            });
        });
    }

    /* ============================================================
       7. POPUP FORM SUBMISSION & CLOSE LOGIC
       ============================================================ */
    const popupForm = document.getElementById('popup-form');
    const popSuccess = document.getElementById('pop-success');
    const popupWrapper = document.getElementById('popup-fundadora-wrapper');
    const popCloseBtn = document.getElementById('pop-close');
    const popBackdrop = document.getElementById('pop-backdrop');

    function closeCustomPopup() {
        if (!popupWrapper) return;
        popupWrapper.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => {
            popupWrapper.hidden = true;
        }, 500); // Matches the CSS transition time
    }

    if (popCloseBtn) popCloseBtn.addEventListener('click', closeCustomPopup);
    if (popBackdrop) popBackdrop.addEventListener('click', closeCustomPopup);

    if (popupForm) {
        popupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nombre = document.getElementById('pop-nombre').value;
            const email = document.getElementById('pop-email').value;
            const whatsapp = document.getElementById('pop-whatsapp').value;

            if (!nombre || !email || !whatsapp) {
                alert('Por favor completa todos los campos.');
                return;
            }

            const btnSubmit = document.getElementById('pop-submit-btn');
            const originalText = btnSubmit.textContent;
            
            btnSubmit.innerHTML = '<span class="spinner" style="display:inline-block; width:15px; height:15px; border:2px solid rgba(229,219,209,0.3); border-radius:50%; border-top-color:#E5DBD1; animation:spin 1s ease-in-out infinite; margin-right:8px; vertical-align:middle;"></span> Enviando...';
            btnSubmit.style.opacity = '0.7';
            btnSubmit.disabled = true;

            const payload = {
                nombre: nombre,
                whatsapp: whatsapp,
                email: email,
                is_popup: true
            };

            fetch('send_email.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                popupForm.style.display = 'none';
                
                popSuccess.innerHTML = `
                    <div class="pop-success-msg">
                        <div style="width:50px; height:50px; border-radius:50%; background:#1B3B36; color:#E5DBD1; display:flex; justify-content:center; align-items:center; font-size:20px; margin-bottom:15px;">✓</div>
                        <h3 class="pop-title" style="font-size:1.5rem; margin-bottom:10px;">¡Gracias, ${nombre}!</h3>
                        <p class="pop-desc" style="margin-bottom:0;">Tu solicitud se envió con éxito. Pronto te contactaremos.</p>
                    </div>
                `;
                popSuccess.hidden = false;
                
                setTimeout(() => {
                    closeCustomPopup();
                }, 4000);
            })
            .catch(err => {
                console.error(err);
                btnSubmit.innerHTML = originalText;
                btnSubmit.style.opacity = '1';
                btnSubmit.disabled = false;
                alert('Hubo un problema al enviar tus datos. Inténtalo de nuevo.');
            });
        });
    }

});

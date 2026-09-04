// Initialize Feather Icons
feather.replace();

// Navbar scroll effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.padding = '10px 0';
        navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.05)';
    } else {
        navbar.style.padding = '0';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for fade-in animations
const fadeElements = document.querySelectorAll('.fade-in');

const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver(function(entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        } else {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, appearOptions);

fadeElements.forEach(el => {
    appearOnScroll.observe(el);
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Show success state
        if (formFeedback) {
            formFeedback.textContent = '¡Gracias por contactarnos! Hemos recibido tu solicitud y te responderemos a la brevedad para confirmar tu clase de prueba.';
            formFeedback.classList.add('success');
        }
        
        contactForm.reset();
    });
}


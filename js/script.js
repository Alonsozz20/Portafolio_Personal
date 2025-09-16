// ==========================================================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ==========================================================================

const config = {
    animationDuration: 300,
    scrollOffset: 80,
    typingSpeed: 100,
    deletingSpeed: 50,
    delayBetweenWords: 2000
};

// ==========================================================================
// UTILIDADES
// ==========================================================================

// Función para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Función para throttle
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Función para detectar si un elemento está en el viewport
function isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= -offset &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Función para scroll suave
function smoothScrollTo(target, duration = 1000) {
    const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
    if (!targetElement) return;

    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - config.scrollOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animate(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animate);
    }

    function easeInOutQuad(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animate);
}

// ==========================================================================
// NAVEGACIÓN
// ==========================================================================

class Navigation {
    constructor() {
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
        this.handleScroll();
    }

    setupElements() {
        this.header = document.querySelector('.header');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
    }

    bindEvents() {
        // Toggle mobile menu
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Close mobile menu when clicking on links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                this.handleNavClick(e);
                this.closeMobileMenu();
            });
        });

        // Handle scroll for header effects
        window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.navMenu.contains(e.target) && !this.navToggle.contains(e.target)) {
                this.closeMobileMenu();
            }
        });

        // Handle resize
        window.addEventListener('resize', debounce(() => this.handleResize(), 250));
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
        document.body.classList.toggle('nav-open');
    }

    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        document.body.classList.remove('nav-open');
    }

    handleNavClick(e) {
        const href = e.target.getAttribute('href');
        
        // Si es un enlace interno (comienza con #)
        if (href && href.startsWith('#')) {
            e.preventDefault();
            smoothScrollTo(href);
        }

        // Actualizar enlace activo
        this.updateActiveLink(e.target);
    }

    updateActiveLink(clickedLink) {
        this.navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    handleScroll() {
        const scrollY = window.pageYOffset;
        
        // Header background effect
        if (scrollY > 50) {
            this.header.classList.add('scrolled');
        } else {
            this.header.classList.remove('scrolled');
        }

        // Update active nav link based on scroll position
        this.updateActiveNavOnScroll();
    }

    updateActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + config.scrollOffset + 50;

        sections.forEach(section => {
            const top = section.getBoundingClientRect().top + window.pageYOffset;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            const correspondingLink = document.querySelector(`a[href="#${id}"]`);

            if (scrollPos >= top && scrollPos <= bottom && correspondingLink) {
                this.navLinks.forEach(link => link.classList.remove('active'));
                correspondingLink.classList.add('active');
            }
        });
    }

    handleResize() {
        if (window.innerWidth > 992) {
            this.closeMobileMenu();
        }
    }
}

// ==========================================================================
// FILTRO DE PROYECTOS
// ==========================================================================

class ProjectFilter {
    constructor() {
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
    }

    setupElements() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.projectCards = document.querySelectorAll('.project-card-detailed');
        this.projectsGrid = document.getElementById('projects-grid');
    }

    bindEvents() {
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterClick(e));
        });
    }

    handleFilterClick(e) {
        const button = e.target;
        const filter = button.getAttribute('data-filter');

        // Update active button
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Filter projects
        this.filterProjects(filter);
    }

    filterProjects(filter) {
        this.projectCards.forEach(card => {
            const categories = card.getAttribute('data-category');
            const shouldShow = filter === 'all' || categories.includes(filter);

            if (shouldShow) {
                card.classList.remove('hidden');
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    card.classList.add('hidden');
                    card.style.display = 'none';
                }, config.animationDuration);
            }
        });

        // Re-layout grid
        setTimeout(() => {
            if (this.projectsGrid) {
                this.projectsGrid.style.height = 'auto';
            }
        }, config.animationDuration);
    }
}

// ==========================================================================
// FORMULARIO DE CONTACTO
// ==========================================================================

class ContactForm {
    constructor() {
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
    }

    setupElements() {
        this.form = document.getElementById('contact-form');
        this.submitButton = document.querySelector('.btn-submit');
        this.successMessage = document.getElementById('success-message');
        this.errorMessage = document.getElementById('error-message');
        this.btnText = document.querySelector('.btn-text');
        this.btnLoading = document.querySelector('.btn-loading');
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Validación en tiempo real
        const inputs = this.form?.querySelectorAll('input, textarea, select');
        inputs?.forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('input', (e) => this.clearFieldError(e.target));
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            return;
        }

        this.showLoading();
        this.simulateSubmission();
    }

    validateForm() {
        const formData = new FormData(this.form);
        let isValid = true;

        // Validar campos requeridos
        const requiredFields = ['name', 'email', 'subject', 'message'];
        requiredFields.forEach(field => {
            const value = formData.get(field);
            const input = this.form.querySelector(`[name="${field}"]`);
            
            if (!value || !value.trim()) {
                this.showFieldError(input, 'Este campo es requerido');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        // Validar email
        const email = formData.get('email');
        if (email && !this.isValidEmail(email)) {
            const emailInput = this.form.querySelector('[name="email"]');
            this.showFieldError(emailInput, 'Por favor ingresa un email válido');
            isValid = false;
        }

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');

        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }

        if (fieldName === 'email' && value && !this.isValidEmail(value)) {
            this.showFieldError(field, 'Por favor ingresa un email válido');
            return false;
        }

        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Remover mensaje de error previo
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }

        // Agregar nuevo mensaje de error
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.75rem';
        errorElement.style.marginTop = '0.25rem';
        errorElement.style.display = 'block';
        
        field.parentNode.appendChild(errorElement);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showLoading() {
        this.submitButton.disabled = true;
        this.btnText.style.display = 'none';
        this.btnLoading.style.display = 'inline-block';
        this.hideMessages();
    }

    hideLoading() {
        this.submitButton.disabled = false;
        this.btnText.style.display = 'inline-block';
        this.btnLoading.style.display = 'none';
    }

    simulateSubmission() {
        // Simular envío del formulario
        setTimeout(() => {
            this.hideLoading();
            
            // Simular éxito (90% de las veces)
            if (Math.random() > 0.1) {
                this.showSuccess();
                this.form.reset();
            } else {
                this.showError();
            }
        }, 2000);
    }

    showSuccess() {
        this.hideMessages();
        this.successMessage.style.display = 'block';
        this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            this.successMessage.style.display = 'none';
        }, 5000);
    }

    showError() {
        this.hideMessages();
        this.errorMessage.style.display = 'block';
        this.errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            this.errorMessage.style.display = 'none';
        }, 5000);
    }

    hideMessages() {
        this.successMessage.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }
}

// ==========================================================================
// FAQ ACORDEÓN
// ==========================================================================

class FAQ {
    constructor() {
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
    }

    setupElements() {
        this.faqItems = document.querySelectorAll('.faq-item');
        this.faqQuestions = document.querySelectorAll('.faq-question');
    }

    bindEvents() {
        this.faqQuestions.forEach(question => {
            question.addEventListener('click', (e) => this.toggleFAQ(e));
        });
    }

    toggleFAQ(e) {
        const question = e.currentTarget;
        const faqItem = question.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');

        // Cerrar todos los FAQs
        this.faqItems.forEach(item => {
            item.classList.remove('active');
        });

        // Abrir el FAQ clickeado si no estaba activo
        if (!isActive) {
            faqItem.classList.add('active');
        }
    }
}

// ==========================================================================
// ANIMACIONES AL SCROLL
// ==========================================================================

class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
        this.checkAnimations();
    }

    setupElements() {
        this.animatedElements = document.querySelectorAll([
            '.fade-in',
            '.slide-up',
            '.slide-left',
            '.slide-right',
            '.skill-item',
            '.project-card',
            '.project-card-detailed',
            '.timeline-item',
            '.contact-item'
        ].join(','));
    }

    bindEvents() {
        window.addEventListener('scroll', throttle(() => this.checkAnimations(), 100));
        window.addEventListener('resize', debounce(() => this.checkAnimations(), 250));
    }

    checkAnimations() {
        this.animatedElements.forEach(element => {
            if (isInViewport(element, 100) && !element.classList.contains('animated')) {
                element.classList.add('animated');
                this.triggerAnimation(element);
            }
        });
    }

    triggerAnimation(element) {
        // Añadir clases de animación específicas
        if (element.classList.contains('skill-item')) {
            element.style.animationDelay = `${Math.random() * 0.5}s`;
        }
        
        if (element.classList.contains('project-card') || element.classList.contains('project-card-detailed')) {
            element.style.animationDelay = `${Math.random() * 0.3}s`;
        }

        if (element.classList.contains('timeline-item')) {
            element.style.animationDelay = `${Array.from(element.parentNode.children).indexOf(element) * 0.2}s`;
        }

        // Trigger counter animations for stats
        const statNumbers = element.querySelectorAll('.stat h3');
        statNumbers.forEach(stat => this.animateCounter(stat));
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace(/\D/g, ''));
        const suffix = element.textContent.replace(/\d/g, '');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + suffix;
        }, 16);
    }
}

// ==========================================================================
// TYPING ANIMATION
// ==========================================================================

class TypingAnimation {
    constructor(element, words, options = {}) {
        this.element = element;
        this.words = words;
        this.options = {
            typingSpeed: options.typingSpeed || config.typingSpeed,
            deletingSpeed: options.deletingSpeed || config.deletingSpeed,
            delayBetweenWords: options.delayBetweenWords || config.delayBetweenWords,
            loop: options.loop !== false
        };
        
        this.wordIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        
        this.init();
    }

    init() {
        if (this.element && this.words.length > 0) {
            this.type();
        }
    }

    type() {
        const currentWord = this.words[this.wordIndex];
        
        if (this.isDeleting) {
            this.charIndex--;
        } else {
            this.charIndex++;
        }

        this.element.textContent = currentWord.substring(0, this.charIndex);

        let typeSpeed = this.options.typingSpeed;

        if (this.isDeleting) {
            typeSpeed = this.options.deletingSpeed;
        }

        if (!this.isDeleting && this.charIndex === currentWord.length) {
            // Pausa al final de la palabra
            typeSpeed = this.options.delayBetweenWords;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.wordIndex++;
            
            // Reiniciar si llegamos al final
            if (this.wordIndex >= this.words.length) {
                if (this.options.loop) {
                    this.wordIndex = 0;
                } else {
                    return;
                }
            }
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ==========================================================================
// LAZY LOADING DE IMÁGENES
// ==========================================================================

class LazyLoader {
    constructor() {
        this.init();
    }

    init() {
        this.setupElements();
        this.bindEvents();
        this.loadVisibleImages();
    }

    setupElements() {
        this.lazyImages = document.querySelectorAll('img[data-src]');
        this.imageObserver = null;
        
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver();
        }
    }

    setupIntersectionObserver() {
        this.imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        this.lazyImages.forEach(img => {
            this.imageObserver.observe(img);
        });
    }

    bindEvents() {
        if (!('IntersectionObserver' in window)) {
            window.addEventListener('scroll', throttle(() => this.loadVisibleImages(), 100));
            window.addEventListener('resize', debounce(() => this.loadVisibleImages(), 250));
        }
    }

    loadVisibleImages() {
        this.lazyImages.forEach(img => {
            if (isInViewport(img, 50)) {
                this.loadImage(img);
            }
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        img.src = src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        
        // Remover de la lista de imágenes lazy
        this.lazyImages = Array.from(this.lazyImages).filter(image => image !== img);
    }
}

// ==========================================================================
// PERFORMANCE Y OPTIMIZACIONES
// ==========================================================================

class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.prefetchLinks();
        this.optimizeScrolling();
        this.handleConnectionSpeed();
    }

    prefetchLinks() {
        // Prefetch de páginas importantes al hover
        const importantLinks = document.querySelectorAll('a[href$=".html"]');
        
        importantLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (!link.hasAttribute('data-prefetched')) {
                    const prefetchLink = document.createElement('link');
                    prefetchLink.rel = 'prefetch';
                    prefetchLink.href = link.href;
                    document.head.appendChild(prefetchLink);
                    link.setAttribute('data-prefetched', 'true');
                }
            });
        });
    }

    optimizeScrolling() {
        // Optimizar scroll con passive listeners
        let ticking = false;
        
        const updateScrollPosition = () => {
            // Actualizar posición de elementos que dependen del scroll
            this.updateParallaxElements();
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }, { passive: true });
    }

    updateParallaxElements() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-parallax') || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    handleConnectionSpeed() {
        // Adaptarse a la velocidad de conexión
        if ('connection' in navigator) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Reducir animaciones en conexiones lentas
                document.body.classList.add('reduce-motion');
                
                // Deshabilitar lazy loading si es muy lenta
                this.disableLazyLoading();
            }
        }
    }

    disableLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
    }
}

// ==========================================================================
// THEME MANAGER (MODO OSCURO)
// ==========================================================================

class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.loadSavedTheme();
        this.setupToggleButton();
        this.detectSystemPreference();
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    setupToggleButton() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    detectSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            if (!localStorage.getItem('theme')) {
                this.setTheme('dark');
            }
        }

        // Escuchar cambios en la preferencia del sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Actualizar icono del botón toggle
        this.updateToggleIcon(theme);
    }

    updateToggleIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
        }
    }
}

// ==========================================================================
// INICIALIZACIÓN Y GESTIÓN DE ERRORES
// ==========================================================================

class App {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        try {
            console.log('🚀 Iniciando aplicación del portafolio...');
            
            // Inicializar componentes principales
            this.initializeComponents();
            
            // Configurar manejo de errores
            this.setupErrorHandling();
            
            // Inicializar optimizaciones
            this.initializeOptimizations();
            
            console.log('✅ Aplicación inicializada correctamente');
            
        } catch (error) {
            console.error('❌ Error al inicializar la aplicación:', error);
            this.handleInitializationError(error);
        }
    }

    initializeComponents() {
        // Navegación (presente en todas las páginas)
        this.components.navigation = new Navigation();
        
        // Filtro de proyectos (solo en página de proyectos)
        if (document.querySelector('.filter-btn')) {
            this.components.projectFilter = new ProjectFilter();
        }
        
        // Formulario de contacto (solo en página de contacto)
        if (document.getElementById('contact-form')) {
            this.components.contactForm = new ContactForm();
        }
        
        // FAQ (solo en página de contacto)
        if (document.querySelector('.faq-item')) {
            this.components.faq = new FAQ();
        }
        
        // Animaciones de scroll
        this.components.scrollAnimations = new ScrollAnimations();
        
        // Lazy loading
        this.components.lazyLoader = new LazyLoader();
        
        // Theme manager
        this.components.themeManager = new ThemeManager();
        
        // Animación de escritura en hero (solo en página de inicio)
        this.initializeTypingAnimation();
    }

    initializeTypingAnimation() {
        const typingElement = document.querySelector('.typing-text');
        if (typingElement) {
            const words = ['Desarrollador', 'Full Stack', 'Creativo', 'Innovador'];
            this.components.typingAnimation = new TypingAnimation(typingElement, words);
        }
    }

    setupErrorHandling() {
        // Manejo de errores JavaScript
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            this.logError('JavaScript Error', e.error);
        });
        
        // Manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            this.logError('Promise Rejection', e.reason);
        });
        
        // Manejo de errores de recursos (imágenes, scripts, etc.)
        window.addEventListener('error', (e) => {
            if (e.target !== window) {
                console.warn('Resource Error:', e.target.src || e.target.href);
                this.handleResourceError(e.target);
            }
        }, true);
    }

    initializeOptimizations() {
        this.components.performanceOptimizer = new PerformanceOptimizer();
    }

    handleInitializationError(error) {
        // Mostrar mensaje de error amigable al usuario
        const errorMessage = document.createElement('div');
        errorMessage.className = 'app-error';
        errorMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #fee2e2;
                color: #dc2626;
                padding: 1rem;
                border-radius: 0.5rem;
                border: 1px solid #fecaca;
                z-index: 9999;
                max-width: 300px;
            ">
                <h4 style="margin: 0 0 0.5rem 0;">Error de Inicialización</h4>
                <p style="margin: 0; font-size: 0.875rem;">
                    Algunas funcionalidades pueden no estar disponibles. 
                    Por favor, recarga la página.
                </p>
            </div>
        `;
        
        document.body.appendChild(errorMessage);
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            errorMessage.remove();
        }, 10000);
    }

    handleResourceError(element) {
        // Manejar errores de carga de recursos
        if (element.tagName === 'IMG') {
            // Usar imagen placeholder para imágenes que fallan
            element.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pgo8L3N2Zz4K';
            element.alt = 'Imagen no disponible';
        }
    }

    logError(type, error) {
        // En un entorno de producción, aquí se enviarían los errores a un servicio de monitoreo
        const errorLog = {
            type: type,
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Por ahora solo log en consola
        console.log('Error logged:', errorLog);
    }

    // Método público para acceder a los componentes desde el exterior
    getComponent(name) {
        return this.components[name];
    }
}

// ==========================================================================
// UTILIDADES ADICIONALES
// ==========================================================================

// Función para formatear números
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Función para validar formularios
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// Función para copiar texto al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores que no soportan clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
    }
}

// Función para detectar dispositivo móvil
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Función para obtener información del navegador
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";
    else if (ua.includes("Opera")) browser = "Opera";
    
    return {
        name: browser,
        userAgent: ua,
        isMobile: isMobileDevice()
    };
}

// ==========================================================================
// INICIALIZACIÓN GLOBAL
// ==========================================================================

// Crear instancia global de la aplicación
let portfolioApp;

// Función de inicialización que se puede llamar desde cualquier lugar
function initPortfolio() {
    portfolioApp = new App();
    return portfolioApp;
}

// Auto-inicializar la aplicación
initPortfolio();

// Exponer funciones útiles globalmente
window.portfolioApp = portfolioApp;
window.smoothScrollTo = smoothScrollTo;
window.copyToClipboard = copyToClipboard;
window.formatNumber = formatNumber;
window.getBrowserInfo = getBrowserInfo;

// ==========================================================================
// EVENT LISTENERS ADICIONALES
// ==========================================================================

// Prevenir el comportamiento por defecto de arrastre en imágenes
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Mejorar la accesibilidad con navegación por teclado
document.addEventListener('keydown', (e) => {
    // Escape para cerrar menús
    if (e.key === 'Escape') {
        const navigation = portfolioApp.getComponent('navigation');
        if (navigation) {
            navigation.closeMobileMenu();
        }
    }
    
    // Enter y Space para activar elementos clickeables
    if (e.key === 'Enter' || e.key === ' ') {
        const target = e.target;
        if (target.hasAttribute('data-clickable')) {
            e.preventDefault();
            target.click();
        }
    }
});

// Optimizar rendimiento ocultando/mostrando elementos fuera del viewport
const handleVisibilityChange = () => {
    if (document.hidden) {
        // Pausar animaciones cuando la página no está visible
        document.body.classList.add('paused');
    } else {
        document.body.classList.remove('paused');
    }
};

document.addEventListener('visibilitychange', handleVisibilityChange);

// Mensaje de desarrollo en consola
console.log(`
🎨 Portfolio Personal v1.0
👨‍💻 Desarrollado con amor y café
🚀 ¿Interesado en colaborar? ¡Contáctame!

Tecnologías utilizadas:
- HTML5 Semántico
- CSS3 con Variables Personalizadas
- JavaScript ES6+ Vanilla
- Diseño Responsive
- Optimización de Performance
- Accesibilidad Web

© ${new Date().getFullYear()} - Todos los derechos reservados
`);

// ==========================================================================
// MÉTRICAS DE RENDIMIENTO (OPCIONAL)
// ==========================================================================

// Registrar métricas de rendimiento si están disponibles
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
            const domContentLoadedTime = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
            
            console.log('📊 Métricas de Rendimiento:');
            console.log(`⏱️  Tiempo de carga: ${loadTime}ms`);
            console.log(`🏗️  DOM Content Loaded: ${domContentLoadedTime}ms`);
            console.log(`🎯 First Paint: ${performance.getEntriesByType('paint')[0]?.startTime}ms`);
            console.log(`🎨 First Contentful Paint: ${performance.getEntriesByType('paint')[1]?.startTime}ms`);
        }, 0);
    });
}
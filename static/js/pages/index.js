/**
 * Index Page Component
 * Handles homepage functionality
 */

class IndexManager {
    constructor() {
        this.initialized = false;
        this.featuredLessons = [];
        this.testimonials = [];
        this.currentTestimonial = 0;
    }

    init() {
        if (this.initialized) return;
        
        console.log('🏠 Initializing Index Page...');
        
        this.setupEventListeners();
        this.loadFeaturedContent();
        this.initializeAnimations();
        this.initializeTestimonials();
        this.initializeScrollEffects();
        
        this.initialized = true;
        console.log('✅ Index page initialized');
    }

    setupEventListeners() {
        // CTA buttons
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(button => {
            button.addEventListener('click', this.handleCTAClick.bind(this));
        });

        // Feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', this.handleFeatureHover.bind(this));
            card.addEventListener('mouseleave', this.handleFeatureLeave.bind(this));
        });

        // Demo button
        const demoButton = document.querySelector('.demo-button');
        if (demoButton) {
            demoButton.addEventListener('click', this.startDemo.bind(this));
        }

        // Newsletter signup
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', this.handleNewsletterSignup.bind(this));
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', this.handleSmoothScroll.bind(this));
        });
    }

    async loadFeaturedContent() {
        try {
            const response = await fetch('/api/featured-content');
            const data = await response.json();
            
            if (data.success) {
                this.featuredLessons = data.lessons || [];
                this.testimonials = data.testimonials || [];
                this.renderFeaturedLessons();
                this.renderTestimonials();
            }
        } catch (error) {
            console.error('Error loading featured content:', error);
            // Use fallback content
            this.useFallbackContent();
        }
    }

    renderFeaturedLessons() {
        const container = document.querySelector('.featured-lessons');
        if (!container || this.featuredLessons.length === 0) return;

        const lessonsHTML = this.featuredLessons.map(lesson => `
            <div class="featured-lesson-card" data-lesson-id="${lesson.id}">
                <div class="lesson-image">
                    <img src="${lesson.thumbnail || '/static/img/lesson-placeholder.svg'}" 
                         alt="${lesson.title}" loading="lazy">
                    <div class="lesson-overlay">
                        <button class="btn btn-primary">Start Learning</button>
                    </div>
                </div>
                <div class="lesson-content">
                    <h3>${lesson.title}</h3>
                    <p>${lesson.shortDescription}</p>
                    <div class="lesson-stats">
                        <span class="difficulty ${lesson.difficulty}">${lesson.difficulty}</span>
                        <span class="duration">${this.formatDuration(lesson.estimatedTime)}</span>
                        <span class="students">${lesson.enrolledCount} students</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = lessonsHTML;

        // Add click handlers
        container.querySelectorAll('.featured-lesson-card').forEach(card => {
            card.addEventListener('click', () => {
                const lessonId = card.dataset.lessonId;
                window.location.href = `/lesson/${lessonId}`;
            });
        });
    }

    renderTestimonials() {
        const container = document.querySelector('.testimonials-container');
        if (!container || this.testimonials.length === 0) return;

        const testimonialsHTML = this.testimonials.map((testimonial, index) => `
            <div class="testimonial ${index === 0 ? 'active' : ''}" data-testimonial="${index}">
                <div class="testimonial-content">
                    <blockquote>"${testimonial.content}"</blockquote>
                    <div class="testimonial-author">
                        <img src="${testimonial.avatar || '/static/img/default-avatar.svg'}" 
                             alt="${testimonial.name}" class="author-avatar">
                        <div class="author-info">
                            <div class="author-name">${testimonial.name}</div>
                            <div class="author-title">${testimonial.title}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = testimonialsHTML;
        this.startTestimonialRotation();
    }

    startTestimonialRotation() {
        if (this.testimonials.length <= 1) return;

        setInterval(() => {
            this.showNextTestimonial();
        }, 5000);
    }

    showNextTestimonial() {
        const testimonials = document.querySelectorAll('.testimonial');
        if (testimonials.length === 0) return;

        testimonials[this.currentTestimonial].classList.remove('active');
        this.currentTestimonial = (this.currentTestimonial + 1) % testimonials.length;
        testimonials[this.currentTestimonial].classList.add('active');
    }

    initializeAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe animatable elements
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    initializeScrollEffects() {
        // Parallax effect for hero section
        const hero = document.querySelector('.hero-section');
        if (hero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const parallax = scrolled * 0.5;
                hero.style.transform = `translateY(${parallax}px)`;
            });
        }

        // Progress indicator
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            window.addEventListener('scroll', () => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                progressBar.style.width = scrolled + '%';
            });
        }
    }

    handleCTAClick(event) {
        event.preventDefault();
        const target = event.target.dataset.target;
        
        switch (target) {
            case 'get-started':
                this.redirectToSignup();
                break;
            case 'learn-more':
                this.scrollToSection('#features');
                break;
            case 'view-lessons':
                window.location.href = '/lessons';
                break;
        }
    }

    handleFeatureHover(event) {
        const card = event.target.closest('.feature-card');
        card.classList.add('hover');
        
        // Add subtle animation
        const icon = card.querySelector('.feature-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }
    }

    handleFeatureLeave(event) {
        const card = event.target.closest('.feature-card');
        card.classList.remove('hover');
        
        const icon = card.querySelector('.feature-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    }

    startDemo() {
        // Open demo modal or redirect to demo lesson
        console.log('Starting demo...');
        
        // For now, redirect to a demo lesson
        window.location.href = '/lesson/demo';
    }

    async handleNewsletterSignup(event) {
        event.preventDefault();
        
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Subscribing...';
        
        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showNotification('Successfully subscribed to newsletter!', 'success');
                form.reset();
            } else {
                throw new Error(data.error || 'Subscription failed');
            }
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showNotification('Failed to subscribe. Please try again.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Subscribe';
        }
    }

    handleSmoothScroll(event) {
        event.preventDefault();
        
        const targetId = event.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    redirectToSignup() {
        // Check if user is already authenticated
        if (window.CwMApp && window.CwMApp.user) {
            window.location.href = '/dashboard';
        } else {
            window.location.href = '/auth/login';
        }
    }

    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
        }
    }

    useFallbackContent() {
        // Fallback featured lessons
        this.featuredLessons = [
            {
                id: 'intro-python',
                title: 'Introduction to Python',
                shortDescription: 'Learn the basics of Python programming',
                difficulty: 'beginner',
                estimatedTime: 45,
                enrolledCount: 1250
            },
            {
                id: 'data-structures',
                title: 'Data Structures in Python',
                shortDescription: 'Master lists, dictionaries, and sets',
                difficulty: 'intermediate',
                estimatedTime: 60,
                enrolledCount: 890
            }
        ];

        this.renderFeaturedLessons();
    }

    showNotification(message, type) {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    destroy() {
        this.initialized = false;
    }
}

// Initialize index page when function is called
function initializeIndex() {
    if (window.indexManager) {
        window.indexManager.destroy();
    }
    
    window.indexManager = new IndexManager();
    window.indexManager.init();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { IndexManager, initializeIndex };
}

/**
 * Professional Enhancements & Advanced Animations
 * Portfolio enhancement script with particle effects, parallax, and smooth interactions
 */

(function() {
    'use strict';

    // ====================================
    // PARTICLE SYSTEM
    // ====================================

    class ParticleSystem {
        constructor() {
            this.container = null;
            this.particles = [];
            this.particleCount = window.innerWidth > 768 ? 8 : 0; // REDUCED from 30 to 8
            this.init();
        }

        init() {
            // Create particle container
            this.container = document.createElement('div');
            this.container.className = 'particle-container';
            document.body.appendChild(this.container);

            // Create particles
            for (let i = 0; i < this.particleCount; i++) {
                this.createParticle();
            }
        }

        createParticle() {
            const particle = document.createElement('div');
            particle.className = 'particle';

            // Random position and animation properties
            const startX = Math.random() * window.innerWidth;
            const endX = startX + (Math.random() - 0.5) * 200;
            const delay = Math.random() * 20;
            const duration = 15 + Math.random() * 10;

            particle.style.left = startX + 'px';
            particle.style.setProperty('--particle-x', (endX - startX) + 'px');
            particle.style.animationDelay = delay + 's';
            particle.style.animationDuration = duration + 's';

            this.container.appendChild(particle);
            this.particles.push(particle);
        }

        destroy() {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
            this.particles = [];
        }
    }

    // ====================================
    // PARALLAX SCROLLING
    // ====================================

    class ParallaxController {
        constructor() {
            this.init();
        }

        init() {
            // DISABLED - Use CSS-only parallax instead for better performance
            // Parallax is now handled by CSS with transform: translateZ()
            // Parallax: Using CSS-only mode for performance
        }
    }

    // ====================================
    // ENHANCED SCROLL REVEAL
    // ====================================

    class ScrollReveal {
        constructor() {
            this.elements = document.querySelectorAll('[data-reveal]');
            this.observer = null;
            this.init();
        }

        init() {
            const options = {
                root: null,
                rootMargin: '0px 0px -100px 0px',
                threshold: 0.15
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');

                        // Add stagger effect to children if present
                        const children = entry.target.querySelectorAll('[data-reveal-child]');
                        children.forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('revealed');
                            }, index * 100);
                        });
                    }
                });
            }, options);

            this.elements.forEach(el => this.observer.observe(el));
        }

        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    }

    // ====================================
    // SLIDER ENHANCEMENTS
    // ====================================

    class SliderEnhancer {
        constructor() {
            this.slider = document.querySelector('.slider');
            if (!this.slider) return;

            this.slides = this.slider.querySelectorAll('.slide');
            this.currentIndex = 0;
            this.init();
        }

        init() {
            // Add swipe support for mobile
            this.addSwipeSupport();

            // Add keyboard navigation
            this.addKeyboardSupport();

            // Preload next image
            this.preloadNextImage();
        }

        addSwipeSupport() {
            let startX = 0;
            let endX = 0;

            this.slider.addEventListener('touchstart', (e) => {
                startX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.slider.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].screenX;
                this.handleSwipe(startX, endX);
            }, { passive: true });
        }

        handleSwipe(startX, endX) {
            const diff = startX - endX;
            const threshold = 50;

            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    document.querySelector('.slider-nav.next')?.click();
                } else {
                    // Swipe right - previous slide
                    document.querySelector('.slider-nav.prev')?.click();
                }
            }
        }

        addKeyboardSupport() {
            document.addEventListener('keydown', (e) => {
                if (!this.isSliderVisible()) return;

                if (e.key === 'ArrowLeft') {
                    document.querySelector('.slider-nav.prev')?.click();
                } else if (e.key === 'ArrowRight') {
                    document.querySelector('.slider-nav.next')?.click();
                }
            });
        }

        isSliderVisible() {
            const rect = this.slider.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        }

        preloadNextImage() {
            const activeSlide = this.slider.querySelector('.slide.active');
            const nextSlide = activeSlide?.nextElementSibling || this.slides[0];
            const img = nextSlide?.querySelector('img');

            if (img && !img.complete) {
                const preloadImg = new Image();
                preloadImg.src = img.src;
            }
        }
    }

    // ====================================
    // SMOOTH MOUSE FOLLOW EFFECT
    // ====================================

    class MouseFollower {
        constructor() {
            this.cursor = null;
            this.cursorGlow = null;
            this.mouseX = 0;
            this.mouseY = 0;
            this.currentX = 0;
            this.currentY = 0;
            this.init();
        }

        init() {
            // Create custom cursor elements
            this.cursor = document.createElement('div');
            this.cursor.className = 'custom-cursor';
            this.cursor.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: #18bfef;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                mix-blend-mode: difference;
                transition: transform 0.2s ease;
            `;

            this.cursorGlow = document.createElement('div');
            this.cursorGlow.className = 'custom-cursor-glow';
            this.cursorGlow.style.cssText = `
                position: fixed;
                width: 40px;
                height: 40px;
                background: radial-gradient(circle, rgba(24,191,239,0.3) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9998;
            `;

            document.body.appendChild(this.cursor);
            document.body.appendChild(this.cursorGlow);

            // Track mouse movement
            document.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });

            // Animate cursor
            this.animate();

            // Add hover effects
            this.addHoverEffects();
        }

        animate() {
            // Smooth follow effect
            this.currentX += (this.mouseX - this.currentX) * 0.15;
            this.currentY += (this.mouseY - this.currentY) * 0.15;

            this.cursor.style.transform = `translate(${this.currentX - 4}px, ${this.currentY - 4}px)`;
            this.cursorGlow.style.transform = `translate(${this.currentX - 20}px, ${this.currentY - 20}px)`;

            requestAnimationFrame(() => this.animate());
        }

        addHoverEffects() {
            const interactiveElements = document.querySelectorAll('a, button, .project-card, .metric-card');

            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    this.cursor.style.transform += ' scale(2)';
                    this.cursorGlow.style.opacity = '0.6';
                });

                el.addEventListener('mouseleave', () => {
                    this.cursor.style.transform = this.cursor.style.transform.replace(' scale(2)', '');
                    this.cursorGlow.style.opacity = '1';
                });
            });
        }

        destroy() {
            if (this.cursor) this.cursor.remove();
            if (this.cursorGlow) this.cursorGlow.remove();
        }
    }

    // ====================================
    // GRADIENT TEXT ANIMATION
    // ====================================

    function applyGradientText() {
        const headings = document.querySelectorAll('h1, h2.gradient-text');
        headings.forEach(heading => {
            if (!heading.classList.contains('gradient-text')) {
                heading.classList.add('gradient-text');
            }
        });
    }

    // ====================================
    // METRICS COUNTER ENHANCEMENT
    // ====================================

    class MetricsCounter {
        constructor() {
            this.metrics = document.querySelectorAll('.metric-value');
            this.observer = null;
            this.init();
        }

        init() {
            const options = {
                threshold: 0.5
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                        this.animateCounter(entry.target);
                        entry.target.classList.add('counted');
                    }
                });
            }, options);

            this.metrics.forEach(metric => this.observer.observe(metric));
        }

        animateCounter(element) {
            const target = parseInt(element.getAttribute('data-target'));
            const suffix = element.getAttribute('data-suffix') || '';
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + suffix;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + suffix;
                }
            }, 16);
        }
    }

    // ====================================
    // INITIALIZATION
    // ====================================

    function init() {
        // Check if user prefers reduced motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!prefersReducedMotion) {
            // DISABLED particle system for performance
            // if (window.innerWidth > 768) {
            //     new ParticleSystem();
            // }

            // DISABLED JS parallax - using CSS instead
            // new ParallaxController();

            // DISABLED custom cursor for performance
            // if (window.innerWidth > 1024) {
            //     new MouseFollower();
            // }
        }

        // Initialize scroll reveal (always)
        new ScrollReveal();

        // Initialize slider enhancements
        new SliderEnhancer();

        // Initialize metrics counter
        new MetricsCounter();

        // Apply gradient text
        applyGradientText();

        // Add floating animation to specific elements
        const floatingElements = document.querySelectorAll('.intro-pills span');
        floatingElements.forEach((el, index) => {
            el.style.animationDelay = (index * 0.2) + 's';
            el.classList.add('float-animation');
        });
    }

    // ====================================
    // PAGE LOAD
    // ====================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

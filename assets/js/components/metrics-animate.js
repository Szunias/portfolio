/**
 * Metrics Counter Animation
 * Animates metric values when they enter viewport
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMetrics);
    } else {
        initMetrics();
    }

    function initMetrics() {
        const metricValues = document.querySelectorAll('.metric-value[data-target]');

        if (metricValues.length === 0) return;

        const animatedValues = new Set();

        // IntersectionObserver for triggering animation when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animatedValues.has(entry.target)) {
                    animatedValues.add(entry.target);
                    animateValue(entry.target);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px'
        });

        metricValues.forEach(element => {
            observer.observe(element);
        });
    }

    function animateValue(element) {
        const target = parseInt(element.getAttribute('data-target'), 10);
        const suffix = element.getAttribute('data-suffix') || '';
        const duration = 2000; // 2 seconds
        const startTime = performance.now();
        const startValue = 0;

        function easeOutExpo(t) {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        }

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

            element.textContent = formatNumber(currentValue) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = formatNumber(target) + suffix;
            }
        }

        requestAnimationFrame(update);
    }

    function formatNumber(num) {
        // Add commas for thousands
        if (num >= 1000) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        return num.toString();
    }

})();

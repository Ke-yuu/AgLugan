// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initScrollAnimations();
    initTeamMemberEffects();
    initSmoothScrolling();
    addLoadingEffects();
});

// Scroll Animation Handler
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.team-member, .feature, .hero-content, .hero-image');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add initial classes and observe elements
    animatedElements.forEach(el => {
        el.classList.add('animate-hidden');
        scrollObserver.observe(el);
    });
}

// Team Member Interactive Effects
function initTeamMemberEffects() {
    const teamMembers = document.querySelectorAll('.team-member');

    teamMembers.forEach(member => {
        // Mouse movement effect
        member.addEventListener('mousemove', (e) => {
            const rect = member.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calculate rotation based on mouse position
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            member.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        // Reset transform on mouse leave
        member.addEventListener('mouseleave', () => {
            member.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });

        // Add click animation
        member.addEventListener('click', () => {
            member.classList.add('pulse');
            setTimeout(() => {
                member.classList.remove('pulse');
            }, 500);
        });
    });
}

// Smooth Scrolling for Navigation
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Page Loading Effects
function addLoadingEffects() {
    window.addEventListener('load', () => {
        document.body.classList.add('page-loaded');
        
        // Animate hero section elements
        const heroContent = document.querySelector('.hero-content');
        const heroImage = document.querySelector('.hero-image');
        
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
        
        if (heroImage) {
            heroImage.style.opacity = '1';
            heroImage.style.transform = 'translateX(0)';
        }
    });
}

// Parallax Effect for Hero Section
let ticking = false;
window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const heroImage = document.querySelector('.hero-image');
            const scrolled = window.pageYOffset;
            
            if (heroImage) {
                heroImage.style.transform = `translateY(${scrolled * 0.1}px)`;
            }
            
            ticking = false;
        });
        
        ticking = true;
    }
});

// Add necessary styles for animations
const style = document.createElement('style');
style.textContent = `
    .animate-hidden {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .fade-in {
        opacity: 1;
        transform: translateY(0);
    }

    .pulse {
        animation: pulse 0.5s ease-out;
    }

    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    .page-loaded .hero-content {
        transition: all 1s ease-out;
    }

    .page-loaded .hero-image {
        transition: all 1s ease-out 0.3s;
    }

    .team-member {
        transition: transform 0.3s ease-out;
        transform-style: preserve-3d;
    }
`;

document.head.appendChild(style);

// Optimize performance for animations
window.requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame;

// Handle browser compatibility
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
    document.body.classList.add('reduce-motion');
}
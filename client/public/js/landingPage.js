const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

const features = document.querySelectorAll('.feature');
features.forEach(feature => {
    feature.style.opacity = 0;
    feature.style.transform = 'translateY(20px)';
});

window.addEventListener('scroll', () => {
    features.forEach(feature => {
        const rect = feature.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            feature.style.opacity = 1;
            feature.style.transform = 'translateY(0)';
            feature.style.transition = 'all 0.5s ease';
        }
    });
});

// Highlight Navigation Menu Item Based on Scroll Position
const navButtons = document.querySelectorAll('.header-buttons a');
const sections = document.querySelectorAll('main > div');

window.addEventListener('scroll', () => {
    let currentSection = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop - sectionHeight / 3) {
            currentSection = section.getAttribute('class');
        }
    });

    navButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('href').includes(currentSection)) {
            button.classList.add('active');
        }
    });
});

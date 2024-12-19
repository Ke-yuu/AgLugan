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

// Modal functionality
const modal = document.getElementById('driverModal');
const applyBtn = document.getElementById('applyBtn');
const closeBtn = document.querySelector('.close-btn');
const driverForm = document.getElementById('driverForm');

applyBtn.addEventListener('click', () => {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

driverForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('driverEmail').value;
    
    // Here you would typically send this data to your server
    console.log('Driver application submitted:', email);
    
    // Show success message (you can customize this)
    alert('Thank you for your interest! We will contact you shortly.');
    
    // Clear form and close modal
    driverForm.reset();
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
});

const allSections = document.querySelectorAll('main > div');
document.addEventListener("DOMContentLoaded", () => {
    // Apply fade-in effect when the page loads
    document.body.classList.add("fade-in");
  
    // Handle links to create smooth fade-out effect before navigation
    const links = document.querySelectorAll('a:not([target="_blank"])'); 
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute("href");
  
        // Ignore if it's not a valid href link
        if (!href || href === "#" || href.startsWith("javascript")) {
          return;
        }
  
        // Prevent default link behavior and add fade-out effect
        e.preventDefault();
        document.body.classList.add("fade-out");
        setTimeout(() => {
          window.location.href = href;
        }, 500); // Matches the transition duration
      });
    });
  });
  
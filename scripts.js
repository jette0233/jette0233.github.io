
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const section = document.querySelector(event.target.getAttribute('href'));
            section.scrollIntoView({ behavior: 'smooth' });
        });
    });
 });
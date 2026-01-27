// Main Application Logic

document.addEventListener('DOMContentLoaded', () => {
    console.log('PDF Converter Application Initialized');
    
    // Mobile Menu Toggle (if we add a mobile menu later)
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
             const isHidden = mobileMenu.classList.contains('hidden');
             if (isHidden) {
                 mobileMenu.classList.remove('hidden');
             } else {
                 mobileMenu.classList.add('hidden');
             }
        });
    }

    // Add scroll effect to navbar
    const navbar = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('shadow-md', 'bg-white/80');
            navbar.classList.remove('bg-transparent');
        } else {
            navbar.classList.remove('shadow-md', 'bg-white/80');
            navbar.classList.add('bg-transparent');
        }
    });

    // Initialize simple feather icons if used, or other icon libs
    // feather.replace();
});

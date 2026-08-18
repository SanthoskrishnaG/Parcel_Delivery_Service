/**
 * SwiftParcel - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. Navbar Scroll Effect
    const mainNav = document.getElementById('mainNav');
    
    if (mainNav) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                mainNav.classList.add('navbar-scrolled');
                mainNav.classList.remove('bg-transparent', 'navbar-dark');
                mainNav.classList.add('bg-white', 'navbar-light');
            } else {
                mainNav.classList.remove('navbar-scrolled');
                mainNav.classList.add('bg-transparent', 'navbar-dark');
                mainNav.classList.remove('bg-white', 'navbar-light');
            }
        });
        
        // Trigger scroll event on load in case page is already scrolled
        window.dispatchEvent(new Event('scroll'));
    }

    // 2. Quick Track Input Enter Key Handler
    const quickTrackInput = document.getElementById('quickTrackInput');
    if (quickTrackInput) {
        quickTrackInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Store tracking number in sessionStorage to pre-fill on tracking page
                const trackingNumber = this.value.trim();
                if (trackingNumber) {
                    sessionStorage.setItem('quickTrackQuery', trackingNumber);
                }
                window.location.href = 'pages/tracking.html';
            }
        });
    }

    // 3. Dynamic Current Year in Footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // 4. Smooth Scrolling for anchor links (if any)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if(this.getAttribute('href') !== '#') {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if(target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

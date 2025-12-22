/**
 * Nanjangud Farms - Interactive Website Script
 * Handles: Navigation, ROI Calculator, Form submission, Animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavigation();
    initCalculator();
    initContactForm();
    initScrollAnimations();
});

/* ============================================
   NAVIGATION
   ============================================ */
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Scroll behavior for navbar
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ============================================
   ROI CALCULATOR
   ============================================ */
function initCalculator() {
    // Get input elements
    const priceInput = document.getElementById('calc-price');
    const appreciationInput = document.getElementById('calc-appreciation');
    const incomeInput = document.getElementById('calc-income');
    const incomeGrowthInput = document.getElementById('calc-income-growth');
    const periodInput = document.getElementById('calc-period');

    // Get display elements
    const appreciationDisplay = document.getElementById('appreciation-display');
    const incomeGrowthDisplay = document.getElementById('income-growth-display');
    const periodDisplay = document.getElementById('period-display');

    // Add event listeners
    [priceInput, incomeInput].forEach(input => {
        input.addEventListener('input', calculateROI);
    });

    [appreciationInput, incomeGrowthInput, periodInput].forEach(input => {
        input.addEventListener('input', function() {
            updateDisplays();
            calculateROI();
        });
    });

    function updateDisplays() {
        appreciationDisplay.textContent = appreciationInput.value + '%';
        incomeGrowthDisplay.textContent = incomeGrowthInput.value + '%';
        periodDisplay.textContent = periodInput.value + ' years';
    }

    function formatCurrency(lakhs) {
        if (lakhs >= 100) {
            return '₹' + (lakhs / 100).toFixed(2) + ' Cr';
        }
        return '₹' + lakhs.toFixed(2) + ' L';
    }

    function calculateROI() {
        // Get values
        const purchasePrice = parseFloat(priceInput.value) || 639;
        const appreciationRate = parseFloat(appreciationInput.value) || 15;
        const currentIncome = parseFloat(incomeInput.value) || 25;
        const incomeGrowthRate = parseFloat(incomeGrowthInput.value) || 10;
        const holdingPeriod = parseInt(periodInput.value) || 10;

        // Calculate projections
        let landValue = purchasePrice;
        let annualIncome = currentIncome;
        let cumulativeIncome = 0;

        for (let year = 1; year <= holdingPeriod; year++) {
            landValue = landValue * (1 + appreciationRate / 100);
            if (year > 1) {
                annualIncome = annualIncome * (1 + incomeGrowthRate / 100);
            }
            cumulativeIncome += annualIncome;
        }

        const totalValue = landValue + cumulativeIncome;
        const totalProfit = totalValue - purchasePrice;
        const totalROI = (totalProfit / purchasePrice) * 100;
        const cagr = (Math.pow(totalValue / purchasePrice, 1 / holdingPeriod) - 1) * 100;

        // Update result displays
        document.getElementById('result-total').textContent = formatCurrency(totalValue);
        document.getElementById('result-profit').textContent = formatCurrency(totalProfit);
        document.getElementById('result-roi').textContent = totalROI.toFixed(0) + '%';
        document.getElementById('result-cagr').textContent = cagr.toFixed(1) + '%';

        // Calculate comparison values
        const fdRate = 4.9; // Post-tax
        const equityRate = 12;
        const equityTax = 10;
        const reRate = 8;

        const fdValue = purchasePrice * Math.pow(1 + fdRate / 100, holdingPeriod);
        const equityGross = purchasePrice * Math.pow(1 + equityRate / 100, holdingPeriod);
        const equityValue = equityGross - (equityGross - purchasePrice) * (equityTax / 100);
        const reValue = purchasePrice * Math.pow(1 + reRate / 100, holdingPeriod);

        // Update comparison displays
        document.getElementById('compare-farm').textContent = formatCurrency(totalValue);
        document.getElementById('compare-equity').textContent = formatCurrency(equityValue);
        document.getElementById('compare-re').textContent = formatCurrency(reValue);
        document.getElementById('compare-fd').textContent = formatCurrency(fdValue);

        // Update bar widths
        const maxValue = totalValue;
        document.getElementById('bar-farm').style.setProperty('--width', '100%');
        document.getElementById('bar-equity').style.setProperty('--width', (equityValue / maxValue * 100) + '%');
        document.getElementById('bar-re').style.setProperty('--width', (reValue / maxValue * 100) + '%');
        document.getElementById('bar-fd').style.setProperty('--width', (fdValue / maxValue * 100) + '%');
    }

    // Initial calculation
    updateDisplays();
    calculateROI();
}

/* ============================================
   CONTACT FORM
   ============================================ */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate
        if (!data.name || !data.phone) {
            showNotification('Please fill in required fields', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;

        // Process form submission
        setTimeout(() => {
            // Store enquiry data (for backend integration later)
            const enquiry = {
                name: data.name,
                phone: data.phone,
                email: data.email || '',
                location: data.location || '',
                interest: data.interest || '',
                message: data.message || '',
                timestamp: new Date().toISOString()
            };

            // Store in localStorage for now (can be replaced with API call)
            const enquiries = JSON.parse(localStorage.getItem('farmEnquiries') || '[]');
            enquiries.push(enquiry);
            localStorage.setItem('farmEnquiries', JSON.stringify(enquiries));

            // Hide form elements and show success message
            const formElements = form.querySelectorAll('.form-group, .form-row, button, .form-note');
            formElements.forEach(el => el.style.display = 'none');
            formSuccess.style.display = 'block';

            // Track the conversion
            trackEvent('Form', 'Submit', 'Enquiry');

            showNotification('Enquiry submitted successfully!', 'success');
        }, 1000);
    });
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        background: type === 'success' ? '#22c55e' : '#ef4444',
        color: 'white',
        fontWeight: '500',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease'
    });

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add notification animations
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .notification button {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
`;
document.head.appendChild(notificationStyles);

/* ============================================
   SCROLL ANIMATIONS
   ============================================ */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animatedElements = document.querySelectorAll(
        '.pillar-card, .detail-card, .income-card, .process-step'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });
}

/* ============================================
   UTILITY FUNCTIONS
   ============================================ */

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Number animation
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = start + (end - start) * easeOutQuart(progress);
        element.textContent = formatNumber(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

function formatNumber(num) {
    if (num >= 10000000) {
        return '₹' + (num / 10000000).toFixed(2) + ' Cr';
    } else if (num >= 100000) {
        return '₹' + (num / 100000).toFixed(2) + ' L';
    }
    return '₹' + num.toFixed(0);
}

/* ============================================
   ANALYTICS TRACKING (Placeholder)
   ============================================ */
function trackEvent(category, action, label) {
    // Implement your analytics tracking here
    console.log('Track:', category, action, label);
    
    // Example for Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', action, {
    //         event_category: category,
    //         event_label: label
    //     });
    // }
}

// Track key interactions
document.addEventListener('click', function(e) {
    const target = e.target.closest('a, button');
    if (!target) return;
    
    if (target.classList.contains('btn-primary')) {
        trackEvent('CTA', 'Click', target.textContent.trim());
    }
    
    if (target.href && target.href.includes('wa.me')) {
        trackEvent('WhatsApp', 'Click', 'Contact');
    }
});

// Track scroll depth
let maxScroll = 0;
window.addEventListener('scroll', throttle(() => {
    const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    
    if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if ([25, 50, 75, 100].includes(scrollPercent)) {
            trackEvent('Scroll', 'Depth', scrollPercent + '%');
        }
    }
}, 500));

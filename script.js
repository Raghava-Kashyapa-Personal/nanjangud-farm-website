/**
 * Nanjangud Income Farms - Site Script
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initContactForm();
});

function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) {
                return;
            }
            event.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            if (navMenu) {
                navMenu.classList.remove('active');
            }
        });
    });
}

function initContactForm() {
    const form = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        if (!data.name || !data.phone) {
            showNotification('Please fill in required fields', 'error');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(formData).toString()
        })
            .then(response => {
                if (response.ok) {
                    const formElements = form.querySelectorAll('.form-group, button, .form-note');
                    formElements.forEach(el => {
                        el.style.display = 'none';
                    });
                    if (formSuccess) {
                        formSuccess.style.display = 'block';
                    }
                    showNotification('Enquiry submitted successfully!', 'success');
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                showNotification('Something went wrong. Please try again.', 'error');
            });
    });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button aria-label="Dismiss notification">×</button>
    `;

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

    notification.querySelector('button').addEventListener('click', () => notification.remove());

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

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

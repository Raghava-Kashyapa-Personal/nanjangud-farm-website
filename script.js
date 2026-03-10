(() => {
  const API_BASE = window.DIRGHA_API_BASE || '';

  document.addEventListener('DOMContentLoaded', () => {
    trackEvent('page_view', { page: document.body.dataset.page || 'unknown' });
    initMenu();
    initReveal();
    initForms();
    initResourceHub();
    initResourceDetail();
    initDownloadTracking();
  });

  function initMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
    });

    menu.querySelectorAll('a').forEach((item) => {
      item.addEventListener('click', () => menu.classList.remove('open'));
    });
  }

  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  function initForms() {
    const waitlistForm = document.getElementById('produce-waitlist-form');
    const leadMagnetForm = document.getElementById('lead-magnet-form');
    const newsletterForm = document.getElementById('newsletter-form');

    if (waitlistForm) {
      wireForm(waitlistForm, '/api/leads/produce-waitlist', (formData) => ({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        city: formData.get('city'),
        household_size: Number(formData.get('household_size')),
        box_preference: formData.get('box_preference'),
        frequency_preference: formData.get('frequency_preference'),
        whatsapp_opt_in: toBool(formData.get('whatsapp_opt_in')),
        consent: toBool(formData.get('consent')),
        source: formData.get('source') || 'produce-waitlist',
        turnstile_token: formData.get('turnstile_token') || ''
      }), {
        successMessage: 'You are on the waitlist. We will reach out with the next allocation window.'
      });
    }

    if (leadMagnetForm) {
      wireForm(leadMagnetForm, '/api/leads/lead-magnet', (formData) => ({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        city: formData.get('city'),
        consent: toBool(formData.get('consent')),
        whatsapp_opt_in: toBool(formData.get('whatsapp_opt_in')),
        source: formData.get('source') || 'lead-magnet',
        turnstile_token: formData.get('turnstile_token') || ''
      }), {
        successMessage: 'Checklist access granted. Check your inbox as well.',
        onSuccess: (response) => {
          const node = leadMagnetForm.querySelector('[data-form-response]');
          if (response.download_url && node) {
            node.innerHTML = `Checklist ready: <a class="resource-link" href="${response.download_url}" download>Download PDF</a>`;
            node.classList.add('success');
          }
        }
      });
    }

    if (newsletterForm) {
      wireForm(newsletterForm, '/api/leads/newsletter', (formData) => ({
        email: formData.get('email'),
        name: formData.get('name') || '',
        interests: formData.get('interests') || '',
        consent: toBool(formData.get('consent')),
        source: formData.get('source') || 'newsletter',
        turnstile_token: formData.get('turnstile_token') || ''
      }), {
        successMessage: 'Subscribed. You will receive the next newsletter issue.'
      });
    }
  }

  async function wireForm(form, endpoint, getPayload, options) {
    const responseNode = form.querySelector('[data-form-response]');
    const submit = form.querySelector('button[type="submit"]');
    let started = false;

    form.addEventListener(
      'focusin',
      () => {
        if (!started) {
          started = true;
          trackEvent('form_start', { endpoint, form_id: form.id || 'unknown' });
        }
      },
      { once: true }
    );

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (form.website && form.website.value) {
        setMessage(responseNode, 'Submission blocked.', true);
        return;
      }

      const formData = new FormData(form);
      const payload = getPayload(formData);

      if (!payload.consent) {
        setMessage(responseNode, 'Please provide consent to continue.', true);
        return;
      }

      if (!isLikelyValidEmail(payload.email || '')) {
        setMessage(responseNode, 'Please enter a valid email address.', true);
        return;
      }

      if (payload.phone && !isLikelyValidPhone(payload.phone)) {
        setMessage(responseNode, 'Please enter a valid phone number.', true);
        return;
      }

      const originalText = submit ? submit.textContent : '';
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Submitting...';
      }

      try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Request failed');
        }

        form.reset();
        setMessage(responseNode, options.successMessage || 'Submitted successfully.', false);
        trackEvent('lead_submit', { endpoint, source: payload.source || 'unknown' });

        if (options.onSuccess) {
          options.onSuccess(result);
        }
      } catch (error) {
        setMessage(responseNode, error.message || 'Something went wrong. Please try again.', true);
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = originalText;
        }
      }
    });
  }

  async function initResourceHub() {
    const list = document.getElementById('resource-list');
    if (!list) return;

    const filterLabel = document.getElementById('filter-label');
    const url = new URL(window.location.href);
    const activePillar = url.searchParams.get('pillar');

    try {
      const response = await fetch('data/content-items.json');
      if (!response.ok) throw new Error('Unable to load content index');
      const items = await response.json();

      let published = items.filter((item) => item.status === 'published');
      if (activePillar) {
        published = published.filter((item) => item.pillar === activePillar);
      }

      published.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

      if (filterLabel) {
        filterLabel.textContent = activePillar
          ? `Filtered by: ${labelizePillar(activePillar)}`
          : 'Showing all pillars';
      }

      if (!published.length) {
        list.innerHTML = '<p>No resources yet for this pillar. Please check another category.</p>';
        return;
      }

      list.innerHTML = published
        .map(
          (item) => `
            <article class="resource-card">
              <p class="resource-meta">${labelizePillar(item.pillar)} | ${formatDate(item.publish_date)} | ${item.type}</p>
              <h3>${escapeHtml(item.title)}</h3>
              <p class="resource-summary">${escapeHtml(item.summary)}</p>
              <a class="resource-link" href="${item.url}" data-resource-slug="${item.slug}">Read resource</a>
            </article>
          `
        )
        .join('');

      list.querySelectorAll('[data-resource-slug]').forEach((link) => {
        link.addEventListener('click', () => {
          trackEvent('resource_click', { slug: link.dataset.resourceSlug || 'unknown' });
        });
      });
    } catch (error) {
      list.innerHTML = `<p>Could not load resources right now. ${escapeHtml(error.message)}</p>`;
    }
  }

  async function initResourceDetail() {
    const detailNode = document.getElementById('resource-detail-card');
    if (!detailNode) return;

    const url = new URL(window.location.href);
    const slug = url.searchParams.get('slug');
    if (!slug) {
      detailNode.innerHTML = '<p class=\"form-response error\">No resource selected.</p>';
      return;
    }

    try {
      const response = await fetch('data/resource-bodies.json');
      if (!response.ok) throw new Error('Unable to load resource content');
      const data = await response.json();
      const item = data[slug];

      if (!item) {
        detailNode.innerHTML = '<p class=\"form-response error\">Resource not found.</p>';
        return;
      }

      document.title = `${item.title} | Dirgha Farms`;
      detailNode.innerHTML = `
        <p class=\"resource-meta\">${labelizePillar(item.pillar)} | ${formatDate(item.publish_date)}</p>
        <h1>${escapeHtml(item.title)}</h1>
        ${item.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      `;
    } catch (error) {
      detailNode.innerHTML = `<p class=\"form-response error\">${escapeHtml(error.message)}</p>`;
    }
  }

  function initDownloadTracking() {
    document.querySelectorAll('a[download]').forEach((link) => {
      link.addEventListener('click', () => {
        trackEvent('download_click', { href: link.getAttribute('href') || '' });
      });
    });
  }

  function setMessage(node, message, isError) {
    if (!node) return;
    node.textContent = message;
    node.classList.toggle('error', Boolean(isError));
    node.classList.toggle('success', !isError);
  }

  function toBool(value) {
    return value === true || value === 'true' || value === 'on';
  }

  function isLikelyValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isLikelyValidPhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }

  function formatDate(dateInput) {
    const date = new Date(dateInput);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  function labelizePillar(slug) {
    return slug
      .split('-')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  }

  function trackEvent(name, payload) {
    if (!window.dataLayer) {
      window.dataLayer = [];
    }
    window.dataLayer.push({ event: name, ...payload });
  }

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();

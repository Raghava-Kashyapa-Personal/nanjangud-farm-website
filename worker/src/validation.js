export function parseBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 1 || value === '1';
}

export function normalizeString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function isValidEmail(value) {
  const email = normalizeString(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(value) {
  const digits = normalizeString(value).replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function validateProduceWaitlist(payload) {
  const required = [
    'name',
    'email',
    'phone',
    'city',
    'household_size',
    'box_preference',
    'frequency_preference',
    'consent',
    'source'
  ];

  const missing = required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing.length) {
    return { valid: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  if (!isValidEmail(payload.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!isValidPhone(payload.phone)) {
    return { valid: false, error: 'Invalid phone format' };
  }

  const household = Number(payload.household_size);
  if (!Number.isInteger(household) || household < 1 || household > 20) {
    return { valid: false, error: 'household_size must be an integer between 1 and 20' };
  }

  if (!parseBoolean(payload.consent)) {
    return { valid: false, error: 'Consent is required' };
  }

  return { valid: true };
}

export function validateLeadMagnet(payload) {
  const required = ['name', 'email', 'phone', 'city', 'consent', 'source'];
  const missing = required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing.length) {
    return { valid: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  if (!isValidEmail(payload.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!isValidPhone(payload.phone)) {
    return { valid: false, error: 'Invalid phone format' };
  }

  if (!parseBoolean(payload.consent)) {
    return { valid: false, error: 'Consent is required' };
  }

  return { valid: true };
}

export function validateNewsletter(payload) {
  const required = ['email', 'consent', 'source'];
  const missing = required.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });

  if (missing.length) {
    return { valid: false, error: `Missing fields: ${missing.join(', ')}` };
  }

  if (!isValidEmail(payload.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (!parseBoolean(payload.consent)) {
    return { valid: false, error: 'Consent is required' };
  }

  return { valid: true };
}

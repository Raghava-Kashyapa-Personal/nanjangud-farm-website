import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidPhone,
  parseBoolean,
  validateLeadMagnet,
  validateNewsletter,
  validateProduceWaitlist
} from '../src/validation.js';

assert.equal(parseBoolean(true), true);
assert.equal(parseBoolean('true'), true);
assert.equal(parseBoolean('on'), true);
assert.equal(parseBoolean('1'), true);
assert.equal(parseBoolean(false), false);

assert.equal(isValidEmail('person@example.com'), true);
assert.equal(isValidEmail('bad-email'), false);
assert.equal(isValidPhone('+91 98765 43210'), true);
assert.equal(isValidPhone('123'), false);

const valid = validateProduceWaitlist({
  name: 'Raghava',
  email: 'raghava@example.com',
  phone: '+91 98765 43210',
  city: 'Bangalore',
  household_size: 3,
  box_preference: 'seasonal-mix',
  frequency_preference: 'weekly',
  consent: true,
  source: 'test'
});
assert.equal(valid.valid, true);

const invalid = validateProduceWaitlist({
  name: 'Raghava',
  email: 'raghava@example.com',
  phone: '+91 98765 43210',
  city: 'Bangalore',
  household_size: 0,
  box_preference: 'seasonal-mix',
  frequency_preference: 'weekly',
  consent: true,
  source: 'test'
});
assert.equal(invalid.valid, false);

const invalidLeadMagnet = validateLeadMagnet({
  name: 'User',
  email: 'user@example.com',
  phone: '+91 98765 43210',
  city: 'Mysore',
  consent: false,
  source: 'test'
});
assert.equal(invalidLeadMagnet.valid, false);

const validNewsletter = validateNewsletter({
  email: 'user@example.com',
  consent: true,
  source: 'test'
});
assert.equal(validNewsletter.valid, true);

console.log('Validation smoke tests passed.');

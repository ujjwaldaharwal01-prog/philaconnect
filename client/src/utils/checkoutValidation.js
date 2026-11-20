import { PAYMENT_METHODS } from '../constants/payment';

/**
 * Checks the checkout form BEFORE it is sent. Returns an object mapping field name -> message
 * (an empty object means everything is valid).
 * The server repeats the same rules, because browser checks alone can be bypassed.
 */
export function validateCheckout(form) {
  const errors = {};
  const text = (key) => (typeof form[key] === 'string' ? form[key].trim() : '');

  if (text('fullName').length < 2) errors.fullName = 'Please enter your full name.';

  const phoneDigits = text('phone').replace(/[\s()+-]/g, '');
  if (!/^\d{10,13}$/.test(phoneDigits)) errors.phone = 'Enter a valid phone number (10 to 13 digits).';

  if (text('addressLine1').length < 5) errors.addressLine1 = 'Please enter your street address.';
  if (text('city').length < 2) errors.city = 'Please enter your city.';
  if (text('state').length < 2) errors.state = 'Please enter your state.';
  if (!/^\d{6}$/.test(text('postalCode'))) errors.postalCode = 'PIN code must be exactly 6 digits.';

  if (!PAYMENT_METHODS.some((m) => m.value === form.paymentMethod)) {
    errors.paymentMethod = 'Please choose a payment method.';
  }
  if (text('notes').length > 300) errors.notes = 'Notes can be at most 300 characters.';

  return errors;
}

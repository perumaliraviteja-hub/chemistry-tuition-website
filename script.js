const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-navigation]');

const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const enquiryForm = document.querySelector('[data-enquiry-form]');
const enquirySuccess = document.querySelector('[data-form-success]');

if (enquiryForm && enquirySuccess) {
  const fields = {
    fullName: {
      input: enquiryForm.elements.fullName,
      error: document.querySelector('#full-name-error'),
      validate: (value) => value.trim().length >= 2 ? '' : 'Please enter your full name.',
    },
    email: {
      input: enquiryForm.elements.email,
      error: document.querySelector('#email-error'),
      validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Please enter a valid email address.',
    },
    phone: {
      input: enquiryForm.elements.phone,
      error: document.querySelector('#phone-error'),
      validate: (value) => /^[0-9+\-()\s]{7,}$/.test(value.trim()) && value.replace(/\D/g, '').length >= 7 ? '' : 'Please enter a valid phone number.',
    },
    message: {
      input: enquiryForm.elements.message,
      error: document.querySelector('#message-error'),
      validate: (value) => value.trim().length < 10 ? 'Please share at least 10 characters.' : value.trim().length > 1200 ? 'Please keep your message under 1,200 characters.' : '',
    },
  };
  const consent = enquiryForm.elements.consent;
  const consentError = document.querySelector('#consent-error');

  const setError = (field, message) => {
    field.error.textContent = message;
    field.input.setAttribute('aria-invalid', String(Boolean(message)));
  };

  Object.values(fields).forEach((field) => {
    field.input.addEventListener('input', () => setError(field, field.validate(field.input.value)));
  });
  consent.addEventListener('change', () => {
    consentError.textContent = consent.checked ? '' : 'Please agree to be contacted regarding your enquiry.';
    consent.setAttribute('aria-invalid', String(!consent.checked));
  });

  enquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();
    let isValid = true;
    Object.values(fields).forEach((field) => {
      const message = field.validate(field.input.value);
      setError(field, message);
      if (message) isValid = false;
    });
    const consentMessage = consent.checked ? '' : 'Please agree to be contacted regarding your enquiry.';
    consentError.textContent = consentMessage;
    consent.setAttribute('aria-invalid', String(Boolean(consentMessage)));
    if (!consent.checked) isValid = false;
    if (!isValid) {
      const firstInvalid = enquiryForm.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      return;
    }
    enquiryForm.hidden = true;
    enquirySuccess.hidden = false;
    const successHeading = enquirySuccess.querySelector('h2');
    successHeading?.setAttribute('tabindex', '-1');
    successHeading?.focus();
  });

  document.querySelector('[data-form-reset]')?.addEventListener('click', () => {
    enquiryForm.reset();
    enquiryForm.hidden = false;
    enquirySuccess.hidden = true;
    Object.values(fields).forEach((field) => setError(field, ''));
    consentError.textContent = '';
    consent.setAttribute('aria-invalid', 'false');
    fields.fullName.input.focus();
  });
}

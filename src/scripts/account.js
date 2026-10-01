import { api } from './api.js';

const form = document.querySelector('#account-form');
const ar = document.documentElement.lang.startsWith('ar');
const status = document.querySelector('#account-status');
const heading = document.querySelector('#account-heading');
const button = form.querySelector('button[type="submit"]');
let mode = 'signup';

function setMode(next) {
  mode = next;
  const signup = mode === 'signup';
  heading.textContent = ar ? (signup ? 'إنشاء حساب' : 'تسجيل الدخول') : (signup ? 'Create your account' : 'Sign in');
  button.textContent = ar ? (signup ? 'إنشاء حساب' : 'تسجيل الدخول') : (signup ? 'Create account' : 'Sign in');
  for (const id of ['full-name-field', 'clinic-field']) document.querySelector(`#${id}`).hidden = !signup;
  for (const input of [form.elements.full_name, form.elements.clinic_name]) input.required = signup;
  form.elements.password.autocomplete = signup ? 'new-password' : 'current-password';
  form.elements.password.minLength = signup ? 10 : 1;
  status.textContent = '';
  document.querySelector('.account-toggle').textContent = ar
    ? (signup ? 'لديك حساب؟ سجّل الدخول' : 'إنشاء حساب جديد')
    : (signup ? 'Already have an account? Sign in' : 'Create a new account');
}

document.querySelector('.account-toggle').addEventListener('click', () => setMode(mode === 'signup' ? 'signin' : 'signup'));
form.addEventListener('submit', async event => {
  event.preventDefault();
  button.disabled = true;
  status.textContent = ar ? 'جارٍ الاتصال…' : 'Connecting…';
  try {
    const data = { email: String(form.elements.email.value).trim(), password: form.elements.password.value };
    if (mode === 'signup') {
      data.full_name = String(form.elements.full_name.value).trim();
      data.clinic_name = String(form.elements.clinic_name.value).trim();
    }
    await api(mode === 'signup' ? 'signup' : 'login', data);
    const destination = new URLSearchParams(location.search).get('next') || `/${ar ? 'ar' : 'en'}/products/`;
    location.assign(destination.startsWith(`/${ar ? 'ar' : 'en'}/`) && !destination.startsWith('//') ? destination : `/${ar ? 'ar' : 'en'}/products/`);
  } catch (error) {
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

async function loadAccount() {
  try {
    const { user, quotes } = await api('me');
    form.hidden = Boolean(user);
    document.querySelector('#account-dashboard').hidden = !user;
    if (!user) return;
    document.querySelector('#account-email').textContent = user.email;
    const list = document.querySelector('#account-quotes');
    list.replaceChildren();
    if (!quotes.length) {
      list.textContent = ar ? 'لا توجد طلبات سابقة.' : 'No submitted requests yet.';
      return;
    }
    for (const quote of quotes) {
      const row = document.createElement('p');
      row.className = 'account-quote-row';
      row.textContent = `${new Date(quote.submitted_at || quote.created_at).toLocaleDateString(ar ? 'ar-AE' : 'en-AE')} · ${quote.status} · ${quote.id.slice(0, 8).toUpperCase()}`;
      list.append(row);
    }
  } catch {
    status.textContent = ar ? 'خدمة الحسابات غير متاحة حالياً.' : 'The account service is unavailable right now.';
  }
}

document.querySelector('#account-signout').addEventListener('click', async () => {
  try { await api('logout', {}); } finally { location.assign(`/${ar ? 'ar' : 'en'}/`); }
});
loadAccount();

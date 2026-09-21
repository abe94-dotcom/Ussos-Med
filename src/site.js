const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const cartCount = document.querySelector('.cart-count');
const cartLink = document.querySelector('.cart-link');
const toast = document.querySelector('.cart-toast');
const currencyRates = { AED: 1, USD: 1 / 3.6725, SAR: 3.75 / 3.6725, QAR: 3.64 / 3.6725, OMR: 1 / 9.538713, JOD: 1 / 5.179831, SYP: 1 / 0.030102, BHD: 1 / 9.741379, KWD: 1 / 11.948918 };
const regionCurrency = { AE: 'AED', SA: 'SAR', QA: 'QAR', OM: 'OMR', JO: 'JOD', SY: 'SYP', BH: 'BHD', KW: 'KWD' };
const timeZoneCurrency = { 'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Qatar': 'QAR', 'Asia/Muscat': 'OMR', 'Asia/Amman': 'JOD', 'Asia/Damascus': 'SYP', 'Asia/Bahrain': 'BHD', 'Asia/Kuwait': 'KWD' };
const currencyFractionDigits = { AED: 0, SAR: 0, QAR: 0, USD: 2, OMR: 3, JOD: 3, BHD: 3, KWD: 3, SYP: 0 };
let count = 0;

function detectedCurrency() {
  const saved = window.localStorage.getItem('ussus_currency');
  if (saved && currencyRates[saved]) return saved;
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const region = typeof Intl.Locale === 'function' ? new Intl.Locale(locale).region : undefined;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return regionCurrency[region] || timeZoneCurrency[timeZone] || 'USD';
}

function renderCurrency(currency) {
  const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: currencyFractionDigits[currency], maximumFractionDigits: currencyFractionDigits[currency] });
  document.querySelectorAll('[data-price-aed]').forEach((price) => {
    price.textContent = formatter.format(Number(price.dataset.priceAed) * currencyRates[currency]);
  });
}

function installCurrencySelector() {
  const currency = detectedCurrency();
  document.querySelectorAll('.language-button').forEach((button) => {
    const selector = document.createElement('select');
    selector.className = 'currency-selector';
    selector.setAttribute('aria-label', 'Display currency');
    [['AED', 'AED'], ['SAR', 'SAR'], ['QAR', 'QAR'], ['OMR', 'OMR'], ['JOD', 'JOD'], ['SYP', 'SYP'], ['BHD', 'BHD'], ['KWD', 'KWD'], ['USD', 'USD']].forEach(([value, label]) => selector.add(new Option(label, value)));
    selector.value = currency;
    selector.addEventListener('change', () => { window.localStorage.setItem('ussus_currency', selector.value); renderCurrency(selector.value); });
    button.after(selector);
  });
  renderCurrency(currency);
}

menuButton?.addEventListener('click', () => { const isOpen = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!isOpen)); navigation?.classList.toggle('is-open', !isOpen); });
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => { menuButton?.setAttribute('aria-expanded', 'false'); navigation?.classList.remove('is-open'); }));
document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => { count += 1; cartCount.textContent = String(count); cartLink?.setAttribute('aria-label', `Shopping cart, ${count} ${count === 1 ? 'item' : 'items'}`); toast.textContent = `${button.dataset.product} added to cart`; toast.classList.add('is-visible'); window.setTimeout(() => toast.classList.remove('is-visible'), 2600); }));
installCurrencySelector();

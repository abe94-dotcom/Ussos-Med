const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const cartCount = document.querySelector('.cart-count');
const cartLink = document.querySelector('.cart-link');
const toast = document.querySelector('.cart-toast');
const currencyRates = { AED: 1, USD: 1 / 3.6725, SAR: 3.75 / 3.6725, QAR: 3.64 / 3.6725 };
const regionCurrency = { AE: 'AED', SA: 'SAR', QA: 'QAR' };
const timeZoneCurrency = { 'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR', 'Asia/Qatar': 'QAR' };
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
  const formatter = new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: currency === 'USD' ? 2 : 0 });
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
    [['AED', 'AED'], ['SAR', 'SAR'], ['QAR', 'QAR'], ['USD', 'USD']].forEach(([value, label]) => selector.add(new Option(label, value)));
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

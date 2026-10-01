import { products } from '../data/products.js';
import { api } from './api.js';

const $ = selector => document.querySelector(selector);
const lang = document.documentElement.lang.startsWith('ar') ? 'ar' : 'en';
const accountUrl = `/${lang}/account/`;
const bySlug = new Map(products.map(product => [product.slug, product]));
let currentUser = null;
let prices = new Map();
let currentCart = null;
const copy = {
  signIn: lang === 'ar' ? 'سجّل الدخول لعرض الأسعار وإضافة المنتجات' : 'Sign in to view prices and add products',
  viewPrice: lang === 'ar' ? 'سجّل الدخول لعرض السعر' : 'Sign in to view price',
  added: lang === 'ar' ? 'تمت إضافة المنتج إلى سلة طلب عرض السعر.' : 'Added to your quote basket.',
  failed: lang === 'ar' ? 'تعذر حفظ التغيير. حاول مرة أخرى.' : 'Could not save that change. Please try again.',
};
const signInLink = next => `${accountUrl}?next=${encodeURIComponent(next || location.pathname)}`;

function refreshGate() {
  const cartLink = $('.cart-link');
  if (cartLink) cartLink.href = currentUser ? `/${lang}/quote/` : signInLink(`/${lang}/quote/`);
  const accountLink = $('.account-link');
  if (accountLink) {
    accountLink.textContent = currentUser ? (lang === 'ar' ? 'حسابي' : 'My account') : (lang === 'ar' ? 'دخول / حساب' : 'Sign in / Create account');
    accountLink.href = accountUrl;
  }
  const selector = $('.currency-selector');
  if (selector) selector.hidden = true;
  document.querySelectorAll('[data-product-price]').forEach(node => {
    const amount = currentUser && prices.get(node.dataset.productPrice);
    node.textContent = amount == null
      ? (currentUser ? (lang === 'ar' ? 'السعر قيد الإعداد' : 'Price being prepared') : copy.viewPrice)
      : `AED ${Number(amount).toLocaleString('en')}`;
    node.classList.toggle('is-price-locked', amount == null);
  });
  document.querySelectorAll('.product-order').forEach(form => {
    const available = Boolean(currentUser && prices.has(form.dataset.slug));
    form.hidden = !available;
    let gate = form.parentElement.querySelector('.product-account-gate');
    if (!gate) {
      gate = document.createElement('p');
      gate.className = 'product-account-gate';
      form.after(gate);
    }
    gate.hidden = available;
    if (!available) {
      const link = document.createElement('a');
      link.className = 'button button-primary';
      link.href = currentUser ? 'mailto:sales@ussusmed.com' : signInLink(location.pathname);
      link.textContent = currentUser ? (lang === 'ar' ? 'تواصل مع المبيعات لمعرفة السعر' : 'Contact sales for pricing') : copy.signIn;
      gate.replaceChildren(link);
    }
  });
  const quoteLayout = $('.quote-layout');
  if (quoteLayout) {
    quoteLayout.hidden = !currentUser;
    const gate = $('.quote-account-gate');
    if (gate) gate.hidden = Boolean(currentUser);
  }
}

function announce(message) {
  const toast = $('.cart-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 4200);
}

async function getCart() {
  if (!currentUser) return { cart: null, items: [] };
  const result = await api('cart');
  currentCart = result.cart;
  const badge = $('.cart-count');
  if (badge) badge.textContent = String(result.items.reduce((sum, item) => sum + item.quantity, 0));
  return result;
}

document.querySelectorAll('.product-order').forEach(form => form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser) { location.assign(signInLink(location.pathname)); return; }
  const product = bySlug.get(form.dataset.slug);
  if (!product) return;
  const values = new FormData(form);
  const quantity = Number(values.get('quantity'));
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return;
  const options = {
    height: String(values.get('height') || ''),
    system: String(values.get('system') || '').trim(),
    connection: String(values.get('connection') || '').trim(),
  };
  if (product.needsSystem && !options.system) options.system = 'Please advise';
  try {
    await api('add_item', { slug: product.slug, quantity, options });
    await getCart();
    announce(copy.added);
  } catch { announce(copy.failed); }
}));

async function renderQuotePage() {
  const list = $('#basket-items');
  if (!list || !currentUser) return;
  let result;
  try { result = await getCart(); } catch { list.textContent = copy.failed; return; }
  const { items } = result;
  list.replaceChildren();
  const quoteForm = $('#quote-form');
  if (!items.length) {
    $('#basket-total').textContent = '';
    list.textContent = lang === 'ar' ? 'السلة فارغة. تصفح المنتجات وأضف ما تحتاجه.' : 'Your basket is empty. Browse products and add the items you need.';
    if (quoteForm) quoteForm.querySelector('button[type="submit"]').disabled = true;
    return;
  }
  if (items.some(item => !prices.has(item.product_slug))) {
    list.textContent = lang === 'ar' ? 'تعذر تحميل بعض الأسعار. حاول تحديث الصفحة.' : 'Some prices could not be loaded. Please refresh the page.';
    if (quoteForm) quoteForm.querySelector('button[type="submit"]').disabled = true;
    return;
  }
  if (quoteForm) quoteForm.querySelector('button[type="submit"]').disabled = false;
  let total = 0;
  for (const item of items) {
    const product = bySlug.get(item.product_slug);
    if (!product) continue;
    const price = prices.get(item.product_slug);
    total += price * item.quantity;
    const row = document.createElement('article'); row.className = 'basket-row';
    const name = document.createElement('a'); name.className = 'text-link'; name.href = `/${lang}/products/${product.slug}/`; name.textContent = product.name; name.dir = 'ltr';
    const detail = document.createElement('p'); detail.textContent = [product.sku, item.options?.height, item.options?.system, item.options?.connection].filter(Boolean).join(' · ');
    const quantity = document.createElement('label'); quantity.textContent = lang === 'ar' ? 'الكمية' : 'Quantity';
    const input = document.createElement('input'); Object.assign(input, { type: 'number', min: '1', max: '999', value: String(item.quantity), required: true });
    input.addEventListener('change', async () => {
      const amount = Number(input.value); if (!Number.isInteger(amount) || amount < 1 || amount > 999) return;
      try { await api('update_item', { id: item.id, quantity: amount }); await renderQuotePage(); } catch { announce(copy.failed); }
    });
    quantity.append(input);
    const line = document.createElement('strong'); line.textContent = `AED ${(price * item.quantity).toLocaleString('en')} line total`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'remove-button'; remove.textContent = lang === 'ar' ? 'إزالة' : 'Remove';
    remove.addEventListener('click', async () => {
      try { await api('remove_item', { id: item.id }); await renderQuotePage(); } catch { announce(copy.failed); }
    });
    row.append(name, detail, quantity, line, remove); list.append(row);
  }
  $('#basket-total').textContent = `${lang === 'ar' ? 'المجموع الفرعي للمنتجات' : 'Item subtotal'}: AED ${total.toLocaleString('en')}`;
  if (quoteForm?.elements.email) quoteForm.elements.email.value = currentUser.email;
}

const quoteForm = $('#quote-form');
quoteForm?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!currentUser || !currentCart) return;
  const values = new FormData(quoteForm);
  try {
    await api('submit_quote', { destination: String(values.get('destination') || ''), notes: String(values.get('notes') || '') });
    $('#form-status').textContent = lang === 'ar' ? 'تم استلام طلب عرض السعر.' : 'Your quote request has been submitted.';
    quoteForm.hidden = true;
    await getCart();
  } catch (error) { $('#form-status').textContent = error.message; }
});

async function initCommerce() {
  try {
    const result = await api('me');
    currentUser = result.user;
    if (currentUser) {
      const priceResult = await api('prices');
      prices = new Map(priceResult.prices.map(row => [row.product_slug, row.amount_aed]));
    }
  } catch { currentUser = null; }
  refreshGate();
  if (currentUser) { await getCart(); await renderQuotePage(); }
}

// Preserve public product discovery: category and text search never depend on sign-in.
const catalogue = $('[data-catalogue]');
if (catalogue) {
  const params = new URLSearchParams(location.search);
  const languageSwitch = $('.language-switch');
  if (languageSwitch && (params.has('q') || params.has('category'))) languageSwitch.href += `?${params.toString()}`;
  const query = (params.get('q') || '').trim().slice(0, 120);
  const groups = [...catalogue.querySelectorAll('[data-category]')];
  const category = groups.some((group) => group.dataset.category === params.get('category')) ? params.get('category') : 'all';
  const queryField = $('#catalogue-query'); if (queryField) queryField.value = query;
  let visible = 0;
  groups.forEach((group) => {
    let count = 0;
    group.querySelectorAll('.catalogue-card').forEach((card) => {
      const matches = (category === 'all' || group.dataset.category === category) && (!query || card.dataset.search.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
      card.hidden = !matches; if (matches) { visible++; count++; }
    });
    group.hidden = count === 0;
  });
  catalogue.querySelectorAll('[data-category-filter]').forEach((link) => { if (link.dataset.categoryFilter === category) link.setAttribute('aria-current', 'true'); });
  const resultCount = $('#catalogue-result-count');
  if (resultCount) resultCount.textContent = `${visible} ${lang === 'ar' ? 'منتجات' : visible === 1 ? 'product' : 'products'}`;
  const empty = $('#catalogue-empty'); if (empty) empty.hidden = visible !== 0;
}

const menu = $('.menu-toggle'); const nav = $('.site-nav');
menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav?.classList.toggle('is-open', open); });

initCommerce();

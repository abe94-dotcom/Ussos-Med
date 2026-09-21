const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const cartCount = document.querySelector('.cart-count');
const cartLink = document.querySelector('.cart-link');
const toast = document.querySelector('.cart-toast');
let count = 0;
menuButton?.addEventListener('click', () => { const isOpen = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!isOpen)); navigation?.classList.toggle('is-open', !isOpen); });
document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => { menuButton?.setAttribute('aria-expanded', 'false'); navigation?.classList.remove('is-open'); }));
document.querySelectorAll('.add-button').forEach((button) => button.addEventListener('click', () => { count += 1; cartCount.textContent = String(count); cartLink?.setAttribute('aria-label', `Shopping cart, ${count} ${count === 1 ? 'item' : 'items'}`); toast.textContent = `${button.dataset.product} added to cart`; toast.classList.add('is-visible'); window.setTimeout(() => toast.classList.remove('is-visible'), 2600); }));

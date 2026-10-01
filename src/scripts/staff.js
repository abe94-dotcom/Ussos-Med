import { products } from '../data/products.js';
import { api } from './api.js';

const status = document.querySelector('#staff-status');
const workspace = document.querySelector('#staff-workspace');
const queue = document.querySelector('#staff-queue');
const priceSection = document.querySelector('#staff-prices');
const priceList = document.querySelector('#staff-price-list');
const productNames = new Map(products.map(product => [product.slug, product.name]));
const statuses = ['submitted', 'in_review', 'quoted', 'accepted', 'declined', 'cancelled'];

function node(tag, value, className) {
  const element = document.createElement(tag);
  if (value != null) element.textContent = value;
  if (className) element.className = className;
  return element;
}

function renderQueue(requests, items) {
  queue.replaceChildren();
  if (!requests.length) { queue.append(node('p', 'No quote requests yet.')); return; }
  for (const request of requests) {
    const card = node('article', null, 'staff-card');
    card.append(
      node('h2', `${request.clinic_name || request.full_name || 'Customer'} · ${request.id.slice(0, 8).toUpperCase()}`),
      node('p', new Date(request.submitted_at || request.created_at).toLocaleString('en-AE')),
      node('p', [request.full_name, request.email].filter(Boolean).join(' · ')),
      node('p', request.destination ? `Delivery: ${request.destination}` : 'Delivery destination not supplied'),
      node('p', request.customer_note ? `Customer note: ${request.customer_note}` : 'No customer note')
    );
    const reply = node('a', 'Email customer', 'text-link');
    reply.href = `mailto:${encodeURIComponent(request.email)}?subject=${encodeURIComponent(`USSUS Med quotation ${request.id.slice(0, 8).toUpperCase()}`)}`;
    card.append(reply);
    const itemList = node('div', null, 'staff-items');
    for (const item of items.filter(entry => entry.quote_id === request.id)) {
      const line = node('div', null, 'staff-item');
      line.append(node('p', `${item.quantity} × ${productNames.get(item.product_slug) || item.product_slug} · ${[item.options?.height, item.options?.system, item.options?.connection].filter(Boolean).join(' · ')}`));
      const price = node('input'); price.type = 'number'; price.min = '0'; price.step = '0.01'; price.placeholder = 'Quoted AED/unit'; price.value = item.quoted_unit_aed ?? '';
      const staffNote = node('input'); staffNote.maxLength = 3000; staffNote.placeholder = 'Staff note'; staffNote.value = item.staff_note || '';
      const save = node('button', 'Save item', 'button button-secondary'); save.type = 'button';
      save.addEventListener('click', async () => {
        try { await api('set_quote_item', { id: item.id, amount: price.value === '' ? null : price.value, note: staffNote.value }); status.textContent = 'Item saved.'; }
        catch (error) { status.textContent = error.message; }
      });
      line.append(price, staffNote, save); itemList.append(line);
    }
    card.append(itemList);
    const label = node('label', 'Status');
    const select = node('select');
    for (const value of statuses) {
      const option = node('option', value.replaceAll('_', ' ')); option.value = value; option.selected = value === request.status; select.append(option);
    }
    select.addEventListener('change', async () => {
      try { await api('set_status', { id: request.id, status: select.value }); status.textContent = 'Status saved.'; request.status = select.value; }
      catch (error) { status.textContent = error.message; select.value = request.status; }
    });
    label.append(select); card.append(label); queue.append(card);
  }
}

function renderPrices(prices) {
  priceList.replaceChildren();
  const bySlug = new Map(prices.map(row => [row.product_slug, row.amount_aed]));
  for (const product of products) {
    const label = node('label', product.name, 'staff-price-row');
    const input = node('input'); input.type = 'number'; input.min = '0'; input.step = '0.01'; input.required = true; input.placeholder = 'AED'; input.value = bySlug.get(product.slug) ?? '';
    const save = node('button', 'Save price', 'button button-secondary'); save.type = 'button';
    save.addEventListener('click', async () => {
      if (!input.reportValidity()) return;
      try { await api('set_price', { slug: product.slug, amount: input.value }); status.textContent = 'Price saved.'; }
      catch (error) { status.textContent = error.message; }
    });
    label.append(input, save); priceList.append(label);
  }
}

async function init() {
  try {
    const { user } = await api('me');
    if (!user) { status.textContent = 'Please sign in with your staff account.'; return; }
    const result = await api('staff');
    workspace.hidden = false;
    status.textContent = 'Showing recent quote requests.';
    renderQueue(result.requests, result.items);
    if (result.role === 'admin') { priceSection.hidden = false; renderPrices(result.prices); }
  } catch (error) {
    status.textContent = error.message;
  }
}
init();

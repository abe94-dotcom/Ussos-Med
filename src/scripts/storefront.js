import { products } from '../data/products.js';
import { getProducts } from '../data/localized-products.js';
const key = 'ussus_quote_v1';
const find = slug => products.find(p => p.slug === slug);
const lang = document.documentElement.lang.startsWith('ar') ? 'ar' : 'en';
const localizedProducts = getProducts(lang);
const displayName = slug => localizedProducts.find(p => p.slug === slug)?.name || find(slug)?.name || '';
let basket = [];
try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) basket = saved.filter(i => find(i?.slug) && Number.isInteger(i.quantity) && i.quantity > 0 && i.quantity <= 999 && typeof i.height === 'string' && typeof i.system === 'string' && i.system.length <= 180 && (i.connection === undefined || typeof i.connection === 'string' && i.connection.length <= 120) && (!find(i.slug).heights.length || find(i.slug).heights.includes(i.height)) && (!find(i.slug).needsSystem || i.system.trim())).map(i => ({ ...i, connection: i.connection || '' })); } catch {}
const $ = s => document.querySelector(s);
let timer;
function announce(text) { $('.cart-toast').textContent = text; $('.cart-toast').classList.add('is-visible'); clearTimeout(timer); timer = setTimeout(() => $('.cart-toast').classList.remove('is-visible'), 4500); }
function count() { const n = basket.reduce((a,i) => a+i.quantity,0); $('.cart-count').textContent = n; $('.cart-link').setAttribute('aria-label', lang === 'ar' ? `سلة عرض السعر، ${n} منتجات` : `Quote basket, ${n} ${n === 1 ? 'item' : 'items'}`); }
function save() { localStorage.setItem(key, JSON.stringify(basket)); count(); if ($('#quote-ready')) $('#quote-ready').hidden = true; }
const currency = $('.currency-selector');
const rates = { AED: 1, USD: 1 / 3.6725, SAR: 3.75 / 3.6725, QAR: 3.64 / 3.6725, OMR: 1 / 9.538713, JOD: 1 / 5.179831, SYP: 1 / 0.030102, BHD: 1 / 9.741379, KWD: 1 / 11.948918 };
try { const saved = localStorage.getItem('ussus_currency'); currency.value = Object.hasOwn(rates, saved) ? saved : 'AED'; } catch {}
function prices() { document.querySelectorAll('[data-price-aed]').forEach(n => { const estimate = currency.value !== 'AED'; n.textContent = (estimate ? '≈ ' : '') + new Intl.NumberFormat('en', {style:'currency',currency:currency.value,currencyDisplay:'code'}).format(Number(n.dataset.priceAed)*rates[currency.value]); }); }
currency.addEventListener('change', () => { try { localStorage.setItem('ussus_currency',currency.value); } catch {} prices(); }); prices();
const menu = $('.menu-toggle'), nav = $('.site-nav');
function close() { menu.setAttribute('aria-expanded','false'); nav.classList.remove('is-open'); menu.querySelector('.sr-only').textContent = 'Open menu'; }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); nav.classList.toggle('is-open',open); menu.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu'; });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click',close));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { close(); menu.focus(); } });
const catalogue = $('[data-catalogue]');
if (catalogue) {
 const params = new URLSearchParams(location.search);
 const languageSwitch = $('.language-switch');
 if (params.has('q') || params.has('category')) languageSwitch.href += `?${params.toString()}`;
 const query = (params.get('q') || '').trim().slice(0, 120);
 const allowedCategories = [...catalogue.querySelectorAll('[data-category]')].map(group => group.dataset.category);
 const category = allowedCategories.includes(params.get('category')) ? params.get('category') : 'all';
 const queryField = $('#catalogue-query');
 queryField.value = query;
 let visible = 0;
 catalogue.querySelectorAll('[data-category]').forEach(group => {
  let groupCount = 0;
  group.querySelectorAll('.catalogue-card').forEach(card => {
   const matches = (category === 'all' || group.dataset.category === category) && (!query || card.dataset.search.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
   card.hidden = !matches;
   if (matches) { visible++; groupCount++; }
  });
  group.hidden = groupCount === 0;
 });
 catalogue.querySelectorAll('[data-category-filter]').forEach(link => {
  if (link.dataset.categoryFilter === category) link.setAttribute('aria-current', 'true');
 });
 $('#catalogue-result-count').textContent = `${visible} ${catalogue.dataset.locale === 'ar' ? 'منتجات' : visible === 1 ? 'product' : 'products'}`;
 $('#catalogue-empty').hidden = visible !== 0;
}
document.querySelectorAll('.product-order').forEach(form => form.addEventListener('submit', e => {
 e.preventDefault(); const d = new FormData(form); const item = {slug:form.dataset.slug,quantity:Number(d.get('quantity')),height:String(d.get('height') || ''),system:String(d.get('system') || '').trim(),connection:String(d.get('connection') || '').trim()}; const p = find(item.slug);
 if (!p || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 999) return;
 if (p.needsSystem && !item.system) { form.elements.system.setCustomValidity('Enter an implant system or Please advise.'); form.elements.system.reportValidity(); return; }
 const previous = JSON.stringify(basket); const existing = basket.find(i => i.slug === item.slug && i.height === item.height && i.system === item.system && i.connection === item.connection);
 if (existing && existing.quantity + item.quantity > 999) { announce('Maximum quantity is 999 per configuration. Adjust your basket.'); return; }
 if (existing) existing.quantity += item.quantity; else basket.push(item);
 try { save(); announce(lang === 'ar' ? `تمت إضافة ${displayName(p.slug)}. راجع سلة عرض السعر للمتابعة.` : `${p.name} added. Review your quote basket to continue.`); } catch { basket = JSON.parse(previous); announce('Unable to save the basket. Enable browser storage or email orders@ussusmed.com with your products.'); }
}));
$('[name="system"]')?.addEventListener('input',e => e.target.setCustomValidity(''));
const money = n => new Intl.NumberFormat('en',{style:'currency',currency:'AED',currencyDisplay:'code'}).format(n);
function el(tag,text,cls) { const n = document.createElement(tag); n.textContent = text; if(cls) n.className=cls; return n; }
function render() {
 const container = $('#basket-items'); if (!container) return; container.replaceChildren();
 if (!basket.length) container.append(el('p',lang === 'ar' ? 'سلة عرض السعر فارغة. استعرض المنتجات أو اكتب ما تحتاجه في النموذج.' : 'Your basket is empty. Browse the catalogue or describe the products you need in the form.','empty-basket'));
 basket.forEach((i,index) => { const p=find(i.slug), name=displayName(i.slug), row=el('article','','basket-row'), a=el('a',name,'text-link'); a.href=`/${lang}/products/${p.slug}/`; row.append(a,el('p',[p.sku,i.height,i.system,i.connection].filter(Boolean).join(' · ')));
 const label=el('label',lang === 'ar' ? 'الكمية' : 'Quantity'), input=el('input',''); Object.assign(input,{type:'number',min:'1',max:'999',step:'1',value:String(i.quantity),required:true}); input.setAttribute('aria-label',`${lang === 'ar' ? 'الكمية لـ' : 'Quantity for'} ${name} ${i.height}`);
 input.addEventListener('change',()=>{if(!input.checkValidity()){input.reportValidity();input.value=String(i.quantity);return;} const old=i.quantity;i.quantity=Number(input.value);try{save();}catch{i.quantity=old;announce('Could not save changes. Check browser storage.');} render();container.querySelectorAll('input')[index]?.focus();}); label.append(input);row.append(label,el('strong',lang === 'ar' ? `إجمالي الصنف ${money(p.price*i.quantity)}` : `${money(p.price*i.quantity)} line total`));
 const remove=el('button',lang === 'ar' ? 'إزالة' : 'Remove','remove-button');remove.type='button';remove.setAttribute('aria-label',`${lang === 'ar' ? 'إزالة' : 'Remove'} ${name} ${i.height}`);remove.addEventListener('click',()=>{const previous=[...basket];basket.splice(index,1);try{save();announce(lang === 'ar' ? `تمت إزالة ${name}.` : `${name} removed.`);}catch{basket=previous;announce('Could not save changes. Check browser storage.');}render();(container.querySelectorAll('.remove-button')[Math.min(index,basket.length-1)] || $('#quote-form input')).focus();});row.append(remove);container.append(row);
 });
 $('#basket-total').textContent=basket.length?`${lang === 'ar' ? 'المجموع الفرعي للمنتجات' : 'Item subtotal'}: ${money(basket.reduce((a,i)=>a+find(i.slug).price*i.quantity,0))}`:'';
}
let download;
const form=$('#quote-form');
form?.addEventListener('input',()=>{$('#quote-ready').hidden=true;});
form?.addEventListener('submit',e=>{
 e.preventDefault();const d=new FormData(form);if(!basket.length&&!String(d.get('notes')).trim()){$('#form-status').textContent='Add a product or describe what you need in Additional requirements.';form.elements.notes.focus();return;}$('#form-status').textContent='';
 const lines=basket.map(i=>`${i.quantity} × ${find(i.slug).name} (${find(i.slug).sku})${i.height?` | Height: ${i.height}`:''}${i.system?` | Implant system: ${i.system}`:''}${i.connection?` | Platform/connection: ${i.connection}`:''} | ${money(find(i.slug).price)} ${find(i.slug).unit}`);
 const body=`Hello USSUS Med,\n\nPlease prepare a quotation for:\n${lines.length?lines.join('\n'):'See requirements below.'}\n\nName: ${d.get('name')}\nEmail: ${d.get('email')}\nClinic/company: ${d.get('clinic')}\nDelivery city and country: ${d.get('destination')}\n\nAdditional requirements:\n${d.get('notes')||'None'}\n\nPlease confirm availability, compatibility, final AED prices, taxes, shipping charges and delivery timing.\n\nThank you.`;
 $('#quote-preview').value=body;$('#email-quote').href=`mailto:orders@ussusmed.com?subject=USSUS%20Med%20quote%20request&body=${encodeURIComponent(body)}`;
 if(download)URL.revokeObjectURL(download);download=URL.createObjectURL(new Blob([body],{type:'text/plain;charset=utf-8'}));$('#download-quote').href=download;$('#copy-status').textContent='';$('#quote-ready').hidden=false;$('#quote-ready').focus();$('#quote-ready').scrollIntoView({block:'start'});
});
$('#copy-quote')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#quote-preview').value);$('#copy-status').textContent='Copied. Paste into your email and send to orders@ussusmed.com.';}catch{$('#quote-preview').focus();$('#quote-preview').select();$('#copy-status').textContent='Copy the selected text or use Download request.';}});
count();render();

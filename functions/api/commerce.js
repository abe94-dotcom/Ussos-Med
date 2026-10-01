// Cloudflare Pages Function. All customer data and prices stay behind this route.
const slugs = new Set(['sis-scanbody-ti', 'sis-smart-tibase-engaging', 'intraoral-scanner-v3-pro', 'nitrile-exam-gloves-m-200', 'self-ligating-brackets', 'cad-cam-milling-block']);
const statuses = new Set(['submitted', 'in_review', 'quoted', 'accepted', 'declined', 'cancelled']);
const encoder = new TextEncoder();
const cookieName = '__Host-ussus_session';
const sessionDays = 30;
const iterations = 310000;

function json(value, status = 200, extra = {}) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
}
function fail(message, status = 400) { return json({ error: message }, status); }
function bytesToHex(bytes) { return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join(''); }
function randomHex(length) { return bytesToHex(crypto.getRandomValues(new Uint8Array(length))); }
async function sha256(value) { return bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)))); }
async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  return bytesToHex(new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: encoder.encode(salt), iterations, hash: 'SHA-256' }, key, 256)));
}
function equalHex(a, b) {
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index++) difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return difference === 0;
}
function cookie(request) {
  const entry = (request.headers.get('Cookie') || '').split(';').map(part => part.trim()).find(part => part.startsWith(cookieName + '='));
  return entry?.slice(cookieName.length + 1) || '';
}
async function currentUser(db, request) {
  const token = cookie(request);
  if (!/^[a-f0-9]{64}$/.test(token)) return null;
  return db.prepare(`SELECT u.id,u.email,u.full_name,u.clinic_name,s.role
    FROM sessions x JOIN users u ON u.id=x.user_id LEFT JOIN staff_members s ON s.user_id=u.id
    WHERE x.token_hash=? AND x.expires_at > datetime('now')`).bind(await sha256(token)).first();
}
async function createSession(db, userId) {
  const token = randomHex(32);
  await db.prepare("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,datetime('now','+30 days'))").bind(await sha256(token), userId).run();
  return `${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${sessionDays * 86400}`;
}
function publicUser(user) { return { id: user.id, email: user.email, full_name: user.full_name, clinic_name: user.clinic_name, role: user.role || null }; }
function validText(value, max, required = false) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text.length <= max && (!required || text.length > 0) ? text : null;
}
function moneyToFils(value) {
  const text = String(value);
  if (!/^(0|[1-9]\d{0,8})(\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
async function audit(db, actor, action, subject, details = {}) {
  await db.prepare('INSERT INTO audit_log(id,actor_user_id,action,subject_id,details_json) VALUES(?,?,?,?,?)')
    .bind(crypto.randomUUID(), actor, action, subject, JSON.stringify(details)).run();
}
async function rateLimit(db, key, limit, minutes) {
  const row = await db.prepare("SELECT count FROM auth_attempts WHERE key=? AND expires_at > datetime('now')").bind(key).first();
  if (row && row.count >= limit) return false;
  await db.prepare(`INSERT INTO auth_attempts(key,count,expires_at) VALUES(?,1,datetime('now','+${minutes} minutes'))
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN expires_at <= datetime('now') THEN 1 ELSE count+1 END,
    expires_at=CASE WHEN expires_at <= datetime('now') THEN excluded.expires_at ELSE expires_at END`).bind(key).run();
  return true;
}
async function requestBody(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new Error('JSON required');
  if (Number(request.headers.get('Content-Length') || 0) > 12000) throw new Error('Request too large');
  const raw = await request.text();
  if (raw.length > 12000) throw new Error('Request too large');
  const body = JSON.parse(raw);
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request');
  return body;
}
function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  return origin === new URL(request.url).origin;
}
function itemsForClient(rows) {
  return rows.map(row => ({ ...row, options: JSON.parse(row.options_json || '{}'), quoted_unit_aed: row.quoted_unit_fils == null ? null : row.quoted_unit_fils / 100 }));
}

export async function onRequest({ request, env }) {
  const db = env.DB;
  if (!db) return fail('Backend database is not connected.', 503);
  const url = new URL(request.url);
  const action = request.method === 'GET' ? url.searchParams.get('action') : null;
  try {
    if (request.method === 'GET') {
      const user = await currentUser(db, request);
      if (action === 'me') {
        if (!user) return json({ user: null, quotes: [] });
        const quotes = await db.prepare("SELECT id,status,submitted_at,created_at FROM quotes WHERE user_id=? AND status<>'cart' ORDER BY created_at DESC LIMIT 30").bind(user.id).all();
        return json({ user: publicUser(user), quotes: quotes.results });
      }
      if (!user) return fail('Sign in required.', 401);
      if (action === 'prices') {
        const rows = await db.prepare('SELECT product_slug,amount_fils FROM prices').all();
        return json({ prices: rows.results.map(row => ({ product_slug: row.product_slug, amount_aed: row.amount_fils / 100 })) });
      }
      if (action === 'cart') {
        const cart = await db.prepare("SELECT id FROM quotes WHERE user_id=? AND status='cart'").bind(user.id).first();
        if (!cart) return json({ cart: null, items: [] });
        const rows = await db.prepare('SELECT id,product_slug,quantity,options_json FROM quote_items WHERE quote_id=? ORDER BY created_at').bind(cart.id).all();
        return json({ cart, items: itemsForClient(rows.results) });
      }
      if (action === 'staff') {
        if (!user.role) return fail('Staff access required.', 403);
        const requests = await db.prepare(`SELECT q.*,u.email,u.full_name,u.clinic_name FROM quotes q
          JOIN users u ON u.id=q.user_id WHERE q.status<>'cart' ORDER BY q.created_at DESC LIMIT 100`).all();
        const itemRows = await db.prepare(`SELECT i.* FROM quote_items i JOIN
          (SELECT id FROM quotes WHERE status<>'cart' ORDER BY created_at DESC LIMIT 100) q ON q.id=i.quote_id`).all();
        const allItems = itemsForClient(itemRows.results);
        const prices = user.role === 'admin' ? (await db.prepare('SELECT product_slug,amount_fils FROM prices').all()).results.map(row => ({ product_slug: row.product_slug, amount_aed: row.amount_fils / 100 })) : [];
        return json({ role: user.role, requests: requests.results, items: allItems, prices });
      }
      return fail('Unknown action.', 404);
    }
    if (request.method !== 'POST') return fail('Method not allowed.', 405);
    if (!sameOrigin(request)) return fail('Invalid request origin.', 403);
    const body = await requestBody(request);
    const operation = body.action;
    if (operation === 'signup' || operation === 'login') {
      const email = validText(body.email, 254, true)?.toLowerCase();
      const password = typeof body.password === 'string' ? body.password : '';
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length > 128) return fail('Check your email and password.');
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const key = await sha256(`${operation}:${ip}:${email}`);
      if (!await rateLimit(db, key, 8, 15)) return fail('Too many attempts. Try again later.', 429);
      if (operation === 'signup') {
        const fullName = validText(body.full_name, 120, true);
        const clinicName = validText(body.clinic_name, 180, true);
        if (!fullName || !clinicName || password.length < 10) return fail('Complete all fields and use at least 10 password characters.');
        if (await db.prepare('SELECT 1 FROM users WHERE email=?').bind(email).first()) return fail('This email already has an account.', 409);
        const salt = randomHex(16);
        const id = crypto.randomUUID();
        await db.prepare('INSERT INTO users(id,email,full_name,clinic_name,password_salt,password_hash) VALUES(?,?,?,?,?,?)')
          .bind(id, email, fullName, clinicName, salt, await passwordHash(password, salt)).run();
        const session = await createSession(db, id);
        return json({ user: { id, email, full_name: fullName, clinic_name: clinicName, role: null } }, 201, { 'Set-Cookie': session });
      }
      const user = await db.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
      const salt = user?.password_salt || '00000000000000000000000000000000';
      const calculated = await passwordHash(password, salt);
      if (!user || !equalHex(calculated, user.password_hash)) return fail('Email or password is incorrect.', 401);
      const session = await createSession(db, user.id);
      return json({ user: publicUser(user) }, 200, { 'Set-Cookie': session });
    }
    const user = await currentUser(db, request);
    if (!user) return fail('Sign in required.', 401);
    if (operation === 'logout') {
      const token = cookie(request);
      if (token) await db.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha256(token)).run();
      return json({ ok: true }, 200, { 'Set-Cookie': `${cookieName}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
    }
    if (operation === 'add_item') {
      if (!slugs.has(body.slug) || !Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 999) return fail('Invalid item.');
      if (!await db.prepare('SELECT 1 FROM prices WHERE product_slug=?').bind(body.slug).first()) return fail('Price is not available for this product.');
      const options = {};
      for (const field of ['height', 'system', 'connection']) {
        const value = validText(body.options?.[field], 120);
        if (value == null) return fail('Invalid product option.');
        options[field] = value;
      }
      let cart = await db.prepare("SELECT id FROM quotes WHERE user_id=? AND status='cart'").bind(user.id).first();
      if (!cart) {
        const id = crypto.randomUUID();
        await db.prepare("INSERT OR IGNORE INTO quotes(id,user_id,status) VALUES(?,?,'cart')").bind(id, user.id).run();
        cart = await db.prepare("SELECT id FROM quotes WHERE user_id=? AND status='cart'").bind(user.id).first();
      }
      await db.prepare('INSERT INTO quote_items(id,quote_id,product_slug,quantity,options_json) VALUES(?,?,?,?,?)')
        .bind(crypto.randomUUID(), cart.id, body.slug, body.quantity, JSON.stringify(options)).run();
      return json({ ok: true });
    }
    if (operation === 'update_item' || operation === 'remove_item') {
      if (typeof body.id !== 'string') return fail('Invalid item.');
      if (operation === 'update_item' && (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 999)) return fail('Invalid quantity.');
      const sql = operation === 'update_item'
        ? "UPDATE quote_items SET quantity=? WHERE id=? AND quote_id IN (SELECT id FROM quotes WHERE user_id=? AND status='cart')"
        : "DELETE FROM quote_items WHERE id=? AND quote_id IN (SELECT id FROM quotes WHERE user_id=? AND status='cart')";
      const params = operation === 'update_item' ? [body.quantity, body.id, user.id] : [body.id, user.id];
      const result = await db.prepare(sql).bind(...params).run();
      return result.meta.changes ? json({ ok: true }) : fail('Item not found.', 404);
    }
    if (operation === 'submit_quote') {
      const destination = validText(body.destination, 180);
      const note = validText(body.notes, 3000);
      if (destination == null || note == null) return fail('Invalid quote details.');
      const cart = await db.prepare("SELECT id FROM quotes WHERE user_id=? AND status='cart'").bind(user.id).first();
      if (!cart) return fail('Your basket is empty.');
      const missing = await db.prepare(`SELECT 1 FROM quote_items i LEFT JOIN prices p ON p.product_slug=i.product_slug
        WHERE i.quote_id=? AND p.product_slug IS NULL LIMIT 1`).bind(cart.id).first();
      if (missing) return fail('A product price is unavailable.');
      const result = await db.prepare(`UPDATE quotes SET status='submitted',destination=?,customer_note=?,submitted_at=datetime('now'),updated_at=datetime('now')
        WHERE id=? AND status='cart' AND EXISTS(SELECT 1 FROM quote_items WHERE quote_id=?)`)
        .bind(destination, note, cart.id, cart.id).run();
      if (!result.meta.changes) return fail('Your basket is empty.');
      await audit(db, user.id, 'submit_quote', cart.id);
      return json({ ok: true, quote_id: cart.id });
    }
    if (!user.role) return fail('Staff access required.', 403);
    if (operation === 'set_status') {
      if (!statuses.has(body.status) || typeof body.id !== 'string') return fail('Invalid status.');
      const result = await db.prepare("UPDATE quotes SET status=?,updated_at=datetime('now') WHERE id=? AND status<>'cart'").bind(body.status, body.id).run();
      if (!result.meta.changes) return fail('Request not found.', 404);
      await audit(db, user.id, 'set_status', body.id, { status: body.status });
      return json({ ok: true });
    }
    if (operation === 'set_quote_item') {
      const fils = body.amount === null ? null : moneyToFils(body.amount);
      const note = validText(body.note, 3000);
      if (typeof body.id !== 'string' || fils === null && body.amount !== null || note == null) return fail('Invalid item.');
      const result = await db.prepare(`UPDATE quote_items SET quoted_unit_fils=?,staff_note=? WHERE id=?
        AND quote_id IN (SELECT id FROM quotes WHERE status<>'cart')`).bind(fils, note, body.id).run();
      if (!result.meta.changes) return fail('Item not found.', 404);
      await audit(db, user.id, 'set_quote_item', body.id, { amount_fils: fils });
      return json({ ok: true });
    }
    if (operation === 'set_price') {
      if (user.role !== 'admin') return fail('Administrator access required.', 403);
      const fils = moneyToFils(body.amount);
      if (!slugs.has(body.slug) || fils == null) return fail('Invalid product or amount.');
      await db.prepare(`INSERT INTO prices(product_slug,amount_fils) VALUES(?,?)
        ON CONFLICT(product_slug) DO UPDATE SET amount_fils=excluded.amount_fils,updated_at=datetime('now')`).bind(body.slug, fils).run();
      await audit(db, user.id, 'set_price', body.slug, { amount_fils: fils });
      return json({ ok: true });
    }
    return fail('Unknown action.', 404);
  } catch (error) {
    if (error instanceof SyntaxError || error.message?.startsWith('Invalid request') || error.message?.startsWith('Request too large') || error.message === 'JSON required') return fail(error.message);
    console.error('Commerce request failed', error);
    return fail('The request could not be completed.', 500);
  }
}

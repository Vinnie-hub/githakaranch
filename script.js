// NAV
  window.addEventListener('scroll', () => {
    document.getElementById('mainNav').classList.toggle('scrolled', window.scrollY > 30);
  });

  // REVEAL
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

  // IMAGE FALLBACK — if any product/gallery image fails to load, show a placeholder
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.p-thumb img, .g-item img, .about-img, .modal-img img').forEach(img => {
      img.addEventListener('error', function() {
        this.style.objectFit = 'contain';
        this.style.background = '#243b27';
        this.style.padding = '20%';
        this.alt = 'Image unavailable';
        // If it's a product card, show a farm icon fallback
        if (this.closest('.p-thumb')) {
          this.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="%23e0a64a"><text x="50" y="58" font-size="40" text-anchor="middle" font-family="sans-serif">🐄</text></svg>');
        }
      });
    });
  });

  // FILTER
  function filterProducts(cat, btn) {
    document.querySelectorAll('.f-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.p-card').forEach(c => {
      c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'flex' : 'none';
    });
  }

  // MODAL
  function openMod(card) {
    const d = card.querySelector('.md');
    document.getElementById('mImg').src = d.querySelector('.mi').textContent.trim();
    document.getElementById('mCat').textContent = d.querySelector('.mc').textContent.trim();
    document.getElementById('mName').textContent = d.querySelector('.mn').textContent.trim();
    document.getElementById('mPrice').textContent = d.querySelector('.mp').textContent.trim();
    document.getElementById('mDesc').textContent = d.querySelector('.mdesc').textContent.trim();
    document.getElementById('mWa').href = d.querySelector('.mw').textContent.trim();
    document.getElementById('mAddCart').onclick = () => {
      addToCart(card);
      document.getElementById('modalOv').classList.remove('open');
      document.body.style.overflow = '';
    };
    document.getElementById('modalOv').classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMod(e) {
    if (e.target === document.getElementById('modalOv')) {
      document.getElementById('modalOv').classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // CART — with localStorage persistence
  let cart = [];

  function loadCart() {
    try {
      const saved = localStorage.getItem('githakaCart');
      if (saved) cart = JSON.parse(saved);
    } catch(e) { cart = []; }
    renderCart();
  }

  function saveCart() {
    try { localStorage.setItem('githakaCart', JSON.stringify(cart)); } catch(e) {}
  }

  function addToCart(card) {
    const d = card.querySelector('.md');
    const name = d.querySelector('.mn').textContent.trim();
    const price = d.querySelector('.mp').textContent.trim();
    const img = d.querySelector('.mi').textContent.trim();
    const existing = cart.find(i => i.name === name);
    if (existing) { existing.qty++; } else { cart.push({ name, price, img, qty: 1 }); }
    saveCart();
    renderCart();
    flashCart();
  }
  function flashCart() {
    const badge = document.getElementById('cartBadge');
    badge.style.transform = 'scale(1.4)';
    setTimeout(() => { badge.style.transform = 'scale(1)'; }, 200);
  }
  function changeQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
    renderCart();
  }
  function removeFromCart(idx) {
    cart.splice(idx, 1);
    saveCart();
    renderCart();
  }
  function clearCart() {
    cart = [];
    saveCart();
    renderCart();
  }
  function renderCart() {
    const items = document.getElementById('cpItems');
    document.getElementById('cartBadge').textContent = cart.reduce((a, i) => a + i.qty, 0);
    if (!cart.length) {
      items.innerHTML = '<div class="cp-empty">Your cart is empty.</div>';
      return;
    }
    items.innerHTML = cart.map((i, idx) => `
      <div class="cp-item">
        <img src="${i.img}" alt="${i.name}" onerror="this.style.display='none'">
        <div class="cp-item-info">
          <div class="cp-item-name">${i.name}</div>
          <div class="cp-item-price">${i.price}</div>
          <div class="cp-qty">
            <button onclick="changeQty(${idx},-1)">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty(${idx},1)">+</button>
          </div>
        </div>
        <button class="cp-rm" onclick="removeFromCart(${idx})">✕</button>
      </div>
    `).join('');
  }
  function toggleCart() {
    document.getElementById('cartPanel').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('open');
    document.body.style.overflow = document.getElementById('cartPanel').classList.contains('open') ? 'hidden' : '';
  }
  function cartWa() {
    if (!cart.length) { alert('Your cart is empty.'); return; }
    const msg = 'Hello, I want to order from Githaka Ranch:\n\n' +
      cart.map(i => `- ${i.name} (x${i.qty}) — ${i.price}`).join('\n') +
      '\n\nPlease confirm price and availability.';
    window.open('https://wa.me/254142222831?text=' + encodeURIComponent(msg));
  }

  // Load cart on page load
  document.addEventListener('DOMContentLoaded', loadCart);

  // ADVISOR
  const advSel = {};
  function pick(btn, group) {
    btn.closest('.adv-opts').querySelectorAll('.adv-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    advSel[group] = btn.textContent.trim();
  }
  function recommend() {
    const res = document.getElementById('advResult');
    const recs = {
      'Milk': 'Go for our Sahiwal Heifers or Milking Cows. Sahiwal is hardy, tick-resistant, and gives 1,500–2,500 litres per lactation with low input.',
      'Breeding / Resale': 'Our Sahiwal Heifers and Bulls suit a breeding plan well. Strong genetics mean good resale value.',
      'Meat': 'Try our Sahiwal cattle for beef and milk, or Boer Goats and Dorper Sheep for meat only. All are vaccinated and ready.'
    };
    const goal = advSel['goal'] || 'Milk';
    res.innerHTML = `<strong style="font-family:'Fraunces',serif;color:var(--ochre-l);display:block;margin-bottom:10px;font-size:1.05rem;">Our Pick</strong><p style="color:rgba(255,253,248,.85);line-height:1.6;margin-bottom:18px;font-size:.9rem;">${recs[goal] || recs['Milk']}</p><a href="https://wa.me/254142222831?text=Hello, I used your livestock advisor and want to ask about: ${encodeURIComponent(goal)}" target="_blank" class="btn btn-primary" style="width:fit-content;">Get a Quote</a>`;
    res.classList.add('show');
  }

  // FAQ
  function faqToggle(btn) {
    const a = btn.nextElementSibling, open = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(q => { q.classList.remove('open'); q.nextElementSibling.classList.remove('open'); });
    if (!open) { btn.classList.add('open'); a.classList.add('open'); }
  }

  // CONTACT FORM
  function sendMsg() {
    const name = document.getElementById('cName').value || 'Customer';
    const phone = document.getElementById('cPhone').value || '';
    const interest = document.getElementById('cInt').value || 'General enquiry';
    const msg = document.getElementById('cMsg').value || '';
    window.open('https://wa.me/254142222831?text=' + encodeURIComponent(`Hello Githaka Ranch!\n\nName: ${name}\nPhone: ${phone}\nInterested in: ${interest}\n\nMessage: ${msg}`));
  }

  // NEWSLETTER
  function subscribe() {
    const email = document.getElementById('nlEmail').value;
    if (!email) { alert('Please enter your email.'); return; }
    window.open('https://wa.me/254142222831?text=' + encodeURIComponent(`Hello! I'd like to subscribe to Githaka Ranch updates. My email is: ${email}`));
    document.getElementById('nlEmail').value = '';
    alert('Thank you! We will add you to our updates list.');
  }
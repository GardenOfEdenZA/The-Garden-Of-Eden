document.addEventListener('DOMContentLoaded', () => {
  feather.replace();

  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let delivery = JSON.parse(localStorage.getItem('delivery')) || { type: '', fee: 0, address: '' };

  const els = {
    cartCount: document.getElementById('cartCount'),
    cartItems: document.getElementById('cartItems'),
    subtotal: document.getElementById('subtotal'),
    deliveryFee: document.getElementById('deliveryFee'),
    cartTotal: document.getElementById('cartTotal'),
    deliveryAddress: document.getElementById('deliveryAddress')
  };

  const isMember = () => localStorage.getItem('member') === 'true';

  // Quantity
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const display = btn.parentElement.querySelector('.qty-display');
      let qty = parseInt(display.textContent);
      qty = btn.classList.contains('minus') ? Math.max(1, qty - 1) : qty + 1;
      display.textContent = qty;
    });
  });

  // Option Selection
  document.querySelectorAll('.option-group').forEach(group => {
    group.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        group.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });

  // Add to Cart
  const addToCart = (item) => {
    const existing = cart.find(p => p.name === item.name);
    existing ? existing.qty += item.qty : cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCart();
  };

  document.querySelectorAll('.add-selected, .add-to-cart-btn, .add-selected-edibles').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isMember()) { alert("Join free first!"); document.getElementById('membershipModal').style.display = 'block'; return; }

      const card = btn.closest('.product-card');
      const qty = parseInt(card.querySelector('.qty-display').textContent);

      if (btn.classList.contains('add-selected')) {
        const selected = card.querySelector('.option-btn.selected');
        addToCart({ name: selected.dataset.name, price: +selected.dataset.price, img: card.querySelector('.option-group').dataset.productImg, qty });
      } else if (btn.classList.contains('add-to-cart-btn')) {
        const data = JSON.parse(card.dataset.product);
        addToCart({ ...data, qty });
      } else if (btn.classList.contains('add-selected-edibles')) {
        card.querySelectorAll('.option-group').forEach(group => {
          const selected = group.querySelector('.option-btn.selected');
          if (selected) addToCart({ name: selected.dataset.name, price: +selected.dataset.price, img: group.dataset.productImg, qty });
        });
      }
    });
  });

  // Update Cart
  const updateCart = () => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const total = subtotal + delivery.fee;
    els.cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
    els.subtotal.textContent = `R${subtotal}`;
    els.deliveryFee.textContent = delivery.fee ? `R${delivery.fee}` : '—';
    els.cartTotal.textContent = `R${total}`;

    els.cartItems.innerHTML = cart.length ? cart.map((item, i) => `
      <div class="flex items-center gap-4 py-4 border-b dark:border-gray-600">
        <img src="${item.img}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
        <div class="flex-1">
          <h4 class="font-medium">${item.name}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">R${item.price} × ${item.qty}</p>
        </div>
        <button onclick="cart.splice(${i},1); localStorage.setItem('cart', JSON.stringify(cart)); updateCart();" class="text-red-600"><i data-feather="trash-2" class="w-5 h-5"></i></button>
      </div>
    `).join('') : '<p class="text-center text-gray-500 py-8">Your cart is empty.</p>';
    feather.replace();
  };

  // Delivery
  document.getElementById('openDelivery')?.addEventListener('click', () => document.getElementById('deliveryModal').style.display = 'block');
  document.getElementById('closeDelivery')?.addEventListener('click', () => document.getElementById('deliveryModal').style.display = 'none');
  document.getElementById('confirmDelivery')?.addEventListener('click', () => {
    const selected = document.querySelector('#deliveryModal .option-btn.selected');
    const address = els.deliveryAddress.value.trim();
    if (!address) return alert("Please enter your address");
    delivery = { type: selected.dataset.type, fee: +selected.dataset.fee, address };
    localStorage.setItem('delivery', JSON.stringify(delivery));
    document.getElementById('deliveryModal').style.display = 'none';
    updateCart();
  });
  els.deliveryAddress.value = delivery.address;

  // Checkout
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (!delivery.address) return document.getElementById('openDelivery').click();
    const summary = cart.map(p => `${p.name} x${p.qty}`).join('%0A');
    const subtotal = cart.reduce((s, p) => s + p.price * p.qty, 0);
    const msg = `Order:%0A${summary}%0A%0ASubtotal: R${subtotal}%0ADelivery (${delivery.type}): R${delivery.fee}%0ATotal: R${subtotal + delivery.fee}%0A%0AName: ${localStorage.getItem('memberName')}%0AAddress: ${delivery.address}`;
    window.open(`https://wa.me/27812345678?text=${msg}`, '_blank');
  });

  // Cart Open/Close
  document.getElementById('cartButton')?.addEventListener('click', () => {
    if (!isMember()) { alert("Join first!"); document.getElementById('membershipModal').style.display = 'block'; }
    else { document.getElementById('cartPage').style.display = 'block'; updateCart(); }
  });
  document.getElementById('closeCart')?.addEventListener('click', () => document.getElementById('cartPage').style.display = 'none');

  // Membership
  document.getElementById('membershipForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    localStorage.setItem('member', 'true');
    localStorage.setItem('memberName', fd.get('Full Name'));
    document.getElementById('membershipModal').style.display = 'none';
    document.getElementById('exclusiveModal').style.display = 'block';
  });

  // Age Gate
  document.getElementById('ageConfirm')?.addEventListener('click', () => {
    document.getElementById('ageGate').style.display = 'none';
    localStorage.setItem('ageVerified', 'true');
    if (!isMember()) document.getElementById('membershipModal').style.display = 'block';
  });
  if (localStorage.getItem('ageVerified') === 'true') document.getElementById('ageGate').style.display = 'none';

  // Dark Mode
  const dm = document.getElementById('darkModeToggle');
  dm.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });
  if (localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }

  updateCart();
});
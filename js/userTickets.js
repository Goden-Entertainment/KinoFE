requireAuth();
initNav();

async function loadTickets() {
  const grid = document.getElementById('ticketGrid');
  try {
    // Get all tickets and filter by current user's orders
    // Since tickets don't directly reference a user, we get orders for this user
    const user = currentUser();
    const orders = await apiFetch('/order/orders');
    const userOrders = orders.filter(o => o.user?.userId === user.userId);

    if (userOrders.length === 0) {
      grid.innerHTML = '<p style="color:#888;grid-column:1/-1;text-align:center">No tickets yet.</p>';
      return;
    }

    grid.innerHTML = '';
    userOrders.forEach(order => {
      const showing = order.showing;
      const movieTitle = showing?.movie?.title || 'Unknown Movie';
      const genre = showing?.movie?.categories?.[0]?.genre || '';
      const ageLimit = formatAgeLimit(showing?.movie?.ageLimit ?? 0);

      const item = document.createElement('div');
      item.className = 'admin-item';
      item.innerHTML = `
        <div class="admin-item-card">
          <span class="admin-item-age">${ageLimit}</span>
          <span class="admin-item-title">${movieTitle}</span>
        </div>
        <div class="admin-item-genre">${genre} · ${showing?.date || ''} ${showing?.time?.slice(0,5) || ''}</div>
      `;
      grid.appendChild(item);
    });
  } catch (e) {
    grid.innerHTML = '<p style="color:#f66;grid-column:1/-1;text-align:center">Could not load tickets.</p>';
    console.error(e);
  }
}

loadTickets();

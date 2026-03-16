initNav();

const ROWS = ['A','B','C','D','E','F','G','H'];
const SEATS_PER_ROW = 12;
const TICKET_PRICE = 100; // kr per seat (placeholder until backend exposes price)

const params = getParams();
const showingId = parseInt(params.get('showingId'));
const movieId   = parseInt(params.get('movieId'));

let selectedSeatIds = new Set(); // seatId numbers
let allSeats = [];       // Seat objects for this theater
let takenSeatIds = new Set(); // seatIds already booked for this showing
let showing = null;
let movie   = null;

// ── Load data ────────────────────────────────────────
async function init() {
  try {
    // Fetch movie (includes showings)
    if (movieId) movie = await apiFetch(`/movie/${movieId}`);

    // Find the showing inside movie.showings
    if (movie) {
      showing = (movie.showings || []).find(s => s.showingId === showingId) || null;
    }

    // Populate showing info bar
    if (movie && showing) {
      document.getElementById('infoTitle').textContent = movie.title;
      const end = calcEndTime(showing.time, movie.duration);
      document.getElementById('infoMeta').textContent =
        `${showing.theater?.name || ''} · ${showing.date} · ${showing.time?.slice(0,5)}–${end}`;
      document.getElementById('orderTitle').textContent = movie.title;
      document.getElementById('orderTheater').textContent = `i ${showing.theater?.name || ''}`;
      document.getElementById('orderTime').textContent =
        `Starter ${showing.time?.slice(0,5)}, ${showing.date} · Slutter ${end}`;
      document.getElementById('orderPoster').src = movie.image || '';
    }

    // Fetch seats for this theater
    const theaterId = showing?.theater?.theaterId;
    if (theaterId) {
      const allSeatsRaw = await apiFetch('/seat/seats');
      allSeats = allSeatsRaw.filter(s => s.theater?.theaterId === theaterId);
    }

    // Find taken seats (tickets for this showing)
    if (showingId) {
      const tickets = await apiFetch('/ticket/tickets');
      tickets.forEach(t => {
        if (t.showing?.showingId === showingId) {
          takenSeatIds.add(t.seat?.seatId);
        }
      });
    }

    renderGrid();
  } catch (e) {
    console.error('Failed to load seating data:', e);
    document.getElementById('infoTitle').textContent = 'Could not load seating.';
  }
}

function calcEndTime(timeStr, durationMin) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const endMin = h * 60 + m + durationMin;
  return `${String(Math.floor(endMin / 60)).padStart(2,'0')}:${String(endMin % 60).padStart(2,'0')}`;
}

// ── Render seat grid ─────────────────────────────────
function renderGrid() {
  const grid = document.getElementById('seatGrid');
  grid.innerHTML = '';

  // Build map: "A-1" -> seatId
  const seatMap = new Map();
  allSeats.forEach(s => {
    const rowLetter = ROWS[s.seatRow - 1] || String.fromCharCode(64 + s.seatRow);
    seatMap.set(`${rowLetter}-${s.seatNumber}`, s);
  });

  ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';

    const label = document.createElement('span');
    label.className = 'row-label';
    label.textContent = row;
    rowEl.appendChild(label);

    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      const key = `${row}-${n}`;
      const seatObj = seatMap.get(key);
      const seatId  = seatObj?.seatId ?? null;
      const isTaken = seatId ? takenSeatIds.has(seatId) : false;

      const seatEl = document.createElement('label');
      seatEl.className = 'seat' + (isTaken ? ' taken' : '');
      seatEl.title = `${row}${n}`;

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'visually-hidden';
      input.disabled = isTaken || !seatId;

      input.addEventListener('change', () => {
        if (input.checked) {
          selectedSeatIds.add(seatId);
        } else {
          selectedSeatIds.delete(seatId);
        }
        updateOrderPanel();
      });

      seatEl.appendChild(input);
      rowEl.appendChild(seatEl);
    }

    grid.appendChild(rowEl);
  });
}

// ── Order panel ──────────────────────────────────────
function updateOrderPanel() {
  const count = selectedSeatIds.size;
  const panel = document.getElementById('orderPanel');

  if (count === 0) {
    panel.classList.remove('visible');
    return;
  }
  panel.classList.add('visible');

  // Seat chips
  const chipsEl = document.getElementById('seatChips');
  chipsEl.innerHTML = '';
  selectedSeatIds.forEach(id => {
    const seat = allSeats.find(s => s.seatId === id);
    if (!seat) return;
    const rowLetter = ROWS[seat.seatRow - 1] || seat.seatRow;
    const chip = document.createElement('span');
    chip.className = 'seat-chip';
    chip.textContent = `Række ${rowLetter}, Sæde ${seat.seatNumber}`;
    chipsEl.appendChild(chip);
  });

  const total = count * TICKET_PRICE;
  document.getElementById('ticketCountLabel').textContent = `${count} billet${count === 1 ? '' : 'ter'} inkl. gebyr`;
  document.getElementById('ticketPrice').textContent = `${total} kr.`;
  document.getElementById('orderTotal').textContent = `${total} kr.`;
}

// ── Checkout flow ────────────────────────────────────
document.getElementById('proceedBtn').addEventListener('click', () => {
  document.getElementById('checkoutModal').classList.add('open');
});
document.getElementById('modalClose').addEventListener('click', () => {
  document.getElementById('checkoutModal').classList.remove('open');
});

document.getElementById('submitOrderBtn').addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const emailConfirm = document.getElementById('emailConfirm').value.trim();
  const errEl = document.getElementById('checkoutError');
  errEl.textContent = '';

  if (!document.getElementById('firstName').value.trim() ||
      !document.getElementById('lastName').value.trim() ||
      !email || !document.getElementById('phoneNumber').value.trim()) {
    errEl.textContent = 'Please fill in all required fields.';
    return;
  }
  if (email !== emailConfirm) {
    errEl.textContent = 'Emails do not match.';
    return;
  }

  try {
    // Create a ticket for each selected seat
    const ticketPromises = [...selectedSeatIds].map(seatId =>
      apiFetch('/ticket/create', {
        method: 'POST',
        body: {
          showing: { showingId },
          seat: { seatId }
        }
      })
    );
    await Promise.all(ticketPromises);
    location.href = 'thankYou.html';
  } catch (e) {
    errEl.textContent = 'Booking failed. Please try again.';
    console.error(e);
  }
});

init();

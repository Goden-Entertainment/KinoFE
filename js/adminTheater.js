requireAdmin();
initNav();

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const params = getParams();
const theaterId = parseInt(params.get('theaterId'));

let currentDate = new Date();
let selectedDate = null;
let allShowings = [];
let allMovies   = [];

async function init() {
  if (!theaterId) { location.href = 'adminShowings.html'; return; }

  try {
    const [theater, showings, movies] = await Promise.all([
      apiFetch(`/theater/${theaterId}`),
      apiFetch(`/showing/theater/${theaterId}`),
      apiFetch('/movie')
    ]);

    document.getElementById('theaterTitle').textContent = `Theater ${theater.name || theaterId}`;
    allShowings = showings;
    allMovies = movies;

    populateMovieSelect();
    populateCalendarSelects();
    renderCalendar();
  } catch (e) {
    console.error('Failed to load theater data:', e);
  }
}

function populateMovieSelect() {
  const sel = document.getElementById('newShowingMovie');
  sel.innerHTML = '';
  allMovies.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.movieId;
    opt.textContent = m.title;
    sel.appendChild(opt);
  });
}

function populateCalendarSelects() {
  const monthSel = document.getElementById('calMonth');
  const yearSel  = document.getElementById('calYear');

  monthSel.innerHTML = MONTH_NAMES.map((n, i) =>
    `<option value="${i}">${n}</option>`).join('');
  monthSel.value = currentDate.getMonth();

  const thisYear = new Date().getFullYear();
  for (let y = thisYear - 1; y <= thisYear + 2; y++) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y;
    yearSel.appendChild(opt);
  }
  yearSel.value = currentDate.getFullYear();

  monthSel.addEventListener('change', () => {
    currentDate.setMonth(parseInt(monthSel.value));
    renderCalendar();
  });
  yearSel.addEventListener('change', () => {
    currentDate.setFullYear(parseInt(yearSel.value));
    renderCalendar();
  });
}

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';

  document.getElementById('calMonth').value = currentDate.getMonth();
  document.getElementById('calYear').value  = currentDate.getFullYear();

  // Day name headers
  DAY_NAMES.forEach(d => {
    const el = document.createElement('div');
    el.className = 'cal-day-name';
    el.textContent = d;
    grid.appendChild(el);
  });

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const first = new Date(year, month, 1).getDay(); // 0=Sun
  const days  = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  // Blank slots before first day
  for (let i = 0; i < first; i++) {
    const blank = document.createElement('button');
    blank.className = 'cal-day other-month';
    blank.disabled = true;
    grid.appendChild(blank);
  }

  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const isToday = date.getTime() === today.getTime();
    const dateStr = toISODate(date);
    const hasShowings = allShowings.some(s => s.date === dateStr && s.status !== 'CANCELLED');

    const btn = document.createElement('button');
    btn.className = 'cal-day' + (isToday ? ' today' : '');
    btn.textContent = d;
    if (hasShowings) btn.style.fontWeight = '700';
    btn.addEventListener('click', () => selectDate(date, dateStr, btn));
    grid.appendChild(btn);
  }
}

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function selectDate(date, dateStr, btn) {
  // Remove previous selection
  document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
  btn.classList.add('selected');
  selectedDate = dateStr;

  document.getElementById('selectedDateLabel').textContent =
    `${date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}`;
  document.getElementById('showingsPanel').style.display = 'block';
  document.getElementById('addShowingForm').style.display = 'none';

  renderDayShowings(dateStr);
}

function renderDayShowings(dateStr) {
  const list = document.getElementById('showingsList');
  const dayShowings = allShowings.filter(s => s.date === dateStr && s.status !== 'CANCELLED');

  if (dayShowings.length === 0) {
    list.innerHTML = '<p style="color:#888">No showings on this date.</p>';
    return;
  }

  list.innerHTML = '';
  dayShowings.forEach(s => {
    // Find movie name from allMovies (showings don't include movie due to @JsonBackReference)
    const movie = allMovies.find(m => (m.showings || []).some(ms => ms.showingId === s.showingId));
    const row = document.createElement('div');
    row.className = 'cal-showing-row';
    row.innerHTML = `
      <span class="movie-time">${s.time?.slice(0,5) || ''}</span>
      <span class="movie-name">${movie?.title || 'Unknown'}</span>
      <button class="cal-showing-delete-btn" onclick="deleteShowing(${s.showingId}, '${dateStr}')">Remove</button>
    `;
    list.appendChild(row);
  });
}

async function deleteShowing(showingId, dateStr) {
  if (!confirm('Remove this showing?')) return;
  try {
    await apiFetch(`/showing/${showingId}`, { method: 'DELETE' });
    allShowings = allShowings.filter(s => s.showingId !== showingId);
    renderDayShowings(dateStr);
    renderCalendar();
  } catch (e) {
    alert('Could not remove showing.');
  }
}

// Add showing toggle
document.getElementById('addShowingToggle').addEventListener('click', () => {
  const form = document.getElementById('addShowingForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('cancelShowingBtn').addEventListener('click', () => {
  document.getElementById('addShowingForm').style.display = 'none';
});

document.getElementById('saveShowingBtn').addEventListener('click', async () => {
  const movieId = parseInt(document.getElementById('newShowingMovie').value);
  const time    = document.getElementById('newShowingTime').value;
  const status  = document.getElementById('newShowingStatus').value;
  const errEl   = document.getElementById('addShowingError');
  errEl.textContent = '';

  if (!selectedDate || !movieId || !time) {
    errEl.textContent = 'Please select a date, movie, and time.';
    return;
  }

  try {
    const newShowing = await apiFetch('/showing', {
      method: 'POST',
      body: {
        date: selectedDate,
        time: time + ':00',
        status,
        movie: { movieId },
        theater: { theaterId }
      }
    });
    allShowings.push(newShowing);
    document.getElementById('addShowingForm').style.display = 'none';
    renderDayShowings(selectedDate);
    renderCalendar();
  } catch (e) {
    errEl.textContent = 'Could not add showing. Check for time conflicts.';
    console.error(e);
  }
});

// Month navigation
document.getElementById('prevMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

init();

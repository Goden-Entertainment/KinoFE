initNav();

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

let weekOffset = 0;
let allMovies = [];  // movies with their showings
let selectedShowing = null;

// Build a map: showingId -> { showing, movie }
function buildShowingIndex() {
  const map = new Map();
  allMovies.forEach(movie => {
    (movie.showings || []).forEach(showing => {
      map.set(showing.showingId, { showing, movie });
    });
  });
  return map;
}

function getMondayOfWeek(offset) {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(today.setDate(diff + offset * 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDate(d) {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

function renderWeek(showingIndex) {
  const monday = getMondayOfWeek(weekOffset);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  document.getElementById('weekRange').textContent =
    `${formatDate(monday)} – ${formatDate(sunday)}`;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const grid = document.getElementById('weekGrid');
  grid.innerHTML = '';

  // Filter by movieId if provided in URL
  const params = getParams();
  const filterMovieId = params.get('movieId') ? parseInt(params.get('movieId')) : null;

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const isToday = day.getTime() === today.getTime();
    const dateStr = toISODate(day);

    const col = document.createElement('div');
    col.className = 'day-col' + (isToday ? ' today' : '');

    col.innerHTML = `
      <div class="day-header">
        <div class="day-name">${DAY_NAMES[day.getDay()]}</div>
        <div class="day-num">${day.getDate()}</div>
      </div>
    `;

    // Add showings for this day
    showingIndex.forEach(({ showing, movie }) => {
      if (showing.date !== dateStr) return;
      if (showing.status === 'CANCELLED') return;
      if (filterMovieId && movie.movieId !== filterMovieId) return;

      const chip = document.createElement('div');
      chip.className = 'showing-chip';
      chip.innerHTML = `
        <div class="chip-time">${showing.time?.slice(0,5) || ''}</div>
        <div class="chip-movie">${movie.title}</div>
      `;
      chip.addEventListener('click', () => showMoviePanel(showing, movie));
      col.appendChild(chip);
    });

    grid.appendChild(col);
  }
}

function showMoviePanel(showing, movie) {
  selectedShowing = showing;
  document.getElementById('panelPoster').src = movie.image || '';
  document.getElementById('panelTitle').textContent = movie.title;
  document.getElementById('panelMeta').textContent =
    `${formatDuration(movie.duration)} · ${formatAgeLimit(movie.ageLimit)} · ${showing.theater?.name || ''} · ${showing.date} ${showing.time?.slice(0,5)}`;
  document.getElementById('panelDesc').textContent = movie.description || '';
  document.getElementById('panelBuyBtn').onclick = () => {
    location.href = `seating.html?showingId=${showing.showingId}&movieId=${movie.movieId}`;
  };
  const panel = document.getElementById('moviePanel');
  panel.classList.add('visible');
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function init() {
  try {
    allMovies = await apiFetch('/movie');
    const showingIndex = buildShowingIndex();
    renderWeek(showingIndex);

    document.getElementById('prevWeek').addEventListener('click', () => {
      weekOffset--;
      renderWeek(showingIndex);
    });
    document.getElementById('nextWeek').addEventListener('click', () => {
      weekOffset++;
      renderWeek(showingIndex);
    });
  } catch (e) {
    console.error('Could not load schedule:', e);
  }
}

init();

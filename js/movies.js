initNav();

async function loadMovies() {
  const grid = document.getElementById('movieGrid');
  try {
    const movies = await apiFetch('/movie');
    const active = movies.filter(m => m.status === 'ACTIVE' || m.status === 'EXTRASHOWING');

    if (active.length === 0) {
      grid.innerHTML = '<p style="color:#888;text-align:center;grid-column:1/-1">No movies available right now.</p>';
      return;
    }

    grid.innerHTML = '';
    active.forEach(movie => {
      const genre = movie.categories?.[0]?.genre || '';
      const card = document.createElement('div');
      card.className = 'dark-movie-card';
      card.innerHTML = `
        <img src="${movie.image || ''}" alt="${movie.title}" onerror="this.style.background='#333'">
        <div class="card-body">
          <p class="card-title">${movie.title}</p>
          <p class="card-meta">${formatDuration(movie.duration)} &nbsp;·&nbsp; ${formatAgeLimit(movie.ageLimit)}</p>
          <p class="card-desc">${movie.description || ''}</p>
          <button class="buy-btn" onclick="location.href='showings.html?movieId=${movie.movieId}'">
            Buy Ticket
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = '<p style="color:#f66;text-align:center;grid-column:1/-1">Could not load movies.</p>';
    console.error(e);
  }
}

loadMovies();

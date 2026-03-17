requireAdmin();
initNav();

async function loadMovies() {
    const grid = document.getElementById('movieListGrid');
    try {
        const movies = await apiFetch('/movie');
        grid.innerHTML = '';

        if (movies.length === 0) {
            grid.innerHTML = '<p style="color:#888;grid-column:1/-1;text-align:center">No movies yet.</p>';
            return;
        }

        movies.forEach(movie => {
            const age = movie.ageLimit === 0 ? 'All' : `${movie.ageLimit}+`;
            const genre = movie.categories?.[0]?.genre || '';

            const entry = document.createElement('div');
            entry.className = 'movie-entry';
            entry.innerHTML = `
                <div class="movie-entry-box">
                    <div class="movie-entry-top">
                        <span class="movie-age">${age}</span>
                        <div class="movie-entry-actions">
                            <button class="edit-btn" title="Edit">&#9998;</button>
                            <button class="delete-btn" title="Delete">&#10683;</button>
                        </div>
                    </div>
                    <div class="movie-entry-name">${movie.title}</div>
                </div>
                <div class="movie-entry-genre">${genre}</div>
            `;

            entry.querySelector('.edit-btn').onclick = () => {
                location.href = `adminAddMovie.html?movieId=${movie.movieId}`;
            };

            entry.querySelector('.delete-btn').onclick = async () => {
                if (!confirm(`Delete "${movie.title}"?`)) return;
                try {
                    await apiFetch(`/movie/${movie.movieId}`, { method: 'DELETE' });
                    loadMovies();
                } catch (e) {
                    alert('Could not delete movie.');
                }
            };

            grid.appendChild(entry);
        });
    } catch (e) {
        grid.innerHTML = '<p style="color:#f66;grid-column:1/-1;text-align:center">Could not load movies.</p>';
        console.error(e);
    }
}

loadMovies();

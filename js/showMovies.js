initNav();

async function showActiveMovies() {
    const strip = document.getElementById('homeMovieStrip');
    if (!strip) return;
    try {
        const movies = await apiFetch('/movie');
        const active = movies.filter(m => m.status === 'ACTIVE' || m.status === 'EXTRASHOWING');
        strip.innerHTML = '';
        active.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'home-movie-card';
            card.innerHTML = `
                <img src="${movie.image || ''}" alt="${movie.title}" onerror="this.style.background='#333'">
                <div class="home-card-info">
                    <p>${movie.title}</p>
                    <button onclick="location.href='showings.html?movieId=${movie.movieId}'">Køb &#127915;</button>
                </div>`;
            strip.appendChild(card);
        });
    } catch (e) {
        console.error('Could not load movies:', e);
    }
}

async function showMoviesComingSoon() {
    try {
        const movies = await apiFetch('/movie');
        const comingSoon = movies.filter(m => m.status === 'COMINGSOON');
        if (comingSoon.length === 0) return;

        const cards = [...comingSoon, ...comingSoon];
        let html = '';
        cards.forEach(movie => {
            html += `
                <div class="card">
                    <img src="${movie.image || ''}" alt="${movie.title}" onerror="this.style.background='#333'">
                    <p class="card-title">${movie.title}</p>
                </div>`;
        });
        document.querySelectorAll('.imageCarousel .group').forEach(g => g.innerHTML = html);
        document.querySelector('.imageCarousel').classList.add('loaded');
    } catch (e) {
        console.error('Could not load coming soon movies:', e);
    }
}

showActiveMovies();
showMoviesComingSoon();

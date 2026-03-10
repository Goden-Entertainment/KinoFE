const MOVIEURL = "http://localhost:8080/movie";

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const movies = await fetch(MOVIEURL).then(r => r.json());
        document.getElementById('movieGrid').innerHTML = movies
            .filter(m => m.status === 'ACTIVE')
            .map(movie => `
                <div class="movieCard">
                    <div class="moviePoster">
                        <img src="${movie.image}" alt="${movie.title}">
                    </div>
                    <div class="movieInfo">
                        <p class="movieText">${movie.title}</p>
                        <p class="movieText">${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m</p>
                        <p class="movieText">${movie.ageLimit}+</p>
                        <p class="movieText">${movie.description}</p>
                        <button class="buyBtn" onclick="buyTicket(${movie.movieId}, '${movie.title}')">Buy Ticket</button>
                    </div>
                </div>
            `).join('');

        const comingSoon = movies.filter(m => m.status === 'COMINGSOON');
        const cards = [...comingSoon, ...comingSoon].map(m => `
        <div class="card">
            <img src="${m.image}" alt="${m.title}" style="width:100%; height:100%; object-fit:cover; border-radius:.3em;">
            <p class="card-title">${m.title}</p>
        </div>
        `).join('');

        document.querySelectorAll('.imageCarousel .group').forEach(g => g.innerHTML = cards);
        document.querySelector('.imageCarousel').classList.add('loaded');

    } catch (error) {
        console.error('Could not load movies:', error);
    }
});

//TODO: finish function when backend is ready.
function buyTicket(movieId, title) {
    alert('Ticket requested for: ' + title);
}
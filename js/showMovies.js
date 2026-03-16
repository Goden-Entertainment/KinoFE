const URL = `http://localhost:8080`;

//Show movies
async function getMovies() {
    try {
        const response = await fetch(URL + `/movie`);
        if (!response.ok) {
            console.log(response);
            return;
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch movies: " + error);
    }
}

//Show active movies in a grid
async function showActiveMovies() {
    const movies = await getMovies();
    const list = document.getElementById("movieGrid");
    const activeMovies = movies.filter(m => m.status === "ACTIVE");

    list.innerHTML = "";
    activeMovies.forEach(movie => {
        list.innerHTML += `
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
            </div>`;
    });
}

//Show coming soon movies in a carousel/slider.
async function showMoviesComingSoon() {
    const movies = await getMovies();
    const comingSoon = movies.filter(m => m.status === "COMINGSOON");
    if (comingSoon.length === 0) return;

    //Duplicate to make the carousel look infinite.
    const cards = [...comingSoon, ...comingSoon];

    let list = "";
    cards.forEach(movie => {
        list += `
            <div class="card">
                <img src="${movie.image}" alt="${movie.title}">
                <p class="card-title">${movie.title}</p>
            </div>`;
    });
    document.querySelectorAll('.imageCarousel .group').forEach(g => g.innerHTML = list);
    document.querySelector('.imageCarousel').classList.add('loaded');
}

//TODO: finish when ready ticket confirmation.
function buyTicket(movieId, title) {
    alert('Ticket requested for: ' + title);
}
showActiveMovies();
showMoviesComingSoon();
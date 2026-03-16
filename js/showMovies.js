const MOVIEURL = `http://51.120.3.91:8080`;

//Fetch all movies. show only active movies. (grid)
async function showActiveMovies() {
    try {
        const response = await fetch(MOVIEURL + `/movie`);
        const movies = await response.json();
        const list = document.getElementById("movieGrid")
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
    } catch (error) {
        console.log("Could not load movie: " + error);
    }
}

//Fetch all movies, show only movies that are coming soon. (carousel/slider)
async function showMoviesComingSoon() {
    try {
        const response = await fetch(MOVIEURL + `/movie`);
        const movies = await response.json();
        const comingSoon = movies.filter(m => m.status === "COMINGSOON");
        let list = "";

        if (comingSoon.length === 0) {
            return;
        }

        //Duplicate, to make it look infinite.
        const cards = [...comingSoon, ...comingSoon];

        cards.forEach(movie => {
            list += `
                <div class="card">
                     <img src="${movie.image}" alt="${movie.title}" style="width:100%; height:100%; object-fit:cover; border-radius:.3em;">
                     <p class="card-title">${movie.title}</p>
                </div>
                `;
        });
        document.querySelectorAll('.imageCarousel .group').forEach(g => g.innerHTML = list);
        document.querySelector('.imageCarousel').classList.add('loaded');

    } catch (error) {
        console.error("Could not load movies: " + error);
    }
}

//TODO: finish when ready ticket confirmation.
function buyTicket(movieId, title) {
    alert('Ticket requested for: ' + title);
}

showActiveMovies();
showMoviesComingSoon();
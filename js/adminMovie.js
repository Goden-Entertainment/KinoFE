async function getMovies() {
    const response = await fetch(`http://localhost:8080/movie`);
    return await response.json();
}

async function createMovie(movieData) {
    const response = await fetch(`http://localhost:8080/movie`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        },
        body: JSON.stringify(movieData)
    });
    return await response.json();
}

async function updateMovie(id, movieData) {
    const response = await fetch(`http://localhost:8080/movie/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        },
        body: JSON.stringify(movieData)
    });
    return await response.json();
}

async function deleteMovie(id) {
    const response = await fetch(`http://localhost:8080/movie/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        }
    });
    return response.ok;
}

async function loadMovies() {
    const movies = await getMovies();
    const tbody = document.querySelector("#movieTable tbody");
    tbody.innerHTML = "";

    movies.forEach(function (movie) {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${movie.movieId}</td>
            <td>${movie.title}</td>
            <td>${movie.ageLimit}</td>
            <td>${movie.duration}</td>
            <td>${movie.status}</td>
            <td>
                <button class="editBtn btnSecondary">Edit</button>
                <button class="deleteBtn btnDelete">Delete</button>
            </td>`
        
        row.querySelector(".editBtn").onclick = function () {
            document.getElementById("updateMovieId").value = movie.movieId
            document.getElementById("updateTitle").value = movie.title
            document.getElementById("updateAgeLimit").value = movie.ageLimit
            document.getElementById("updateDuration").value = movie.duration
            document.getElementById("updateDescription").value = movie.description
            document.getElementById("updateStatus").value = movie.status
            document.getElementById("updateMovieFormContainer").style.display = "block"
        }
        
        row.querySelector(".deleteBtn").onclick = async function () {
            await deleteMovie(movie.movieId);
            loadMovies();
        }

        tbody.appendChild(row);
    });
}

document.getElementById("addMovieBtn").onclick = async function (e) {
    e.preventDefault();
    const movieData = {
        title: document.getElementById("newTitle").value,
        ageLimit: parseInt(document.getElementById("newAgeLimit").value),
        duration: parseInt(document.getElementById("newDuration").value),
        description: document.getElementById("newDescription").value,
        status: document.getElementById("newStatus").value
    }
    console.log("Sending:", JSON.stringify(movieData))
    await createMovie(movieData);
    loadMovies();
}

document.getElementById("updateMovieBtn").onclick = async function () {
    const id = document.getElementById("updateMovieId").value
    const movieData = {
        title: document.getElementById("updateTitle").value,
        ageLimit: parseInt(document.getElementById("updateAgeLimit").value),
        duration: parseInt(document.getElementById("updateDuration").value),
        description: document.getElementById("updateDescription").value,
        status: document.getElementById("updateStatus").value
    }
    await updateMovie(id, movieData);
    document.getElementById("updateMovieFormContainer").style.display = "none";
    loadMovies();
}

loadMovies();
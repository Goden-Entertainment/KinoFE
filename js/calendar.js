const showingURL = `http://localhost:8080/showing`;
const movieURL = `http://localhost:8080/movie`;
const theaterURL = `http://localhost:8080/theater`;
let currentDate = new Date()
let movies = []
let showings = []
let theaters = []

async function getShowings() {
    try {
        const movieResponse = await fetch(movieURL);
        movies = await movieResponse.json();

        const showingResponse = await fetch(showingURL);
        showings = await showingResponse.json();

        const theaterResponse = await fetch(theaterURL);
        theaters = await theaterResponse.json()

        fillDropdowns()
        renderCalendar()
        
    } catch (error) {
        console.error("failed to load data: " + error);
    }
}

async function createShowing(ShowingData) {
    const response = await fetch(showingURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        },
        body: JSON.stringify(ShowingData)
    });
    if (!response.ok) {
        const errorText = await response.text();
        return null;
    }
    return await response.json();
}

async function updateShowing(id, showingData) {
    const response = await fetch(`http://localhost:8080/showing/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        },
        body: JSON.stringify(showingData)
    });
    return await response.json();
}

async function deleteShowing(id) {
    const response = await fetch(`http://localhost:8080/showing/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        }
    });
    return response.ok;
}

function fillDropdowns() {
    const movieOptions = movies.map(m => `<option value="${m.movieId}">${m.title}</option>`).join("")
    const theaterOptions = theaters.map(t => `<option value="${t.theaterId}">${t.name}</option>`).join("")

    document.getElementById("newMovie").innerHTML = movieOptions
    document.getElementById("newTheater").innerHTML = theaterOptions
    document.getElementById("updateMovie").innerHTML = movieOptions
    document.getElementById("updateTheater").innerHTML = theaterOptions
}

function getStartOfWeek(date) {
    let d = new Date(date)
    let day = d.getDay()
    let diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return d
}

function toDateString(date) {
    let y = date.getFullYear()
    let m = String(date.getMonth() + 1).padStart(2, "0")
    let d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

function isToday(date) {
    return toDateString(date) === toDateString(new Date())
}

function renderCalendar() {
    const calendar = document.getElementById("calendar")
    calendar.innerHTML = ""
    let start = getStartOfWeek(currentDate)

    let end = new Date(start)
    end.setDate(start.getDate() + 6)

    document.getElementById("weekLabel").innerText =
        start.toDateString().slice(4, 10) + " – " + end.toDateString().slice(4, 10)

    for (let i = 0; i < 7; i++) {
        let dayDate = new Date(start)
        dayDate.setDate(start.getDate() + i)

        let dayDiv = document.createElement("div")
        dayDiv.className = "day" + (isToday(dayDate) ? " today" : "")

        let header = document.createElement("div")
        header.className = "dayHeader"
        header.innerHTML =
            `<span class="name">${dayDate.toDateString().slice(0, 3)}</span>
             <span class="num">${dayDate.getDate()}</span>`
        dayDiv.appendChild(header)

        let showingsDiv = document.createElement("div")
        showingsDiv.className = "showings"

        let dateStr = toDateString(dayDate)
        let dayShowings = showings.filter(s => s.date === dateStr)
        dayShowings.sort((a, b) => a.time.localeCompare(b.time))

        if (dayShowings.length === 0) {
            showingsDiv.innerHTML = `<div class="empty">—</div>`
        } else {
            dayShowings.forEach(showing => {
                let div = document.createElement("div")
                div.className = "showing"
                div.innerHTML = `
                <span class="time">${showing.time}</span>
                <span class="title">${showing.movie.title}</span>
                <button class="editBtn btnSecondary">Edit</button>
                <button class="deleteBtn btnDelete">Delete</button>`

                div.querySelector(".editBtn").onclick = function () {
                    document.getElementById("updateShowingId").value = showing.showingId
                    document.getElementById("updateMovie").value = showing.movie.movieId
                    document.getElementById("updateTheater").value = showing.theater.theaterId
                    document.getElementById("updateDate").value = showing.date
                    document.getElementById("updateTime").value = showing.time
                    document.getElementById("updateShowingForm").style.display = "block"
                }

                div.querySelector(".deleteBtn").onclick = async function () {
                    if (confirm("Delete this showing?")) {
                        await deleteShowing(showing.showingId)
                        await getShowings()
                    }
                }

                showingsDiv.appendChild(div)
            })
        }
        dayDiv.appendChild(showingsDiv)
        calendar.appendChild(dayDiv)
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("nextBtn").onclick = function () {
        currentDate.setDate(currentDate.getDate() + 7);
        renderCalendar();
    }
    document.getElementById("prevBtn").onclick = function () {
        currentDate.setDate(currentDate.getDate() - 7);
        renderCalendar();
    }
    document.getElementById("createShowingBtn").onclick = async function () {
        const movieId = parseInt(document.getElementById("newMovie").value)
        const theaterId = parseInt(document.getElementById("newTheater").value)
        const selectedMovie = movies.find(m => m.movieId === movieId)
        const selectedTheater = theaters.find(t => t.theaterId === theaterId)
        
        const showingData = {
            date: document.getElementById("newDate").value,
            time: document.getElementById("newTime").value + ":00",
            status: "ACTIVE",
            movie: selectedMovie,
            theater: selectedTheater
        }
        await createShowing(showingData)
        await getShowings()
    }
    
    document.getElementById("updateShowingBtn").onclick = async function () {
        const id = document.getElementById("updateShowingId").value
        const movieId = parseInt(document.getElementById("updateMovie").value)
        const theaterId = parseInt(document.getElementById("updateTheater").value)
        const selectedMovie = movies.find(m => m.movieId === movieId)
        const selectedTheater = theaters.find(t => t.theaterId === theaterId)
        
        const showingData = {
            date: document.getElementById("updateDate").value,
            time: document.getElementById("updateTime").value,
            status: "ACTIVE",
            movie: selectedMovie,
            theater: selectedTheater
        }
        await updateShowing(id, showingData)
        document.getElementById("updateShowingForm").style.display = "none"
        await getShowings()
    }
    renderCalendar();
    getShowings()
})
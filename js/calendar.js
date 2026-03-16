const url = `http://localhost:8080`
let currentDate = new Date();
let movies = []
let showings = []
let theaters = []

//fetch Theater and Movie
async function GetTheaterAndMovie() {
    try {
        const movieResponse = await fetch(url + `/movie`);
        if (!movieResponse.ok) {
            console.log("Failed to fetch movies.");
            return;
        }
        movies = await movieResponse.json();

        const theaterResponse = await fetch(url + `/theater`);
        if (!theaterResponse.ok) {
            console.log("Failed to fetch theaters.");
            return;
        }
        theaters = await theaterResponse.json();
        fillDropdowns();
    } catch (error) {
        console.error("Failed to load reference data: " + error);
    }
}

//Fetch showings.
async function getShowings() {
    try {
        const showingResponse = await fetch(url + `/showing`);
        if (!showingResponse.ok) {
            console.log("Failed to fetch showings.");
            return;
        }
        showings = await showingResponse.json();
        renderCalendar();
    } catch (error) {
        console.error("Failed to load showings: " + error);
    }
}

//create a new showing.
async function createShowing(showingData) {
    try {
        const response = await fetch(url + `/showing`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(showingData)
        });
        if (!response.ok) {
            console.log("Failed to create showing.");
            return;
        }
        return await response.json();
    } catch (error) {
        console.error("failed to create showing: " + error);
    }
}

//Update existing showing by id.
async function updateShowing(id, showingData) {
    try {
        const response = await fetch(url + `/showing/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(showingData)
        });
        if (!response.ok) {
            const errorBody = await response.text()
            console.log("Failed to update showing:", errorBody)
            return;
        }
        return await response.json();
    } catch (error) {
        console.error("failed to update showing: " + error);
    }
}
//Delete showing by id.
async function deleteShowing(id) {
    try {
        const response = await fetch(url + `/showing/${id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            console.log("Failed to delete showing.");
            return;
        }
        return response.json();
    } catch (error) {
        console.error("failed to delete showing: " + error);
    }
}

//Form for update and create.
function fillDropdowns() {
    //finds theater and movies to select.
    const movieOptions = movies.map(m => `<option value="${m.movieId}">${m.title}</option>`).join("")
    const theaterOptions = theaters.map(t => `<option value="${t.theaterId}">${t.name}</option>`).join("")

    document.getElementById("newMovie").innerHTML = movieOptions
    document.getElementById("newTheater").innerHTML = theaterOptions
    document.getElementById("updateMovie").innerHTML = movieOptions
    document.getElementById("updateTheater").innerHTML = theaterOptions
}

//Calendar
//Return monday.
function getStartOfWeek(date) {
    let d = new Date(date)
    let day = d.getDay()
    let diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return d
}

//format "YYYY-MM-DD".
function toDateString(date) {
    let y = date.getFullYear()
    let m = String(date.getMonth() + 1).padStart(2, "0")
    let d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
}

//return true if the date is today.
function isToday(date) {
    return toDateString(date) === toDateString(new Date())
}

//Sets the week label and returns the start date.
function initCalendar() {
    const calendar = document.getElementById("calendar")
    calendar.innerHTML = ""
    let start = getStartOfWeek(currentDate)
    let end = new Date(start)
    end.setDate(start.getDate() + 6)
    document.getElementById("weekLabel").innerText =
        start.toDateString().slice(4, 10) + " – " + end.toDateString().slice(4, 10)
    return start
}

//creates a single showing with edit and delete buttons.
function createShowingDiv(showing) {
    let div = document.createElement("div")
    div.className = "showing"

    let xLabel = showing.status === "EXTRASHOWING"
        ? `<span class="extraShowingLabel">x</span>`
        : ""

    div.innerHTML = `
        <span class="time">${showing.time}</span>
        <span class="title">${showing.movie?.title ?? "No movie"}</span>
        <button class="editBtn btnSecondary">Edit</button>
        <button class="deleteBtn btnDelete">Delete</button>
        ${xLabel}`

    div.querySelector(".editBtn").onclick = function () {
        document.getElementById("updateShowingId").value = showing.showingId
        document.getElementById("updateMovie").value = showing.movie?.movieId ?? ""
        document.getElementById("updateTheater").value = showing.theater.theaterId
        document.getElementById("updateDate").value = showing.date
        document.getElementById("updateTime").value = showing.time
        document.getElementById("updateExtraShowing").checked = showing.status === "EXTRASHOWING"
        document.getElementById("updateShowingForm").style.display = "block"
    }

    div.querySelector(".deleteBtn").onclick = async function () {
        if (confirm("Delete this showing?")) {
            await deleteShowing(showing.showingId)
            await getShowings()
        }
    }
    return div
}

//creates a single day column with its showings.
function createDayDiv(dayDate) {
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
    let dayShowings = showings.filter(s => s.date === dateStr && s.theater)
    dayShowings.sort((a, b) => a.time.localeCompare(b.time))
    dayShowings.forEach(showing => showingsDiv.appendChild(createShowingDiv(showing)))

    dayDiv.appendChild(showingsDiv)
    return dayDiv
}

//show the calendar.
function renderCalendar() {
    let start = initCalendar()
    const calendar = document.getElementById("calendar")
    for (let i = 0; i < 7; i++) {
        let dayDate = new Date(start)
        dayDate.setDate(start.getDate() + i)
        calendar.appendChild(createDayDiv(dayDate))
    }
}

//Buttons
document.addEventListener("DOMContentLoaded", async function () {
    //navigate to next week.
    document.getElementById("nextBtn").onclick = function () {
        currentDate.setDate(currentDate.getDate() + 7);
        renderCalendar();
    }
    //navigate to previous week.
    document.getElementById("prevBtn").onclick = function () {
        currentDate.setDate(currentDate.getDate() - 7);
        renderCalendar();
    }
    //Create new showings.
    document.getElementById("createShowingBtn").onclick = async function (event) {
        event.preventDefault();
        const movieId = parseInt(document.getElementById("newMovie").value)
        const theaterId = parseInt(document.getElementById("newTheater").value)
        const selectedMovie = movies.find(m => m.movieId === movieId)
        const selectedTheater = theaters.find(t => t.theaterId === theaterId)

        const showingData = {
            date: document.getElementById("newDate").value,
            time: document.getElementById("newTime").value,
            status: document.getElementById("extraShowing").checked ? "EXTRASHOWING" : null,
            movie: selectedMovie,
            theater: selectedTheater
        }
        await createShowing(showingData)
        await getShowings()
    }

    //update form.
    document.getElementById("updateShowingBtn").onclick = async function () {
        const id = document.getElementById("updateShowingId").value
        const movieId = parseInt(document.getElementById("updateMovie").value)
        const theaterId = parseInt(document.getElementById("updateTheater").value)
        const selectedMovie = movies.find(m => m.movieId === movieId)
        const selectedTheater = theaters.find(t => t.theaterId === theaterId)

        const showingData = {
            date: document.getElementById("updateDate").value,
            time: document.getElementById("updateTime").value,
            status: document.getElementById("updateExtraShowing").checked ? "EXTRASHOWING" : null,
            movie: selectedMovie,
            theater: selectedTheater
        }
        await updateShowing(id, showingData)
        document.getElementById("updateShowingForm").style.display = "none"
        await getShowings()
    }
    
    await GetTheaterAndMovie();
    await getShowings();
});

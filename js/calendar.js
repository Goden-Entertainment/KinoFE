const url = `http://localhost:8080`
let currentDate = new Date();
let movies = []
let showings = []
let theaters = []

//Fetch movies, showings and theaters.
async function getShowings() {
    try {
        const movieResponse = await fetch(url + `/movie`);
        movies = await movieResponse.json();

        const showingResponse = await fetch(url +`/showing`);
        showings = await showingResponse.json();

        const theaterResponse = await fetch(url + `/theater` );
        theaters = await theaterResponse.json()

        fillDropdowns()
        renderCalendar()
        
    } catch (error) {
        console.error("failed to load data: " + error);
    }
}

//create a new showing.
async function createShowing(showingData) {
    const response = await fetch(url +  `/showing`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        },
        body: JSON.stringify(showingData)
    });
    return await response.json();
}

//Update existing showing by id.
async function updateShowing(id, showingData) {
    const response = await fetch(url + `/showing/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        },
        body: JSON.stringify(showingData)
    });
    return await response.json();
}

//Delete showing by id.
async function deleteShowing(id) {
    const response = await fetch(url + `/showing/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("token")
        }
    });
    return response.ok;
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

//weekly calendar view. sort each day by time + edit and delete buttons.
function renderCalendar() {
    const calendar = document.getElementById("calendar")
    calendar.innerHTML = ""
    let start = getStartOfWeek(currentDate) //find monday of the week showing in calendar.

    //sunday = monday + 6
    let end = new Date(start)
    end.setDate(start.getDate() + 6)

    //display the week label at the top of calendar.
    document.getElementById("weekLabel").innerText =
        start.toDateString().slice(4, 10) + " – " + end.toDateString().slice(4, 10)

    //Loop through seven days.
    for (let i = 0; i < 7; i++) {
        let dayDate = new Date(start)
        dayDate.setDate(start.getDate() + i) //get specific day.

        //Highlight today
        let dayDiv = document.createElement("div")
        dayDiv.className = "day" + (isToday(dayDate) ? " today" : "")

        //Show name for each day
        let header = document.createElement("div")
        header.className = "dayHeader"
        header.innerHTML =
            `<span class="name">${dayDate.toDateString().slice(0, 3)}</span>
             <span class="num">${dayDate.getDate()}</span>`
        dayDiv.appendChild(header)

        //create container for a day
        let showingsDiv = document.createElement("div")
        showingsDiv.className = "showings"

        //matches days with this day sorted by time.
        let dateStr = toDateString(dayDate)
        let dayShowings = showings.filter(s => s.date === dateStr)
        dayShowings.sort((a, b) => a.time.localeCompare(b.time))
        
        //Create div for each showing.
            dayShowings.forEach(showing => {
                let div = document.createElement("div")
                div.className = "showing"
                div.innerHTML = `
                <span class="time">${showing.time}</span>
                <span class="title">${showing.movie.title}</span>
                <button class="editBtn btnSecondary">Edit</button>
                <button class="deleteBtn btnDelete">Delete</button>`

                //update form showing data with right data.
                div.querySelector(".editBtn").onclick = function () {
                    document.getElementById("updateShowingId").value = showing.showingId
                    document.getElementById("updateMovie").value = showing.movie.movieId
                    document.getElementById("updateTheater").value = showing.theater.theaterId
                    document.getElementById("updateDate").value = showing.date
                    document.getElementById("updateTime").value = showing.time
                    document.getElementById("updateShowingForm").style.display = "block"
                }

                //When delete is clicked, Confirm delete with message.
                div.querySelector(".deleteBtn").onclick = async function () {
                    if (confirm("Delete this showing?")) {
                        await deleteShowing(showing.showingId)
                        await getShowings()
                    }
                }
                showingsDiv.appendChild(div)
            })
        
        dayDiv.appendChild(showingsDiv)
        calendar.appendChild(dayDiv)
    }
}

document.addEventListener("DOMContentLoaded", function () {
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
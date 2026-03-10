let currentDate = new Date()
let movies = []
let showings = []

async function loadData() {
    movies = await fetch("/movies").then(r => r.json())
    showings = await fetch("/showings").then(r => r.json())
    renderCalendar()
}

const calendar = document.getElementById("calendar")

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
            dayShowings.forEach(show => {
                let movie = movies.find(m => m.movieId === show.movieFK)
                let div = document.createElement("div")
                div.className = "showing"
                div.innerHTML = `
          <span class="time">${show.time}</span>
          <span class="title">${movie.title}</span>
        `
                showingsDiv.appendChild(div)
            })
        }

        dayDiv.appendChild(showingsDiv)
        calendar.appendChild(dayDiv)
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("nextBtn").onclick = function () {
        currentDate.setDate(currentDate.getDate() + 7)
        renderCalendar()
    }
    document.getElementById("prevBtn").onclick = function () {
        currentDate.setDate(currentDate.getDate() - 7)
        renderCalendar()
    }
    renderCalendar()
    loadData()
})

// Should call to get how big the theater is, and how many rows and seats per row. For now, it is hardcoded.
const Rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SeatsPerRow = 12;

const selectedSeats = new Set();

// finds first form in the html, which is the one we want to use for storing the seating layout. 
const form = document.querySelector('form');

// Create the cinema screen element
const screen = document.createElement('div');
screen.classList.add('screen');
screen.textContent = 'CINEMA SCREEN';
// Insert the screen at the top of the form
form.before(screen);

// MOCK API remove when backend is running 
 function mockFetchSeats() {
  return ["A-3", "B-7", "C-5","D-10", "E-1", "F-4", "G-8", "H-2"];
}

 function mockBookSeats(seats) {
  return { success: true, bookingId: "MOCK-123" };
}
//  MOCK End

function generateLayout(seats) {
  Rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.classList.add('row');

    const rowLabel = document.createElement('span');
    rowLabel.classList.add('row-label');
    rowLabel.textContent = row;
    rowEl.appendChild(rowLabel);

    for (let i = 1; i <= SeatsPerRow; i++) {
      const seatId = `${row}-${i}`;
      const seatData = seats.get(seatId);

      const label = document.createElement('label');
      label.classList.add('seat');

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.classList.add('visually-hidden');
      input.id = seatId;
      input.name = seatId;

      if (seatData?.isUnavailable) {
        input.disabled = true;
        label.classList.add('unavailable');
      }

      label.appendChild(input);
      rowEl.appendChild(label);
    }

    form.appendChild(rowEl);
  });
}

async function loadSeats() {
  // Swap mockFetchSeats() for fetch('/api/seats') when backend is ready
  const unavailableSeats = await mockFetchSeats();
  const seats = new Map(unavailableSeats.map(id => [id, { isUnavailable: true }]));
  generateLayout(seats);
}

async function bookSeats() {
  // Swap mockBookSeats() for the real fetch call when backend is ready
  const result = await mockBookSeats([...selectedSeats]);

  if (result.success) {
    alert(`Booking confirmed! ID: ${result.bookingId}`);
  }
}

// Handle seat selection
form.addEventListener('change', (e) => {
  if (e.target.type !== 'checkbox') return;

  const seatId = e.target.id;
  e.target.checked ? selectedSeats.add(seatId) : selectedSeats.delete(seatId);

  console.log('Selected seats:', [...selectedSeats]);
});

loadSeats();
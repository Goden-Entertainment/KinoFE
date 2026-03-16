requireAdmin();
initNav();

const params = getParams();
const editId = params.get('movieId') ? parseInt(params.get('movieId')) : null;
let imageDataUrl = null;

if (editId) {
  document.getElementById('pageTitle').innerHTML = 'Edit<br>Movie';
  loadMovieForEdit(editId);
}

// Image file → data URL
document.getElementById('imageFile').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { imageDataUrl = reader.result; };
  reader.readAsDataURL(file);
});

async function loadMovieForEdit(id) {
  try {
    const movie = await apiFetch(`/movie/${id}`);
    document.getElementById('title').value = movie.title || '';
    document.getElementById('description').value = movie.description || '';
    document.getElementById('duration').value = movie.duration || '';
    document.getElementById('status').value = movie.status || 'ACTIVE';
    document.getElementById('ageLimit').value = movie.ageLimit ?? 0;
    document.getElementById('imageUrl').value = movie.image || '';
  } catch (e) {
    document.getElementById('errorMsg').textContent = 'Could not load movie data.';
  }
}

document.getElementById('movieForm').addEventListener('submit', async e => {
  e.preventDefault();
  const errEl = document.getElementById('errorMsg');
  errEl.textContent = '';

  const image = imageDataUrl || document.getElementById('imageUrl').value.trim() || null;

  const payload = {
    title: document.getElementById('title').value.trim(),
    description: document.getElementById('description').value.trim(),
    duration: parseInt(document.getElementById('duration').value),
    status: document.getElementById('status').value,
    ageLimit: parseInt(document.getElementById('ageLimit').value) || 0,
    image
  };

  try {
    if (editId) {
      await apiFetch(`/movie/${editId}`, { method: 'PUT', body: payload });
    } else {
      await apiFetch('/movie', { method: 'POST', body: payload });
    }
    location.href = 'adminMovie.html';
  } catch (err) {
    errEl.textContent = 'Could not save movie. Please try again.';
    console.error(err);
  }
});

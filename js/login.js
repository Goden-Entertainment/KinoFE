document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '';

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      credentials: 'include',
      body: new URLSearchParams({ username, password })
    });

    if (!res.ok) {
      errorMsg.textContent = 'Invalid username or password';
      return;
    }

    const user = await res.json();
    sessionStorage.setItem('currentUser', JSON.stringify(user));

    // Temporary admin detection – replace when backend adds role support
    if (user.username === 'August') {
      sessionStorage.setItem('isAdmin', 'true');
      location.href = 'adminProfile.html';
    } else {
      location.href = 'userProfile.html';
    }
  } catch (err) {
    errorMsg.textContent = 'Could not connect to server. Please try again.';
  }
});

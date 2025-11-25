document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const data = {
    username: form.username.value,
    email: form.email.value,
    password: form.password.value,
    // role: form.role.value
  };

  const resp = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await resp.json();

  if (json.success) {
    alert('User created');
    window.location.href = '/login'; // redirect to login page
  } else {
    alert(json.message || 'Error creating user');
  }
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const email    = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) {
      return alert('Input account and password');
    }

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await resp.json();
      if (!resp.ok) {
        return alert('login failed：' + result.error);
      }

     
      sessionStorage.setItem('authToken', result.token);
      sessionStorage.setItem('patientId', JSON.parse(atob(result.token.split('.')[1])).patientId);

   
      location.href = 'services.html';
    } catch (err) {
      console.error(err);
      alert('Error! retry it later');
    }
  });
});

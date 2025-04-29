document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-panel form');
    form.addEventListener('submit', async e => {
      e.preventDefault();
        const fd = new FormData(form);
  
      try {
        const resp = await fetch('/api/auth/register', {
          method: 'POST',
          body: fd   
        });
        const result = await resp.json();
        if (resp.ok) {
          alert('Success create ,Your ID is ' + result.patientId);
          sessionStorage.setItem('patientId', result.patientId);
          location.href = 'register_success.html';
        } else {
          alert('FAILED：' + result.error);
        }
      } catch (err) {
        console.error(err);
        alert('Retry it Later');
      }
    });
  });

